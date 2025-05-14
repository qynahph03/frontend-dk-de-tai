import React, { useState } from "react";
//import "../../assets/css/submit-report.css";

const SubmitReport = () => {
  const [reportFile, setReportFile] = useState(null);
  const [message, setMessage] = useState("");

  const handleFileChange = (e) => {
    setReportFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (reportFile) {
      setMessage("📎 Báo cáo đã được nộp thành công!");
    } else {
      setMessage("⚠️ Vui lòng chọn tệp báo cáo trước khi gửi.");
    }
  };

  return (
    <div className="submit-report-container">
      <h2>📎 Nộp báo cáo nghiên cứu</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Chọn tệp báo cáo:
          <input type="file" onChange={handleFileChange} accept=".pdf,.doc,.docx" />
        </label>
        <button type="submit">Nộp báo cáo</button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default SubmitReport;