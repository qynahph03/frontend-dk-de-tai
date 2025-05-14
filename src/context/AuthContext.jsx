//frontend/src/context/AuthContext.jsx

import { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    if (storedUser) {
      setUser(storedUser);
      console.log("Đã khôi phục user từ localStorage:", storedUser);
    }
  }, []);

  const login = (userData) => {
    console.log("Đang đăng nhập với dữ liệu:", userData);

    if (userData.token) {
      try {
        const decodedToken = jwtDecode(userData.token);
        const normalizedUser = {
          token: userData.token,
          role: userData.role,
          userId: decodedToken.id,
          username: userData.username,
        };
        setUser(normalizedUser);
        localStorage.setItem("user", JSON.stringify(normalizedUser));
        console.log("Đã lưu user vào localStorage:", JSON.parse(localStorage.getItem("user")));
      } catch (error) {
        console.error("Lỗi khi giải mã token:", error);
        return;
      }
    } else {
      console.error("Không có token trong dữ liệu đăng nhập");
      return;
    }

    switch (userData.role) {
      case "admin":
        navigate("/admin/dashboard");
        break;
      case "teacher":
        navigate("/teacher/dashboard");
        break;
      case "student":
        navigate("/student/dashboard");
        break;
      case "uniadmin":
        navigate("/uniadmin/dashboard");
        break;
      default:
        console.warn("Vai trò không hợp lệ:", userData.role);
        navigate("/");
    }
  };

  const logout = () => {
    console.log("Đang đăng xuất");
    setUser(null);
    localStorage.removeItem("user");
    console.log("Đã xóa user khỏi localStorage:", localStorage.getItem("user"));
    navigate("/");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};