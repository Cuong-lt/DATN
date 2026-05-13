import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Layers, Mail, Lock, Eye, EyeOff, X } from "lucide-react";
import { login, saveAuth } from "../services/authService";
import "./Login.css";

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await login({ username, password });
      saveAuth(res.data);
      if (res.data.role === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/home");
      }
    } catch {
      setError("Tên người dùng hoặc mật khẩu không hợp lệ. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <button
        className="login-close-btn"
        onClick={() => navigate("/")}
        aria-label="Đóng"
      >
        <X size={24} />
      </button>

      <div className="login-container">
        <div className="login-icon">
          <Layers size={32} />
        </div>
        <h1 className="login-title">Chào Mừng Trở Lại</h1>
        <p className="login-subtitle">
          Tiếp tục hành trình flashcard của bạn ngày hôm nay
        </p>

        {error && <div className="login-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email hoặc Tên Người Dùng</label>
            <div className="input-wrapper">
              <Mail size={18} />
              <input
                type="text"
                placeholder="ten@example.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">
              Mật Khẩu
              <Link to="/forgot-password">Quên?</Link>
            </label>
            <div className="input-wrapper">
              <Lock size={18} />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <button type="submit" className="btn-signin" disabled={loading}>
            {loading ? "Đang Đăng Nhập..." : "Đăng Nhập"}
          </button>
        </form>

        <div className="divider">HOẶC TIẾP TỤC VỚI</div>
        <div className="social-buttons">
          <button className="social-btn">
            <span className="social-icon">G</span> Google
          </button>
          <button className="social-btn">
            <span className="social-icon">iOS</span> Apple
          </button>
        </div>

        <p className="login-footer-link">
          Chưa có tài khoản? <Link to="/register">Tạo tài khoản</Link>
        </p>

        <div className="login-bottom-links">
          <a href="#">Trung Tâm Trợ Giúp</a>
          <a href="#">Chính Sách Bảo Mật</a>
          <a href="#">Điều Khoản Dịch Vụ</a>
        </div>
      </div>
    </div>
  );
}
