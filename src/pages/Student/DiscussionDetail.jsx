import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { sendMessage, deleteMessage, fetchDiscussionById } from "../../services/discussionService";
import "../../assets/css/Student/discussiondetail.css";

const DiscussionDetail = ({ discussionId, topicTitle, onBack }) => {
  const { user } = useAuth();
  const [discussion, setDiscussion] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  const loadDiscussion = async () => {
    setIsLoading(true);
    try {
      const data = await fetchDiscussionById(user.token, discussionId);
      setDiscussion(data);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết thảo luận:", error.message);
      alert(error.message); // TODO: Thay bằng react-toastify
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    const message = newMessage.trim();
    if (!message) return;

    try {
      await sendMessage(user.token, discussionId, message);
      setNewMessage("");
      loadDiscussion();
    } catch (error) {
      console.error("Lỗi khi gửi tin nhắn:", error.message);
      alert(error.message);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!window.confirm("Bạn có chắc muốn xóa tin nhắn này?")) return;
    try {
      await deleteMessage(user.token, discussionId, messageId);
      loadDiscussion();
    } catch (error) {
      console.error("Lỗi khi xóa tin nhắn:", error.message);
      alert(error.message);
    }
  };

  useEffect(() => {
    if (user?.token) {
      loadDiscussion();
    }
  }, [user, discussionId]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [discussion]);

  return (
    <div className="stu-discussion-detail">
      <div className="stu-header">
        <button className="stu-back-btn" onClick={onBack}>
          ⬅️
        </button>
        <h3>📝 {topicTitle || "Không có tiêu đề"}</h3>
      </div>
      {isLoading ? (
        <p>Đang tải...</p>
      ) : !discussion ? (
        <p>Không tìm thấy cuộc thảo luận!</p>
      ) : (
        <>
          <div className="stu-messages-container">
            {discussion.messages.map((msg) => {
              const isOwn = msg.senderId === user.userId;
              return (
                <div
                  key={msg._id}
                  className={`stu-message-item ${isOwn ? "stu-own-message" : "stu-other-message"}`}
                >
                  {isOwn && (
                    <span
                      className="stu-delete-icon"
                      onClick={() => handleDeleteMessage(msg._id)}
                    >
                      🗑️
                    </span>
                  )}
                  <div className="stu-message-content">
                    <strong>{msg.sender || "Ẩn danh"}</strong>
                    <p>{msg.message}</p>
                    <small>{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <div className="stu-input-area">
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
            <button className="stu-send-btn" onClick={handleSendMessage}>
              Gửi
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default DiscussionDetail;