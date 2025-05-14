//frontend/src/pages/Admin/Notifications.jsx

import React, { useEffect, useState } from "react";
import { getNotifications, markAllNotificationsAsRead } from "../../services/notificationService";
import { useAuth } from "../../context/AuthContext";
import "../../assets/css/Admin/notifications.css"; // Đảm bảo bạn đã nhập đúng file CSS
import Sidebar from "../../components/Sidebar/Sidebar";

const AdminNotifications = () => {
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
      const data = await getNotifications(user.token, 'admin');  // Lọc theo role admin
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
    <div className="admin-notifications-container">
      <Sidebar role="admin" />

      <h2 className="admin-notifications-title">Thông báo của Admin</h2>

      <button onClick={markAllAsRead} className="admin-notifications-btn">
        Đánh dấu tất cả đã đọc
      </button>

      {loading ? (
        <p className="admin-notifications-loading">Đang tải...</p>
      ) : (
        <div className="admin-notifications-list-container">
          <ul className="admin-notifications-list">
            {notifications.length === 0 ? (
              <p className="admin-notifications-empty">Không có thông báo nào.</p>
            ) : (
              notifications.map((notification) => (
                <li
                  key={notification._id}
                  className={`admin-notification-item ${notification.isRead ? "admin-notification-read" : "admin-notification-unread"}`}
                >
                  <p className="admin-notification-message">{notification.message}</p>
                  <small className="admin-notification-time">
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

export default AdminNotifications;
