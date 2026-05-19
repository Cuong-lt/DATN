import { useState, useRef, useEffect } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Home,
  FolderOpen,
  Plus,
  User,
  LogOut,
  Menu,
  Search,
  Layers,
  FolderPlus,
  Globe,
  Trophy,
  Settings,
  Moon,
  Sun,
  Shield,
  BarChart2,
} from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import {
  logout,
  getUsername,
  getEmail,
  isAdmin,
} from "../services/authService";
import "./MainLayout.css";

const sidebarLinks = [
  { to: "/home", icon: Home, label: "Trang chủ", end: true },
  { to: "/library", icon: FolderOpen, label: "Thư viện của bạn" },
  { to: "/explore", icon: Globe, label: "Khám phá" },
  { to: "/statistics", icon: BarChart2, label: "Thống kê cá nhân" },
];

export default function MainLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCreateMenu, setShowCreateMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const username = getUsername();
  const email = getEmail();

  const isFullscreenRoute = [
    "/quiz",
    "/quiz-results",
    "/fill-blank",
    "/settings",
  ].includes(location.pathname);

  const createMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        createMenuRef.current &&
        !createMenuRef.current.contains(e.target as Node)
      ) {
        setShowCreateMenu(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setShowUserMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="main-layout">
      {/* Top Header */}
      <header className="main-header">
        <div className="header-left">
          <button
            className="sidebar-toggle-btn"
            onClick={() => setCollapsed(!collapsed)}
          >
            <Menu size={24} />
          </button>
          <span className="header-brand" onClick={() => navigate("/home")}>
            Flashy
          </span>
        </div>

        <form className="header-search" onSubmit={handleSearch}>
          <Search size={18} className="header-search-icon" />
          <input
            type="text"
            placeholder="Tìm kiếm bộ thẻ ..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="header-right">
          {/* Create button with dropdown */}
          <div className="header-create-wrapper" ref={createMenuRef}>
            <button
              className="header-create-btn"
              onClick={() => setShowCreateMenu(!showCreateMenu)}
              title="Tạo"
            >
              <Plus size={20} />
            </button>
            {showCreateMenu && (
              <div className="header-create-dropdown">
                <button
                  onClick={() => {
                    setShowCreateMenu(false);
                    navigate("/create-set");
                  }}
                >
                  <Layers size={18} />
                  <div>
                    <span className="create-option-title">Bộ Học Tập</span>
                    <span className="create-option-desc">
                      Tạo flashcard để học tập
                    </span>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setShowCreateMenu(false);
                    navigate("/create-folder");
                  }}
                >
                  <FolderPlus size={18} />
                  <div>
                    <span className="create-option-title">Thư Mục</span>
                    <span className="create-option-desc">
                      Tổ chức các bộ học tập của bạn
                    </span>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* User avatar with dropdown */}
          <div className="header-user-wrapper" ref={userMenuRef}>
            <button
              className="header-avatar-btn"
              onClick={() => setShowUserMenu(!showUserMenu)}
              title={username || "Người Dùng"}
            >
              {username ? username.charAt(0).toUpperCase() : <User size={16} />}
            </button>
            {showUserMenu && (
              <div className="header-user-dropdown">
                {/* Profile section */}
                <div className="user-menu-profile">
                  <div className="user-menu-avatar">
                    {username ? (
                      username.charAt(0).toUpperCase()
                    ) : (
                      <User size={20} />
                    )}
                  </div>
                  <div className="user-menu-info">
                    <span className="user-menu-name">
                      {username || "Người Dùng"}
                    </span>
                    {email && <span className="user-menu-email">{email}</span>}
                  </div>
                </div>

                {/* Menu items */}
                <div className="user-menu-section">
                  {isAdmin() && (
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        navigate("/admin");
                      }}
                    >
                      <Shield size={18} /> Quản Lý Người Dùng
                    </button>
                  )}
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate("/achievements");
                    }}
                  >
                    <Trophy size={18} /> Thành Tựu
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate("/settings");
                    }}
                  >
                    <Settings size={18} /> Cài Đặt
                  </button>
                  <button onClick={toggleTheme}>
                    {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                    {theme === "dark" ? "Sáng" : "Tối"}
                  </button>
                </div>

                <div className="user-menu-divider" />

                <div className="user-menu-section">
                  <button className="user-menu-logout" onClick={handleLogout}>
                    <LogOut size={18} /> Đăng Xuất
                  </button>
                </div>

                <div className="user-menu-divider" />

                <div className="user-menu-section user-menu-footer">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                    }}
                  >
                    Quyền Riêng Tư
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                    }}
                  >
                    Trợ Giúp & Feedback
                  </button>
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                    }}
                  >
                    Nâng Cấp
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Left Sidebar */}
      {!isFullscreenRoute && (
        <aside className={`main-sidebar ${collapsed ? "collapsed" : ""}`}>
          <nav className="sidebar-links">
            {sidebarLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) =>
                  `sidebar-nav-link ${isActive ? "active" : ""}`
                }
              >
                <link.icon size={20} />
                {!collapsed && <span>{link.label}</span>}
              </NavLink>
            ))}
          </nav>
        </aside>
      )}

      <main
        className={`main-page-content ${isFullscreenRoute ? "no-sidebar" : collapsed ? "sidebar-collapsed" : ""}`}
      >
        <Outlet />
      </main>
    </div>
  );
}
