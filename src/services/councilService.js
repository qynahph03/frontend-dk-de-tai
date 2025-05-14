//frontend/src/services/councilService.js


// 📋 Lấy danh sách hội đồng
export const getCouncilList = async (token) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/council/list`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Không thể lấy danh sách hội đồng!");
  }

  return response.json();
};

// 📋 Lấy thông tin hội đồng của một đề tài
export const getCouncilInfo = async (token, topicId = null) => {
  const url = topicId
    ? `${import.meta.env.VITE_API_URL}/council/list?topicId=${encodeURIComponent(topicId)}`
    : `${import.meta.env.VITE_API_URL}/council/list`;
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Không thể lấy thông tin hội đồng!");
  }

  const councils = await response.json();
  if (topicId) {
    const council = councils.find((c) => c.topic._id === topicId);
    if (!council) {
      throw new Error("Không tìm thấy hội đồng!");
    }
    return council;
  }
  return councils;
};

// 👨‍🏫 Lấy danh sách giảng viên
export const getTeachers = async (token) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/user/teachers`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Không thể lấy danh sách giảng viên!");
  }

  return response.json();
};

// 🏛️ Gửi yêu cầu tạo hội đồng
export const createCouncil = async (token, topicId, chairmanId, secretaryId, memberIds) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/council/request-create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ topicId, chairmanId, secretaryId, memberIds }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Gửi yêu cầu tạo hội đồng thất bại!");
  }

  return response.json();
};

// ✏️ Cập nhật yêu cầu tạo hội đồng
export const updateCouncil = async (token, councilId, chairmanId, secretaryId, memberIds) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/council/update`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ councilId, chairmanId, secretaryId, memberIds, status: "pending-creation" }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Cập nhật yêu cầu tạo hội đồng thất bại!");
  }

  return response.json();
};

// 🗑️ Xóa yêu cầu tạo hội đồng
export const deleteCouncil = async (token, councilId) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/council/delete`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ councilId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Xóa yêu cầu tạo hội đồng thất bại!");
  }

  return response.json();
};

// 📝 Chấm điểm hội đồng
export const submitScore = async (token, councilId, score, comment) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/council/score`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ councilId, score: Number(score), comment }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Không thể chấm điểm!");
  }

  return response.json();
};

// 📚 Lấy danh sách hội đồng công khai
export const getCouncilPublicList = async (token) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/council/public-list`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Không thể lấy danh sách hội đồng!");
  }
  return response.json();
};

// 📥 Tải file báo cáo
export const downloadReport = async (token, reportId) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/council/report/${reportId}/download`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Không thể tải báo cáo!");
  }
  const blob = await response.blob();
  return { data: blob, headers: Object.fromEntries(response.headers.entries()) };
};

// 📋 Lấy danh sách yêu cầu tạo hội đồng
export const getPendingCouncilRequests = async (token) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/council/pending-requests`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Không thể lấy danh sách yêu cầu tạo hội đồng!");
  }

  return response.json();
};

// ✅ Phê duyệt yêu cầu tạo hội đồng
export const approveCouncilRequest = async (token, requestId) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/council/uniadmin-approve-request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ requestId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Phê duyệt yêu cầu tạo hội đồng thất bại!");
  }

  return response.json();
};

// ❌ Từ chối yêu cầu tạo hội đồng
export const rejectCouncilRequest = async (token, requestId, reason) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/council/uniadmin-reject-request`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ requestId, reason }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Từ chối yêu cầu tạo hội đồng thất bại!");
  }

  return response.json();
};

// 📄 Tải tài liệu phê duyệt
export const downloadApprovalDocument = async (token, councilId) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/council/approval-document/${councilId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Không thể tải tài liệu phê duyệt!");
  }

  const blob = await response.blob();
  return { data: blob, headers: Object.fromEntries(response.headers.entries()) };
};