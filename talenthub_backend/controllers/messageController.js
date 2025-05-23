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

    const message = await prisma.message.create({
      data: {
        content,
        senderId,
        receiverId,
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

    const messages = await prisma.message.findMany({
      where: {
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
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    // Okunmamış mesajları okundu olarak işaretle
    await prisma.message.updateMany({
      where: {
        senderId: parseInt(otherUserId),
        receiverId: userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    res.json(messages);
  } catch (error) {
    console.error('Mesajları getirme hatası:', error);
    res.status(500).json({ error: 'Mesajlar getirilemedi' });
  }
};

// Kullanıcının son mesajlaştığı kişileri getirme
const getRecentChats = async (req, res) => {
  try {
    const userId = req.user.id;

    // Son mesajlaşılan kullanıcıları getir
    const recentChats = await prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId },
        ],
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
      distinct: ['senderId', 'receiverId'],
    });

    // Mesajlaşılan kullanıcıları düzenle
    const formattedChats = recentChats.map(chat => {
      const otherUser = chat.senderId === userId ? chat.receiver : chat.sender;
      return {
        user: otherUser,
        lastMessage: chat,
        unreadCount: 0, // Bu kısmı daha sonra implement edeceğiz
      };
    });

    res.json(formattedChats);
  } catch (error) {
    console.error('Son mesajlaşmaları getirme hatası:', error);
    res.status(500).json({ error: 'Son mesajlaşmalar getirilemedi' });
  }
};

module.exports = {
  sendMessage,
  getUserMessages,
  getRecentChats,
}; 