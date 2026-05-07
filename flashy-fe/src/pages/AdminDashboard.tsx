import { useEffect, useState } from 'react';
import { Users, BookOpen, Layers, Brain, FolderOpen, UserPlus, FilePlus, ClipboardList } from 'lucide-react';
import { getDashboardStats, type AdminDashboardStats } from '../services/adminService';
import { getUsername } from '../services/authService';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const username = getUsername();

  useEffect(() => {
    getDashboardStats()
      .then((res) => setStats(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="admin-dashboard-loading">Đang tải dữ liệu...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="admin-dashboard">
        <div className="admin-dashboard-error">Không thể tải dữ liệu thống kê.</div>
      </div>
    );
  }

  const overviewCards = [
    { title: 'Tổng người dùng', value: stats.totalUsers, icon: Users, color: '#3b82f6' },
    { title: 'Tổng bộ thẻ', value: stats.totalSets, icon: BookOpen, color: '#10b981' },
    { title: 'Tổng flashcard', value: stats.totalFlashcards, icon: Layers, color: '#8b5cf6' },
    { title: 'Tổng bài quiz', value: stats.totalQuizzes, icon: Brain, color: '#f59e0b' },
  ];

  const monthlyCards = [
    { title: 'Người dùng mới', value: stats.newUsersThisMonth, icon: UserPlus, color: '#3b82f6' },
    { title: 'Bộ thẻ mới', value: stats.newSetsThisMonth, icon: FilePlus, color: '#10b981' },
    { title: 'Quiz mới', value: stats.newQuizzesThisMonth, icon: ClipboardList, color: '#8b5cf6' },
    { title: 'Tổng thư mục', value: stats.totalFolders, icon: FolderOpen, color: '#f59e0b' },
  ];

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <div>
          <h1 className="admin-dashboard-title">Dashboard</h1>
          <p className="admin-dashboard-subtitle">
            Xin chào, {username}! Đây là tổng quan về hệ thống Flashy.
          </p>
        </div>
      </div>

      <h2 className="admin-section-title">Tổng quan hệ thống</h2>
      <div className="admin-stats-grid">
        {overviewCards.map((card) => (
          <div className="admin-stat-card" key={card.title}>
            <div className="admin-stat-card-header">
              <div>
                <p className="admin-stat-card-label">{card.title}</p>
                <h3 className="admin-stat-card-value">{card.value.toLocaleString()}</h3>
              </div>
              <div className="admin-stat-card-icon" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
                <card.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <h2 className="admin-section-title">Tháng này</h2>
      <div className="admin-stats-grid">
        {monthlyCards.map((card) => (
          <div className="admin-stat-card" key={card.title}>
            <div className="admin-stat-card-header">
              <div>
                <p className="admin-stat-card-label">{card.title}</p>
                <h3 className="admin-stat-card-value">{card.value.toLocaleString()}</h3>
              </div>
              <div className="admin-stat-card-icon" style={{ backgroundColor: `${card.color}15`, color: card.color }}>
                <card.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
