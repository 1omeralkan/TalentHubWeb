import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserAlt, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaGoogle, FaFacebookF, FaPinterestP, FaLinkedinIn } from "react-icons/fa";

const palette = {
  primary: "#4f46e5",
  secondary: "#6366f1",
  accent: "#a5b4fc",
  bgLeft: "#1e293b",
  yellow: "#facc15",
  white: "#fff",
  bgGradient: "linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)",
  bgLight: "#f6f7fb",
};

const LoginRegisterPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [form, setForm] = useState({
    fullName: "",
    userName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [animating, setAnimating] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSwitch = () => {
    setAnimating(true);
    setTimeout(() => {
      setIsLogin((prev) => !prev);
      setError("");
      setForm({ fullName: "", userName: "", email: "", password: "" });
      setShowPassword(false);
      setAnimating(false);
    }, 400);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    try {
      if (isLogin) {
        const res = await fetch("http://localhost:5000/api/auth/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: form.email, password: form.password }),
        });
        const data = await res.json();
        if (data.token) {
          localStorage.setItem("token", data.token);
          navigate("/dashboard");
        } else {
          setError(data.message || "Giriş başarısız!");
        }
      } else {
        const res = await fetch("http://localhost:5000/api/auth/register", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(form),
        });
        const data = await res.json();
        if (res.ok) {
          alert("Kayıt başarılı! Giriş yapabilirsiniz.");
          setIsLogin(true);
        } else {
          setError(data.message || "Kayıt başarısız!");
        }
      }
    } catch (err) {
      setError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{...styles.bgWrap, background: palette.bgLight}}>
      <div style={{...styles.gradientBg, background: palette.bgGradient, opacity: 0.10}}></div>
      <div style={styles.centerWrap}>
        <div style={{
          ...styles.card,
          boxShadow: "0 8px 32px rgba(79,70,229,0.13)",
        }}>
          {/* Sol Panel */}
          <div style={{
            ...styles.leftPanel,
            background: palette.bgLeft,
            color: palette.white,
            borderTopLeftRadius: 60,
            borderBottomLeftRadius: 60,
            borderTopRightRadius: isLogin ? 0 : 80,
            borderBottomRightRadius: isLogin ? 0 : 80,
            transition: "all 0.5s cubic-bezier(.4,1.3,.6,1)",
            transform: animating ? `scale(0.98)` : "scale(1)",
            opacity: animating ? 0.7 : 1,
          }}>
            <div style={{
              padding: '1.2rem 2rem',
              display:'flex',
              flexDirection:'column',
              alignItems:'center',
              justifyContent:'center',
              height:'100%',
              minHeight: 600,
              width: '100%',
            }}>
              <h2 style={{
                fontWeight:700,
                fontSize:'2.3rem',
                marginBottom:18,
                letterSpacing:0.5,
                marginTop: 0,
                textAlign: 'center',
                lineHeight: 1.18,
              }}>
                {isLogin ? "TalentHub'a Hoş Geldin!" : "Aramıza Katıl!"}
              </h2>
              <p style={{
                fontSize:'1.15rem',
                opacity:0.93,
                marginBottom:38,
                textAlign:'center',
                maxWidth:270,
                marginTop: 8,
                lineHeight: 1.5,
              }}>
                {isLogin
                  ? "Yeteneklerini paylaşmak ve topluluğumuza katılmak için giriş yap."
                  : "Kendi profilini oluştur, projelerini sergile ve yeni fırsatları keşfet!"}
              </p>
              <button
                onClick={handleSwitch}
                style={{
                  ...styles.switchBtn,
                  background: "none",
                  color: palette.white,
                  border: `2px solid ${palette.white}` ,
                  marginTop: 8,
                  fontWeight: 600,
                  fontSize: '1.13rem',
                  letterSpacing: 0.2,
                  boxShadow: 'none',
                  transition: 'all 0.2s',
                  minWidth: 190,
                  minHeight: 50,
                }}
                disabled={animating}
              >
                {isLogin ? "KAYIT OL" : "GİRİŞ YAP"}
              </button>
            </div>
          </div>
          {/* Sağ Panel (Form) */}
          <div style={{
            ...styles.rightPanel,
            borderTopRightRadius: 60,
            borderBottomRightRadius: 60,
            borderTopLeftRadius: isLogin ? 80 : 0,
            borderBottomLeftRadius: isLogin ? 80 : 0,
            background: palette.white,
            transition: "all 0.5s cubic-bezier(.4,1.3,.6,1)",
            transform: animating ? `scale(0.98)` : "scale(1)",
            opacity: animating ? 0.7 : 1,
          }}>
            <div style={{padding: '2.5rem 2rem', minWidth: 320, maxWidth: 370, width: '100%', display:'flex', flexDirection:'column', alignItems:'center'}}>
              <h2 style={{fontWeight:700, fontSize:'1.7rem', color:palette.primary, marginBottom:8, letterSpacing:0.5}}>
                {isLogin ? "Giriş Yap" : "Kayıt Ol"}
              </h2>
              <div style={{display:'flex', gap:12, margin:'12px 0 18px 0'}}>
                <SocialButton icon={<FaGoogle />} />
                <SocialButton icon={<FaFacebookF />} />
                <SocialButton icon={<FaPinterestP />} />
                <SocialButton icon={<FaLinkedinIn />} />
              </div>
              <div style={{fontWeight:600, color:palette.secondary, margin:'8px 0 8px 0', fontSize:'1.08rem'}}>VEYA</div>
              <form onSubmit={handleSubmit} style={{width:'100%', display:'flex', flexDirection:'column', gap:16}}>
                {!isLogin && (
                  <>
                    <InputField
                      icon={<FaUserAlt />}
                      name="fullName"
                      type="text"
                      placeholder="Ad Soyad"
                      value={form.fullName}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                    <InputField
                      icon={<FaUserAlt />}
                      name="userName"
                      type="text"
                      placeholder="Kullanıcı Adı"
                      value={form.userName}
                      onChange={handleChange}
                      disabled={isLoading}
                    />
                  </>
                )}
                <InputField
                  icon={<FaEnvelope />}
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={form.email}
                  onChange={handleChange}
                  disabled={isLoading}
                />
                <InputField
                  icon={<FaLock />}
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Şifre"
                  value={form.password}
                  onChange={handleChange}
                  disabled={isLoading}
                  rightIcon={showPassword ? <FaEyeSlash /> : <FaEye />}
                  onRightIconClick={() => setShowPassword((v) => !v)}
                />
                {error && (
                  <div style={styles.error}>{error}</div>
                )}
                <button
                  type="submit"
                  style={{
                    ...styles.submitBtn,
                    background: isLogin
                      ? palette.bgGradient
                      : palette.bgGradient,
                    color: palette.white,
                    opacity: isLoading ? 0.7 : 1,
                    cursor: isLoading ? 'not-allowed' : 'pointer',
                    fontWeight: 700,
                    fontSize: '1.08rem',
                    letterSpacing: 0.5,
                    transition: 'background 0.2s, box-shadow 0.2s',
                    boxShadow: '0 2px 8px rgba(99,102,241,0.08)',
                  }}
                  onMouseOver={e => e.currentTarget.style.background = 'linear-gradient(90deg, #3730a3, #4f46e5)'}
                  onMouseOut={e => e.currentTarget.style.background = palette.bgGradient}
                  disabled={isLoading}
                >
                  {isLoading ? 'Yükleniyor...' : isLogin ? 'GİRİŞ YAP' : 'KAYIT OL'}
                </button>
              </form>
              {isLogin && (
                <button
                  style={{
                    ...styles.forgotBtn,
                    color: palette.primary,
                    marginTop: 12,
                  }}
                  onClick={() => navigate('/forgot-password')}
                  type="button"
                >
                  Şifreni mi unuttun?
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function SocialButton({ icon }) {
  return (
    <button style={{
      border: '1.5px solid #e5e7eb',
      background: '#fff',
      borderRadius: 8,
      width: 38,
      height: 38,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 18,
      color: '#4f46e5',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 1px 2px rgba(99,102,241,0.05)',
    }} type="button">
      {icon}
    </button>
  );
}

function InputField({ icon, rightIcon, onRightIconClick, ...props }) {
  return (
    <div style={{ position: 'relative', width: '100%' }}>
      <span style={{
        position: 'absolute',
        left: 14,
        top: '50%',
        transform: 'translateY(-50%)',
        color: '#a5b4fc',
        fontSize: 17,
        zIndex: 2,
      }}>{icon}</span>
      <input
        {...props}
        style={{
          padding: rightIcon ? '0.85rem 2.8rem 0.85rem 2.8rem' : '0.85rem 1rem 0.85rem 2.8rem',
          borderRadius: 12,
          border: '1.5px solid #e5e7eb',
          fontSize: '1rem',
          background: '#f8fafc',
          transition: 'all 0.2s',
          outline: 'none',
          width: '100%',
          boxShadow: '0 1px 2px rgba(99,102,241,0.05)',
          boxSizing: 'border-box',
          minWidth: 0,
          maxWidth: '100%',
        }}
      />
      {rightIcon && (
        <button
          type="button"
          onClick={onRightIconClick}
          style={{
            position: 'absolute',
            right: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'none',
            border: 'none',
            color: '#a5b4fc',
            cursor: 'pointer',
            padding: 4,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 17,
          }}
        >
          {rightIcon}
        </button>
      )}
    </div>
  );
}

const styles = {
  bgWrap: {
    minHeight: '100vh',
    width: '100vw',
    background: 'linear-gradient(135deg, #f6f7fb 0%, #e0e7ff 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  gradientBg: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100vw',
    height: '100vh',
    background: 'linear-gradient(120deg, #4f46e5 0%, #a5b4fc 100%)',
    opacity: 0.13,
    zIndex: 0,
  },
  centerWrap: {
    width: '100%',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  card: {
    display: 'flex',
    flexDirection: 'row',
    minHeight: 600,
    minWidth: 700,
    maxWidth: 900,
    width: '90vw',
    background: '#fff',
    borderRadius: 60,
    overflow: 'hidden',
    position: 'relative',
    transition: 'all 0.5s cubic-bezier(.4,1.3,.6,1)',
  },
  leftPanel: {
    width: 320,
    minHeight: 600,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2,
    borderTopRightRadius: 60,
    borderBottomRightRadius: 60,
    borderTopLeftRadius: 60,
    borderBottomLeftRadius: 60,
  },
  rightPanel: {
    flex: 1,
    minHeight: 600,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    zIndex: 2,
    background: '#fff',
    borderTopLeftRadius: 60,
    borderBottomLeftRadius: 60,
    borderTopRightRadius: 60,
    borderBottomRightRadius: 60,
  },
  switchBtn: {
    border: '2px solid',
    borderRadius: 8,
    padding: '0.7rem 2.2rem',
    fontSize: '1.08rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginTop: 18,
    transition: 'all 0.2s',
    background: 'none',
    boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
  },
  submitBtn: {
    border: 'none',
    borderRadius: 8,
    padding: '0.9rem 0',
    fontSize: '1.08rem',
    fontWeight: 700,
    cursor: 'pointer',
    marginTop: 8,
    transition: 'all 0.2s',
    boxShadow: '0 2px 8px rgba(99,102,241,0.08)',
    width: '100%',
  },
  forgotBtn: {
    background: 'none',
    border: 'none',
    fontWeight: 500,
    fontSize: '0.98rem',
    cursor: 'pointer',
    textDecoration: 'underline',
    marginTop: 8,
    transition: 'color 0.2s',
  },
  error: {
    color: '#ef4444',
    marginBottom: '0.5rem',
    textAlign: 'center',
    fontSize: '0.95rem',
    fontWeight: 500,
    background: '#fef2f2',
    borderRadius: 8,
    padding: '0.75rem 1rem',
    border: '1px solid #fecaca',
    animation: 'shake 0.5s cubic-bezier(.36,.07,.19,.97) both',
  },
};

export default LoginRegisterPage; 