import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import {
  getReportList,
  submitReport,
  updateReport,
  deleteReport,
  restoreReport,
  getDeletedReports,
  getMyTopic,
  submitReportsToAdmin,
} from "../../services/reportService";
import Sidebar from "../../components/Sidebar/Sidebar";
import "../../assets/css/Student/report.css";
import { toast } from "react-toastify";

const StudentReport = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [deletedReports, setDeletedReports] = useState([]);
  const [approvedReports, setApprovedReports] = useState([]);
  const [newReport, setNewReport] = useState({
    period: "",
    reportContent: "",
    reportFile: null,
  });
  const [topicId, setTopicId] = useState(null);
  const [topicName, setTopicName] = useState("");
  const [topicStatus, setTopicStatus] = useState("");
  const [teamMembers, setTeamMembers] = useState([]);
  const [editingReportId, setEditingReportId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);

  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        const [reportData, deletedReportData, topicData] = await Promise.all([
          getReportList(user.token),
          getDeletedReports(user.token),
          getMyTopic(user.token),
        ]);
        setReports(reportData.filter((report) => report.status !== "approved"));
        setApprovedReports(reportData.filter((report) => report.status === "approved"));
        setDeletedReports(deletedReportData);
        setTopicId(topicData.topicId);
        setTopicName(topicData.topicName || "Đề tài của nhóm");
        setTopicStatus(topicData.status || "");
        setTeamMembers(topicData.teamMembers || []);
      } catch (err) {
        toast.error("Lỗi khi tải dữ liệu: " + err.message);
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, navigate]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const allowedTypes = [
      "application/msword",
      "application/x-msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "image/jpeg",
      "image/png",
      "image/gif",
    ];

    if (file && !allowedTypes.includes(file.type)) {
      toast.warning("Chỉ chấp nhận file DOC, DOCX, JPG, PNG.");
      setNewReport({ ...newReport, reportFile: null });
    } else {
      setNewReport({ ...newReport, reportFile: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topicId) {
      toast.warning("Không tìm thấy đề tài được phê duyệt. Vui lòng thử lại.");
      return;
    }
    if (!newReport.period) {
      toast.warning("Vui lòng nhập đợt nộp.");
      return;
    }
    if (!newReport.reportContent) {
      toast.warning("Vui lòng nhập nội dung báo cáo.");
      return;
    }
    if (!newReport.reportFile && !editingReportId) {
      toast.warning("Vui lòng chọn file báo cáo.");
      return;
    }

    try {
      if (editingReportId) {
        const formData = new FormData();
        if (newReport.reportFile) {
          formData.append("file", newReport.reportFile);
        }
        await updateReport(user.token, formData, editingReportId, newReport.reportContent);
        toast.success("✅ Cập nhật báo cáo thành công.");
      } else {
        const formData = new FormData();
        formData.append("file", newReport.reportFile);
        await submitReport(
          user.token,
          formData,
          topicId,
          newReport.reportContent,
          newReport.period
        );
        toast.success("✅ Gửi báo cáo thành công.");
      }

      setNewReport({ period: "", reportContent: "", reportFile: null });
      setEditingReportId(null);
      const reportData = await getReportList(user.token);
      setReports(reportData.filter((report) => report.status !== "approved"));
      setApprovedReports(reportData.filter((report) => report.status === "approved"));
      const deletedReportData = await getDeletedReports(user.token);
      setDeletedReports(deletedReportData);
    } catch (err) {
      toast.error(`Lỗi: ${err.message}`);
      console.error(err);
    }
  };

  const handleEdit = (report) => {
    if (report.status !== "pending") {
      toast.warning("Chỉ có thể chỉnh sửa báo cáo đang chờ duyệt!");
      return;
    }
    setNewReport({
      period: report.period,
      reportContent: report.reportContent,
      reportFile: null,
    });
    setEditingReportId(report._id);
  };

  const handleCancelEdit = () => {
    setNewReport({ period: "", reportContent: "", reportFile: null });
    setEditingReportId(null);
  };

  const handleDelete = async (reportId) => {
    if (window.confirm("Bạn có chắc muốn xóa báo cáo này?")) {
      try {
        await deleteReport(user.token, reportId);
        toast.success("🗑️ Đã xóa báo cáo.");
        const reportData = await getReportList(user.token);
        setReports(reportData.filter((report) => report.status !== "approved"));
        setApprovedReports(reportData.filter((report) => report.status === "approved"));
        const deletedReportData = await getDeletedReports(user.token);
        setDeletedReports(deletedReportData);
      } catch (err) {
        toast.error(`Lỗi: ${err.message}`);
        console.error(err);
      }
    }
  };

  const handleRestore = async (reportId) => {
    if (window.confirm("Bạn có chắc muốn khôi phục báo cáo này?")) {
      try {
        await restoreReport(user.token, reportId);
        toast.success("🔄 Đã khôi phục báo cáo.");
        const reportData = await getReportList(user.token);
        setReports(reportData.filter((report) => report.status !== "approved"));
        setApprovedReports(reportData.filter((report) => report.status === "approved"));
        const deletedReportData = await getDeletedReports(user.token);
        setDeletedReports(deletedReportData);
      } catch (err) {
        toast.error(`Lỗi: ${err.message}`);
        console.error(err);
      }
    }
  };

  const handleSubmitToAdmin = async () => {
    if (!window.confirm("Bạn có chắc muốn nộp các báo cáo đã phê duyệt cho admin?")) return;
    try {
      await submitReportsToAdmin(user.token, topicId);
      toast.success("📤 Đã nộp báo cáo cho admin thành công!");
      const reportData = await getReportList(user.token);
      setReports(reportData.filter((report) => report.status !== "approved"));
      setApprovedReports(reportData.filter((report) => report.status === "approved"));
    } catch (err) {
      toast.error(`Lỗi: ${err.message}`);
      console.error(err);
    }
  };

  const renderFilePreview = (fileUrl) => {
    if (!fileUrl) return "Không có";

    const extension = fileUrl.split(".").pop().toLowerCase();
    if (["jpg", "jpeg", "png", "gif"].includes(extension)) {
      return <img src={fileUrl} alt="Preview" style={{ maxWidth: "100px", maxHeight: "100px" }} />;
    } else if (extension === "pdf") {
      return (
        <embed
          src={fileUrl}
          type="application/pdf"
          width="100px"
          height="100px"
          style={{ border: "1px solid #ddd" }}
        />
      );
    } else {
      return (
        <a href={fileUrl} target="_blank" rel="noreferrer" download>
          Tải file
        </a>
      );
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case "pending":
        return "⏳ Đang chờ duyệt";
      case "approved":
        return "✅ Đã phê duyệt";
      case "rejected":
        return "❌ Đã từ chối";
      default:
        return "Không xác định";
    }
  };

  const isTeamLeader = user && teamMembers.length > 0 && teamMembers[0] === user.userId;
  const canSubmitToAdmin = approvedReports.length > 0 && !approvedReports.every((report) => report.submittedToAdmin);

  return (
    <div className="dashboard-container">
      <Sidebar role="student" />
      <div className="dashboard-content">
        <h2>📑 Báo Cáo Đề Tài: {topicName}</h2>

        <div className="report-form">
          <input
            type="text"
            placeholder="Nhập đợt nộp (ví dụ: Đợt 1)"
            value={newReport.period}
            onChange={(e) => setNewReport({ ...newReport, period: e.target.value })}
            disabled={editingReportId}
          />
          <textarea
            placeholder="Nhập nội dung báo cáo..."
            value={newReport.reportContent}
            onChange={(e) => setNewReport({ ...newReport, reportContent: e.target.value })}
          />
          <input
            type="file"
            onChange={handleFileChange}
            accept=".doc,.docx,.jpg,.png,.gif"
          />
          <div>
            <button onClick={handleSubmit}>
              {editingReportId ? "✏️ Cập nhật báo cáo" : "📤 Gửi báo cáo"}
            </button>
            {editingReportId && (
              <button onClick={handleCancelEdit} style={{ marginLeft: "10px" }}>
                ❌ Hủy
              </button>
            )}
          </div>
        </div>

        <button
          className={`ShowDeleted ${showDeleted ? "active" : ""}`}
          onClick={() => setShowDeleted(!showDeleted)}
        >
          {showDeleted ? "Ẩn báo cáo đã xóa" : "Xem báo cáo đã xóa"}
        </button>

        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <>
            <h3>{showDeleted ? "Báo cáo đã xóa" : "Danh sách báo cáo"}</h3>
            {showDeleted ? (
              deletedReports.length === 0 ? (
                <p>Chưa có báo cáo nào bị xóa.</p>
              ) : (
                <table>
                  <thead>
                    <tr>
                      <th>Nội dung</th>
                      <th>Tệp đính kèm</th>
                      <th>Đợt</th>
                      <th>Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deletedReports.map((report) => (
                      <tr key={report._id}>
                        <td>{report.reportContent}</td>
                        <td>{renderFilePreview(report.file)}</td>
                        <td>{report.period}</td>
                        <td>
                          <button onClick={() => handleRestore(report._id)}>🔄 Khôi phục</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )
            ) : reports.length === 0 && approvedReports.length === 0 ? (
              <p>Chưa có báo cáo nào được gửi.</p>
            ) : (
              <>
                {reports.length > 0 && (
                  <table>
                    <thead>
                      <tr>
                        <th>Nội dung</th>
                        <th>Tệp đính kèm</th>
                        <th>Đợt</th>
                        <th>Trạng thái</th>
                        <th>Hành động</th>
                      </tr>
                    </thead>
                    <tbody>
                      {reports.map((report) => (
                        <tr key={report._id}>
                          <td>{report.reportContent}</td>
                          <td>{renderFilePreview(report.file)}</td>
                          <td>{report.period}</td>
                          <td>{getStatusDisplay(report.status)}</td>
                          <td>
                            {report.status === "pending" && (
                              <>
                                <button onClick={() => handleEdit(report)}>✏️ Sửa</button>
                                <button onClick={() => handleDelete(report._id)}>🗑️ Xóa</button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                <h3>Báo cáo đã phê duyệt</h3>
                {approvedReports.length === 0 ? (
                  <p>Chưa có báo cáo nào được phê duyệt.</p>
                ) : (
                  <>
                    <table>
                      <thead>
                        <tr>
                          <th>Nội dung</th>
                          <th>Tệp đính kèm</th>
                          <th>Đợt</th>
                          <th>Trạng thái</th>
                          <th>Nộp cho admin</th>
                        </tr>
                      </thead>
                      <tbody>
                        {approvedReports.map((report) => (
                          <tr key={report._id}>
                            <td>{report.reportContent}</td>
                            <td>{renderFilePreview(report.file)}</td>
                            <td>{report.period}</td>
                            <td>{getStatusDisplay(report.status)}</td>
                            <td>{report.submittedToAdmin ? "Đã nộp" : "Chưa nộp"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {isTeamLeader && topicStatus === "approved" && canSubmitToAdmin && (
                      <button
                        className="submit-to-admin-btn"
                        onClick={handleSubmitToAdmin}
                      >
                        📤 Nộp báo cáo cho Khoa
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentReport;