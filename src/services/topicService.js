// / frontend/src/services/topicService.js


// Thêm API lấy danh sách đề tài (khôi phục từ lịch sử)
export const getTopicsForUser = async (token) => {
  console.log("Gửi yêu cầu API với token:", token);
  const response = await fetch(`${import.meta.env.VITE_API_URL}/topic/list`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`, // Gửi token xác thực
    },
  });

  if (!response.ok) {
    throw new Error("Không thể tải danh sách đề tài. Token có thể đã hết hạn.");
  }

  return response.json();
};

// 📋 Lấy danh sách đề tài của người dùng (đã lọc status: "approved")
export const fetchTopics = async (token) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/topic/list`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Không thể lấy danh sách đề tài!");
  }

  const topics = await response.json();
  // Lọc chỉ các topic có status: "approved"
  return topics.filter((topic) => topic.status === "approved");
};

// Lấy danh sách thảo luận
export const fetchDiscussions = async (token, page = 1, limit = 10) => {
  const res = await fetch(`/api/discussion/messages?page=${page}&limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Không thể lấy danh sách thảo luận");
  }
  return data;
};

// Lấy dữ liệu tổng quan cho dashboard
export const fetchDashboardOverview = async (token) => {
  const res = await fetch(`/api/teadashboard/overview`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.message || "Không thể lấy dữ liệu tổng quan");
  }
  return data;
};

// API sinh viên gửi yêu cầu hủy đề tài
export const cancelTopicRequest = async (topicId, token) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/topic/student-cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ topicId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Không thể gửi yêu cầu hủy đề tài.");
  }

  return response.json();
};

// Lấy danh sách đề tài cần xét duyệt
export const getAllTopics = async (token) => {
  if (!token) {
    throw new Error("Token không hợp lệ hoặc thiếu.");
  }
  const response = await fetch(`${import.meta.env.VITE_API_URL}/topic/list`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error(`Không thể lấy danh sách đề tài: ${response.status} - ${response.statusText}`);
  }

  return response.json();
};

// Giảng viên phê duyệt đề tài
export const approveTopic = async (topicId, token) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/topic/teacher-approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ topicId }),
  });

  if (!response.ok) {
    throw new Error("Không thể phê duyệt đề tài.");
  }

  return response.json();
};

// Giảng viên từ chối đề tài
export const rejectTopic = async (topicId, token) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/topic/teacher-reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ topicId }),
  });

  if (!response.ok) {
    throw new Error("Không thể từ chối đề tài.");
  }

  return response.json();
};

// Admin phê duyệt đề tài
export const adminApproveTopic = async (topicId, token) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/topic/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ topicId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Không thể phê duyệt đề tài.");
  }

  return response.json();
};

// Admin từ chối đề tài
export const adminRejectTopic = async (topicId, token) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/topic/reject`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ topicId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Không thể từ chối đề tài.");
  }

  return response.json();
};

  // Admin phê duyệt yêu cầu dừng đề tài
  export const approveStopTopic = async (token, topicId) => {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/topic/approve-stop`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ topicId }),
    });
  
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Không thể phê duyệt yêu cầu dừng đề tài!");
    }
  
    return response.json();
  };