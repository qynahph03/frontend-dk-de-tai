import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar/Sidebar";
import { getNotifications, markAllNotificationsAsRead } from "../../services/notificationService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../assets/css/Uniadmin/notifications.css";

const Notifications = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const notificationData = await getNotifications(user.token);
      setNotifications(notificationData);
    } catch (error) {
      setMessage(error.message || "Không thể tải danh sách thông báo.");
      toast.error(error.message || "Không thể tải danh sách thông báo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.token || user?.role !== "uniadmin") {
      setMessage("Bạn không có quyền truy cập trang này.");
      toast.error("Bạn không có quyền truy cập trang này.");
      navigate("/login");
      return;
    }
    fetchNotifications();
  }, [user, navigate]);

  const handleMarkAllAsRead = async () => {
    setActionLoading(true);
    setMessage("");
    try {
      await markAllNotificationsAsRead(user.token);
      setMessage("Đã đánh dấu tất cả thông báo là đã đọc!");
      toast.success("Đã đánh dấu tất cả thông báo là đã đọc!");
      await fetchNotifications();
    } catch (error) {
      const errorMsg = error.message || "Không thể đánh dấu thông báo đã đọc!";
      setMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()} ${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;
  };

  return (
    <div className="notifications-container">
      <Sidebar role="uniadmin" />
      <div className="notifications-content">
        <h2>Thông báo</h2>
        <div className="action-buttons">
          <button onClick={handleMarkAllAsRead} disabled={actionLoading}>
            {actionLoading ? "Đang xử lý..." : "Đánh dấu tất cả đã đọc"}
          </button>
        </div>
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : notifications.length === 0 ? (
          <p>Không có thông báo nào.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Nội dung</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {notifications.map((notification) => (
                <tr key={notification._id}>
                  <td>{formatDate(notification.createdAt)}</td>
                  <td>{notification.message}</td>
                  <td className={notification.isRead ? "status-read" : "status-unread"}>
                    {notification.isRead ? "Đã đọc" : "Chưa đọc"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Notifications;