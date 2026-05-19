import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { logout as logoutApi, getUsername } from "../services/authService";
import {
  LayoutDashboard,
  Users,
  Settings,
  Bell,
  Search,
  Menu,
  X,
  ChevronDown,
  LogOut,
  Home,
  BookOpen,
} from "lucide-react";
import "./AdminLayout.css";

const sidebarLinks = [
  { to: "/admin", icon: LayoutDashboard, label: "Dashboard", end: true },
  { to: "/admin/users", icon: Users, label: "Quản lý người dùng" },
  { to: "/admin/sets", icon: BookOpen, label: "Quản lý nội dung" },
  { to: "/admin/notifications", icon: Bell, label: "Gửi thông báo" },
  { to: "/home", icon: Home, label: "Về trang chính" },
];

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const username = getUsername();

  const handleLogout = async () => {
    await logoutApi();
    navigate("/login");
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? "open" : "closed"}`}>
        <div className="sidebar-header">
          {sidebarOpen && <h2 className="sidebar-logo">Flashy Admin</h2>}
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>

        <nav className="sidebar-nav">
          {sidebarLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <link.icon size={20} />
              {sidebarOpen && <span>{link.label}</span>}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <div className="main-wrapper">
        {/* Header */}
        <header className="admin-header">
          <div className="header-search">
            <Search size={18} />
            <input type="text" placeholder="Search..." />
          </div>

          <div className="header-actions">
            <button className="header-btn notification-btn">
              <Bell size={20} />
              <span className="notification-badge">3</span>
            </button>

            <div className="profile-dropdown">
              <button
                className="profile-btn"
                onClick={() => setProfileOpen(!profileOpen)}
              >
                <div className="avatar">{username.charAt(0).toUpperCase()}</div>
                <span className="profile-name">{username}</span>
                <ChevronDown size={16} />
              </button>

              {profileOpen && (
                <div className="dropdown-menu">
                  <a href="#" className="dropdown-item">
                    <Settings size={16} /> Thông tin cá nhân
                  </a>
                  <button onClick={handleLogout} className="dropdown-item">
                    <LogOut size={16} /> Đăng xuất
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="main-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
