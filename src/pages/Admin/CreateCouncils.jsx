//src/pages/Admin/CreateCouncils.jsx

import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Sidebar from "../../components/Sidebar/Sidebar";
import { getTeachers, createCouncil, updateCouncil, getCouncilInfo, deleteCouncil } from "../../services/councilService";
import { getCouncilNotifications, markAllNotificationsAsRead } from "../../services/notificationService";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "../../assets/css/Admin/createcouncils.css";

const CreateCouncil = () => {
  const { user } = useAuth();
  const { topicId } = useParams();
  const { state } = useLocation();
  const councilId = state?.councilId || null;
  const navigate = useNavigate();
  const [teachers, setTeachers] = useState([]);
  const [council, setCouncil] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [formData, setFormData] = useState({
    chairmanId: "",
    secretaryId: "",
    memberIds: [],
  });
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [message, setMessage] = useState("");

  const fetchTeachersAndCouncil = async () => {
    try {
      setLoading(true);
      const [teacherData, councilData, notificationData] = await Promise.all([
        getTeachers(user.token),
        councilId ? getCouncilInfo(user.token, topicId) : Promise.resolve(null),
        getCouncilNotifications(user.token),
      ]);
      setTeachers(teacherData);
      if (councilData) {
        setCouncil(councilData);
        setFormData({
          chairmanId: councilData.chairman._id,
          secretaryId: councilData.secretary._id,
          memberIds: councilData.members.map((m) => m._id),
        });
      }
      setNotifications(notificationData.filter((n) => !n.isRead));
      if (notificationData.length > 0) {
        await markAllNotificationsAsRead(user.token);
      }
    } catch (error) {
      setMessage(error.message || "Không thể tải dữ liệu.");
      toast.error(error.message || "Không thể tải dữ liệu.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user?.token || user?.role !== "admin") {
      setMessage("Bạn không có quyền truy cập trang này.");
      toast.error("Bạn không có quyền truy cập trang này.");
      return;
    }
    fetchTeachersAndCouncil();
  }, [user]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleMemberChange = (teacherId) => {
    setFormData((prev) => {
      const memberIds = prev.memberIds.includes(teacherId)
        ? prev.memberIds.filter((id) => id !== teacherId)
        : [...prev.memberIds, teacherId];
      return { ...prev, memberIds };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.chairmanId === formData.secretaryId) {
      setMessage("Chủ nhiệm và thư ký không được trùng!");
      toast.error("Chủ nhiệm và thư ký không được trùng!");
      return;
    }
    if (formData.memberIds.includes(formData.chairmanId) || formData.memberIds.includes(formData.secretaryId)) {
      setMessage("Thành viên không được trùng với chủ nhiệm hoặc thư ký!");
      toast.error("Thành viên không được trùng với chủ nhiệm hoặc thư ký!");
      return;
    }
    if (!window.confirm(councilId ? "Bạn có chắc muốn cập nhật yêu cầu tạo hội đồng?" : "Bạn có chắc muốn gửi yêu cầu tạo hội đồng?")) {
      return;
    }

    setActionLoading(true);
    setMessage("");
    try {
      if (councilId) {
        await updateCouncil(user.token, councilId, formData.chairmanId, formData.secretaryId, formData.memberIds);
        const updatedCouncil = await getCouncilInfo(user.token, topicId);
        setCouncil(updatedCouncil);
        setMessage("Cập nhật yêu cầu tạo hội đồng thành công!");
        toast.success("Cập nhật yêu cầu tạo hội đồng thành công!");
      } else {
        const response = await createCouncil(user.token, topicId, formData.chairmanId, formData.secretaryId, formData.memberIds);
        setCouncil(response.request);
        setMessage("Gửi yêu cầu tạo hội đồng thành công!");
        toast.success("Gửi yêu cầu tạo hội đồng thành công!");
      }
      setTimeout(() => navigate("/admin/approve-topics-page"), 1000);
    } catch (error) {
      setMessage(error.message || "Không thể lưu yêu cầu tạo hội đồng.");
      toast.error(error.message || "Không thể lưu yêu cầu tạo hội đồng.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancelRequest = async () => {
    if (!window.confirm("Bạn có chắc muốn hủy yêu cầu tạo hội đồng?")) {
      return;
    }
    setActionLoading(true);
    setMessage("");
    try {
      await deleteCouncil(user.token, council._id);
      setMessage("Hủy yêu cầu tạo hội đồng thành công!");
      toast.success("Hủy yêu cầu tạo hội đồng thành công!");
      setTimeout(() => navigate("/admin/approve-topics-page"), 1000);
    } catch (error) {
      setMessage(error.message || "Không thể hủy yêu cầu tạo hội đồng!");
      toast.error(error.message || "Không thể hủy yêu cầu tạo hội đồng!");
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusDisplay = (status) => {
    switch (status) {
      case "pending-creation":
        return "Chờ uniadmin phê duyệt";
      case "uniadmin-approved":
        return "Đã chốt hội đồng";
      case "uniadmin-rejected":
        return "Bị từ chối";
      case "completed":
        return "Đã chấm điểm xong";
      default:
        return status;
    }
  };

  return (
    <div className="create-council-container">
      <Sidebar role="admin" />
      <div className="create-council-content">
        <h2>{councilId ? "✏️ Chỉnh sửa yêu cầu tạo hội đồng" : "🏛️ Gửi yêu cầu tạo hội đồng"}</h2>
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
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Chủ tịch hội đồng:</label>
                <select
                  name="chairmanId"
                  value={formData.chairmanId}
                  onChange={handleChange}
                  required
                  disabled={council?.status === "uniadmin-approved" || council?.status === "completed"}
                >
                  <option value="">Chọn giảng viên</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Thư ký:</label>
                <select
                  name="secretaryId"
                  value={formData.secretaryId}
                  onChange={handleChange}
                  required
                  disabled={council?.status === "uniadmin-approved" || council?.status === "completed"}
                >
                  <option value="">Chọn giảng viên</option>
                  {teachers.map((teacher) => (
                    <option key={teacher._id} value={teacher._id}>
                      {teacher.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Thành viên:</label>
                <div className="members-list">
                  {teachers.map((teacher) => (
                    <label key={teacher._id}>
                      <input
                        type="checkbox"
                        checked={formData.memberIds.includes(teacher._id)}
                        onChange={() => handleMemberChange(teacher._id)}
                        disabled={council?.status === "uniadmin-approved" || council?.status === "completed"}
                      />
                      {teacher.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  disabled={actionLoading || council?.status === "uniadmin-approved" || council?.status === "completed"}
                >
                  {actionLoading ? "Đang xử lý..." : councilId ? "Cập nhật yêu cầu" : "Gửi yêu cầu"}
                </button>
                {council && council.status === "pending-creation" && (
                  <button
                    type="button"
                    onClick={handleCancelRequest}
                    disabled={actionLoading}
                    className="bg-red-500 text-white px-4 py-2 rounded ml-2"
                  >
                    {actionLoading ? "Đang xử lý..." : "Hủy yêu cầu"}
                  </button>
                )}
              </div>
            </form>
            {council && (
              <>
                <div className="council-members">
                  <h3>Danh sách thành viên hội đồng</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Vai trò</th>
                        <th>Tên</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Chủ tịch</td>
                        <td>{teachers.find((t) => t._id === council.chairman._id)?.name || "N/A"}</td>
                      </tr>
                      <tr>
                        <td>Thư ký</td>
                        <td>{teachers.find((t) => t._id === council.secretary._id)?.name || "N/A"}</td>
                      </tr>
                      {council.members.map((member) => (
                        <tr key={member._id}>
                          <td>Thành viên</td>
                          <td>{teachers.find((t) => t._id === member._id)?.name || "N/A"}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="council-status">
                  <h3>Trạng thái hội đồng: {getStatusDisplay(council.status)}</h3>
                  {council.status === "uniadmin-rejected" && council.rejectReason && (
                    <p>Lý do từ chối: {council.rejectReason}</p>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CreateCouncil;