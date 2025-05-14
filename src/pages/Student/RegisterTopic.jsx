// frontend/src/pages/Student/RegisterTopic.jsx

import React, { useState } from "react";
import Sidebar from "../../components/Sidebar/Sidebar";
import "../../assets/css/Student/registertopic.css";
import { toast } from "react-toastify";

const RegisterTopic = () => {
  const [formData, setFormData] = useState({
    topicName: "",
    topicDescription: "",
    supervisor: "",
    teamMembers: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const isConfirmed = window.confirm("Bạn có chắc chắn muốn đăng ký đề tài này không?");
    if (!isConfirmed) return;

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Bạn chưa đăng nhập!");
        setIsSubmitting(false);
        return;
      }

      // Kiểm tra giảng viên hướng dẫn
      const encodedSupervisor = encodeURIComponent(formData.supervisor);
      const supervisorCheck = await fetch(
        `http://localhost:5000/api/user/check?name=${encodedSupervisor}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const supervisorData = await supervisorCheck.json();

      if (!supervisorData.user || supervisorData.user.role !== "teacher") {
        toast.error("Giảng viên hướng dẫn không tồn tại hoặc không hợp lệ!");
        setIsSubmitting(false);
        return;
      }

      // Kiểm tra từng thành viên nhóm
      if (formData.teamMembers) {
        const members = formData.teamMembers.split(",").map((name) => name.trim());
        for (const member of members) {
          const encodedMember = encodeURIComponent(member);
          const memberCheck = await fetch(
            `http://localhost:5000/api/user/check?name=${encodedMember}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          const memberData = await memberCheck.json();
          if (!memberData.user || memberData.user.role !== "student") {
            toast.error(`Thành viên nhóm ${member} không tồn tại hoặc không hợp lệ!`);
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Gửi request đăng ký
      const response = await fetch("/api/topic/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Đăng ký đề tài thất bại!");
      }

      toast.success("🎉 Đăng ký đề tài thành công!");
      setFormData({ topicName: "", topicDescription: "", supervisor: "", teamMembers: "" });
    } catch (error) {
      toast.error(error.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="register-topic-container">
      <Sidebar role="student" />
      <h2 className="title">📌 Đăng ký đề tài nghiên cứu</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Tên đề tài:
          <input
            type="text"
            name="topicName"
            value={formData.topicName}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Mô tả đề tài:
          <textarea
            name="topicDescription"
            value={formData.topicDescription}
            onChange={handleChange}
            required
          ></textarea>
        </label>
        <label>
          Giảng viên hướng dẫn:
          <input
            type="text"
            name="supervisor"
            value={formData.supervisor}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Thành viên nhóm:
          <input
            type="text"
            name="teamMembers"
            value={formData.teamMembers}
            onChange={handleChange}
            placeholder="Nhập tên sinh viên, cách nhau bằng dấu phẩy"
          />
        </label>
        <button type="submit" disabled={isSubmitting}>Gửi đăng ký</button>
      </form>
    </div>
  );
};

export default RegisterTopic;
