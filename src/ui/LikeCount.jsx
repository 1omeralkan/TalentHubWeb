import React, { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { Link } from "react-router-dom";

const API_BASE = "http://localhost:5000/api";

const LikeCount = ({ uploadId }) => {
  const [count, setCount] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [likers, setLikers] = useState([]);
  const [loadingLikers, setLoadingLikers] = useState(false);

  useEffect(() => {
    if (!uploadId) return;
    fetch(`${API_BASE}/uploads/${uploadId}/likes`)
      .then(res => res.json())
      .then(data => setCount(data.count || 0));
  }, [uploadId]);

  const handleShowLikers = async () => {
    setShowModal(true);
    setLoadingLikers(true);
    try {
      const res = await fetch(`${API_BASE}/uploads/${uploadId}/likers`);
      const data = await res.json();
      setLikers(data.users || []);
    } catch (err) {
      setLikers([]);
    } finally {
      setLoadingLikers(false);
    }
  };

  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginTop: 6, cursor: "pointer" }} onClick={handleShowLikers} title="Beğenenleri gör">
        <FaHeart style={{ color: "#e11d48", fontSize: "1.15rem" }} />
        <span style={{ fontWeight: 600, color: "#64FFDA", fontSize: "1.05rem" }}>{count}</span>
      </div>
      {showModal && (
        <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(0,0,0,0.25)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }} onClick={() => setShowModal(false)}>
          <div style={{ background: 'linear-gradient(135deg, #112240 80%, #233554 100%)', borderRadius: 18, minWidth: 280, maxWidth: 340, maxHeight: 400, overflowY: "auto", boxShadow: "0 4px 24px #64FFDA22", padding: 20, border: '2px solid #233554', color: '#E6F1FF' }} onClick={e => e.stopPropagation()}>
            <div style={{ fontWeight: 800, fontSize: "1.18rem", marginBottom: 12, color: "#64FFDA", textAlign: "center", letterSpacing: 0.1, textShadow: '0 2px 8px #0A192F44' }}>Beğenenler</div>
            {loadingLikers ? (
              <div style={{ textAlign: "center", color: "#b0b3c6", fontSize: 15 }}>Yükleniyor...</div>
            ) : likers.length === 0 ? (
              <div style={{ textAlign: "center", color: "#b0b3c6", fontSize: 15 }}>Henüz kimse beğenmemiş.</div>
            ) : (
              <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                {likers.map(user => (
                  <li key={user.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "7px 0", borderBottom: "1px solid #233554", cursor: "pointer" }}>
                    <Link to={`/profile/${user.id}`} style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', color: 'inherit', width: '100%' }}>
                      {user.profilePhotoUrl ? (
                        <img src={`http://localhost:5000${user.profilePhotoUrl}`} alt={user.userName} style={{ width: 32, height: 32, borderRadius: "50%", objectFit: "cover", border: "1.5px solid #64FFDA", boxShadow: '0 1px 4px #64FFDA33' }} />
                      ) : (
                        <div style={{ width: 32, height: 32, borderRadius: "50%", background: "#233554", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, color: "#64FFDA", fontSize: 17, border: '1.5px solid #64FFDA' }}>{user.userName?.[0]?.toUpperCase() || "K"}</div>
                      )}
                      <span style={{ fontWeight: 600, color: "#64FFDA", fontSize: 15 }}>@{user.userName || user.fullName || "Kullanıcı"}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
            <button onClick={() => setShowModal(false)} style={{ marginTop: 16, width: "100%", background: 'linear-gradient(90deg, #64FFDA 0%, #4f46e5 100%)', color: "#fff", border: "none", borderRadius: 10, padding: "10px 0", fontWeight: 800, fontSize: 16, cursor: "pointer", letterSpacing: 0.1, boxShadow: '0 2px 8px #64FFDA22', textShadow: '0 2px 8px #0A192F44' }}>Kapat</button>
          </div>
        </div>
      )}
    </>
  );
};

export default LikeCount; 