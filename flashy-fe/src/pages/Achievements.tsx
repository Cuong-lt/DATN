import { useState, useEffect } from "react";
import {
  Trophy,
  Zap,
  BookOpen,
  Target,
  Share2,
  Moon,
  Brain,
  Flame,
  Award,
  TrendingUp,
} from "lucide-react";
import { getMyStats, type UserStatsResponse } from "../services/userService";

import "./Achievements.css";

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  check: (s: UserStatsResponse) => boolean;
}

interface ProgressAchievement {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  current: (s: UserStatsResponse) => number;
  goal: number;
}

const achievements: Achievement[] = [
  {
    id: "speed",
    title: "Siêu tốc độ",
    description: "Hoàn thành 10 bài kiểm tra",
    icon: <Zap size={24} />,
    color: "#f59e0b",
    check: (s) => s.totalQuizzes >= 10,
  },
  {
    id: "bookworm",
    title: "Nhà tri thức",
    description: "Học trong 7 ngày liên tiếp",
    icon: <BookOpen size={24} />,
    color: "#3b82f6",
    check: (s) => s.longestStreak >= 7,
  },
  {
    id: "perfect",
    title: "Kẻ hoàn hảo",
    description: "Đạt điểm tuyệt đối trong 5 bài kiểm tra",
    icon: <Target size={24} />,
    color: "#10b981",
    check: (s) => s.perfectQuizzes >= 5,
  },
  {
    id: "creator",
    title: "Nhà sáng tạo",
    description: "Tạo 10 bộ tài liệu học tập",
    icon: <Share2 size={24} />,
    color: "#8b5cf6",
    check: (s) => s.totalSets >= 10,
  },
  {
    id: "collector",
    title: "Người sưu tập",
    description: "Tạo 100 flashcards",
    icon: <Award size={24} />,
    color: "#ec4899",
    check: (s) => s.totalCards >= 100,
  },
  {
    id: "quizmaster",
    title: "Học bá",
    description: "Hoàn thành 50 bài kiểm tra",
    icon: <Brain size={24} />,
    color: "#06b6d4",
    check: (s) => s.totalQuizzes >= 50,
  },
];

const progressAchievements: ProgressAchievement[] = [
  {
    id: "vocab",
    title: "Người sáng lập",
    description: "Tạo 1000 thẻ",
    icon: <BookOpen size={20} />,
    color: "#3b82f6",
    current: (s) => s.totalCards,
    goal: 1000,
  },
  {
    id: "streak",
    title: "Kỷ lục gia",
    description: "Học trong 10 ngày liên tiếp",
    icon: <Moon size={20} />,
    color: "#f59e0b",
    current: (s) => s.longestStreak,
    goal: 10,
  },
  {
    id: "memory",
    title: "Siêu trí nhớ",
    description: "Hoàn thành 100 bài kiểm tra",
    icon: <Brain size={20} />,
    color: "#8b5cf6",
    current: (s) => s.totalQuizzes,
    goal: 100,
  },
];

export default function Achievements() {
  const [stats, setStats] = useState<UserStatsResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyStats()
      .then((res) => setStats(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="achievements-page">
        <div className="achievements-loading">Loading...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="achievements-page">
        <div className="achievements-loading">Failed to load stats.</div>
      </div>
    );
  }

  const earned = achievements.filter((a) => a.check(stats));
  const xp = stats.totalCorrectAnswers * 10 + stats.totalQuizzes * 50;
  const level = Math.floor(xp / 500) + 1;
  const xpInLevel = xp % 500;
  const accuracy =
    stats.totalQuestions > 0
      ? Math.round((stats.totalCorrectAnswers / stats.totalQuestions) * 100)
      : 0;

  return (
    <div className="achievements-page">
      <div className="achievements-content">
        {/* Header with level and streak */}
        <div className="achievements-hero">
          <div className="achievements-hero-left">
            <div className="level-badge">
              <svg viewBox="0 0 80 80" className="level-ring">
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke="var(--border-color)"
                  strokeWidth="5"
                />
                <circle
                  cx="40"
                  cy="40"
                  r="34"
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth="5"
                  strokeDasharray={`${(xpInLevel / 500) * 213.6} 213.6`}
                  strokeLinecap="round"
                  transform="rotate(-90 40 40)"
                />
              </svg>
              <div className="level-number">
                <span className="level-label">LEVEL</span>
                <span className="level-value">{level}</span>
              </div>
            </div>
            <div className="achievements-hero-info">
              <h1>Thành tựu của bạn</h1>
              <p className="hero-xp">
                {xp.toLocaleString()} XP &bull; {500 - xpInLevel} XP tới cấp độ{" "}
                {level + 1}
              </p>
            </div>
          </div>
          <div className="streak-badge">
            <Flame size={20} />
            <div>
              <span className="streak-label">Chuỗi học</span>
              <span className="streak-value">{stats.currentStreak} Ngày</span>
            </div>
          </div>
        </div>

        {/* Earned Achievements */}
        <section className="achievements-section">
          <h2>
            <Trophy size={18} /> Đã đạt được ({earned.length})
          </h2>
          <div className="achievements-grid">
            {achievements.map((a) => {
              const isEarned = a.check(stats);
              return (
                <div
                  key={a.id}
                  className={`achievement-card ${isEarned ? "earned" : "locked"}`}
                >
                  <div
                    className="achievement-icon"
                    style={{ background: isEarned ? a.color : undefined }}
                  >
                    {a.icon}
                  </div>
                  <h4>{a.title}</h4>
                  <p>{a.description}</p>
                </div>
              );
            })}
          </div>
        </section>

        {/* In Progress */}
        <section className="achievements-section">
          <h2>
            <TrendingUp size={18} /> Tiến trình
          </h2>
          <div className="progress-list">
            {progressAchievements.map((a) => {
              const current = Math.min(a.current(stats), a.goal);
              const pct = Math.round((current / a.goal) * 100);
              return (
                <div key={a.id} className="progress-card">
                  <div
                    className="progress-card-icon"
                    style={{ background: a.color }}
                  >
                    {a.icon}
                  </div>
                  <div className="progress-card-info">
                    <div className="progress-card-header">
                      <strong>{a.title}</strong>
                      <span>{a.description}</span>
                    </div>
                    <div className="progress-bar-wrapper">
                      <div className="progress-bar-bg">
                        <div
                          className="progress-bar-fill"
                          style={{ width: `${pct}%`, background: a.color }}
                        />
                      </div>
                      <span className="progress-text">
                        {current}/{a.goal}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Personal Records */}
        <section className="achievements-section">
          <h2>
            <Award size={18} /> Thành tích cá nhân
          </h2>
          <div className="records-grid">
            <div className="record-card">
              <div className="record-icon" style={{ color: "#f59e0b" }}>
                <Zap size={28} />
              </div>
              <span className="record-label">BÀI KIỂM TRA ĐÃ LÀM</span>
              <span className="record-value">{stats.totalQuizzes}</span>
              <span className="record-sub">
                Tổng số bài kiểm tra đã hoàn thành
              </span>
            </div>
            <div className="record-card">
              <div className="record-icon" style={{ color: "#10b981" }}>
                <Target size={28} />
              </div>
              <span className="record-label">Ngắm bắn chuẩn</span>
              <span className="record-value">{accuracy}%</span>
              <span className="record-sub">Tỷ lệ đúng trung bình</span>
            </div>
            <div className="record-card">
              <div className="record-icon" style={{ color: "#3b82f6" }}>
                <Flame size={28} />
              </div>
              <span className="record-label">Chuỗi học dài nhất</span>
              <span className="record-value">{stats.longestStreak} Ngày</span>
              <span className="record-sub">Ngày học liên tiếp</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
