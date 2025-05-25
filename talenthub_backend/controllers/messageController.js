const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Mesaj gönderme
const sendMessage = async (req, res) => {
  try {
    const { receiverId, content } = req.body;
    const senderId = req.user.userId;

    if (!content || !receiverId) {
      return res.status(400).json({ error: 'Mesaj içeriği ve alıcı ID gereklidir' });
    }

    // İki kullanıcı arasındaki chat'i bul veya oluştur
    let chat = await prisma.chat.findFirst({
      where: {
        participants: {
          some: { userId: senderId },
        },
        AND: {
          participants: {
            some: { userId: receiverId },
          },
        },
      },
    });
    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          participants: {
            create: [
              { userId: senderId },
              { userId: receiverId },
            ],
          },
        },
      });
    }

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
        chatId: chat.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            userName: true,
            fullName: true,
            profilePhotoUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            userName: true,
            fullName: true,
            profilePhotoUrl: true,
          },
        },
      },
    });

    // WebSocket üzerinden mesajı alıcıya gönder
    if (req.app.get('io')) {
      req.app.get('io').to(`user_${receiverId}`).emit('new_message', message);
    }

    res.status(201).json(message);
  } catch (error) {
    console.error('Mesaj gönderme hatası:', error);
    res.status(500).json({ error: 'Mesaj gönderilemedi' });
  }
};

// Kullanıcının mesajlarını getirme
const getUserMessages = async (req, res) => {
  try {
    const userId = req.user.id;
    const { otherUserId } = req.params;

    // Önce iki kullanıcı arasındaki chat'i bul
    const chat = await prisma.chat.findFirst({
      where: {
        participants: {
          some: { userId: userId },
        },
        AND: [
          {
            participants: {
              some: { userId: parseInt(otherUserId) },
            },
          },
        ],
      },
    });

    if (!chat) {
      return res.json([]); // Hiç chat yoksa boş dizi dön
    }

    const messages = await prisma.message.findMany({
      where: {
        chatId: chat.id, // chatId ile filtrele
        OR: [
          { senderId: userId, receiverId: parseInt(otherUserId) },
          { senderId: parseInt(otherUserId), receiverId: userId },
        ],
      },
      include: {
        sender: {
          select: {
            id: true,
            userName: true,
            fullName: true,
            profilePhotoUrl: true,
          },
        },
        receiver: {
          select: {
            id: true,
            userName: true,
            fullName: true,
            profilePhotoUrl: true,
          },
        },
        deletedBy: {
          where: { userId: userId },
          select: { id: true },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Okunmamış mesajları okundu olarak işaretle
    await prisma.message.updateMany({
      where: {
        chatId: chat.id, // chatId ile filtrele
        senderId: parseInt(otherUserId),
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    // deletedByMe alanını ekle ve silinenleri filtrele
    const filtered = messages
      .map(msg => ({
        ...msg,
        deletedByMe: msg.deletedBy && msg.deletedBy.length > 0
      }))
      .filter(msg => !msg.deletedByMe)
      .map(({ deletedBy, ...rest }) => rest); // deletedBy alanını dışarıda bırak

    res.json(filtered);
  } catch (error) {
    console.error('Mesajları getirme hatası:', error);
    res.status(500).json({ error: 'Mesajlar getirilemedi' });
  }
};

// Kullanıcının son mesajlaştığı kişileri getirme
const getRecentChats = async (req, res) => {
  try {
    const userId = req.user.id;
    // Kullanıcının sildiği sohbetleri bul
    const deletedChats = await prisma.chatDelete.findMany({ where: { userId }, select: { chatId: true } });
    const deletedChatIds = deletedChats.map(dc => dc.chatId);
    // Son mesajlaşılan kullanıcıları getir
    const recentChats = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
        chatId: { notIn: deletedChatIds },
      },
      include: {
        sender: {
          select: {
            id: true,
            userName: true,
            fullName: true,
            profilePhotoUrl: true,
            isOnline: true,
            lastSeen: true,
          },
        },
        receiver: {
          select: {
            id: true,
            userName: true,
            fullName: true,
            profilePhotoUrl: true,
            isOnline: true,
            lastSeen: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      distinct: ['chatId'],
    });
    // Mesajlaşılan kullanıcıları düzenle
    const formattedChats = recentChats.map(chat => {
      const otherUser = chat.senderId === userId ? chat.receiver : chat.sender;
      return {
        user: otherUser,
        lastMessage: chat,
        chatId: chat.chatId,
        unreadCount: 0, // Bu kısmı daha sonra implement edeceğiz
      };
    });
    res.json(formattedChats);
  } catch (error) {
    console.error('Son mesajlaşmaları getirme hatası:', error);
    res.status(500).json({ error: 'Son mesajlaşmalar getirilemedi' });
  }
};

// Bir mesajı sadece kendinden sil (Benden Sil)
const deleteMessageForMe = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { messageId } = req.params;
    // Mesaj var mı kontrol et
    const message = await prisma.message.findUnique({ where: { id: parseInt(messageId) } });
    if (!message) return res.status(404).json({ error: 'Mesaj bulunamadı' });
    // Zaten silinmiş mi kontrol et
    const alreadyDeleted = await prisma.messageDelete.findUnique({ where: { userId_messageId: { userId, messageId: parseInt(messageId) } } });
    if (alreadyDeleted) return res.status(200).json({ success: true });
    await prisma.messageDelete.create({ data: { userId, messageId: parseInt(messageId) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Benden sil hatası:', error);
    res.status(500).json({ error: 'Mesaj silinemedi' });
  }
};

// Bir mesajı herkesten sil (Herkesten Sil)
const deleteMessageForAll = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { messageId } = req.params;
    const message = await prisma.message.findUnique({ where: { id: parseInt(messageId) } });
    if (!message) return res.status(404).json({ error: 'Mesaj bulunamadı' });
    if (message.senderId !== userId) return res.status(403).json({ error: 'Sadece kendi mesajını herkesten silebilirsin' });
    // Önce MessageDelete kayıtlarını sil
    await prisma.messageDelete.deleteMany({ where: { messageId: parseInt(messageId) } });
    // Sonra mesajı sil
    await prisma.message.delete({ where: { id: parseInt(messageId) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Herkesten sil hatası:', error);
    res.status(500).json({ error: 'Mesaj herkesten silinemedi' });
  }
};

// Bir sohbeti sadece kendinden sil (Benden Sil)
const deleteChatForMe = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { chatId } = req.params;
    // Sohbet var mı kontrol et
    const chat = await prisma.chat.findUnique({ where: { id: parseInt(chatId) } });
    if (!chat) return res.status(404).json({ error: 'Sohbet bulunamadı' });
    // Zaten silinmiş mi kontrol et
    const alreadyDeleted = await prisma.chatDelete.findUnique({ where: { userId_chatId: { userId, chatId: parseInt(chatId) } } });
    if (alreadyDeleted) return res.status(200).json({ success: true });
    await prisma.chatDelete.create({ data: { userId, chatId: parseInt(chatId) } });
    res.json({ success: true });
  } catch (error) {
    console.error('Sohbeti benden sil hatası:', error);
    res.status(500).json({ error: 'Sohbet silinemedi' });
  }
};

module.exports = {
  sendMessage,
  getUserMessages,
  getRecentChats,
  deleteMessageForMe,
  deleteMessageForAll,
  deleteChatForMe,
}; 