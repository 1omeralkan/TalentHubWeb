import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LoginRegisterPage from "./pages/LoginRegisterPage";
import DashboardPage from "./pages/DashboardPage"; 
import UploadPage from "./pages/UploadPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage"; 
import ProfilPage from "./pages/ProfilPage";
import EditProfilePage from "./pages/EditProfilePage";
import MainLayout from "./layouts/MainLayout";
import UserProfilePage from "./pages/UserProfilePage";
import HomePage from "./pages/HomePage";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/register" element={<LoginRegisterPage />} />
        <Route path="/login" element={<LoginRegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
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
