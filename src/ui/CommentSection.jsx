import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaThumbsUp, FaThumbsDown } from "react-icons/fa";

const API_URL = "http://localhost:5000/api/comments";
const LIKE_API_URL = "http://localhost:5000/api/comment-likes";
const DISLIKE_API_URL = "http://localhost:5000/api/comment-dislikes";

// User ve Comment objesi yapısı (TypeScript değil, açıklama amaçlı)
// User: { id, userName?, fullName?, profilePhotoUrl? }
// Comment: { id, content, createdAt, user, replies, parentId? }

const LikeButton = ({ commentId, currentUser, liked, setLiked, disliked, setDisliked, likeCount, setLikeCount, dislikeCount, setDislikeCount }) => {
  const [loading, setLoading] = useState(false);

  // Beğeni sayısı ve kullanıcının beğenip beğenmediğini getir
  const fetchLikeData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [countRes, likedRes] = await Promise.all([
        fetch(`${LIKE_API_URL}/${commentId}/count`),
        currentUser ? fetch(`${LIKE_API_URL}/${commentId}/is-liked`, { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve({ json: () => ({ liked: false }) })
      ]);
      const countData = await countRes.json();
      setLikeCount(countData.count || 0);
      if (currentUser) {
        const likedData = await likedRes.json();
        setLiked(!!likedData.liked);
      }
    } catch (err) {
      console.error("Like veri çekme hatası:", err);
    }
  };

  useEffect(() => {
    fetchLikeData();
    // eslint-disable-next-line
  }, [commentId, currentUser]);

  // Beğeni toggle
  const handleToggleLike = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${LIKE_API_URL}/${commentId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Like response:", data);
      
      // Like durumunu güncelle
      setLiked(data.liked);
      setDisliked(data.disliked);
      
      // Sayıları güncelle
      if (data.liked) {
        // Like eklendi, dislike varsa azalt
        setLikeCount(prev => prev + 1);
        if (disliked) {
          setDislikeCount(prev => prev - 1);
        }
      } else {
        // Like kaldırıldı
        setLikeCount(prev => prev - 1);
      }
    } catch (err) {
      console.error("Like toggle hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleLike}
      disabled={loading || !currentUser}
      style={{
        background: "none",
        border: "none",
        color: liked ? "#64FFDA" : "#888",
        cursor: currentUser ? "pointer" : "not-allowed",
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontWeight: 700,
        fontSize: 16,
        marginRight: 8,
        opacity: loading ? 0.7 : 1,
        transition: 'all 0.2s'
      }}
      title={currentUser ? (liked ? "Beğenmekten vazgeç" : "Beğen") : "Giriş yapmalısın"}
    >
      <FaThumbsUp style={{ fontSize: 20, marginRight: 2, color: liked ? "#64FFDA" : "#888", filter: liked ? 'drop-shadow(0 2px 8px #64FFDA88)' : 'none', transition: 'color 0.18s, filter 0.18s' }} />
      <span>{likeCount}</span>
    </button>
  );
};

const DislikeButton = ({ commentId, currentUser, liked, setLiked, disliked, setDisliked, likeCount, setLikeCount, dislikeCount, setDislikeCount }) => {
  const [loading, setLoading] = useState(false);

  // Dislike sayısı ve kullanıcının dislike edip etmediğini getir
  const fetchDislikeData = async () => {
    try {
      const token = localStorage.getItem("token");
      const [countRes, dislikedRes] = await Promise.all([
        fetch(`${DISLIKE_API_URL}/${commentId}/count`),
        currentUser ? fetch(`${DISLIKE_API_URL}/${commentId}/is-disliked`, { headers: { Authorization: `Bearer ${token}` } }) : Promise.resolve({ json: () => ({ disliked: false }) })
      ]);
      const countData = await countRes.json();
      setDislikeCount(countData.count || 0);
      if (currentUser) {
        const dislikedData = await dislikedRes.json();
        setDisliked(!!dislikedData.disliked);
      }
    } catch (err) {
      console.error("Dislike veri çekme hatası:", err);
    }
  };

  useEffect(() => {
    fetchDislikeData();
    // eslint-disable-next-line
  }, [commentId, currentUser]);

  // Dislike toggle
  const handleToggleDislike = async () => {
    if (!currentUser) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${DISLIKE_API_URL}/${commentId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const data = await res.json();
      console.log("Dislike response:", data);
      
      // Dislike durumunu güncelle
      setDisliked(data.disliked);
      setLiked(data.liked);
      
      // Sayıları güncelle
      if (data.disliked) {
        // Dislike eklendi, like varsa azalt
        setDislikeCount(prev => prev + 1);
        if (liked) {
          setLikeCount(prev => prev - 1);
        }
      } else {
        // Dislike kaldırıldı
        setDislikeCount(prev => prev - 1);
      }
    } catch (err) {
      console.error("Dislike toggle hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleToggleDislike}
      disabled={loading || !currentUser}
      style={{
        background: "none",
        border: "none",
        color: disliked ? "#a21caf" : "#888",
        cursor: currentUser ? "pointer" : "not-allowed",
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontWeight: 700,
        fontSize: 16,
        marginRight: 8,
        opacity: loading ? 0.7 : 1,
        transition: 'all 0.2s'
      }}
      title={currentUser ? (disliked ? "Beğenmemekten vazgeç" : "Beğenmedim") : "Giriş yapmalısın"}
    >
      <FaThumbsDown style={{ fontSize: 20, marginRight: 2, color: disliked ? "#a21caf" : "#888", filter: disliked ? 'drop-shadow(0 2px 8px #a21caf88)' : 'none', transition: 'color 0.18s, filter 0.18s' }} />
      <span>{dislikeCount}</span>
    </button>
  );
};

const commentBoxStyle = (isReply) => ({
  marginBottom: 14,
  background: isReply ? '#192B3F' : '#233554',
  borderRadius: 16,
  boxShadow: isReply ? '0 1px 4px #64FFDA11' : '0 2px 12px #64FFDA22',
  padding: isReply ? '12px 18px 10px 38px' : '16px 22px 12px 22px',
  border: isReply ? '1.5px solid #233554' : '2px solid #64FFDA22',
  color: '#E6F1FF',
  position: 'relative',
  minWidth: 0,
  width: '100%',
  transition: 'box-shadow 0.18s, border 0.18s',
});

const userInfoStyle = {
  fontWeight: 700,
  fontSize: 16,
  color: '#64FFDA',
  display: 'inline-block',
  marginRight: 8,
  letterSpacing: 0.1,
  textDecoration: 'none',
};

const dateStyle = {
  color: '#b0b3c6',
  fontSize: 13,
  fontWeight: 500,
  marginLeft: 6,
  letterSpacing: 0.1,
};

const actionBarStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginLeft: 2,
};

const replyBtnStyle = {
  color: '#4f46e5',
  fontWeight: 600,
  fontSize: 15,
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  marginLeft: 8,
  transition: 'color 0.18s',
};

const menuBtnStyle = {
  background: 'none',
  border: 'none',
  color: '#bbb',
  fontSize: 20,
  cursor: 'pointer',
  marginLeft: 8,
  borderRadius: 6,
  transition: 'color 0.18s',
};

const inputBoxStyle = {
  background: '#192B3F',
  color: '#E6F1FF',
  border: '2px solid #64FFDA44',
  borderRadius: 12,
  padding: '0.85rem 1.2rem',
  fontSize: '1.08rem',
  marginTop: 8,
  marginBottom: 0,
  width: '100%',
  outline: 'none',
  boxShadow: '0 1px 4px #64FFDA11',
  transition: 'border 0.18s, box-shadow 0.18s',
};

const sendBtnStyle = {
  background: 'linear-gradient(90deg, #64FFDA 0%, #4f46e5 100%)',
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  padding: '0.7rem 1.6rem',
  fontWeight: 700,
  fontSize: '1.08rem',
  cursor: 'pointer',
  marginLeft: 8,
  boxShadow: '0 2px 8px #64FFDA22',
  transition: 'background 0.18s, box-shadow 0.18s',
};

const ReplyThread = ({ comment, currentUser, onReply, replyTo, replyContent, setReplyContent, setReplyTo, handleAddReply, loading, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [dislikeCount, setDislikeCount] = useState(0);

  const handleDelete = async () => {
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true);
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/comments/${comment.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Yorum silinemedi");
      }

      onDelete(comment.id);
    } catch (err) {
      alert(err.message || "Yorum silinirken bir hata oluştu");
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    if (!editContent.trim() || editContent === comment.content) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/comments/${comment.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ content: editContent.trim() }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Yorum düzenlenemedi");
      }

      const updatedComment = await res.json();
      // Yorumu güncelle
      comment.content = updatedComment.content;
      setIsEditing(false);
    } catch (err) {
      alert(err.message || "Yorum düzenlenirken bir hata oluştu");
    } finally {
      setIsUpdating(false);
    }
  };

  // Kullanıcı id kontrolü hem userId hem user.id üzerinden yapılmalı
  const isOwner = currentUser && (currentUser.id === comment.userId || currentUser.id === (comment.user && comment.user.id));
  const isVideoOwner = currentUser && currentUser.id === (comment.upload?.userId);
  const canDelete = isOwner || isVideoOwner;

  // Üç nokta menü tıklama
  const handleMenuClick = (e) => {
    e.stopPropagation();
    if (!isOwner && !canDelete) {
      alert("Bu yorumu sadece sahibi veya video sahibi düzenleyebilir/silebilir.");
      setShowMenu(false);
      return;
    }
    setShowMenu((prev) => !prev);
  };

  // Menü dışına tıklanınca menüyü kapat
  useEffect(() => {
    if (!showMenu) return;
    const close = () => setShowMenu(false);
    window.addEventListener("click", close);
    return () => window.removeEventListener("click", close);
  }, [showMenu]);

  return (
    <div style={commentBoxStyle(!!comment.parentId)}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 2 }}>
        <div>
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {comment.user?.profilePhotoUrl ? (
              <Link to={`/profile/${comment.user.id}`} style={{ display: 'inline-block' }}>
                <img
                  src={`http://localhost:5000${comment.user.profilePhotoUrl}`}
                  alt={comment.user.userName}
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    border: '1.2px solid #e0e7ff',
                    background: '#f3e8ff',
                    marginRight: 2,
                    boxShadow: '0 1px 3px #e0e7ff44',
                    transition: 'box-shadow 0.18s',
                    cursor: 'pointer',
                  }}
                />
              </Link>
            ) : (
              <Link to={`/profile/${comment.user.id}`} style={{ display: 'inline-block' }}>
                <div
                  style={{
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: '#f3e8ff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    color: '#6366f1',
                    fontSize: 15,
                    marginRight: 2,
                    border: '1.2px solid #e0e7ff',
                    boxShadow: '0 1px 3px #e0e7ff44',
                    transition: 'box-shadow 0.18s',
                    cursor: 'pointer',
                  }}
                >
                  {comment.user?.userName?.[0]?.toUpperCase() || 'K'}
                </div>
              </Link>
            )}
            <span style={userInfoStyle}>@{comment.user?.userName || comment.user?.fullName || "Kullanıcı"}</span>
          </span>
          <span style={dateStyle}>{new Date(comment.createdAt).toLocaleString("tr-TR")}</span>
        </div>
        <div style={actionBarStyle}>
          <LikeButton 
            commentId={comment.id} 
            currentUser={currentUser} 
            liked={liked} 
            setLiked={setLiked}
            disliked={disliked}
            setDisliked={setDisliked}
            likeCount={likeCount}
            setLikeCount={setLikeCount}
            dislikeCount={dislikeCount}
            setDislikeCount={setDislikeCount}
          />
          <DislikeButton 
            commentId={comment.id} 
            currentUser={currentUser} 
            liked={liked} 
            setLiked={setLiked} 
            disliked={disliked} 
            setDisliked={setDisliked}
            likeCount={likeCount}
            setLikeCount={setLikeCount}
            dislikeCount={dislikeCount}
            setDislikeCount={setDislikeCount}
          />
          {/* Üç nokta menüsü */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={handleMenuClick}
              style={menuBtnStyle}
              title="Daha fazla"
              tabIndex={0}
            >
              &#8942;
            </button>
            {showMenu && !isEditing && (
              <div style={{
                position: 'absolute',
                top: 24,
                right: 0,
                background: '#fff',
                border: '1px solid #ddd',
                borderRadius: 6,
                boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                zIndex: 10,
                minWidth: 140,
                padding: '4px 0'
              }}>
                {isOwner && (
                  <button
                    onClick={() => { setIsEditing(true); setShowMenu(false); }}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      color: '#23223b',
                      padding: '10px 14px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: 15,
                      borderRadius: 6,
                    }}
                  >
                    Yorumu Düzenle
                  </button>
                )}
                {canDelete && (
                  <button
                    onClick={() => { setShowMenu(false); handleDelete(); }}
                    style={{
                      width: '100%',
                      background: 'none',
                      border: 'none',
                      color: '#e11d48',
                      padding: '10px 14px',
                      textAlign: 'left',
                      cursor: 'pointer',
                      fontSize: 15,
                      borderRadius: 6,
                    }}
                  >
                    Yorumu Sil
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {isEditing ? (
        <form onSubmit={handleEdit} style={{ marginTop: 8 }}>
          <textarea
            value={editContent}
            onChange={e => setEditContent(e.target.value)}
            style={{
              width: "100%",
              minHeight: 60,
              padding: 8,
              borderRadius: 6,
              border: "1px solid #ddd",
              marginBottom: 8,
              resize: "vertical",
              fontFamily: "inherit",
              fontSize: 14
            }}
            disabled={isUpdating}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="submit"
              disabled={isUpdating || !editContent.trim() || editContent === comment.content}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                background: "#6366f1",
                color: "#fff",
                border: "none",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              {isUpdating ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setEditContent(comment.content);
              }}
              disabled={isUpdating}
              style={{
                padding: "6px 12px",
                borderRadius: 6,
                background: "#eee",
                color: "#444",
                border: "none",
                fontWeight: 500,
                cursor: "pointer"
              }}
            >
              İptal
            </button>
          </div>
        </form>
      ) : (
        <>
          <div style={{ marginTop: 2, fontSize: 15, color: '#fff', fontWeight: 500, whiteSpace: 'pre-line' }}>{comment.content}</div>
          {currentUser && (
            <button 
              style={replyBtnStyle}
              onClick={() => setReplyTo(comment.id)}
            >
              Yanıtla
            </button>
          )}
        </>
      )}

      {/* Yanıt inputu */}
      {replyTo === comment.id && !isEditing && (
        <form onSubmit={e => handleAddReply(e, comment.id)} style={{ display: 'flex', gap: 6, marginTop: 6 }}>
          <input
            type="text"
            value={replyContent}
            onChange={e => setReplyContent(e.target.value)}
            placeholder="Yanıt yaz..."
            style={{ flex: 1, padding: 6, borderRadius: 6, border: "1px solid #ddd" }}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !replyContent.trim()} style={{ padding: "6px 12px", borderRadius: 6, background: "#6366f1", color: "#fff", border: "none", fontWeight: 600 }}>
            Gönder
          </button>
          <button type="button" onClick={() => { setReplyTo(null); setReplyContent(""); }} style={{ padding: "6px 10px", borderRadius: 6, background: "#eee", color: "#444", border: "none", fontWeight: 500, marginLeft: 2 }}>
            İptal
          </button>
        </form>
      )}
    
      {/* Alt yanıtlar (recursive) */}
      {comment.replies && comment.replies.length > 0 && (
        <div>
          {comment.replies.map(reply => (
            <ReplyThread
              key={reply.id}
              comment={reply}
              currentUser={currentUser}
              onReply={onReply}
              replyTo={replyTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              setReplyTo={setReplyTo}
              handleAddReply={handleAddReply}
              loading={loading}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const commentSectionOuterStyle = {
  marginTop: 24,
  width: "100%",
  maxWidth: 480,
  background: 'linear-gradient(135deg, #112240 80%, #233554 100%)',
  borderRadius: 20,
  boxShadow: '0 2px 24px #64FFDA22',
  padding: '22px 28px',
  border: '2px solid #233554',
};

const CommentSection = ({ uploadId, currentUser, hideTitle = false }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [replyContent, setReplyContent] = useState("");

  // Yorumları getir
  const fetchComments = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/${uploadId}`);
      const data = await res.json();
      setComments(data);
    } catch (err) {
      setError("Yorumlar yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (uploadId) fetchComments();
    // eslint-disable-next-line
  }, [uploadId]);

  // Yorum silme işlemi
  const handleDeleteComment = (commentId) => {
    const deleteCommentFromTree = (comments) => {
      return comments.filter(comment => {
        if (comment.id === commentId) {
          return false;
        }
        if (comment.replies && comment.replies.length > 0) {
          comment.replies = deleteCommentFromTree(comment.replies);
        }
        return true;
      });
    };

    setComments(prevComments => deleteCommentFromTree([...prevComments]));
  };

  // Yorum ekle
  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uploadId, content: newComment }),
      });
      if (!res.ok) throw new Error("Yorum eklenemedi");
      setNewComment("");
      fetchComments();
    } catch (err) {
      setError("Yorum eklenemedi");
    } finally {
      setLoading(false);
    }
  };

  // Yanıt ekle
  const handleAddReply = async (e, parentId) => {
    e.preventDefault();
    if (!replyContent.trim()) return;
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ uploadId, content: replyContent, parentId }),
      });
      if (!res.ok) throw new Error("Yanıt eklenemedi");
      setReplyContent("");
      setReplyTo(null);
      fetchComments();
    } catch (err) {
      setError("Yanıt eklenemedi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={commentSectionOuterStyle}>
      {!hideTitle && (
        <h3 style={{ fontWeight: 800, fontSize: 22, marginBottom: 14, color: '#64FFDA', letterSpacing: 0.2, textShadow: '0 2px 8px #0A192F44' }}>Yorumlar</h3>
      )}
      {loading && <div style={{ color: '#64FFDA', fontWeight: 600 }}>Yükleniyor...</div>}
      {error && <div style={{ color: "#e11d48", fontWeight: 500 }}>{error}</div>}
      <div style={{ maxHeight: 320, overflowY: "auto", marginBottom: 14, paddingRight: 4 }}>
        {comments.length === 0 ? (
          <div style={{ color: '#b0b3c6', fontSize: 15, fontWeight: 500 }}>Henüz yorum yok.</div>
        ) : (
          comments.map((comment) => (
            <ReplyThread
              key={comment.id}
              comment={comment}
              currentUser={currentUser}
              onReply={() => setReplyTo(comment.id)}
              replyTo={replyTo}
              replyContent={replyContent}
              setReplyContent={setReplyContent}
              setReplyTo={setReplyTo}
              handleAddReply={handleAddReply}
              loading={loading}
              onDelete={handleDeleteComment}
            />
          ))
        )}
      </div>
      {currentUser && (
        <form onSubmit={handleAddComment} style={{ display: "flex", gap: 8, marginTop: 8 }}>
          <input
            type="text"
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Yorum ekle..."
            style={inputBoxStyle}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !newComment.trim()} style={sendBtnStyle}>
            Gönder
          </button>
        </form>
      )}
      {!currentUser && <div style={{ color: "#b0b3c6", fontSize: 14, marginTop: 8 }}>Yorum yapmak için giriş yap.</div>}
    </div>
  );
};

export default CommentSection; 