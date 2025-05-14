//frontend/src/services/reportService.js

const API_URL = "http://localhost:5000/api";

// 📥 Nộp báo cáo
export const submitReport = async (token, formData, topicId, reportContent, period) => {
    try {
        formData.append("topicId", topicId);
        formData.append("reportContent", reportContent);
        formData.append("period", period);

        const response = await fetch(`${API_URL}/report/submit`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
            console.error("Error response:", data);
            throw new Error(data.message || "Nộp báo cáo thất bại!");
        }

        return data;
    } catch (error) {
        console.error("Error in submitReport:", error);
        throw new Error(error.message || "Lỗi khi nộp báo cáo.");
    }
};

// 📄 Lấy danh sách báo cáo
export const getReportList = async (token) => {
    try {
        const response = await fetch(`${API_URL}/report/list`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            console.error("Error response:", data);
            throw new Error(data.message || "Không thể lấy danh sách báo cáo!");
        }

        return data;
    } catch (error) {
        console.error("Error in getReportList:", error);
        throw new Error(error.message || "Lỗi khi lấy danh sách báo cáo.");
    }
};

// ✏️ Cập nhật báo cáo
export const updateReport = async (token, formData, reportId, reportContent) => {
    try {
        formData.append("reportId", reportId);
        formData.append("reportContent", reportContent);

        const response = await fetch(`${API_URL}/report/update-report`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${token}`,
            },
            body: formData,
        });

        const data = await response.json();
        if (!response.ok) {
            console.error("Error response:", data);
            throw new Error(data.message || "Cập nhật báo cáo thất bại!");
        }

        return data;
    } catch (error) {
        console.error("Error in updateReport:", error);
        throw new Error(error.message || "Lỗi khi cập nhật báo cáo.");
    }
};

// 🗑️ Xóa báo cáo
export const deleteReport = async (token, reportId) => {
    try {
        const response = await fetch(`${API_URL}/report/delete-report`, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ reportId }),
        });

        const data = await response.json();
        if (!response.ok) {
            console.error("Error response:", data);
            throw new Error(data.message || "Xóa báo cáo thất bại!");
        }

        return data;
    } catch (error) {
        console.error("Error in deleteReport:", error);
        throw new Error(error.message || "Lỗi khi xóa báo cáo.");
    }
};

// ✅ Phê duyệt báo cáo (teacher)
export const approveReport = async (token, reportId) => {
    try {
        const response = await fetch(`${API_URL}/report/approve-report`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ reportId }),
        });

        const data = await response.json();
        if (!response.ok) {
            console.error("Error response:", data);
            throw new Error(data.message || "Phê duyệt báo cáo thất bại!");
        }

        return data;
    } catch (error) {
        console.error("Error in approveReport:", error);
        throw new Error(error.message || "Lỗi khi phê duyệt báo cáo.");
    }
};

// ❌ Từ chối báo cáo (teacher)
export const rejectReport = async (token, reportId) => {
    try {
        const response = await fetch(`${API_URL}/report/reject-report`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ reportId }),
        });

        const data = await response.json();
        if (!response.ok) {
            console.error("Error response:", data);
            throw new Error(data.message || "Từ chối báo cáo thất bại!");
        }

        return data;
    } catch (error) {
        console.error("Error in rejectReport:", error);
        throw new Error(error.message || "Lỗi khi từ chối báo cáo.");
    }
};

// 🔄 Khôi phục báo cáo
export const restoreReport = async (token, reportId) => {
    try {
        const response = await fetch(`${API_URL}/report/restore-report`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ reportId }),
        });

        const data = await response.json();
        if (!response.ok) {
            console.error("Error response:", data);
            throw new Error(data.message || "Khôi phục báo cáo thất bại!");
        }

        return data;
    } catch (error) {
        console.error("Error in restoreReport:", error);
        throw new Error(error.message || "Lỗi khi khôi phục báo cáo.");
    }
};

// 🗑️ Lấy danh sách báo cáo đã xóa
export const getDeletedReports = async (token) => {
    try {
        const response = await fetch(`${API_URL}/report/deleted-reports`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            console.error("Error response:", data);
            throw new Error(data.message || "Không thể lấy danh sách báo cáo đã xóa!");
        }

        return data;
    } catch (error) {
        console.error("Error in getDeletedReports:", error);
        throw new Error(error.message || "Lỗi khi lấy danh sách báo cáo đã xóa.");
    }
};

// 🗒️ Lấy đề tài approved
export const getMyTopic = async (token) => {
    try {
        const response = await fetch(`${API_URL}/topic/list`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        const data = await response.json();
        if (!response.ok) {
            console.error("Error response:", data);
            throw new Error(data.message || "Không thể lấy thông tin đề tài!");
        }

        if (!Array.isArray(data)) {
            throw new Error("Dữ liệu đề tài không hợp lệ!");
        }

        const approvedTopics = data.filter((topic) => topic.status === "approved");
        if (approvedTopics.length === 0) {
            throw new Error("Không tìm thấy đề tài nào được phê duyệt!");
        }
        if (approvedTopics.length > 1) {
            throw new Error("Dự kiến chỉ có một đề tài được phê duyệt, nhưng tìm thấy nhiều hơn!");
        }

        return {
          topicId: approvedTopics[0]._id,
          topicName: approvedTopics[0].topicName,
          status: approvedTopics[0].status,
          teamMembers: approvedTopics[0].teamMembers.map((member) => member._id),
        };
    } catch (error) {
        console.error("Error in getMyTopic:", error);
        throw new Error(error.message || "Lỗi khi lấy thông tin đề tài.");
    }
};

// Nộp tất cả báo cáo đã phê duyệt của một đề tài cho admin
export const submitReportsToAdmin = async (token, topicId) => {
    try {
      const response = await fetch(`${API_URL}/report/submit-to-admin`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ topicId }),
      });
  
      const data = await response.json();
      if (!response.ok) {
        console.error("Error response:", data);
        throw new Error(data.message || "Nộp báo cáo cho admin thất bại!");
      }
  
      return data;
    } catch (error) {
      console.error("Error in submitReportsToAdmin:", error);
      throw new Error(error.message || "Lỗi khi nộp báo cáo cho admin.");
    }
  };

export const createEvaluationPanel = async (token, topicId, members) => {
    try {
      const response = await fetch(`${API_URL}/evaluation-panel/create`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ topicId, members }),
      });
  
          const data = await response.json();
          if (!response.ok) {
              console.error("Error response:", data);
              throw new Error(data.message || "Tạo hội đồng chấm điểm thất bại!");
          }
  
          return data;
      } catch (error) {
          console.error("Error in createEvaluationPanel:", error);
          throw new Error(error.message || "Lỗi khi tạo hội đồng chấm điểm.");
      }
};