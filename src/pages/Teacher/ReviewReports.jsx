//frontend/src/pages/Teacher/ReviewReports.jsx

import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar/Sidebar";
import { getReportList, approveReport, rejectReport, submitReportsToAdmin } from "../../services/reportService";
import "../../assets/css/Teacher/reviewreports.css";

const ReviewReports = () => {
  const { user } = useAuth();
  const [reports, setReports] = useState([]);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState({});
  const [message, setMessage] = useState("");

  const fetchReports = async () => {
    try {
      setLoading(true);
      const data = await getReportList(user.token);
      const pendingReports = data.filter(
        (report) =>
          report.isEditable &&
          String(report.topic.supervisor._id) === String(user.userId)
      );
      // Nhóm báo cáo theo đề tài
      const topicMap = data.reduce((acc, report) => {
        if (String(report.topic.supervisor._id) === String(user.userId)) {
          if (!acc[report.topic._id]) {
            acc[report.topic._id] = {
              topicId: report.topic._id,
              topicName: report.topic.topicName,
              reports: [],
              approvedReports: [],
              allSubmitted: true,
            };
          }
          acc[report.topic._id].reports.push(report);
          if (report.status === "approved") {
            acc[report.topic._id].approvedReports.push(report);
          }
          if (report.status === "approved" && !report.submittedToAdmin) {
            acc[report.topic._id].allSubmitted = false;
          }
        }
        return acc;
      }, {});
      setReports(pendingReports);
      setTopics(Object.values(topicMap));
    } catch (error) {
      setMessage(error.response?.data?.message || "Không thể tải danh sách báo cáo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.token) return;
    fetchReports();
  }, [user?.token]);

  const handleApprove = async (reportId) => {
    if (!window.confirm("Bạn có chắc muốn phê duyệt báo cáo này?")) return;

    setActionLoading((prev) => ({ ...prev, [reportId]: true }));
    setMessage("");
    try {
      await approveReport(user.token, reportId);
      await fetchReports();
      setMessage("Phê duyệt báo cáo thành công!");
    } catch (error) {
      setMessage(error.response?.data?.message || "Không thể phê duyệt báo cáo.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [reportId]: false }));
    }
  };

  const handleReject = async (reportId) => {
    if (!window.confirm("Bạn có chắc muốn từ chối báo cáo này?")) return;

    setActionLoading((prev) => ({ ...prev, [reportId]: true }));
    setMessage("");
    try {
      await rejectReport(user.token, reportId);
      await fetchReports();
      setMessage("Từ chối báo cáo thành công!");
    } catch (error) {
      setMessage(error.response?.data?.message || "Không thể từ chối báo cáo.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [reportId]: false }));
    }
  };

  const handleSubmitToAdmin = async (topicId) => {
    if (!window.confirm("Bạn có chắc muốn nộp các báo cáo đã phê duyệt của đề tài này cho admin?")) return;

    setActionLoading((prev) => ({ ...prev, [`submit_${topicId}`]: true }));
    setMessage("");
    try {
      await submitReportsToAdmin(user.token, topicId);
      await fetchReports();
      setMessage("Nộp báo cáo cho admin thành công!");
    } catch (error) {
      setMessage(error.response?.data?.message || "Không thể nộp báo cáo cho admin.");
    } finally {
      setActionLoading((prev) => ({ ...prev, [`submit_${topicId}`]: false }));
    }
  };

  return (
    <div className="teacher-approval-container">
      <Sidebar role="teacher" />
      <div className="teacher-approval-content">
        <h2>📋 Xét duyệt báo cáo</h2>
        {message && (
          <p className={message.includes("thành công") ? "success-message" : "error-message"}>
            {message}
          </p>
        )}
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <>
            <h3>📑 Báo cáo chờ xét duyệt</h3>
            {reports.length === 0 ? (
              <p>Không có báo cáo nào chờ xét duyệt.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Tên đề tài</th>
                    <th>Nội dung báo cáo</th>
                    <th>Kỳ báo cáo</th>
                    <th>Nhóm sinh viên</th>
                    <th>File</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report._id}>
                      <td>{report.topic.topicName}</td>
                      <td>{report.reportContent}</td>
                      <td>{report.period}</td>
                      <td>
                        {report.topic.teamMembers.length > 0
                          ? report.topic.teamMembers.map((m) => m.name).join(", ")
                          : "Không có thành viên"}
                      </td>
                      <td>
                        <a href={report.file} target="_blank" rel="noopener noreferrer">
                          Tải file
                        </a>
                      </td>
                      <td>
                        <button
                          onClick={() => handleApprove(report._id)}
                          disabled={actionLoading[report._id]}
                        >
                          {actionLoading[report._id] ? "Đang xử lý..." : "Phê duyệt"}
                        </button>
                        <button
                          onClick={() => handleReject(report._id)}
                          disabled={actionLoading[report._id]}
                        >
                          {actionLoading[report._id] ? "Đang xử lý..." : "Từ chối"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ReviewReports;