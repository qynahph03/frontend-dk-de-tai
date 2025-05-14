// frontend/src/pages/Admin/Dashboard.jsx

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useAuth } from "../../context/AuthContext";
import { fetchAdminDashboardOverview } from "../../services/addashboardService";
import { getAllTopics } from "../../services/topicService";
import { getNotifications, markAllNotificationsAsRead } from "../../services/notificationService";
import { toast } from "react-toastify";
import "../../assets/css/Admin/dashboard.css";

const AdminDashboard = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState({
    topicCount: 0,
    reportCount: 0,
    councilCount: 0,
    unreadNotifications: 0,
    pendingTopics: 0,
    stopPerformingTopics: 0,
  });
  const [topics, setTopics] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Lấy dữ liệu tổng quan
      const overviewData = await fetchAdminDashboardOverview(user.token);
      setOverview(overviewData);

      // Lấy danh sách đề tài chờ phê duyệt
      const topicData = await getAllTopics(user.token);
      const pendingTopics = topicData.filter(
        (topic) => topic.status === "teacher-approve" || topic.status === "stop-performing"
      );
      setTopics(pendingTopics.slice(0, 5)); // Giới hạn 5 đề tài

      // Lấy danh sách thông báo
      const notificationData = await getNotifications(user.token);
      setNotifications(notificationData.slice(0, 5)); // Giới hạn 5 thông báo
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error.message);
      toast.error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(user.token);
      const updatedNotifications = notifications.map((notif) => ({
        ...notif,
        isRead: true,
      }));
      setNotifications(updatedNotifications);
      setOverview((prev) => ({ ...prev, unreadNotifications: 0 }));
      toast.success("Đã đánh dấu tất cả thông báo là đã đọc!");
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc:", error.message);
      toast.error(error.message);
    }
  };

  const handleViewTopic = () => {
    window.location.href = "/admin/approve-reject-topics";
  };

  useEffect(() => {
    if (user?.token) {
      loadData();
    }
  }, [user]);

  return (
    <div id="admin-dashboard" className="admin-dashboard-container">
      <Sidebar role="admin" />
      <div className="admin-dashboard-content">
        <h2>📊 Trang chủ</h2>

        {/* Tổng quan */}
        <div className="admin-overview-section">
          <div className="admin-overview-card">
            <h4>Tổng số đề tài</h4>
            <p>{overview.topicCount}</p>
          </div>
          <div className="admin-overview-card">
            <h4>Số báo cáo đã nộp</h4>
            <p>{overview.reportCount}</p>
          </div>
          <div className="admin-overview-card">
            <h4>Thông báo chưa đọc</h4>
            <p>{overview.unreadNotifications}</p>
          </div>
          <div className="admin-overview-card">
            <h4>Đề tài chờ phê duyệt</h4>
            <p>{overview.pendingTopics}</p>
          </div>
        </div>

        {/* Thông báo */}
        <div className="admin-notifications-section">
          <div className="admin-notifications-header">
            <h3>🔔 Thông báo gần đây</h3>
            {notifications.some((notif) => !notif.isRead) && (
              <button className="admin-mark-read-btn" onClick={handleMarkAllAsRead}>
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
          {isLoading ? (
            <p>Đang tải...</p>
          ) : notifications.length === 0 ? (
            <p>Chưa có thông báo nào.</p>
          ) : (
            <div className="admin-notification-cards">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`admin-notification-card ${notification.isRead ? "read" : "unread"}`}
                >
                  <p>{notification.message}</p>
                  <small>{new Date(notification.createdAt).toLocaleString()}</small>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Đề tài chờ phê duyệt */}
        <div className="admin-topics-section">
          <h3>📋 Đề tài chờ phê duyệt</h3>
          {isLoading ? (
            <p>Đang tải...</p>
          ) : topics.length === 0 ? (
            <p>Chưa có đề tài nào chờ phê duyệt.</p>
          ) : (
            <div className="admin-topic-cards">
              {topics.map((topic) => (
                <div
                  key={topic._id}
                  className="admin-topic-card"
                  onClick={() => handleViewTopic()}
                >
                  <h4>{topic.topicName}</h4>
                  <p>{topic.topicDescription}</p>
                  <p>Giảng viên: {topic.supervisor?.name || "Chưa có"}</p>
                  <p>Trạng thái: {topic.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

