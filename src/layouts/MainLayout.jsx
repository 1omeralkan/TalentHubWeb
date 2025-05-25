import React, { useState, useRef } from "react";
import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { FaUser, FaPlusSquare, FaHome, FaSearch, FaEllipsisH, FaCompass, FaEnvelope, FaComments, FaMoon, FaSun, FaBars, FaChevronLeft } from "react-icons/fa";

const MainLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchTimeout = useRef();
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");
  const [sidebarOpen, setSidebarOpen] = useState(true);

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

  React.useEffect(() => {
    document.body.classList.toggle("dark", theme === "dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  return (
    <div style={{ ...styles.container, backgroundColor: '#0A192F' }}>
      <div style={{ ...styles.sidebar, width: sidebarOpen ? 250 : 64, background: '#112240', transition: 'width 0.25s cubic-bezier(.4,1.3,.6,1), background 0.2s' }}>
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.2rem', justifyContent: sidebarOpen ? 'space-between' : 'center' }}>
          {sidebarOpen && <h2 style={{ ...styles.sidebarTitle, color: '#64FFDA' }}>TalentHub</h2>}
          <button
            onClick={() => setSidebarOpen(o => !o)}
            style={{ background: 'none', border: 'none', color: '#64FFDA', fontSize: 22, cursor: 'pointer', marginLeft: sidebarOpen ? 8 : 0, transition: 'all 0.2s' }}
            aria-label={sidebarOpen ? 'Sidebarı Kapat' : 'Sidebarı Aç'}
          >
            {sidebarOpen ? <FaChevronLeft /> : <FaBars />}
          </button>
        </div>
        <div style={{ marginBottom: '1.2rem', position: 'relative', display: sidebarOpen ? 'block' : 'none', transition: 'display 0.2s' }}>
          <div style={{ display: 'flex', alignItems: 'center', background: '#233554', borderRadius: '8px', padding: '0.4rem 0.8rem' }}>
            <FaSearch style={{ color: '#64FFDA', fontSize: '1.1rem', marginRight: '0.5rem' }} />
            <input
              type="text"
              placeholder="Ara"
              value={searchTerm}
              onChange={handleSearchChange}
              style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '1rem', width: '100%', color: '#E6F1FF' }}
              onFocus={() => { if (searchResults.length > 0) setShowDropdown(true); }}
              onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
            />
          </div>
          {showDropdown && searchResults.length > 0 && (
            <ul style={{ ...styles.searchDropdown, background: '#233554', color: '#E6F1FF' }}>
              {searchResults.map(user => (
                <li key={user.id} style={styles.searchResultItem} onClick={() => handleResultClick(user.id)}>
                  <img src={user.profilePhotoUrl ? `http://localhost:5000${user.profilePhotoUrl}` : "https://ui-avatars.com/api/?name=" + encodeURIComponent(user.fullName || user.userName)} alt="" style={styles.searchAvatar} />
                  <div>
                    <div style={{ fontWeight: 600, color: '#64FFDA', fontSize: '1rem' }}>@{user.userName}</div>
                    <div style={{ color: '#E6F1FF', fontSize: '0.95rem' }}>{user.fullName}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div style={styles.sidebarMenu}>
          <Link to="/" style={{ ...styles.sidebarItem, ...(isActive("/") && styles.activeItem), justifyContent: sidebarOpen ? 'flex-start' : 'center', padding: sidebarOpen ? '1.05rem 1.1rem' : '1.05rem 0', borderRadius: 16, fontSize: sidebarOpen ? '1.13rem' : 0 }}>
            <FaHome style={{ ...styles.icon, marginRight: sidebarOpen ? 18 : 0, fontSize: sidebarOpen ? 23 : 28, minWidth: 28, textAlign: 'center' }} />
            {sidebarOpen && <span>Ana Sayfa</span>}
          </Link>
          <Link to="/dashboard" style={{ ...styles.sidebarItem, ...(isActive("/dashboard") && styles.activeItem), justifyContent: sidebarOpen ? 'flex-start' : 'center', padding: sidebarOpen ? '1.05rem 1.1rem' : '1.05rem 0', borderRadius: 16, fontSize: sidebarOpen ? '1.13rem' : 0 }}>
            <FaCompass style={{ ...styles.icon, marginRight: sidebarOpen ? 18 : 0, fontSize: sidebarOpen ? 23 : 28, minWidth: 28, textAlign: 'center' }} />
            {sidebarOpen && <span>Keşfet</span>}
          </Link>
          <Link to="/messages" style={{ ...styles.sidebarItem, ...(isActive("/messages") && styles.activeItem), justifyContent: sidebarOpen ? 'flex-start' : 'center', padding: sidebarOpen ? '1.05rem 1.1rem' : '1.05rem 0', borderRadius: 16, fontSize: sidebarOpen ? '1.13rem' : 0 }}>
            <FaComments style={{ ...styles.icon, marginRight: sidebarOpen ? 18 : 0, fontSize: sidebarOpen ? 23 : 28, minWidth: 28, textAlign: 'center' }} />
            {sidebarOpen && <span>Mesajlar</span>}
          </Link>
          <Link to="/new-message" style={{ ...styles.sidebarItem, ...(isActive("/new-message") && styles.activeItem), justifyContent: sidebarOpen ? 'flex-start' : 'center', padding: sidebarOpen ? '1.05rem 1.1rem' : '1.05rem 0', borderRadius: 16, fontSize: sidebarOpen ? '1.13rem' : 0 }}>
            <FaEnvelope style={{ ...styles.icon, marginRight: sidebarOpen ? 18 : 0, fontSize: sidebarOpen ? 23 : 28, minWidth: 28, textAlign: 'center' }} />
            {sidebarOpen && <span>Yeni Mesaj</span>}
          </Link>
          <Link to="/profile" style={{ ...styles.sidebarItem, ...(isActive("/profile") && styles.activeItem), justifyContent: sidebarOpen ? 'flex-start' : 'center', padding: sidebarOpen ? '1.05rem 1.1rem' : '1.05rem 0', borderRadius: 16, fontSize: sidebarOpen ? '1.13rem' : 0 }}>
            <FaUser style={{ ...styles.icon, marginRight: sidebarOpen ? 18 : 0, fontSize: sidebarOpen ? 23 : 28, minWidth: 28, textAlign: 'center' }} />
            {sidebarOpen && <span>Profil</span>}
          </Link>
          <Link to="/upload" style={{ ...styles.sidebarItem, ...(isActive("/upload") && styles.activeItem), justifyContent: sidebarOpen ? 'flex-start' : 'center', padding: sidebarOpen ? '1.05rem 1.1rem' : '1.05rem 0', borderRadius: 16, fontSize: sidebarOpen ? '1.13rem' : 0, marginBottom: 0 }}>
            <FaPlusSquare style={{ ...styles.icon, marginRight: sidebarOpen ? 18 : 0, fontSize: sidebarOpen ? 23 : 28, minWidth: 28, textAlign: 'center' }} />
            {sidebarOpen && <span>Yükle</span>}
          </Link>
          <div style={{ ...styles.logoutButton, justifyContent: sidebarOpen ? 'flex-start' : 'center', padding: sidebarOpen ? '1.05rem 1.1rem' : '1.05rem 0', borderRadius: 16, fontSize: sidebarOpen ? '1.13rem' : 0, marginBottom: 0, marginTop: 0 }} onClick={handleLogout}>
            <FaUser style={{ ...styles.icon, marginRight: sidebarOpen ? 18 : 0, fontSize: sidebarOpen ? 23 : 28, minWidth: 28, textAlign: 'center' }} />
            {sidebarOpen && <span>Çıkış Yap</span>}
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
    backgroundColor: "#0A192F",
    display: "flex",
  },
  sidebar: {
    width: "250px",
    background: "linear-gradient(160deg, #112240 60%, #233554 100%)",
    boxShadow: "2px 0 16px 0 rgba(36, 60, 99, 0.18)",
    padding: "2.2rem 1.2rem 1.2rem 1.2rem",
    position: "sticky",
    top: 0,
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    zIndex: 10,
    borderTopRightRadius: 32,
    borderBottomRightRadius: 32,
    transition: 'width 0.25s cubic-bezier(.4,1.3,.6,1), background 0.2s',
  },
  sidebarTitle: {
    fontFamily: 'Montserrat, sans-serif',
    fontWeight: 800,
    fontSize: '2.2rem',
    color: '#64FFDA',
    letterSpacing: '1.5px',
    marginBottom: '2.2rem',
    marginLeft: 2,
    transition: 'color 0.2s',
  },
  sidebarMenu: {
    marginTop: "1.5rem",
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '0.7rem',
  },
  sidebarItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: 'flex-start',
    padding: "1.05rem 1.1rem",
    color: "#E6F1FF",
    textDecoration: "none",
    borderRadius: "16px",
    marginBottom: "0.2rem",
    fontWeight: 600,
    fontSize: "1.13rem",
    letterSpacing: 0.1,
    transition: "all 0.22s cubic-bezier(.4,1.3,.6,1)",
    boxShadow: 'none',
  },
  activeItem: {
    background: "linear-gradient(90deg, #64FFDA 0%, #4f46e5 100%)",
    color: "#112240",
    boxShadow: '0 2px 16px 0 rgba(100,255,218,0.10)',
  },
  icon: {
    marginRight: "1.1rem",
    fontSize: "1.45rem",
    minWidth: 28,
    textAlign: 'center',
    transition: 'font-size 0.18s',
  },
  logoutButton: {
    display: "flex",
    alignItems: "center",
    padding: "1.05rem 1.1rem",
    color: "#FF6B6B",
    cursor: "pointer",
    borderRadius: "16px",
    marginTop: "0.7rem",
    fontWeight: "bold",
    fontSize: '1.13rem',
    transition: "all 0.22s cubic-bezier(.4,1.3,.6,1)",
    background: 'none',
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
    background: '#233554',
    borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(36,60,99,0.18)',
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
    padding: '0.9rem 1.2rem',
    cursor: 'pointer',
    borderBottom: '1px solid #1a2636',
    transition: 'background 0.18s',
    background: 'none',
    color: '#E6F1FF',
    fontWeight: 500,
    fontSize: '1.05rem',
  },
  searchAvatar: {
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    objectFit: 'cover',
    background: '#233554',
    border: '2px solid #64FFDA22',
  },
};

export default MainLayout; 