//frontend/src/pages/Teacher/TopicList.jsx

import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { getTopicsForUser } from "../../services/topicService"; // Hàm API lấy danh sách đề tài
import "../../assets/css/Teacher/topiclist.css";
import Sidebar from "../../components/Sidebar/Sidebar";

const TopicList = () => {
  const { user } = useAuth(); // Lấy thông tin user từ AuthContext
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTopics = async () => {
      console.log("user từ AuthContext:", user);

      // Kiểm tra nếu user hoặc token không hợp lệ
      if (!user || !user.token) {
        setError("Token không có hoặc không hợp lệ.");
        setLoading(false);
        console.log("Không có token hoặc token không hợp lệ");
        return; // Kiểm tra token hợp lệ
      }

      console.log("Token hợp lệ: ", user.token); // Log token để kiểm tra

      try {
        // Lấy danh sách đề tài từ API
        const data = await getTopicsForUser(user.token);
        console.log("Danh sách đề tài nhận được:", data); // Log dữ liệu trả về để kiểm tra
        setTopics(data);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách đề tài:", error);
        setError("Lỗi khi lấy danh sách đề tài: " + error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTopics();
  }, [user]);

  // Hàm để chuyển đổi trạng thái thành mô tả dễ hiểu
  const getStatusDescription = (status) => {
    switch (status) {
      case "pending-teacher":
        return "Chờ giảng viên duyệt";
      case "teacher-approve":
        return "Đang chờ admin duyệt";
      case "teacher-reject":
        return "Giảng viên từ chối";
      case "pending":
        return "Chờ admin phê duyệt";
      case "approved":
        return "Đã được phê duyệt";
      case "rejected":
        return "Đã bị từ chối";
      case "canceled":
        return "Đã hủy";
      case "stop-performing":
        return "Đang yêu cầu dừng";
      case "stopped":
        return "Đã dừng thực hiện";
      default:
        return "Trạng thái không xác định";
    }
  };

  return (
    <div className="topic-list-container">
      <Sidebar role="teacher" />

      <h2>📜 Danh sách đề tài đã đăng ký</h2>
      {loading && <p>Đang tải...</p>}
      {error && <p className="error-message">{error}</p>}
      <table border="1">
        <thead>
          <tr>
            <th>Tên đề tài</th>
            <th>Mô tả</th>
            <th>Giảng viên hướng dẫn</th>
            <th>Thành viên nhóm</th>
            <th>Trạng thái</th>
          </tr>
        </thead>
        <tbody>
          {topics.length > 0 ? (
            topics.map((topic) => (
              <tr key={topic._id}>
                <td>{topic.topicName}</td>
                <td>{topic.topicDescription}</td>
                <td>{topic.supervisor?.name || "Chưa có giảng viên"}</td>
                <td>
                  {topic.teamMembers?.length > 0
                    ? topic.teamMembers.map((member) => member.name).join(", ")
                    : "Chưa có thành viên"}
                </td>
                <td>{getStatusDescription(topic.status)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">Không có đề tài nào.</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default TopicList;
