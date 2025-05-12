import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage"; 
import UploadPage from "./pages/UploadPage"; // ⬅️ Yeni sayfa eklendi
import ForgotPasswordPage from "./pages/ForgotPasswordPage"; 
import ProfilPage from "./pages/ProfilPage";
import EditProfilePage from "./pages/EditProfilePage";
import MainLayout from "./layouts/MainLayout";
import UserProfilePage from "./pages/UserProfilePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route element={<MainLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} /> 
        <Route path="/upload" element={<UploadPage />} />
        <Route path="/profile" element={<ProfilPage />} />
        <Route path="/edit-profile" element={<EditProfilePage />} />
        <Route path="/profile/:userId" element={<UserProfilePage />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
