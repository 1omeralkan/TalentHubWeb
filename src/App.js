import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage"; 
import UploadPage from "./pages/UploadPage"; // ⬅️ Yeni sayfa eklendi
import ForgotPasswordPage from "./pages/ForgotPasswordPage"; 

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} /> 
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />{/* ⬅️ Yeni route */}
      </Routes>
    </Router>
  );
}

export default App;
