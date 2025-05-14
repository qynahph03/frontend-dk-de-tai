//src/pages/Teacher/Discussions.jsx

import React, { useEffect, useState, useCallback, useRef } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useAuth } from "../../context/AuthContext";
import { fetchDiscussions, sendMessage, deleteMessage } from "../../services/discussionService";
import "../../assets/css/Teacher/discussions.css";

const TeacherDiscussions = () => {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [selectedDiscussionId, setSelectedDiscussionId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const [newMessage, setNewMessage] = useState("");

  const loadDiscussions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchDiscussions(user.token, 1, 10);
      setDiscussions(data.discussions);
    } catch (error) {
      console.error("Lỗi khi lấy cuộc thảo luận:", error.message);
      alert(error.message); // TODO: Thay bằng react-toastify
    } finally {
      setIsLoading(false);
    }
  }, [user.token]);

  const handleSelectDiscussion = (discussionId) => {
    setSelectedDiscussionId(discussionId);
  };

  const handleBack = () => {
    setSelectedDiscussionId(null);
    loadDiscussions();
  };

  const selectedDiscussion = discussions.find(
    (d) => d.discussionId === selectedDiscussionId
  );

  const handleSendMessage = async () => {
    const message = newMessage.trim();
    if (!message) return;

    try {
      await sendMessage(user.token, selectedDiscussionId, message);
      setNewMessage("");
      loadDiscussions();
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error.message);
      alert(error.message);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Bạn có chắc muốn xóa tin nhắn này?")) return;
    try {
      await deleteMessage(user.token, selectedDiscussionId, messageId);
      loadDiscussions();
    } catch (error) {
      console.error("Lỗi khi xóa tin nhắn:", error.message);
      alert(error.message);
    }
  };

  useEffect(() => {
    if (user?.token) {
      loadDiscussions();
    }
  }, [user, loadDiscussions]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedDiscussion]);

  return (
    <div className="tea-discussions-container">
      <Sidebar role="teacher" />
      <div className="tea-discussions-content">
        <h2>💬 Diễn đàn hướng dẫn</h2>
        {selectedDiscussionId ? (
          <div className="tea-discussion-detail">
            <div className="tea-header">
              <button className="tea-back-btn" onClick={handleBack}>
                ⬅️
              </button>
              <h3>📝 {selectedDiscussion?.topicTitle || "Không có tiêu đề"}</h3>
            </div>
            {isLoading ? (
              <p>Đang tải...</p>
            ) : !selectedDiscussion ? (
              <p>Không tìm thấy cuộc thảo luận!</p>
            ) : (
              <>
                <div className="tea-messages-container">
                  {selectedDiscussion.messages.map((msg) => {
                    const isOwn = msg.senderId === user.userId;
                    return (
                      <div
                        key={msg._id}
                        className={`tea-message-item ${isOwn ? "tea-own-message" : "tea-other-message"}`}
                      >
                        {isOwn && (
                          <span
                            className="tea-delete-icon"
                            onClick={() => handleDeleteMessage(msg._id)}
                          >
                            🗑️
                          </span>
                        )}
                        <div className="tea-message-content">
                          <strong>{msg.sender || "Ẩn danh"}</strong>
                          <p>{msg.message}</p>
                          <small>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
                <div className="tea-input-area">
                  <input
                    type="text"
                    placeholder="Nhập tin nhắn..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                  />
                  <button className="tea-send-btn" onClick={handleSendMessage}>
                    Gửi
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="tea-discussion-cards">
            {isLoading ? (
              <p>Đang tải thảo luận...</p>
            ) : discussions.length === 0 ? (
              <p>Chưa có cuộc thảo luận nào.</p>
            ) : (
              discussions.map((discussion) => (
                <div
                  key={discussion.discussionId}
                  className="tea-discussion-card"
                  onClick={() => handleSelectDiscussion(discussion.discussionId)}
                >
                  <h4>{discussion.topicTitle || "Không có tiêu đề"}</h4>
                  <p>
                    {discussion.messages.length > 0
                      ? discussion.messages[discussion.messages.length - 1].message
                      : "Chưa có tin nhắn"}
                  </p>
                  <small>
                    {discussion.messages.length > 0
                      ? new Date(
                          discussion.messages[discussion.messages.length - 1].createdAt
                        ).toLocaleString()
                      : ""}
                  </small>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TeacherDiscussions;