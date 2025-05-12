const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

// Kullanıcıyı takip et
const followUser = async (req, res) => {
  const followerId = req.user.userId; // Token'dan gelen kullanıcı
  const followingId = parseInt(req.params.userId); // Takip edilecek kullanıcı

  try {
    // Kendini takip etmeyi engelle
    if (followerId === followingId) {
      return res.status(400).json({ message: "Kendinizi takip edemezsiniz" });
    }

    // Kullanıcının var olup olmadığını kontrol et
    const userToFollow = await prisma.user.findUnique({
      where: { id: followingId }
    });

    if (!userToFollow) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı" });
    }

    // Takip ilişkisini oluştur
    const follow = await prisma.follow.create({
      data: {
        followerId,
        followingId
      }
    });

    res.status(201).json({ message: "Kullanıcı takip edildi", follow });
  } catch (err) {
    // Eğer zaten takip ediliyorsa
    if (err.code === 'P2002') {
      return res.status(400).json({ message: "Bu kullanıcıyı zaten takip ediyorsunuz" });
    }
    console.error("Takip hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Takibi bırak
const unfollowUser = async (req, res) => {
  const followerId = req.user.userId;
  const followingId = parseInt(req.params.userId);

  try {
    const follow = await prisma.follow.delete({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    });

    res.json({ message: "Takip bırakıldı", follow });
  } catch (err) {
    if (err.code === 'P2025') {
      return res.status(404).json({ message: "Takip ilişkisi bulunamadı" });
    }
    console.error("Takip bırakma hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Takipçileri listele
const getFollowers = async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      include: {
        follower: {
          select: {
            id: true,
            userName: true,
            fullName: true,
            profilePhotoUrl: true
          }
        }
      }
    });

    res.json(followers.map(f => f.follower));
  } catch (err) {
    console.error("Takipçi listeleme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Takip edilenleri listele
const getFollowing = async (req, res) => {
  const userId = parseInt(req.params.userId);

  try {
    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      include: {
        following: {
          select: {
            id: true,
            userName: true,
            fullName: true,
            profilePhotoUrl: true
          }
        }
      }
    });

    res.json(following.map(f => f.following));
  } catch (err) {
    console.error("Takip edilenleri listeleme hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

// Takip durumunu kontrol et
const getFollowStatus = async (req, res) => {
  const followerId = req.user.userId;
  const followingId = parseInt(req.params.userId);

  try {
    const follow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId
        }
      }
    });

    res.json({ isFollowing: !!follow });
  } catch (err) {
    console.error("Takip durumu kontrol hatası:", err);
    res.status(500).json({ message: "Sunucu hatası" });
  }
};

module.exports = {
  followUser,
  unfollowUser,
  getFollowers,
  getFollowing,
  getFollowStatus
}; 