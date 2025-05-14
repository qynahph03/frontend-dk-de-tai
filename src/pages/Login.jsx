// File: frontend/src/pages/Login.jsx

import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import '../assets/css/login.css';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }

      // Lưu token vào localStorage
      localStorage.setItem("token", data.token);

      // Đăng nhập thành công thì lưu thông tin vào useAuth
      login({ username, token: data.token, role: data.role });

      // Chuyển hướng dựa trên role
      if (data.role === "student") navigate("/student/dashboard");
      else if (data.role === "teacher") navigate("/teacher/dashboard");
      else if (data.role === "admin") navigate("/admin/dashboard");

    } catch (error) {
      alert("Lỗi đăng nhập: " + error.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Đăng Nhập</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <input
              type="text"
              placeholder="Tên đăng nhập"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <input
              type="password"
              placeholder="Mật khẩu"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Đăng nhập</button>
          <p>Bạn chưa có tài khoản? <a href="/register">Đăng ký ngay</a></p>
        </form>
      </div>
    </div>
  );
};

export default Login;
