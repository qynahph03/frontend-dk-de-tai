//src/pages/Admin/ApproveRejectTopics.jsx

import React, { useEffect, useState } from "react";
import { getAllTopics, adminApproveTopic, adminRejectTopic, approveStopTopic } from "/src/services/topicService";
import { toast } from "react-toastify";
import "/src/assets/css/Admin/approverejecttopics.css";
import Sidebar from "../../components/Sidebar/Sidebar";

const ApproveRejectTopics = () => {
  const [topics, setTopics] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTopics();
  }, []);

  const fetchTopics = async () => {
    try {
      const token = localStorage.getItem("token");
      const data = await getAllTopics(token);
      setTopics(data);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  const handleAction = async (topicId, action) => {
    try {
      const token = localStorage.getItem("token");
      if (action === "approve") {
        await adminApproveTopic(topicId, token);
        toast.success("Đề tài đã được phê duyệt!");
      } else if (action === "reject") {
        await adminRejectTopic(topicId, token);
        toast.success("Đề tài đã bị từ chối!");
      } else if (action === "approve-stop") {
        await approveStopTopic(token, topicId);
        toast.success("Yêu cầu dừng đề tài đã được phê duyệt!");
      }

      setTopics((prevTopics) =>
        prevTopics.map((topic) =>
          topic._id === topicId
            ? {
                ...topic,
                status:
                  action === "approve" ? "approved" : action === "reject" ? "rejected" : "stopped",
              }
            : topic
        )
      );
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  };

  return (
    <div className="approve-reject-container">
      <Sidebar role="admin" />

      <h2 className="title">📌 Quản lý xét duyệt đề tài</h2>
      {error && <p className="error-message">{error}</p>}
      <ul className="topic-list">
        {topics.map((topic) => (
          <li key={topic._id} className="topic-item">
            <strong>{topic.topicName}</strong> - {topic.topicDescription} <br />
            Giảng viên: {topic.supervisor?.name} <br />
            <span className={`status ${topic.status}`}>
              Trạng thái: {topic.status}
            </span>{" "}
            <br />
            {topic.status === "teacher-approve" && (
              <>
                <button
                  className="approve-btn"
                  onClick={() => handleAction(topic._id, "approve")}
                >
                  ✅ Phê duyệt
                </button>
                <button
                  className="reject-btn"
                  onClick={() => handleAction(topic._id, "reject")}
                >
                  ❌ Từ chối
                </button>
              </>
            )}
            {topic.status === "stop-performing" && (
              <button
                className="approve-stop-btn"
                onClick={() => handleAction(topic._id, "approve-stop")}
              >
                🛑 Phê duyệt dừng
              </button>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ApproveRejectTopics;
