const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Kişisel sohbet oluştur (veya varsa bul)
const createPersonalChat = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { otherUserId } = req.body;
    if (!otherUserId || userId === otherUserId) {
      return res.status(400).json({ error: 'Geçersiz kullanıcı.' });
    }
    // Aynı iki kullanıcı arasında zaten bir sohbet var mı?
    let chat = await prisma.chat.findFirst({
      where: {
        participants: {
          some: { userId: userId },
        },
        AND: {
          participants: {
            some: { userId: otherUserId },
          },
        },
      },
      include: {
        participants: {
          include: { user: { select: { id: true, userName: true, fullName: true, profilePhotoUrl: true } } }
        },
      },
    });
    if (!chat) {
      // Yoksa oluştur
      chat = await prisma.chat.create({
        data: {
          participants: {
            create: [
              { userId: userId },
              { userId: otherUserId },
            ],
          },
        },
        include: {
          participants: {
            include: { user: { select: { id: true, userName: true, fullName: true, profilePhotoUrl: true } } }
          },
        },
      });
    }
    res.status(201).json(chat);
  } catch (error) {
    console.error('Sohbet oluşturma hatası:', error);
    res.status(500).json({ error: 'Sohbet oluşturulamadı.' });
  }
};

// Kullanıcının dahil olduğu sohbetleri getir
const getMyChats = async (req, res) => {
  try {
    const userId = req.user.userId;
    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: { userId: userId },
        },
      },
      include: {
        participants: {
          include: { user: { select: { id: true, userName: true, fullName: true, profilePhotoUrl: true } } }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
    res.json(chats);
  } catch (error) {
    console.error('Sohbetleri getirme hatası:', error);
    res.status(500).json({ error: 'Sohbetler getirilemedi.' });
  }
};

module.exports = {
  createPersonalChat,
  getMyChats,
}; 