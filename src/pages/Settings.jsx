// File: frontend/src/pages/Settings.jsx

import React from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
import "../assets/css/Student/settings.css"

const Settings = () => {
  const navigate = useNavigate(); // Khai báo hàm điều hướng
  const { logout } = useAuth(); // Lấy hàm logout từ AuthContext

  const handleLogout = () => {
    localStorage.removeItem("token"); // Xóa token khỏi localStorage
    logout(); // Xóa trạng thái đăng nhập
    navigate("/login");
  };

  return (
    <div className="settings-container">
      {/* <Sidebar role="student" /> */}
      <h1>⚙️ Đây là trang Cài đặt</h1>
      <div className="settings-options">
        <h3>Cài đặt tài khoản</h3>
        <ul>
          {/* Các mục cài đặt khác */}
          <li>
            <button className="setting-logout-btn" onClick={handleLogout}>
              Đăng xuất
            </button>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Settings;
