//frontend/src/components/Sidebar/Sidebar.jsx

import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import "./sidebar.css";

const Sidebar = ({ role, onToggle }) => {
  const [isExpanded, setIsExpanded] = useState(window.innerWidth > 768);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsExpanded(window.innerWidth > 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    setIsExpanded(!isExpanded);
    if (typeof onToggle === "function") {
      onToggle(); // Gọi callback để báo cho Dashboard biết
    }
  };

  const menuItems = {
    student: [
      { name: "Trang chủ", path: "/student/dashboard", icon: "🏠" },
      { name: "Đăng ký đề tài", path: "/student/register-topic", icon: "📝" },
      { name: "Nộp báo cáo", path: "/student/report", icon: "📤" },
      { name: "Diễn đàn", path: "/student/discussions", icon: "💬" },
      { name: "Thư viện đề tài", path: "/student/library", icon: "📚" },
      { name: "Thông báo", path: "/student/notifications", icon: "🔔" },
      { name: "Cài đặt", path: "/student/settings", icon: "⚙️" },
    ],
    teacher: [
      { name: "Trang chủ", path: "/teacher/dashboard", icon: "🏠" },
      { name: "Xét duyệt đề tài", path: "/teacher/approval", icon: "📝" },
      { name: "Danh sách đề tài", path: "/teacher/topic-list", icon: "📋" },
      { name: "Chấm điểm đề tài", path: "/teacher/score", icon: "👨‍🏫" },
      { name: "Đánh giá báo cáo", path: "/teacher/review-reports", icon: "✅" },
      { name: "Diễn đàn", path: "/teacher/discussions", icon: "💬" },
      { name: "Thông báo", path: "/teacher/notifications", icon: "🔔" },
      { name: "Cài đặt", path: "/teacher/settings", icon: "⚙️" },
    ],
    admin: [
      { name: "Trang chủ", path: "/admin/dashboard", icon: "🏠" },
      { name: "Danh sách báo cáo", path: "/admin/approve-topics-page", icon: "📋" },
      { name: "Danh sách đề tài", path: "/admin/scored-topics", icon: "📝" },
      { name: "Xét duyệt đề tài", path: "/admin/approve-reject-topics", icon: "✅" },
      { name: "Thông báo", path: "/admin/notifications", icon: "🔔" },
      { name: "Cài đặt", path: "/admin/settings", icon: "⚙️" },
    ],
    uniadmin: [
      { name: "Trang chủ", path: "/uniadmin/dashboard", icon: "🏠" },
      { name: "Phê duyệt hội đồng", path: "/uniadmin/council-approval", icon: "✅" },
      { name: "Thông báo", path: "/uniadmin/notifications", icon: "🔔" },
      { name: "Cài đặt", path: "/uniadmin/settings", icon: "⚙️" },
    ],
  };

  const roleNames = {
    student: "Sinh viên",
    teacher: "Giảng viên",
    admin: "Khoa",
    uniadmin: "Trường",
  };

  const roleIcons = {
    student: "🎓",
    teacher: "📚",
    admin: "🛠",
    uniadmin: "👑",
  };

  return (
    <div>
      {/* Nút toggle nằm bên ngoài sidebar */}
      <button
        className={`sidebar-toggle-btn ${isExpanded ? "expanded-toggle" : ""}`}
        onClick={toggleSidebar}
        aria-label="Toggle sidebar"
      >
        <span className="arrow">{isExpanded ? "◀" : "▶"}</span>
      </button>

      {/* Thanh bên */}
      <div className={`sidebar ${isExpanded ? "expanded" : "collapsed"}`}>
        <h2 className={`role-label ${isExpanded ? "expanded" : "collapsed"}`}>
          <span className="icon">{roleIcons[role]}</span>
          <span className="text">{roleNames[role]}</span>
        </h2>

        <ul>
          {menuItems[role]?.map((item, index) => {
            const isActive = location.pathname === item.path;
            return (
              <li key={index} className={isActive ? "active" : ""}>
                <Link to={item.path} title={item.name}>
                  <span className="menu-icon">{item.icon}</span>
                  <span className={isExpanded ? "menu-text" : "hidden"}>{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;