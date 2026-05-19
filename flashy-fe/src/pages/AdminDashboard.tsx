import { useEffect, useState } from 'react';
import {
  Users, BookOpen, Layers, Brain, FolderOpen, UserPlus, FilePlus, ClipboardList, TrendingUp,
} from 'lucide-react';
import {
  AreaChart, Area, BarChart, Bar,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import {
  getDashboardStats, getAdminTrends,
  type AdminDashboardStats, type AdminTrends,
} from '../services/adminService';
import { getUsername } from '../services/authService';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [trends, setTrends] = useState<AdminTrends | null>(null);
  const [loading, setLoading] = useState(true);
  const username = getUsername();

  useEffect(() => {
    Promise.all([getDashboardStats(), getAdminTrends()])
      .then(([statsRes, trendsRes]) => {
        setStats(statsRes.data);
        setTrends(trendsRes.data);
      })
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

  const tooltipStyle = {
    contentStyle: {
      background: 'var(--bg-card)',
      border: '1px solid var(--border-color)',
      borderRadius: 8,
      fontSize: 12,
    },
  };

  const axisProps = {
    tick: { fontSize: 11, fill: 'var(--text-muted)' },
    tickLine: false,
    axisLine: false,
  };

  // Merge trends data vào 1 array cho combined chart
  const combinedTrend = trends?.userGrowth.map((u, i) => ({
    month: u.month,
    'Người dùng': u.count,
    'Bộ thẻ': trends.setGrowth[i]?.count ?? 0,
    'Quiz': trends.quizGrowth[i]?.count ?? 0,
  })) ?? [];

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

      {/* Overview stats */}
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

      {/* Monthly stats */}
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

      {/* Trend charts */}
      {trends && (
        <>
          <div className="admin-trend-header">
            <TrendingUp size={18} />
            <h2 className="admin-section-title">Xu hướng 6 tháng gần nhất</h2>
          </div>

          <div className="admin-charts-grid">
            {/* User growth */}
            <div className="admin-chart-card">
              <h3 className="admin-chart-title">
                <span className="chart-dot" style={{ background: '#3b82f6' }} />
                Người dùng mới
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trends.userGrowth}>
                  <defs>
                    <linearGradient id="gradUser" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="month" {...axisProps} />
                  <YAxis {...axisProps} allowDecimals={false} width={28} />
                  <Tooltip {...tooltipStyle} formatter={(v) => [v, 'Người dùng mới']} />
                  <Area type="monotone" dataKey="count" name="Người dùng" stroke="#3b82f6" strokeWidth={2.5}
                    fill="url(#gradUser)" dot={{ r: 4, fill: '#3b82f6' }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Set growth */}
            <div className="admin-chart-card">
              <h3 className="admin-chart-title">
                <span className="chart-dot" style={{ background: '#10b981' }} />
                Bộ thẻ mới
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={trends.setGrowth}>
                  <defs>
                    <linearGradient id="gradSet" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="month" {...axisProps} />
                  <YAxis {...axisProps} allowDecimals={false} width={28} />
                  <Tooltip {...tooltipStyle} formatter={(v) => [v, 'Bộ thẻ mới']} />
                  <Area type="monotone" dataKey="count" name="Bộ thẻ" stroke="#10b981" strokeWidth={2.5}
                    fill="url(#gradSet)" dot={{ r: 4, fill: '#10b981' }} activeDot={{ r: 6 }} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Quiz activity */}
            <div className="admin-chart-card">
              <h3 className="admin-chart-title">
                <span className="chart-dot" style={{ background: '#f59e0b' }} />
                Hoạt động Quiz
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={trends.quizGrowth} barSize={28}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="month" {...axisProps} />
                  <YAxis {...axisProps} allowDecimals={false} width={28} />
                  <Tooltip {...tooltipStyle} formatter={(v) => [v, 'Quiz mới']} />
                  <Bar dataKey="count" name="Quiz" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Combined chart */}
            <div className="admin-chart-card admin-chart-wide">
              <h3 className="admin-chart-title">Tổng hợp tăng trưởng</h3>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={combinedTrend}>
                  <defs>
                    <linearGradient id="gradU2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradS2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="gradQ2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-color)" vertical={false} />
                  <XAxis dataKey="month" {...axisProps} />
                  <YAxis {...axisProps} allowDecimals={false} width={28} />
                  <Tooltip {...tooltipStyle} />
                  <Legend wrapperStyle={{ fontSize: 12, paddingTop: 8 }} />
                  <Area type="monotone" dataKey="Người dùng" stroke="#3b82f6" strokeWidth={2}
                    fill="url(#gradU2)" dot={false} />
                  <Area type="monotone" dataKey="Bộ thẻ" stroke="#10b981" strokeWidth={2}
                    fill="url(#gradS2)" dot={false} />
                  <Area type="monotone" dataKey="Quiz" stroke="#f59e0b" strokeWidth={2}
                    fill="url(#gradQ2)" dot={false} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
