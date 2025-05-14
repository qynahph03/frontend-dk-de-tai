//frontend/src/pages/Teacher/Notifications.jsx

import React, { useEffect, useState } from "react";
import { getNotifications, markAllNotificationsAsRead } from "../../services/notificationService";
import { useAuth } from "../../context/AuthContext";
import "../../assets/css/Teacher/notifications.css"; // Đảm bảo bạn đã nhập đúng file CSS
import Sidebar from "../../components/Sidebar/Sidebar";

const TeacherNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user.token) {
      fetchNotifications();
    } else {
      console.error("Không có token, vui lòng đăng nhập lại.");
      setLoading(false);
    }
  }, []);

  const fetchNotifications = async () => {
    try {
      const data = await getNotifications(user.token, 'teacher');  // Lọc theo role teacher
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi khi lấy thông báo:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(user.token);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái thông báo:", error);
    }
  };

  // Định dạng thời gian
  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="teacher-notifications-container">
      <Sidebar role="teacher" />

      <h2 className="teacher-notifications-title">Thông báo của Giảng viên</h2>

      <button onClick={markAllAsRead} className="teacher-notifications-btn">
        Đánh dấu tất cả đã đọc
      </button>

      {loading ? (
        <p className="teacher-notifications-loading">Đang tải...</p>
      ) : (
        <div className="teacher-notifications-list-container">
          <ul className="teacher-notifications-list">
            {notifications.length === 0 ? (
              <p className="teacher-notifications-empty">Không có thông báo nào.</p>
            ) : (
              notifications.map((notification) => (
                <li
                  key={notification._id}
                  className={`teacher-notification-item ${notification.isRead ? "teacher-notification-read" : "teacher-notification-unread"}`}
                >
                  <p className="teacher-notification-message">{notification.message}</p>
                  <small className="teacher-notification-time">
                    📅 {formatDate(notification.createdAt)} | {notification.isRead ? "✅ Đã đọc" : "📩 Chưa đọc"}
                  </small>
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default TeacherNotifications;
