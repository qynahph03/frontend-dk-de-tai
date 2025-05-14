import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar/Sidebar";
import { getCouncilPublicList, downloadReport } from "../../services/councilService";
import { toast } from "react-toastify";
import "../../assets/css/Admin/scoredtopics.css";

const Library = () => {
  const { user } = useAuth();
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchTopics = async () => {
    try {
      setLoading(true);
      const councilData = await getCouncilPublicList(user.token, true);
      const filteredTopics = councilData.map((c) => ({
        ...c,
        latestScoredAt: c.scores[0]?.scoredAt || null,
      }));
      setTopics(filteredTopics);
    } catch (error) {
      setMessage(error.message || "Không thể tải danh sách đề tài.");
      toast.error(error.message || "Không thể tải danh sách đề tài.");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (reportId) => {
    try {
      const response = await downloadReport(user.token, reportId, { responseType: "blob" });
      const disposition = response.headers["content-disposition"];
      let fileName = "downloaded_file.docx"; // Tên mặc định nếu không tìm thấy

      if (disposition && disposition.includes("attachment")) {
        const matches = disposition.match(/filename="(.+)"/);
        if (matches && matches[1]) {
          fileName = matches[1];
        }
      }

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error(error.message || "Không thể tải báo cáo!");
    }
  };

  // Hàm làm sạch tên file để hiển thị trên UI
  const getCleanFileName = (report) => {
    return report.publicId || report.file.split("/").pop().split("?")[0];
  };

  useEffect(() => {
    if (!user?.token || user?.role !== "student") {
      setMessage("Bạn không có quyền truy cập trang này.");
      return;
    }
    fetchTopics();
  }, [user]);

  return (
    <div className="scored-topics-container">
      <Sidebar role="student" />
      <div className="scored-topics-content">
        <h2> 📚 Thư viện đề tài</h2>
        <p>Danh sách các đề tài có điểm trên 80 để sinh viên tham khảo.</p>
        {message && (
          <p className={message.includes("thành công") ? "success-message" : "error-message"}>
            {message}
          </p>
        )}
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : topics.length === 0 ? (
          <p>Không có đề tài nào đạt trên 90 điểm.</p>
        ) : (
          <table>
            <thead className="head-tbl">
              <tr>
                <th>Mã đề tài</th>
                <th>Tên đề tài</th>
                <th>Điểm trung bình</th>
                <th>Chủ tịch hội đồng</th>
                <th>Ngày chấm</th>
                <th>Tài liệu</th>
              </tr>
            </thead>
            <tbody>
              {topics.map((topic) => (
                <tr key={topic._id}>
                  <td>{topic.topic?._id || "N/A"}</td>
                  <td>{topic.topic?.topicName || "N/A"}</td>
                  <td>{topic.averageScore.toFixed(2)}</td>
                  <td>{topic.chairman?.name || "N/A"}</td>
                  <td>
                    {topic.latestScoredAt
                      ? new Date(topic.latestScoredAt).toLocaleDateString()
                      : "Chưa xác định"}
                  </td>
                  <td>
                    {topic.reports && topic.reports.length > 0 ? (
                      topic.reports.map((report) => (
                        <button
                          key={report._id}
                          onClick={() => handleDownload(report._id)}
                          style={{ marginRight: "5px", padding: "5px 10px", cursor: "pointer" }}
                        >
                          Tải {getCleanFileName(report)} (Đợt: {report.period})
                        </button>
                      ))
                    ) : (
                      "Không có tài liệu"
                    )}
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

export default Library;