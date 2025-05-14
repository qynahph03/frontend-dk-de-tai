// frontend/src/pages/Student/Dashboard.jsx

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { getTopicsForUser, cancelTopicRequest } from "../../services/topicService";
import Sidebar from "../../components/Sidebar/Sidebar";
import "../../assets/css/Student/dashboard.css";
import { toast } from "react-toastify";

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Ánh xạ trạng thái sang thông báo
  const statusMessages = {
    canceled: "Đã bị hủy",
    "pending-teacher": "Chờ giảng viên xét duyệt",
    "teacher-approve": "Giảng viên đã phê duyệt",
    "teacher-reject": "Giảng viên từ chối",
    pending: "Chờ xét duyệt",
    approved: "Đã được phê duyệt",
    rejected: "Đã bị từ chối",
    "stop-performing": "Yêu cầu dừng thực hiện",
    stopped: "Đã dừng thực hiện"
  };

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchTopics = async () => {
      try {
        const data = await getTopicsForUser(user.token);
        setTopics(data);
      } catch (err) {
        setError("Không thể tải danh sách đề tài.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [user, navigate]);

  const handleCancelRequest = async (topicId) => {
    const isConfirmed = window.confirm("Bạn có chắc muốn hủy đăng ký đề tài này?");
    if (!isConfirmed) return;

    try {
      await cancelTopicRequest(topicId, user.token);
      toast.success("✅ Yêu cầu hủy đề tài đã được gửi.");

      // Cập nhật trạng thái đề tài trong state
      setTopics(topics.map(t => t._id === topicId ? { ...t, status: "canceled" } : t));
    } catch (err) {
      alert("Không thể gửi yêu cầu hủy.");
      console.error(err);
    }
  };
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  return (
    <div className={`dashboard-container ${isSidebarCollapsed ? "sidebar-collapsed" : "sidebar-expanded"}`}>
      <Sidebar role="student" 
      onToggle={() => setIsSidebarCollapsed(prev => !prev)} />
      <div className="dashboard-content">
        <h2>🎓 Quản lý Đề Tài</h2>
        <p>Chào mừng, {user?.username}! Đây là nơi bạn theo dõi đề tài đã đăng ký.</p>

        {loading && <p>Đang tải...</p>}
        {error && <p className="error-message">{error}</p>}

        {topics.length === 0 ? (
          <p>📌 Bạn chưa đăng ký đề tài nào.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Tên đề tài</th>
                <th>Giảng viên hướng dẫn</th>
                <th>Trạng thái</th>
                <th>Thành viên nhóm</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic) => (
                <tr key={topic._id}>
                  <td>{topic.topicName}</td>
                  <td>{topic.supervisor?.name || "Chưa có giảng viên"}</td>
                  <td className={`status ${topic.status}`}>{statusMessages[topic.status] || topic.status}</td>
                  <td>
                    {topic.teamMembers?.length > 0 ? topic.teamMembers.map((m, idx) =>
                          `${m.name}${idx === 0 ? " (Nhóm trưởng)" : ""}` ).join(", ") : "Không có"}
                  </td>
                  <td>
                    {topic.status === "pending-teacher" &&
                    topic.teamMembers?.length > 0 &&
                    topic.teamMembers[0]?._id?.toString() === user.userId?.toString() && (
                      <button className="cancel-btn" onClick={() => handleCancelRequest(topic._id)}>
                        ❌ Xin hủy đề tài
                      </button>
                    )}
                    {topic.status === "approved" && <span>✔️ Đã được phê duyệt</span>}
                    {topic.status === "rejected" && <span>❌ Đã bị từ chối</span>}
                    {topic.status === "canceled" && <span>🔄 Đang chờ hủy</span>}
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

export default StudentDashboard;
