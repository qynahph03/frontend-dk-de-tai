//frontend/src/pages/Teacher/Score.jsx

import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar/Sidebar";
import { getCouncilList, submitScore } from "../../services/councilService";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import "../../assets/css/Teacher/score.css";

const Score = () => {
  const { user } = useAuth();
  const { councilId } = useParams();
  const navigate = useNavigate();
  const [councils, setCouncils] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formData, setFormData] = useState({
    score: "",
    comment: "",
  });

  const fetchCouncils = async () => {
    try {
      setLoading(true);
      const councilData = await getCouncilList(user.token);
      setCouncils(councilData);
    } catch (error) {
      setMessage(error.message || "Không thể tải danh sách hội đồng.");
      toast.error(error.message || "Không thể tải danh sách hội đồng.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.token || user?.role !== "teacher") {
      setMessage("Bạn không có quyền truy cập trang này.");
      toast.error("Bạn không có quyền truy cập trang này.");
      navigate("/login");
      return;
    }
    fetchCouncils();
  }, [user, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.score || formData.score < 0 || formData.score > 100) {
      setMessage("Điểm số phải từ 0 đến 100!");
      toast.error("Điểm số phải từ 0 đến 100!");
      return;
    }
    setActionLoading(true);
    setMessage("");
    try {
      await submitScore(user.token, councilId, formData.score, formData.comment);
      setMessage("Chấm điểm thành công!");
      toast.success("Chấm điểm thành công!");
      setFormData({ score: "", comment: "" });
      await fetchCouncils();
      navigate("/teacher/score");
    } catch (error) {
      const errorMsg = error.message || "Không thể gửi điểm!";
      setMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setActionLoading(false);
    }
  };

  const selectedCouncil = councils.find((c) => c._id === councilId);

  const getStatusDisplay = (status) => {
    switch (status) {
      case "uniadmin-approved":
        return "Đã chốt, sẵn sàng chấm điểm";
      case "completed":
        return "Hoàn thành";
      default:
        return status;
    }
  };

  const hasScored = (council) => {
    return council.scores.some((s) => s.user?._id === user._id);
  };

  const getTotalMembers = (council) => {
    return 1 + 1 + (council.members?.length || 0);
  };

  const canScore = (council) => {
    return council.status === "uniadmin-approved" && !hasScored(council);
  };

  return (
    <div className="score-container">
      <Sidebar role="teacher" />
      <div className="score-content">
        <h2>Chấm điểm đề tài</h2>
        {message && (
          <p className={message.includes("thành công") ? "success-message" : "error-message"}>
            {message}
          </p>
        )}
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : councilId && selectedCouncil ? (
          <div>
            <h3>Đề tài: {selectedCouncil.topic?.topicName || "N/A"}</h3>
            <p>Trạng thái: {getStatusDisplay(selectedCouncil.status)}</p>
            <p>Số thành viên hội đồng: {getTotalMembers(selectedCouncil)}</p>
            <p>Số điểm hiện tại: {selectedCouncil.scores.length}</p>
            <p>Đã chấm điểm: {hasScored(selectedCouncil) ? "Có" : "Chưa"}</p>
            {selectedCouncil.status === "completed" && (
              <p className="info-message">Hội đồng đã hoàn thành, không thể chấm thêm.</p>
            )}
            {hasScored(selectedCouncil) && (
              <p className="info-message">Bạn đã chấm điểm và không thể chỉnh sửa.</p>
            )}
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Điểm số (0-100):</label>
                <input
                  type="number"
                  name="score"
                  value={formData.score}
                  onChange={handleChange}
                  min="0"
                  max="100"
                  required
                  disabled={hasScored(selectedCouncil) || selectedCouncil.status === "completed"}
                />
              </div>
              <div className="form-group">
                <label>Bình luận:</label>
                <textarea
                  name="comment"
                  value={formData.comment}
                  onChange={handleChange}
                  rows="4"
                  disabled={hasScored(selectedCouncil) || selectedCouncil.status === "completed"}
                />
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  disabled={actionLoading || hasScored(selectedCouncil) || selectedCouncil.status === "completed"}
                >
                  {actionLoading ? "Đang xử lý..." : "Gửi điểm"}
                </button>
                <button
                  type="button"
                  onClick={() => navigate("/teacher/score")}
                  disabled={actionLoading}
                >
                  Quay lại danh sách
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <h3>Danh sách đề tài cần chấm điểm</h3>
            {councils.length === 0 ? (
              <p>Không có đề tài nào để chấm điểm.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Tên đề tài</th>
                    <th>Số thành viên</th>
                    <th>Số điểm</th>
                    <th>Trạng thái</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {councils.map((council) => (
                    <tr key={council._id}>
                      <td>{council.topic?.topicName || "N/A"}</td>
                      <td>{getTotalMembers(council)}</td>
                      <td>{council.scores.length}</td>
                      <td>{getStatusDisplay(council.status)}</td>
                      <td>
                        <button
                          onClick={() => navigate(`/teacher/score/${council._id}`)}
                          disabled={!canScore(council)}
                        >
                          Chấm điểm
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Score;