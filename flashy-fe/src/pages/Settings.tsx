import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  User,
  CreditCard,
  Shield,
  Bell,
  Check,
  AlertTriangle,
  X,
} from "lucide-react";
import {
  getMyProfile,
  updateEmail,
  changePassword,
  deleteAccount,
  type UserResponse,
} from "../services/userService";
import { logout, saveEmail } from "../services/authService";
import "./Settings.css";

const tabs = [
  { key: "account", label: "Tài khoản", icon: User },
  { key: "subscription", label: "Đăng ký", icon: CreditCard },
  { key: "security", label: "Bảo mật", icon: Shield },
  { key: "notifications", label: "Thông báo", icon: Bell },
];

export default function Settings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("account");
  const [profile, setProfile] = useState<UserResponse | null>(null);
  const [loading, setLoading] = useState(true);

  // Email update state
  const [emailValue, setEmailValue] = useState("");
  const [emailMsg, setEmailMsg] = useState("");
  const [emailError, setEmailError] = useState("");
  const [emailLoading, setEmailLoading] = useState(false);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pwdMsg, setPwdMsg] = useState("");
  const [pwdError, setPwdError] = useState("");
  const [pwdLoading, setPwdLoading] = useState(false);

  // Delete account state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  useEffect(() => {
    getMyProfile()
      .then((res) => {
        setProfile(res.data);
        setEmailValue(res.data.email);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateEmail = async () => {
    setEmailMsg("");
    setEmailError("");
    if (!emailValue.trim()) {
      setEmailError("Email is required");
      return;
    }
    setEmailLoading(true);
    try {
      const res = await updateEmail(emailValue.trim());
      setProfile(res.data);
      setEmailValue(res.data.email);
      saveEmail(res.data.email);
      setEmailMsg("Email updated successfully");
    } catch (err: any) {
      setEmailError(err?.message || "Failed to update email");
    } finally {
      setEmailLoading(false);
    }
  };

  const handleChangePassword = async () => {
    setPwdMsg("");
    setPwdError("");
    if (!currentPassword) {
      setPwdError("Current password is required");
      return;
    }
    if (newPassword.length < 6) {
      setPwdError("New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwdError("Passwords do not match");
      return;
    }
    setPwdLoading(true);
    try {
      await changePassword(currentPassword, newPassword);
      setPwdMsg("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setPwdError(err?.message || "Failed to change password");
    } finally {
      setPwdLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    setDeleteLoading(true);
    try {
      await deleteAccount();
      await logout();
      navigate("/login");
    } catch {
      setDeleteLoading(false);
      setShowDeleteConfirm(false);
    }
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-loading">Loading...</div>
      </div>
    );
  }

  return (
    <div className="settings-page">
      <button
        className="settings-close-btn"
        onClick={() => navigate("/home")}
        title="Close"
      >
        <X size={24} />
      </button>
      <div className="settings-layout">
        {/* Left sidebar tabs */}
        <aside className="settings-sidebar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              className={`settings-tab ${activeTab === tab.key ? "active" : ""}`}
              onClick={() => setActiveTab(tab.key)}
            >
              <tab.icon size={18} />
              <span>{tab.label}</span>
            </button>
          ))}
        </aside>

        {/* Main content */}
        <div className="settings-main">
          <h1>Cài đặt</h1>
          <p className="settings-subtitle">
            Quản lý thông tin tài khoản, đăng ký và bảo mật của bạn tại đây.
          </p>

          {/* Account Tab */}
          {activeTab === "account" && (
            <>
              <section className="settings-section">
                <h2>Thông tin tài khoản</h2>
                <div className="settings-field">
                  <div className="settings-field-label">
                    <strong>Tên người dùng</strong>
                    <span>Đây là tên duy nhất của bạn trên Flashy.</span>
                  </div>
                  <div className="settings-field-input">
                    <input
                      type="text"
                      value={profile?.username || ""}
                      disabled
                    />
                  </div>
                </div>

                <div className="settings-field">
                  <div className="settings-field-label">
                    <strong>Địa chỉ email</strong>
                    <span>
                      Được sử dụng cho thông báo và khôi phục tài khoản.
                    </span>
                  </div>
                  <div className="settings-field-input">
                    <input
                      type="email"
                      value={emailValue}
                      onChange={(e) => {
                        setEmailValue(e.target.value);
                        setEmailMsg("");
                        setEmailError("");
                      }}
                    />
                    <button
                      className="btn-update"
                      onClick={handleUpdateEmail}
                      disabled={emailLoading || emailValue === profile?.email}
                    >
                      {emailLoading ? "Updating..." : "Update"}
                    </button>
                  </div>
                  {emailMsg && (
                    <p className="field-success">
                      <Check size={14} /> {emailMsg}
                    </p>
                  )}
                  {emailError && <p className="field-error">{emailError}</p>}
                </div>

                <div className="settings-field">
                  <div className="settings-field-label">
                    <strong>Thành viên</strong>
                    <span>Ngày bạn tham gia Flashy.</span>
                  </div>
                  <div className="settings-field-input">
                    <input
                      type="text"
                      value={
                        profile?.createdAt
                          ? new Date(profile.createdAt).toLocaleDateString(
                              "en-US",
                              {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              },
                            )
                          : ""
                      }
                      disabled
                    />
                  </div>
                </div>
              </section>

              <section className="settings-section">
                <h2>Đăng ký</h2>
                <div className="subscription-card">
                  <div className="subscription-info">
                    <h3>Flashy Free</h3>
                    <p>
                      Bạn đang sử dụng phiên bản miễn phí của Flashy. Nâng cấp
                      lên Plus để trải nghiệm học tập không quảng cáo và truy
                      cập ngoại tuyến.
                    </p>
                    <ul className="subscription-features">
                      <li>
                        <Check size={14} /> Flashcards không giới hạn
                      </li>
                      <li>
                        <Check size={14} /> Các chế độ học cơ bản
                      </li>
                    </ul>
                  </div>
                  <div className="subscription-action">
                    <button className="btn-upgrade">Nâng cấp gói Plus</button>
                    <span className="upgrade-price">
                      Bắt đầu từ $3.99/tháng
                    </span>
                  </div>
                </div>
              </section>

              <section className="settings-section danger-zone">
                <h2>Nguy hiểm</h2>
                <div className="danger-card">
                  <div className="danger-info">
                    <strong>Xóa tài khoản</strong>
                    <p>
                      Nếu bạn xóa tài khoản, tất cả dữ liệu của bạn sẽ bị mất
                      vĩnh viễn và
                    </p>
                  </div>
                  <button
                    className="btn-delete-account"
                    onClick={() => setShowDeleteConfirm(true)}
                  >
                    Xóa tài khoản
                  </button>
                </div>
              </section>
            </>
          )}

          {/* Security Tab */}
          {activeTab === "security" && (
            <section className="settings-section">
              <h2>Đổi mật khẩu</h2>
              <div className="password-form">
                <div className="settings-field">
                  <div className="settings-field-label">
                    <strong>Mật khẩu hiện tại</strong>
                  </div>
                  <div className="settings-field-input">
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => {
                        setCurrentPassword(e.target.value);
                        setPwdError("");
                        setPwdMsg("");
                      }}
                      placeholder="Nhập mật khẩu hiện tại"
                    />
                  </div>
                </div>
                <div className="settings-field">
                  <div className="settings-field-label">
                    <strong>Mật khẩu mới</strong>
                  </div>
                  <div className="settings-field-input">
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => {
                        setNewPassword(e.target.value);
                        setPwdError("");
                        setPwdMsg("");
                      }}
                      placeholder="Ít nhất 6 ký tự"
                    />
                  </div>
                </div>
                <div className="settings-field">
                  <div className="settings-field-label">
                    <strong>Xác nhận mật khẩu mới</strong>
                  </div>
                  <div className="settings-field-input">
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        setPwdError("");
                        setPwdMsg("");
                      }}
                      placeholder="Xác nhận mật khẩu mới"
                    />
                  </div>
                </div>
                {pwdMsg && (
                  <p className="field-success">
                    <Check size={14} /> {pwdMsg}
                  </p>
                )}
                {pwdError && <p className="field-error">{pwdError}</p>}
                <button
                  className="btn-change-pwd"
                  onClick={handleChangePassword}
                  disabled={pwdLoading}
                >
                  {pwdLoading ? "Đang thay đổi..." : "Thay đổi mật khẩu"}
                </button>
              </div>
            </section>
          )}

          {/* Subscription Tab */}
          {activeTab === "subscription" && (
            <section className="settings-section">
              <div className="subscription-header">
                <h2>Đăng ký</h2>
                <span className="current-plan-badge">GÓI HIỆN TẠI</span>
              </div>
              <div className="subscription-card">
                <div className="subscription-info">
                  <h3>Flashy Free</h3>
                  <p>
                    Bạn đang sử dụng phiên bản miễn phí của Flashy. Nâng cấp lên
                    Plus để trải nghiệm học tập không quảng cáo và truy cập
                    ngoại tuyến.
                  </p>
                  <ul className="subscription-features">
                    <li>
                      <Check size={14} /> Flashcards không giới hạn
                    </li>
                    <li>
                      <Check size={14} /> Chế độ học cơ bản
                    </li>
                  </ul>
                </div>
                <div className="subscription-action">
                  <button className="btn-upgrade">Nâng cấp gói Plus</button>
                  <span className="upgrade-price">Bắt đầu từ $3.99/tháng</span>
                </div>
              </div>
            </section>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <section className="settings-section">
              <h2>Thông báo</h2>
              <p className="settings-coming-soon">
                Tùy chọn thông báo sẽ sớm có mặt.
              </p>
            </section>
          )}
        </div>
      </div>

      {/* Bottom footer */}
      <footer className="settings-footer">
        {profile && (
          <div className="settings-footer-user">
            <div className="settings-sidebar-avatar">
              {profile.username.charAt(0).toUpperCase()}
            </div>
            <div className="settings-sidebar-info">
              <span className="settings-sidebar-name">{profile.username}</span>
              <span className="settings-sidebar-email">{profile.email}</span>
            </div>
          </div>
        )}
        <div className="settings-footer-links">
          <a href="#">Hỗ trợ</a>
          <a href="#">Chính sách bảo mật</a>
          <a href="#">Điều khoản dịch vụ</a>
        </div>
      </footer>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div
          className="modal-overlay"
          onClick={() => !deleteLoading && setShowDeleteConfirm(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-icon">
              <AlertTriangle size={32} />
            </div>
            <h3>Xóa tài khoản của bạn?</h3>
            <p>
              Hành động này là vĩnh viễn và không thể hoàn tác. Tất cả các bộ
              thẻ học, thư mục và tiến độ của bạn sẽ bị mất.
            </p>
            <div className="modal-actions">
              <button
                className="btn-cancel"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={deleteLoading}
              >
                Hủy
              </button>
              <button
                className="btn-confirm-delete"
                onClick={handleDeleteAccount}
                disabled={deleteLoading}
              >
                {deleteLoading ? "Đang xóa..." : "Xóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
