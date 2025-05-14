import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar/Sidebar";
import { getCouncilList } from "../../services/councilService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import * as XLSX from "xlsx";
import "../../assets/css/Admin/scoredtopics.css";

const ScoredTopics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [councils, setCouncils] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [selectedCouncil, setSelectedCouncil] = useState(null);

  const fetchCouncils = async () => {
    try {
      setLoading(true);
      const councilData = await getCouncilList(user.token);
      console.log("Council data:", councilData);
      setCouncils(councilData.filter((c) => c.scores.length > 0));
    } catch (error) {
      setMessage(error.message || "Không thể tải danh sách đề tài.");
      toast.error(error.message || "Không thể tải danh sách đề tài.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.token || user?.role !== "admin") {
      setMessage("Bạn không có quyền truy cập trang này.");
      toast.error("Bạn không có quyền truy cập trang này!");
      return;
    }
    fetchCouncils();
  }, [user]);

  const calculateAverageScore = (scores) => {
    if (scores.length === 0) return "Chưa có điểm";
    const total = scores.reduce((sum, s) => sum + s.score, 0);
    return (total / scores.length).toFixed(2);
  };

  // Thêm hàm để xác định kết quả dựa trên điểm trung bình
  const getResult = (scores) => {
    const avgScore = calculateAverageScore(scores);
    if (avgScore === "Chưa có điểm") return "Chưa có kết quả";
    return parseFloat(avgScore) > 70 ? "Đạt" : "Không đạt";
  };

  const getTotalMembers = (council) => {
    return 1 + 1 + (council.members?.length || 0); // Chủ tịch + Thư ký + Thành viên
  };

  const showScoreDetails = (council) => {
    setSelectedCouncil(council);
  };

  const closeScoreDetails = () => {
    setSelectedCouncil(null);
  };

  const exportToExcel = () => {
    try {
      // Sheet 1: Thông tin tổng quan
      const summaryData = councils.map((c) => ({
        "Tên đề tài": c.topic?.topicName || "N/A",
        "Chủ tịch hội đồng": c.chairman?.name || "N/A",
        "Thư ký hội đồng": c.secretary?.name || "N/A",
        "Số thành viên hội đồng": getTotalMembers(c),
        "Điểm trung bình": calculateAverageScore(c.scores),
        "Kết quả": getResult(c.scores), // Thêm Kết quả vào Excel
        "Số lượng điểm": c.scores.length,
        "Trạng thái": c.status === "completed" ? "Hoàn thành" : "Đang chấm",
      }));

      // Sheet 2: Chi tiết điểm số
      const detailsData = councils.flatMap((c) =>
        c.scores.map((s) => ({
          "Tên đề tài": c.topic?.topicName || "N/A",
          "Người chấm": s.user?.name || "N/A",
          "Điểm": s.score,
          "Bình luận": s.comment || "Không có",
          "Ngày chấm": s.scoredAt ? new Date(s.scoredAt).toLocaleDateString("vi-VN") : "Chưa ghi nhận",
        }))
      );

      const wb = XLSX.utils.book_new();

      // Định dạng Sheet Tổng quan
      const wsSummary = XLSX.utils.json_to_sheet(summaryData);
      wsSummary["!cols"] = [
        { wch: 30 }, // Tên đề tài
        { wch: 20 }, // Chủ tịch
        { wch: 20 }, // Thư ký
        { wch: 15 }, // Số thành viên
        { wch: 15 }, // Điểm trung bình
        { wch: 15 }, // Kết quả (Thêm cột)
        { wch: 15 }, // Số lượng điểm
        { wch: 15 }, // Trạng thái
      ];

      // Định dạng Sheet Chi tiết điểm
      const wsDetails = XLSX.utils.json_to_sheet(detailsData);
      wsDetails["!cols"] = [
        { wch: 30 }, // Tên đề tài
        { wch: 20 }, // Người chấm
        { wch: 10 }, // Điểm
        { wch: 40 }, // Bình luận
        { wch: 15 }, // Ngày chấm
      ];

      XLSX.utils.book_append_sheet(wb, wsSummary, "Tổng quan");
      XLSX.utils.book_append_sheet(wb, wsDetails, "Chi tiết điểm");
      XLSX.writeFile(wb, `scored-topics-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      console.error("Lỗi khi xuất Excel:", error);
      toast.error("Không thể xuất file Excel!");
    }
  };

  return (
    <div className="scored-topics-container">
      <Sidebar role="admin" />
      <div className="scored-topics-content">
        <h2>Danh sách đề tài đã chấm điểm</h2>
        <button onClick={exportToExcel} className="export-button">
          Xuất Excel
        </button>
        {message && (
          <p className={message.includes("thành công") ? "success-message" : "error-message"}>
            {message}
          </p>
        )}
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : councils.length === 0 ? (
          <p>Không có đề tài nào đã được chấm điểm.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Tên đề tài</th>
                <th>Hội đồng</th>
                <th>Số thành viên</th>
                <th>Điểm trung bình</th>
                <th>Kết quả</th> {/* Thêm cột Kết quả */}
                <th>Số lượng điểm</th>
                <th>Trạng thái</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {councils.map((council) => (
                <tr key={council._id}>
                  <td>{council.topic?.topicName || "N/A"}</td>
                  <td>
                    Chủ tịch: {council.chairman?.name || "N/A"}, Thư ký: {council.secretary?.name || "N/A"}
                  </td>
                  <td>{getTotalMembers(council)}</td>
                  <td>{calculateAverageScore(council.scores)}</td>
                  <td>{getResult(council.scores)}</td> {/* Hiển thị Kết quả */}
                  <td>{council.scores.length}</td>
                  <td>{council.status === "completed" ? "Hoàn thành" : "Đang chấm"}</td>
                  <td>
                    <button onClick={() => showScoreDetails(council)}>Xem chi tiết</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {selectedCouncil && (
          <div className="score-details-modal">
            <div className="modal-content">
              <h3>Chi tiết điểm số: {selectedCouncil.topic?.topicName || "N/A"}</h3>
              <table>
                <thead>
                  <tr>
                    <th>Người chấm</th>
                    <th>Điểm</th>
                    <th>Bình luận</th>
                    <th>Ngày chấm</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedCouncil.scores.map((score) => (
                    <tr key={score.user?._id || score._id}>
                      <td>{score.user?.name || "N/A"}</td>
                      <td>{score.score}</td>
                      <td>{score.comment || "Không có"}</td>
                      <td>{score.scoredAt ? new Date(score.scoredAt).toLocaleDateString("vi-VN") : "Chưa ghi nhận"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button onClick={closeScoreDetails}>Đóng</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ScoredTopics;