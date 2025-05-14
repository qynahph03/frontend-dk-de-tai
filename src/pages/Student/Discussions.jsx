import React, { useEffect, useState, useCallback } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import { useAuth } from "../../context/AuthContext";
import { fetchDiscussions, startDiscussion } from "../../services/discussionService";
import { fetchTopics } from "../../services/topicService";
import DiscussionDetail from "./DiscussionDetail";
import "../../assets/css/Student/discussions.css";

const StudentDiscussions = () => {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [topics, setTopics] = useState([]);
  const [selectedTopicId, setSelectedTopicId] = useState("");
  const [selectedDiscussionId, setSelectedDiscussionId] = useState(null);
  const [isLoadingTopics, setIsLoadingTopics] = useState(false);
  const [isLoadingDiscussions, setIsLoadingDiscussions] = useState(false);

  // Lấy danh sách thảo luận
  const loadDiscussions = useCallback(async () => {
    setIsLoadingDiscussions(true);
    try {
      const data = await fetchDiscussions(user.token, 1, 10);
      setDiscussions(data.discussions);
    } catch (error) {
      console.error("Lỗi khi lấy tin nhắn:", error.message);
      alert(error.message); // TODO: Thay bằng react-toastify
    } finally {
      setIsLoadingDiscussions(false);
    }
  }, [user.token]);

  // Lấy danh sách đề tài
  const loadTopics = useCallback(async () => {
    setIsLoadingTopics(true);
    try {
      const data = await fetchTopics(user.token);
      setTopics(data);
    } catch (error) {
      console.error("Lỗi khi lấy đề tài:", error.message);
      alert(error.message);
    } finally {
      setIsLoadingTopics(false);
    }
  }, [user.token]);

  const handleStartDiscussion = async () => {
    if (!selectedTopicId) {
      alert("Vui lòng chọn một đề tài!");
      return;
    }
    try {
      await startDiscussion(user.token, selectedTopicId);
      setSelectedTopicId("");
      loadDiscussions();
      alert("Tạo thảo luận thành công!");
    } catch (error) {
      console.error("Lỗi tạo thảo luận:", error.message);
      alert(error.message);
    }
  };

  const handleSelectDiscussion = (discussionId) => {
    setSelectedDiscussionId(discussionId);
  };

  const handleBack = () => {
    setSelectedDiscussionId(null);
    loadDiscussions();
  };

  useEffect(() => {
    if (user?.token) {
      loadDiscussions();
      loadTopics();
    }
  }, [user, loadDiscussions, loadTopics]);

  return (
    <div className="stu-discussions-container">
      <Sidebar role="student" />
      <div className="stu-discussions-content">
        <h2>💬 Diễn đàn nhóm</h2>
        {selectedDiscussionId ? (
          <DiscussionDetail
            discussionId={selectedDiscussionId}
            topicTitle={
              discussions.find((d) => d.discussionId === selectedDiscussionId)?.topicTitle ||
              "Không có tiêu đề"
            }
            onBack={handleBack}
          />
        ) : (
          <>
            {/* Form tạo thảo luận mới */}
            <div className="stu-create-discussion">
              {isLoadingTopics ? (
                <p>Đang tải đề tài...</p>
              ) : (
                <select
                  value={selectedTopicId}
                  onChange={(e) => setSelectedTopicId(e.target.value)}
                >
                  <option value="">Chọn đề tài</option>
                  {topics.map((topic) => (
                    <option key={topic._id} value={topic._id}>
                      {topic.topicName}
                    </option>
                  ))}
                </select>
              )}
              <button onClick={handleStartDiscussion} disabled={isLoadingTopics}>
                Tạo thảo luận mới
              </button>
            </div>
            {isLoadingDiscussions ? (
              <p>Đang tải thảo luận...</p>
            ) : discussions.length === 0 ? (
              <p>Chưa có cuộc thảo luận nào. Hãy tạo một cuộc thảo luận mới!</p>
            ) : (
              <div className="stu-discussion-cards">
                {discussions.map((discussion) => (
                  <div
                    key={discussion.discussionId}
                    className="stu-discussion-card"
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
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDiscussions;