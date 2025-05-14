//frontend/src/pages/Uniadmin/CouncilApproval.jsx

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getPendingCouncilRequests, approveCouncilRequest, rejectCouncilRequest, downloadApprovalDocument } from '../../services/councilService';
import { getCouncilNotifications, markAllNotificationsAsRead } from '../../services/notificationService';
import { toast } from 'react-toastify';
import Sidebar from "../../components/Sidebar/Sidebar";


const CouncilApproval = () => {
  const [requests, setRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rejectReason, setRejectReason] = useState({});
  const [showRejectModal, setShowRejectModal] = useState(null);
  const token = JSON.parse(localStorage.getItem('user'))?.token;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [requestData, notificationData] = await Promise.all([
          getPendingCouncilRequests(token),
          getCouncilNotifications(token),
        ]);
        setRequests(requestData);
        setNotifications(notificationData.filter((n) => !n.isRead));
        setLoading(false);
        if (notificationData.length > 0) {
          await markAllNotificationsAsRead(token);
        }
      } catch (err) {
        setError(err.message);
        setLoading(false);
        toast.error(err.message);
      }
    };
    if (token) fetchData();
    else setError('Vui lòng đăng nhập lại');
  }, [token]);

  const handleApprove = async (requestId) => {
    try {
      await approveCouncilRequest(token, requestId);
      setRequests(requests.filter((r) => r._id !== requestId));
      toast.success('Yêu cầu tạo hội đồng đã được phê duyệt!');
    } catch (err) {
      toast.error('Lỗi khi phê duyệt yêu cầu: ' + err.message);
    }
  };

  const handleReject = async (requestId) => {
    try {
      const reason = rejectReason[requestId];
      if (!reason) {
        toast.error('Vui lòng nhập lý do từ chối!');
        return;
      }
      await rejectCouncilRequest(token, requestId, reason);
      setRequests(requests.filter((r) => r._id !== requestId));
      setShowRejectModal(null);
      setRejectReason({ ...rejectReason, [requestId]: '' });
      toast.success('Yêu cầu tạo hội đồng đã bị từ chối!');
    } catch (err) {
      toast.error('Lỗi khi từ chối yêu cầu: ' + err.message);
    }
  };

  const handleDownload = async (councilId) => {
    try {
      const { data, headers } = await downloadApprovalDocument(token, councilId);
      const url = window.URL.createObjectURL(data);
      const link = document.createElement('a');
      const fileName = headers['content-disposition']
        ? headers['content-disposition'].split('filename=')[1].replace(/"/g, '')
        : `council_approval_${councilId}.docx`;
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success('Tải tài liệu phê duyệt thành công!');
    } catch (err) {
      toast.error('Lỗi khi tải tài liệu: ' + err.message);
    }
  };

  if (!token) return <div className="p-6">Vui lòng đăng nhập để tiếp tục.</div>;
  if (loading) return <div className="p-6">Đang tải...</div>;
  if (error) return <div className="p-6">Lỗi: {error}</div>;

  return (
    <div className="p-6">
            <Sidebar role="uniadmin" />
      
      <h1 className="text-3xl font-bold mb-4">Phê duyệt yêu cầu tạo hội đồng</h1>
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
      {requests.length === 0 ? (
        <p>Không có yêu cầu nào đang chờ phê duyệt.</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Đề tài</th>
              <th className="border p-2">Chủ tịch</th>
              <th className="border p-2">Thư ký</th>
              <th className="border p-2">Thành viên</th>
              <th className="border p-2">Người gửi</th>
              <th className="border p-2">Trạng thái</th>
              <th className="border p-2">Hành động</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((request) => (
              <tr key={request._id} className="border">
                <td className="border p-2">
                  {request.topic?._id ? (
                    <Link to={`/topic/${request.topic._id}`} className="text-blue-500 hover:underline">
                      {request.topic?.topicName || 'Không xác định'}
                    </Link>
                  ) : (
                    'Không xác định'
                  )}
                </td>
                <td className="border p-2">{request.chairman?.name || 'Không xác định'}</td>
                <td className="border p-2">{request.secretary?.name || 'Không xác định'}</td>
                <td className="border p-2">
                  {request.members.map((m) => m.name).join(', ') || 'Không có'}
                </td>
                <td className="border p-2">{request.createdBy?.name || 'Không xác định'}</td>
                <td className="border p-2">{request.status}</td>
                <td className="border p-2">
                  {request.status === 'pending-creation' ? (
                    <>
                      <button
                        onClick={() => handleApprove(request._id)}
                        className="bg-green-500 text-white px-2 py-1 rounded mr-2"
                      >
                        Phê duyệt
                      </button>
                      <button
                        onClick={() => setShowRejectModal(request._id)}
                        className="bg-red-500 text-white px-2 py-1 rounded"
                      >
                        Từ chối
                      </button>
                      {showRejectModal === request._id && (
                        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="bg-white p-4 rounded">
                            <h2 className="text-xl mb-2">Lý do từ chối</h2>
                            <textarea
                              value={rejectReason[request._id] || ''}
                              onChange={(e) =>
                                setRejectReason({
                                  ...rejectReason,
                                  [request._id]: e.target.value,
                                })
                              }
                              className="w-full p-2 border"
                              placeholder="Nhập lý do từ chối"
                            />
                            <div className="mt-4">
                              <button
                                onClick={() => handleReject(request._id)}
                                className="bg-red-500 text-white px-4 py-2 rounded mr-2"
                              >
                                Xác nhận
                              </button>
                              <button
                                onClick={() => setShowRejectModal(null)}
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                              >
                                Hủy
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                    </>
                  ) : request.status === 'uniadmin-approved' ? (
                    <button
                      onClick={() => handleDownload(request._id)}
                      className="bg-blue-500 text-white px-2 py-1 rounded"
                    >
                      Tải tài liệu
                    </button>
                  ) : (
                    <span>Đã xử lý</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default CouncilApproval;