import React, { useState, useRef } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { FaUser, FaPlusSquare, FaHome, FaSearch, FaEllipsisH } from "react-icons/fa";

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeout = useRef();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.trim().length === 0) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    searchTimeout.current = setTimeout(async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/search/users?q=${encodeURIComponent(value)}`);
        const data = await res.json();
        setSearchResults(data);
        setShowDropdown(true);
      } catch (err) {
        setSearchResults([]);
        setShowDropdown(false);
      }
    }, 350);
  };

  const handleResultClick = (userId) => {
    setShowDropdown(false);
    setSearchTerm("");
    setSearchResults([]);
    navigate(`/profile/${userId}`);
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2 style={styles.sidebarTitle}>TalentHub</h2>
        <div style={{ marginBottom: '1.2rem', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#f0f0f0', borderRadius: '8px', padding: '0.4rem 0.8rem' }}>
            <FaSearch style={{ color: '#888', fontSize: '1.1rem', marginRight: '0.5rem' }} />
            <input
              type="text"
              placeholder="Ara"
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '1rem', width: '100%' }}
              onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
          </div>
          {showDropdown && searchResults.length > 0 && (
            <ul style={styles.searchDropdown}>
              {searchResults.map(user => (
                <li key={user.id} style={styles.searchResultItem} onClick={() => handleResultClick(user.id)}>
                  <img src={user.profilePhotoUrl ? `http://localhost:5000${user.profilePhotoUrl}` : "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.fullName || user.userName)} alt="" style={styles.searchAvatar} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#4f46e5', fontSize: '1rem' }}>@{user.userName}</div>
                    <div style={{ color: '#444', fontSize: '0.95rem' }}>{user.fullName}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div style={styles.sidebarMenu}>
          <Link to="/dashboard" style={{ ...styles.sidebarItem, ...(isActive("/dashboard") && styles.activeItem) }}>
            <FaHome style={styles.icon} />
            <span>Sizin için</span>
          </Link>
          <Link to="/profile" style={{ ...styles.sidebarItem, ...(isActive("/profile") && styles.activeItem) }}>
            <FaUser style={styles.icon} />
            <span>Profil</span>
          </Link>
          <Link to="/upload" style={{ ...styles.sidebarItem, ...(isActive("/upload") && styles.activeItem) }}>
            <FaPlusSquare style={styles.icon} />
            <span>Yükle</span>
          </Link>
          <div style={styles.sidebarItem}>
            <FaEllipsisH style={styles.icon} />
            <span>Dahası</span>
          </div>
          <div style={{ height: '1.5rem' }} />
          <div style={styles.logoutButton} onClick={handleLogout}>
            <FaUser style={styles.themeIcon} />
            <span>Çıkış Yap</span>
          </div>
        </div>
      </div>
      <div style={styles.contentArea}>
        <Outlet />
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: "100vh",
    backgroundColor: "#f9f9f9",
    display: "flex",
  },
  sidebar: {
    width: "250px",
    backgroundColor: "#fff",
    boxShadow: "2px 0 5px rgba(0,0,0,0.1)",
    padding: "1.5rem 1rem 1rem 1rem",
    position: "sticky",
    top: 0,
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    zIndex: 10,
  },
  sidebarTitle: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 700,
    fontSize: '2rem',
    color: '#4f46e5',
    letterSpacing: '1px',
    marginBottom: '1.2rem',
  },
  sidebarMenu: {
    marginTop: "1rem",
    flex: 1,
  },
  sidebarItem: {
    display: "flex",
    alignItems: "center",
    padding: "0.8rem 1rem",
    color: "#333",
    textDecoration: "none",
    borderRadius: "5px",
    marginBottom: "0.5rem",
    fontWeight: 500,
    fontSize: "1.08rem",
    transition: "all 0.2s",
  },
  activeItem: {
    backgroundColor: "#4f46e5",
    color: "#fff",
  },
  icon: {
    marginRight: "0.8rem",
    fontSize: "1.2rem",
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    padding: "0.8rem 1rem",
    color: "#ef4444",
    cursor: "pointer",
    borderRadius: "5px",
    marginTop: "0.5rem",
    fontWeight: "bold",
    transition: "all 0.2s",
  },
  contentArea: {
    flex: 1,
    minHeight: "100vh",
    padding: "2rem 0 2rem 0",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  searchDropdown: {
    position: 'absolute',
    top: '48px',
    left: 0,
    width: '100%',
    background: '#fff',
    borderRadius: '8px',
    boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
    zIndex: 100,
    padding: 0,
    margin: 0,
    listStyle: 'none',
    maxHeight: '260px',
    overflowY: 'auto',
  },
  searchResultItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.7rem',
    padding: '0.7rem 1rem',
    cursor: 'pointer',
    borderBottom: '1px solid #f3f3f3',
    transition: 'background 0.18s',
    background: '#fff',
  },
  searchAvatar: {
    width: '32px',
    height: '32px',
    borderRadius: '50%',
    objectFit: 'cover',
    background: '#e0e7ff',
  },
};

export default MainLayout; 