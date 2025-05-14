//src/pages/Teacher/Dashboard.jsx

import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useAuth } from "../../context/AuthContext";
import { fetchTopics, fetchDiscussions, fetchDashboardOverview } from "../../services/topicService";
import { getNotifications, markAllNotificationsAsRead } from "../../services/notificationService";
import "../../assets/css/Teacher/dashboard.css";

const TeacherDashboard = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState({ topicCount: 0, studentCount: 0, unreadNotifications: 0 });
  const [topics, setTopics] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Lấy dữ liệu tổng quan
      const overviewData = await fetchDashboardOverview(user.token);
      setOverview(overviewData);

      // Lấy danh sách đề tài
      const topicData = await fetchTopics(user.token);
      setTopics(topicData);

      // Lấy danh sách thảo luận gần đây
      const discussionData = await fetchDiscussions(user.token, 1, 3);
      setDiscussions(discussionData.discussions);

      // Lấy danh sách thông báo
      const notificationData = await getNotifications(user.token);
      // Giới hạn 5 thông báo gần nhất (vì API không hỗ trợ phân trang)
      setNotifications(notificationData.slice(0, 5));
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error.message);
      alert(error.message); // TODO: Thay bằng react-toastify
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead(user.token);
      // Cập nhật lại thông báo và tổng quan
      const updatedNotifications = notifications.map((notif) => ({
        ...notif,
        isRead: true,
      }));
      setNotifications(updatedNotifications);
      setOverview((prev) => ({ ...prev, unreadNotifications: 0 }));
    } catch (error) {
      console.error("Lỗi khi đánh dấu đã đọc:", error.message);
      alert(error.message); // TODO: Thay bằng react-toastify
    }
  };

  const handleViewDiscussion = (discussionId) => {
    window.location.href = `/teacher/discussions?discussionId=${discussionId}`;
  };

  useEffect(() => {
    if (user?.token) {
      loadData();
    }
  }, [user]);

  return (
    <div id="teacher-dashboard" className="tea-dashboard-container">
      <Sidebar role="teacher" />
      <div className="tea-dashboard-content">
        <h2>📊 Dashboard Giáo viên</h2>

        {/* Tổng quan */}
        <div className="tea-overview-section">
          <div className="tea-overview-card">
            <h4>Đề tài đang hướng dẫn</h4>
            <p>{overview.topicCount}</p>
          </div>
          <div className="tea-overview-card">
            <h4>Số sinh viên</h4>
            <p>{overview.studentCount}</p>
          </div>
          <div className="tea-overview-card">
            <h4>Thông báo chưa đọc</h4>
            <p>{overview.unreadNotifications}</p>
          </div>
        </div>

        {/* Thông báo */}
        <div className="tea-notifications-section">
          <div className="tea-notifications-header">
            <h3>🔔 Thông báo gần đây</h3>
            {notifications.some((notif) => !notif.isRead) && (
              <button className="tea-mark-read-btn" onClick={handleMarkAllAsRead}>
                Đánh dấu tất cả đã đọc
              </button>
            )}
          </div>
          {isLoading ? (
            <p>Đang tải...</p>
          ) : notifications.length === 0 ? (
            <p>Chưa có thông báo nào.</p>
          ) : (
            <div className="tea-notification-cards">
              {notifications.map((notification) => (
                <div
                  key={notification._id}
                  className={`tea-notification-card ${notification.isRead ? "read" : "unread"}`}
                >
                  <p>{notification.message}</p>
                  <small>{new Date(notification.createdAt).toLocaleString()}</small>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Thảo luận nhanh */}
        <div className="tea-discussions-section">
          <h3>💬 Thảo luận gần đây</h3>
          {isLoading ? (
            <p>Đang tải...</p>
          ) : discussions.length === 0 ? (
            <p>Chưa có thảo luận nào.</p>
          ) : (
            <div className="tea-discussion-cards">
              {discussions.map((discussion) => (
                <div
                  key={discussion.discussionId}
                  className="tea-discussion-card"
                >
                  <h4>{discussion.topicTitle || "Không có tiêu đề"}</h4>
                  <p>
                    {discussion.messages.length > 0
                      ? discussion.messages[discussion.messages.length - 1].message
                      : "Chưa có tin nhắn"}
                  </p>
                  <small>
                    {discussion.messages.length > 0
                      ? new Date(
                          discussion.messages[discussion.messages.length - 1].createdAt
                        ).toLocaleString()
                      : ""}
                  </small>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TeacherDashboard;