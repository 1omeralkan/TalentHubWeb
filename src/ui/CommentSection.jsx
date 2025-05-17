import React, { useEffect, useState } from "react";

const API_URL = "http://localhost:5000/api/comments";
const LIKE_API_URL = "http://localhost:5000/api/comment-likes";

// User ve Comment objesi yapısı (TypeScript değil, açıklama amaçlı)
// User: { id, userName?, fullName?, profilePhotoUrl? }
// Comment: { id, content, createdAt, user, replies, parentId? }

const LikeButton = ({ commentId, currentUser }) => {
  const [liked, setLiked] = useState(false);
  const [count, setCount] = useState(0);
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
      setCount(countData.count || 0);
      if (currentUser) {
        const likedData = await likedRes.json();
        setLiked(!!likedData.liked);
      }
    } catch (err) {
      // ignore
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
      const data = await res.json();
      setLiked(data.liked);
      setCount(prev => data.liked ? prev + 1 : prev - 1);
    } catch (err) {
      // ignore
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
        color: liked ? "#e11d48" : "#888",
        cursor: currentUser ? "pointer" : "not-allowed",
        display: "flex",
        alignItems: "center",
        gap: 4,
        fontWeight: 600,
        fontSize: 15,
        marginRight: 8
      }}
      title={currentUser ? (liked ? "Beğenmekten vazgeç" : "Beğen") : "Giriş yapmalısın"}
    >
      <span style={{ fontSize: 18, marginRight: 2 }}>{liked ? "❤️" : "🤍"}</span>
      <span>{count}</span>
    </button>
  );
};

const commentBoxStyle = (isReply) => ({
  marginBottom: 14,
  padding: isReply ? '10px 16px' : '14px 18px',
  background: isReply ? '#f6f8fa' : '#fff',
  borderRadius: 12,
  boxShadow: isReply ? 'none' : '0 2px 12px rgba(99,102,241,0.07)',
  border: isReply ? '1px solid #e5e7eb' : '1.5px solid #e0e7ff',
  position: 'relative',
  transition: 'box-shadow 0.2s',
  minHeight: 56,
});

const userInfoStyle = {
  fontWeight: 600,
  fontSize: 15,
  color: '#4f46e5',
  display: 'inline-block',
  marginRight: 8,
};

const dateStyle = {
  color: '#888',
  fontSize: 12,
  marginLeft: 2,
  fontWeight: 400,
};

const actionBarStyle = {
  display: 'flex',
  alignItems: 'center',
  gap: 10,
  marginLeft: 2,
};

const replyBtnStyle = {
  fontSize: 13,
  color: '#6366f1',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  marginTop: 6,
  fontWeight: 500,
  padding: 0,
  transition: 'color 0.18s',
};

const ReplyThread = ({ comment, currentUser, onReply, replyTo, replyContent, setReplyContent, setReplyTo, handleAddReply, loading, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isUpdating, setIsUpdating] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

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
          <span style={userInfoStyle}>@{comment.user?.userName || comment.user?.fullName || "Kullanıcı"}</span>
          <span style={dateStyle}>{new Date(comment.createdAt).toLocaleString("tr-TR")}</span>
        </div>
        <div style={actionBarStyle}>
          <LikeButton commentId={comment.id} currentUser={currentUser} />
          {/* Üç nokta menüsü */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={handleMenuClick}
              style={{
                background: 'none',
                border: 'none',
                color: '#888',
                cursor: 'pointer',
                fontSize: 18,
                padding: '0 4px',
                lineHeight: 1
              }}
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
          <div style={{ marginTop: 2, fontSize: 15, color: '#23223b', fontWeight: 500, whiteSpace: 'pre-line' }}>{comment.content}</div>
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

const CommentSection = ({ uploadId, currentUser }) => {
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
    <div style={{ marginTop: 24, width: "100%", maxWidth: 440, background: '#f8fafc', borderRadius: 16, boxShadow: '0 2px 16px rgba(99,102,241,0.06)', padding: '18px 22px' }}>
      <h3 style={{ fontWeight: 700, fontSize: 20, marginBottom: 14, color: '#23223b', letterSpacing: 0.2 }}>Yorumlar</h3>
      {loading && <div>Yükleniyor...</div>}
      {error && <div style={{ color: "#e11d48", fontWeight: 500 }}>{error}</div>}
      <div style={{ maxHeight: 320, overflowY: "auto", marginBottom: 14, paddingRight: 4 }}>
        {comments.length === 0 ? (
          <div style={{ color: '#888', fontSize: 15, fontWeight: 500 }}>Henüz yorum yok.</div>
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
            style={{ flex: 1, padding: 10, borderRadius: 8, border: "1.5px solid #c7d2fe", fontSize: 15, background: '#fff', fontWeight: 500 }}
            disabled={loading}
          />
          <button type="submit" disabled={loading || !newComment.trim()} style={{ padding: "10px 20px", borderRadius: 8, background: "#6366f1", color: "#fff", border: "none", fontWeight: 700, fontSize: 15, letterSpacing: 0.2, boxShadow: '0 1px 4px rgba(99,102,241,0.08)' }}>
            Gönder
          </button>
        </form>
      )}
      {!currentUser && <div style={{ color: "#888", fontSize: 14, marginTop: 8 }}>Yorum yapmak için giriş yap.</div>}
    </div>
  );
};

export default CommentSection; 