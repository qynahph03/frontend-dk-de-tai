//frontend/src/main.jsx

import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>  {/* ✅ Chỉ có một BrowserRouter duy nhất */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);
