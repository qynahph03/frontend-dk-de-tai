// File: src/pages/Register.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../assets/css/register.css';

const Register = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const [role] = useState('student');


  const handleSubmit = async (e) => {
    e.preventDefault();
    // if (role === 'teacher' && !isVerified) return;
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, username, password, role }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message);
      }

      alert('Đăng ký thành công! Hãy đăng nhập.');
      navigate('/login');
    } catch (error) {
      alert('Lỗi đăng ký ' + error.message);
    }
  };

  return (
    <div className="register-container">
      <form className="register-form" onSubmit={handleSubmit}>
        <h2>Đăng ký</h2>
        <div className="form-group">
          <input placeholder="Họ và tên" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="form-group">
          <input placeholder="Tên đăng nhập" type="text" value={username} onChange={(e) => setUsername(e.target.value)} required />
        </div>
        <div className="form-group">
          <input placeholder="Mật khẩu" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        </div>

        <button type="submit">Đăng kí</button>
        <p>Bạn đã có tài khoản? <a href="/login">Đăng nhập ngay</a></p>
      </form>
    </div>
  );
};

export default Register;
