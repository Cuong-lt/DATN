import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Layers,
  User,
  Mail,
  Lock,
  ShieldCheck,
  ArrowRight,
  X,
} from "lucide-react";
import { register, saveAuth, saveEmail } from "../services/authService";
import ThemeToggle from "../components/ThemeToggle";
import "./Register.css";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (form.username.length < 3) {
      setError("Tên người dùng phải có ít nhất 3 ký tự");
      return;
    }
    if (form.password.length < 6) {
      setError("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Mật khẩu không khớp");
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        username: form.username,
        email: form.email,
        password: form.password,
      });
      saveAuth(res.data);
      saveEmail(form.email);
      navigate("/home");
    } catch (err: any) {
      setError(
        err?.message ||
          "Đăng ký thất bại. Tên người dùng hoặc email có thể đã tồn tại.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <button
        className="register-close-btn"
        onClick={() => navigate("/")}
        aria-label="Đóng"
      >
        <X size={24} />
      </button>
      <div className="register-theme-toggle">
        <ThemeToggle />
      </div>
      <header className="register-header">
        <h1>Tạo Tài Khoản</h1>
      </header>

      <div className="register-container">
        <div className="register-icon">
          <Layers size={32} />
        </div>
        <h2 className="register-title">Tham Gia FlashLearner</h2>
        <p className="register-subtitle">
          Bắt đầu hành trình thành thạo bất kỳ chủ đề nào với flashcard thông
          minh.
        </p>

        {error && <div className="register-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Tên Người Dùng</label>
            <div className="input-wrapper">
              <User size={18} />
              <input
                type="text"
                placeholder="Chọn một tên người dùng duy nhất"
                value={form.username}
                onChange={(e) => update("username", e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <div className="input-wrapper">
              <Mail size={18} />
              <input
                type="email"
                placeholder="email@example.com"
                value={form.email}
                onChange={(e) => update("email", e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Mật Khẩu</label>
            <div className="input-wrapper">
              <Lock size={18} />
              <input
                type="password"
                placeholder="Tạo một mật khẩu mạnh"
                value={form.password}
                onChange={(e) => update("password", e.target.value)}
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Xác Nhận Mật Khẩu</label>
            <div className="input-wrapper">
              <ShieldCheck size={18} />
              <input
                type="password"
                placeholder="Nhập lại mật khẩu"
                value={form.confirmPassword}
                onChange={(e) => update("confirmPassword", e.target.value)}
                required
              />
            </div>
          </div>
          <button type="submit" className="btn-register" disabled={loading}>
            {loading ? "Đang tạo tài khoản..." : "Đăng Ký Ngay"}{" "}
            {!loading && <ArrowRight size={18} />}
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

        <p className="register-footer-link">
          Đã có tài khoản? <Link to="/login">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}
