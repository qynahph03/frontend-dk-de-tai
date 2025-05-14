// src/services/addashboardService.js

// Lấy dữ liệu tổng quan cho dashboard admin
export const fetchAdminDashboardOverview = async (token) => {
  const response = await fetch(`${import.meta.env.VITE_API_URL}/addashboard/overview`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Không thể lấy dữ liệu tổng quan!");
  }

  return response.json();
};