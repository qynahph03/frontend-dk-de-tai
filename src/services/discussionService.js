const API_URL = "http://localhost:5000/api";

// 📋 Lấy danh sách thảo luận
export const fetchDiscussions = async (token, page = 1, limit = 10) => {
  const response = await fetch(`${API_URL}/discussion/messages?page=${page}&limit=${limit}`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Không thể lấy danh sách thảo luận!");
  }

  return response.json();
};

// 📋 Lấy chi tiết một cuộc thảo luận
export const fetchDiscussionById = async (token, discussionId) => {
  const response = await fetch(`${API_URL}/discussion/messages?page=1&limit=100`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Không thể lấy chi tiết thảo luận!");
  }

  const data = await response.json();
  const discussion = data.discussions.find(d => d.discussionId === discussionId);
  if (!discussion) {
    throw new Error("Cuộc thảo luận không tồn tại!");
  }
  return discussion;
};

// ✉️ Gửi tin nhắn mới
export const sendMessage = async (token, discussionId, message) => {
  const response = await fetch(`${API_URL}/discussion/message`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ discussionId, message }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Không thể gửi tin nhắn!");
  }

  return response.json();
};

// 📝 Tạo cuộc thảo luận mới
export const startDiscussion = async (token, topicId) => {
  const response = await fetch(`${API_URL}/discussion/start`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ topicId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Không thể tạo cuộc thảo luận!");
  }

  return response.json();
};

// 🗑️ Xóa tin nhắn
export const deleteMessage = async (token, discussionId, messageId) => {
  const response = await fetch(`${API_URL}/discussion/message`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ discussionId, messageId }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Không thể xóa tin nhắn!");
  }

  return response.json();
};