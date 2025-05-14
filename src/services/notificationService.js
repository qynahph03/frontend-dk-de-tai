//frontend/src/services/notificationService.js


// 📨 Lấy danh sách thông báo
export const getNotifications = async (token) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/notification/list`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Không thể lấy danh sách thông báo!");
  }

  return response.json();
};

// 📨 Lấy danh sách thông báo liên quan đến hội đồng
export const getCouncilNotifications = async (token) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/notification/list?type=council`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Không thể lấy thông báo hội đồng!");
  }

  return response.json();
};

// ✅ Đánh dấu tất cả thông báo đã đọc
export const markAllNotificationsAsRead = async (token) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/notification/mark-as-read`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Không thể đánh dấu thông báo đã đọc!");
  }

  return response.json();
};