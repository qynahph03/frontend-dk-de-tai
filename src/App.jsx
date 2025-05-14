//frontend/src/App.jsx

import React from "react";
import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";


import Login from "./pages/Login";
import Register from "./pages/Register";
import Settings from "./pages/Settings";

//Role Student
import StudentDashboard from "./pages/Student/Dashboard";
import Discussions from "./pages/Student/Discussions";
import Library from "./pages/Student/Library";
import RegisterTopic from "./pages/Student/RegisterTopic";
import Report from "./pages/Student/Report";
import StudentNotifications from "./pages/Student/Notifications";

//Role Teacher
import TeacherDashboard from "./pages/Teacher/Dashboard";
import TopicList from "./pages/Teacher/TopicList";
import TeacherNotifications from "./pages/Teacher/Notifications";
import TeacherApproval from "./pages/Teacher/TeacherApproval";
import DiscussionsTeacher from "./pages/Teacher/Discussions";
import ReviewReports from "./pages/Teacher/ReviewReports"; 
import Score from "./pages/Teacher/Score";

//Role Admin
import AdminDashboard from "./pages/Admin/Dashboard";
import ApproveRejectTopics from "./pages/Admin/ApproveRejectTopics";
import AdminNotifications from "./pages/Admin/Notifications";
import ApprovedTopics from "./pages/Admin/ApprovedTopics";
import CreateCouncils from "./pages/Admin/CreateCouncils";
import ScoredTopics from "./pages/Admin/ScoredTopics";

//Role UniAdmin
import UniadminDashboard from "./pages/Uniadmin/Dashboard";
import CouncilApproval from "./pages/Uniadmin/CouncilApproval";
import UniadminNotifications from "./pages/Uniadmin/Notifications";


function App() {
  return (
    <>
      <ToastContainer/>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        //Role Student Dashboard
        <Route path="/student/dashboard" element={<StudentDashboard />} />
        <Route path="/student/library" element={<Library />} />
        <Route path="/student/register-topic" element={<RegisterTopic />} />
        <Route path="/student/notifications" element={<StudentNotifications />} />
        <Route path="/student/settings" element={<Settings />} />
        <Route path="/student/report" element={<Report />} />
        <Route path="/student/discussions" element={<Discussions />} />

        //Role Teacher Dashboard
        <Route path="/teacher/dashboard" element={<TeacherDashboard />} />
        <Route path="/teacher/topic-list" element={<TopicList />} />
        <Route path="/teacher/approval" element={<TeacherApproval />} />
        <Route path="/teacher/notifications" element={<TeacherNotifications />} />
        <Route path="/teacher/settings" element={<Settings />} />
        <Route path="/teacher/score" element={<Score />} />
        <Route path="/teacher/score/:councilId" element={<Score />} />
        <Route path="/teacher/discussions" element={<DiscussionsTeacher />} />
        <Route path="/teacher/review-reports" element={<ReviewReports />} />

        //Role Admin Dashboard
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="/admin/approve-reject-topics" element={<ApproveRejectTopics />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/settings" element={<Settings />} />
        <Route path="/admin/approve-topics-page" element={<ApprovedTopics />} />
        <Route path="/admin/create-councils/:topicId" element={<CreateCouncils />} />
        <Route path="/admin/scored-topics" element={<ScoredTopics />} />

        //Role Uniadmin Dashboard
        <Route path="/uniadmin/dashboard" element={<UniadminDashboard />} />
        <Route path="/uniadmin/council-approval" element={<CouncilApproval />} />
        <Route path="/uniadmin/notifications" element={<UniadminNotifications />} />
        <Route path="/uniadmin/settings" element={<Settings />} />
      </Routes>
    </>
  );
}

export default App;
