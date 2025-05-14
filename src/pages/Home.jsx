// File: frontend/src/pages/Home.jsx

import React from "react";
import { Link } from "react-router-dom";
import "../assets/css/home.css";

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Hệ thống Đăng kí Đề tài Nghiên cứu Khoa học của Sinh viên</h1>
        <p>Nền tảng hỗ trợ quá trình nghiên cứu và quản lý đề tài.</p>
      </header>
      <div className="home-links">
        <Link to="/login" className="btn btn-primary">Đăng nhập</Link>
        <Link to="/register" className="btn btn-secondary">Đăng ký</Link>
      </div>
    </div>
  );
};

export default Home;