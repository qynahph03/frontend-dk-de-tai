import React, { useEffect, useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useAuth } from "../../context/AuthContext";
import { getCouncilList } from "../../services/councilService";
import { getNotifications, markAllNotificationsAsRead } from "../../services/notificationService";
import { toast } from "react-toastify";
import "../../assets/css/uniadmin/dashboard.css"; // Tái sử dụng CSS của admin

const UniadminDashboard = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState({
    councilCount: 0,
    pendingCouncils: 0,
    approvedCouncils: 0,
    rejectedCouncils: 0,
    unreadNotifications: 0,
  });
  const [councils, setCouncils] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Lấy danh sách hội đồng
      const councilData = await getCouncilList(user.token);
      const pendingCouncils = councilData.filter((council) => council.status === "pending-uniadmin");
      const approvedCouncils = councilData.filter((council) => council.status === "uniadmin-approved");
      const rejectedCouncils = councilData.filter((council) => council.status === "uniadmin-rejected");

      setOverview({
        councilCount: councilData.length,
        pendingCouncils: pendingCouncils.length,
        approvedCouncils: approvedCouncils.length,
        rejectedCouncils: rejectedCouncils.length,
        unreadNotifications: notifications.filter((notif) => !notif.isRead).length,
      });
      setCouncils(councilData.slice(0, 5)); // Giới hạn 5 hội đồng

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

  const handleViewCouncil = () => {
    window.location.href = "/uniadmin/council-approval";
  };

  useEffect(() => {
    if (user?.token) {
      loadData();
    }
  }, [user]);

  return (
    <div id="uniadmin-dashboard" className="admin-dashboard-container">
      <Sidebar role="uniadmin" />
      <div className="admin-dashboard-content">
        <h2>📊 Dashboard Quản trị cấp cao</h2>

        {/* Tổng quan */}
        <div className="admin-overview-section">
          <div className="admin-overview-card">
            <h4>Tổng số hội đồng</h4>
            <p>{overview.councilCount}</p>
          </div>
          <div className="admin-overview-card">
            <h4>Thông báo chưa đọc</h4>
            <p>{overview.unreadNotifications}</p>
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

        {/* Hội đồng gần đây */}
        <div className="admin-topics-section">
          <h3>📋 Hội đồng gần đây</h3>
          {isLoading ? (
            <p>Đang tải...</p>
          ) : councils.length === 0 ? (
            <p>Chưa có hội đồng nào.</p>
          ) : (
            <div className="admin-topic-cards">
              {councils.map((council) => (
                <div
                  key={council._id}
                  className="admin-topic-card"
                  onClick={() => handleViewCouncil()}
                >
                  <h4>{council.topic?.topicName}</h4>
                  <p>Chủ tịch: {council.chairman?.name || "Chưa có"}</p>
                  <p>Thư ký: {council.secretary?.name || "Chưa có"}</p>
                  <p>Trạng thái: {council.status}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UniadminDashboard;