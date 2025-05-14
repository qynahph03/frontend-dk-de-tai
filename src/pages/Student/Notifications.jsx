//frontend/src/pages/Student/Notifications.jsx

import React, { useEffect, useState } from "react";
import { getNotifications, markAllNotificationsAsRead } from "../../services/notificationService";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useAuth } from "../../context/AuthContext";
import "../../assets/css/Student/notifications.css";

const StudentNotifications = () => {
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
      const data = await getNotifications(user.token, 'student');  // Lọc theo role student
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

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit", month: "2-digit", year: "numeric",
      hour: "2-digit", minute: "2-digit"
    });
  };

  return (
    <div className="stu-notifications-container">
      <Sidebar role="student" />
      <h2 className="stu-notifications-title">Thông báo của bạn</h2>

      <button onClick={markAllAsRead} className="stu-notifications-btn">
        Đánh dấu tất cả đã đọc
      </button>

      {loading ? (
        <p className="stu-notifications-loading">Đang tải...</p>
      ) : (
        <div className="stu-notifications-list-container">
          <ul className="stu-notifications-list">
            {notifications.length === 0 ? (
              <p className="stu-notifications-empty">Không có thông báo nào.</p>
            ) : (
              notifications.map((notification) => (
                <li
                  key={notification._id}
                  className={`stu-notification-item ${notification.isRead ? "stu-notification-read" : "stu-notification-unread"}`}
                >
                  <p className="stu-notification-message">{notification.message}</p>
                  <small className="stu-notification-time">
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

export default StudentNotifications;
