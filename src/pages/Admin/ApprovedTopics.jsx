//frontend/src/pages/Admin/ApprovedTopics.jsx

import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar/Sidebar";
import { getAllTopics } from "../../services/topicService";
import { getCouncilInfo, downloadApprovalDocument } from "../../services/councilService";
import { getReportList } from "../../services/reportService";
import { getCouncilNotifications, markAllNotificationsAsRead } from "../../services/notificationService";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../assets/css/Admin/approvedtopics.css";

const ApprovedTopics = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [topics, setTopics] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchTopicsAndReports = async () => {
    try {
      setLoading(true);
      const [reports, allTopics, notificationData] = await Promise.all([
        getReportList(user.token),
        getAllTopics(user.token),
        getCouncilNotifications(user.token),
      ]);

      const approvedTopics = allTopics.filter((topic) => topic.status === "approved");
      const topicMap = await Promise.all(
        approvedTopics.map(async (topic) => {
          const topicReports = reports.filter(
            (report) =>
              report.topic._id === topic._id &&
              report.status === "approved" &&
              report.submittedToAdmin
          );
          let council = null;
          try {
            council = await getCouncilInfo(user.token, topic._id);
          } catch (error) {
            console.warn(`No council for topic ${topic._id}: ${error.message}`);
          }
          return {
            ...topic,
            approvedReports: topicReports,
            council: council,
            hasCouncil: !!council,
            councilId: council?._id || null,
            councilStatus: council?.status || null,
            approvalDocument: council?.approvalDocument || null,
          };
        })
      );

      const filteredTopics = topicMap.filter((topic) => topic.approvedReports.length > 0);
      setTopics(filteredTopics);
      setNotifications(notificationData.filter((n) => !n.isRead));
      if (notificationData.length > 0) {
        await markAllNotificationsAsRead(user.token);
      }
      if (filteredTopics.length === 0) {
        setMessage("Không có đề tài nào có báo cáo đã nộp.");
      }
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
      toast.error("Bạn không có quyền truy cập trang này.");
      navigate("/login");
      return;
    }
    fetchTopicsAndReports();
  }, [user, navigate]);

  const handleCouncilAction = (topicId, councilId) => {
    navigate(`/admin/create-councils/${topicId}`, { state: { councilId } });
  };

  const handleDownloadApprovalDocument = async (councilId) => {
    try {
      const { data: blob, headers } = await downloadApprovalDocument(user.token, councilId);
      const fileName = headers["content-disposition"]
        ?.match(/filename="(.+)"/)?.[1] || `council_approval_${councilId}.docx`;
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Tải tài liệu phê duyệt thành công!");
    } catch (error) {
      toast.error(error.message || "Không thể tải tài liệu phê duyệt!");
    }
  };

  const getCouncilStatusDisplay = (hasCouncil, councilStatus) => {
    if (!hasCouncil) return "Chưa có hội đồng";
    switch (councilStatus) {
      case "pending-creation":
        return "Chờ xét duyệt";
      case "uniadmin-approved":
        return "Đã chốt hội đồng";
      case "uniadmin-rejected":
        return "Bị từ chối";
      case "completed":
        return "Đã chấm điểm ";
      default:
        return "Không xác định";
    }
  };

  const getCouncilButtonText = (hasCouncil, councilStatus) => {
    if (!hasCouncil) return "Tạo hội đồng";
    if (councilStatus === "pending-creation") return "Chờ xét duyệt";
    if (councilStatus === "uniadmin-rejected") return "Chỉnh sửa hội đồng";
    return "Xem hội đồng";
  };

  const isCouncilButtonDisabled = (councilStatus) => {
    return councilStatus === "pending-creation";
  };

  return (
    <div className="approved-topics-container">
      <Sidebar role="admin" />
      <div className="approved-topics-content">
        <h2>📋 Danh sách đề tài đã nộp báo cáo</h2>
        {message && (
          <p className={message.includes("thành công") ? "success-message" : "error-message"}>
            {message}
          </p>
        )}
        {notifications.length > 0 && (
          <div className="mb-4 p-4 bg-yellow-100 border border-yellow-400 rounded">
            <h3 className="font-bold">Thông báo mới:</h3>
            <ul>
              {notifications.map((n) => (
                <li key={n._id}>{n.message}</li>
              ))}
            </ul>
          </div>
        )}
        {loading ? (
          <p>Đang tải dữ liệu...</p>
        ) : (
          <>
            {topics.length === 0 ? (
              <p>Không có đề tài nào có báo cáo đã nộp.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Tên đề tài</th>
                    <th>Giảng viên hướng dẫn</th>
                    <th>Nhóm sinh viên</th>
                    <th>Báo cáo đã nộp</th>
                    <th>Trạng thái hội đồng</th>
                    <th>Tài liệu phê duyệt</th>
                    <th>Hành động</th>
                  </tr>
                </thead>
                <tbody>
                  {topics.map((topic) => (
                    <tr key={topic._id}>
                      <td>{topic.topicName}</td>
                      <td>{topic.supervisor?.name || "N/A"}</td>
                      <td>
                        {topic.teamMembers?.length > 0
                          ? topic.teamMembers.map((m) => m.name).join(", ")
                          : "Không có thành viên"}
                      </td>
                      <td>{topic.approvedReports.length}</td>
                      <td>{getCouncilStatusDisplay(topic.hasCouncil, topic.councilStatus)}</td>
                      <td>
                        {topic.approvalDocument?.url && ["uniadmin-approved", "completed"].includes(topic.councilStatus) ? (
                          <button
                            onClick={() => handleDownloadApprovalDocument(topic.councilId)}
                            className="download-btn"
                          >
                            Tải tài liệu
                          </button>
                        ) : (
                          "Chưa có"
                        )}
                      </td>
                      <td>
                        <button
                          onClick={() => handleCouncilAction(topic._id, topic.councilId)}
                          disabled={isCouncilButtonDisabled(topic.councilStatus)}
                          className={isCouncilButtonDisabled(topic.councilStatus) ? "disabled" : ""}
                        >
                          {getCouncilButtonText(topic.hasCouncil, topic.councilStatus)}
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

export default ApprovedTopics;