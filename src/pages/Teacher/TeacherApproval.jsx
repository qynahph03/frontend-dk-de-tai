import React, { useEffect, useState } from "react";
import { getAllTopics, approveTopic, rejectTopic } from "../../services/topicService";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar/Sidebar";
import "../../assets/css/Teacher/teacherapproval.css";

const TeacherApproval = () => {
  const { user } = useAuth();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false); // Loading cho hành động phê duyệt/từ chối
  const [message, setMessage] = useState(""); // Thông báo cho người dùng

  useEffect(() => {
    const fetchTopics = async () => {
      if (!user || !user.userId) {
        console.log("Chờ user được khởi tạo:", user);
        setLoading(true);
        return;
      }

      try {
        setLoading(true);
        const allTopics = await getAllTopics(user.token);
        console.log("🔍 Dữ liệu từ API:", allTopics);
        console.log("👤 ID giảng viên đăng nhập:", user.userId);

        allTopics.forEach(topic => {
          console.log("🎓 Giảng viên của đề tài:", topic.supervisor._id);
        });

        const pendingTopics = allTopics.filter(topic =>
          topic.status === "pending-teacher" && String(topic.supervisor._id) === String(user.userId)
        );

        console.log("✅ Đề tài chờ xét duyệt:", pendingTopics);
        setTopics(pendingTopics);
      } catch (error) {
        console.error("❌ Lỗi khi lấy danh sách đề tài:", error);
        setMessage("Không thể tải danh sách đề tài. Vui lòng thử lại.");
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [user]);

  const handleApprove = async (topicId) => {
    if (!window.confirm("Bạn có chắc muốn phê duyệt đề tài này?")) return;

    setActionLoading(true);
    setMessage("");
    try {
      await approveTopic(topicId, user.token);
      setTopics(topics.filter(topic => topic._id !== topicId)); // Xóa đề tài khỏi danh sách
      setMessage("Phê duyệt đề tài thành công!");
    } catch (error) {
      console.error("❌ Lỗi khi phê duyệt đề tài:", error);
      setMessage(error.message || "Không thể phê duyệt đề tài.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async (topicId) => {
    if (!window.confirm("Bạn có chắc muốn từ chối đề tài này?")) return;

    setActionLoading(true);
    setMessage("");
    try {
      await rejectTopic(topicId, user.token);
      setTopics(topics.filter(topic => topic._id !== topicId)); // Xóa đề tài khỏi danh sách
      setMessage("Từ chối đề tài thành công!");
    } catch (error) {
      console.error("❌ Lỗi khi từ chối đề tài:", error);
      setMessage(error.message || "Không thể từ chối đề tài.");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="teacher-approval-container">
      <Sidebar role="teacher" />
      <div className="teacher-approval-content">
        <h2>📋 Xét duyệt đề tài</h2>
        {message && <p className={message.includes("thành công") ? "success-message" : "error-message"}>{message}</p>}
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : topics.length === 0 ? (
          <p>Không có đề tài nào chờ xét duyệt.</p>
        ) : (
          <table>
            <thead>
              <tr><th>Tên đề tài</th><th>Mô tả</th><th>Nhóm sinh viên</th><th>Hành động</th></tr>
            </thead>
            <tbody>
              {topics.map(topic => (
                <tr key={topic._id}>
                  <td>{topic.topicName}</td>
                  <td>{topic.topicDescription}</td> 
                  <td>{topic.teamMembers.map(m => m.name).join(", ")}</td>
                  <td>
                    <button
                      onClick={() => handleApprove(topic._id)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? "Đang xử lý..." : "Phê duyệt"}
                    </button>
                    <button
                      onClick={() => handleReject(topic._id)}
                      disabled={actionLoading}
                    >
                      {actionLoading ? "Đang xử lý..." : "Từ chối"}
                    </button>
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

export default TeacherApproval;