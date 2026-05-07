import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import {
  TrendingUp,
  Flame,
  Brain,
  Target,
  BookOpen,
  Zap,
  Calendar,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  getMyActivity,
  type UserActivityResponse,
  type DailyActivityPoint,
} from "../services/userService";
import "./Statistics.css";

// Rút gọn ngày cho trục X
function shortDate(dateStr: string): string {
  const d = new Date(dateStr);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

// Tô màu heatmap theo cường độ
function heatColor(count: number): string {
  if (count === 0) return "var(--border-color)";
  if (count === 1) return "#93c5fd";
  if (count <= 3) return "#3b82f6";
  return "#1d4ed8";
}

interface HeatmapProps {
  days: DailyActivityPoint[];
}
function ActivityHeatmap({ days }: HeatmapProps) {
  return (
    <div className="heatmap-grid">
      {days.map((d) => (
        <div
          key={d.date}
          className="heatmap-cell"
          style={{ background: heatColor(d.count) }}
          title={`${d.date}: ${d.count} quiz${d.count !== 1 ? "zes" : ""}`}
        />
      ))}
    </div>
  );
}

export default function Statistics() {
  const [data, setData] = useState<UserActivityResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyActivity()
      .then((res) => setData(res.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="stats-page">
        <div className="stats-loading">Đang tải thống kê...</div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="stats-page">
        <div className="stats-loading">Không thể tải dữ liệu.</div>
      </div>
    );
  }

  // Quiz history hiển thị theo thứ tự thời gian (đảo ngược vì API trả về mới nhất trước)
  const chartData = [...data.recentQuizzes].reverse().map((q, i) => ({
    name: `#${i + 1}`,
    accuracy: q.accuracy,
    setTitle: q.setTitle,
    date: q.date,
  }));

  // Activity bar chart data
  const activityData = data.dailyActivity.map((d) => ({
    name: shortDate(d.date),
    count: d.count,
    date: d.date,
  }));

  const srsLearnedPct =
    data.srsTotal > 0 ? Math.round((data.srsLearned / data.srsTotal) * 100) : 0;
  const srsDuePct =
    data.srsTotal > 0 ? Math.round((data.srsDue / data.srsTotal) * 100) : 0;

  return (
    <div className="stats-page">
      <div className="stats-content">
        <h1 className="stats-title">
          <TrendingUp size={22} /> Thống kê cá nhân
        </h1>

        {/* ── Overview cards ── */}
        <div className="stats-overview">
          <div className="stat-overview-card">
            <div className="stat-ov-icon blue">
              <BookOpen size={20} />
            </div>
            <div className="stat-ov-info">
              <span className="stat-ov-value">
                {data.totalCards.toLocaleString()}
              </span>
              <span className="stat-ov-label">Tổng số thẻ</span>
            </div>
          </div>
          <div className="stat-overview-card">
            <div className="stat-ov-icon orange">
              <Flame size={20} />
            </div>
            <div className="stat-ov-info">
              <span className="stat-ov-value">{data.currentStreak}</span>
              <span className="stat-ov-label">Chuỗi hiện tại (ngày)</span>
            </div>
          </div>
          <div className="stat-overview-card">
            <div className="stat-ov-icon green">
              <Target size={20} />
            </div>
            <div className="stat-ov-info">
              <span className="stat-ov-value">{data.overallAccuracy}%</span>
              <span className="stat-ov-label">Độ chính xác</span>
            </div>
          </div>
          <div className="stat-overview-card">
            <div className="stat-ov-icon purple">
              <Zap size={20} />
            </div>
            <div className="stat-ov-info">
              <span className="stat-ov-value">{data.totalQuizzes}</span>
              <span className="stat-ov-label">Quiz đã làm</span>
            </div>
          </div>
        </div>

        {/* ── Activity heatmap + bar chart ── */}
        <section className="stats-section">
          <h2>
            <Calendar size={17} /> Hoạt động 30 ngày gần nhất
          </h2>
          <div className="stats-card">
            <ActivityHeatmap days={data.dailyActivity} />
            <div className="heatmap-legend">
              <span>Ít</span>
              <div className="heatmap-legend-cells">
                <div style={{ background: "var(--border-color)" }} />
                <div style={{ background: "#93c5fd" }} />
                <div style={{ background: "#3b82f6" }} />
                <div style={{ background: "#1d4ed8" }} />
              </div>
              <span>Nhiều</span>
            </div>

            <div className="activity-bar-chart">
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={activityData} barSize={10}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-color)"
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fill: "var(--text-muted)" }}
                    tickLine={false}
                    axisLine={false}
                    interval={4}
                  />
                  <YAxis hide allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-color)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(val: number) => [`${val} quiz`, "Số lần"]}
                    labelFormatter={(label, payload) =>
                      payload?.[0]?.payload?.date ?? label
                    }
                  />
                  <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </section>

        {/* ── Quiz accuracy trend ── */}
        {chartData.length > 0 && (
          <section className="stats-section">
            <h2>
              <TrendingUp size={17} /> Xu hướng độ chính xác (20 quiz gần nhất)
            </h2>
            <div className="stats-card">
              <ResponsiveContainer width="100%" height={220}>
                <LineChart data={chartData}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--border-color)"
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fontSize: 11, fill: "var(--text-muted)" }}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(v) => `${v}%`}
                  />
                  <Tooltip
                    contentStyle={{
                      background: "var(--bg-card)",
                      border: "1px solid var(--border-color)",
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(val: number) => [`${val}%`, "Độ chính xác"]}
                    labelFormatter={(_, payload) => {
                      const p = payload?.[0]?.payload;
                      return p ? `${p.setTitle} · ${p.date}` : "";
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="accuracy"
                    stroke="#3b82f6"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#3b82f6" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        )}

        {/* ── SRS Overview ── */}
        <section className="stats-section">
          <h2>
            <Brain size={17} /> Tiến độ ôn tập giãn cách
          </h2>
          <div className="stats-card srs-overview-card">
            <div className="srs-ov-numbers">
              <div className="srs-ov-item">
                <CheckCircle2 size={20} className="srs-ov-icon green" />
                <div>
                  <span className="srs-ov-val">{data.srsLearned}</span>
                  <span className="srs-ov-lbl">Đã thuộc</span>
                </div>
              </div>
              <div className="srs-ov-item">
                <Clock size={20} className="srs-ov-icon orange" />
                <div>
                  <span className="srs-ov-val">{data.srsDue}</span>
                  <span className="srs-ov-lbl">Cần ôn</span>
                </div>
              </div>
              <div className="srs-ov-item">
                <Zap size={20} className="srs-ov-icon blue" />
                <div>
                  <span className="srs-ov-val">{data.srsNew}</span>
                  <span className="srs-ov-lbl">Thẻ mới</span>
                </div>
              </div>
              <div className="srs-ov-item">
                <BookOpen size={20} className="srs-ov-icon purple" />
                <div>
                  <span className="srs-ov-val">{data.srsTotal}</span>
                  <span className="srs-ov-lbl">Tổng thẻ</span>
                </div>
              </div>
            </div>

            {data.srsTotal > 0 && (
              <div className="srs-stacked-bar-wrap">
                <div className="srs-stacked-bar">
                  <div
                    className="srs-bar-learned"
                    style={{ width: `${srsLearnedPct}%` }}
                    title={`Đã thuộc: ${srsLearnedPct}%`}
                  />
                  <div
                    className="srs-bar-due"
                    style={{ width: `${srsDuePct}%` }}
                    title={`Cần ôn: ${srsDuePct}%`}
                  />
                </div>
                <div className="srs-bar-labels">
                  <span className="srs-label-learned">
                    <span className="srs-dot green" /> Đã thuộc {srsLearnedPct}%
                  </span>
                  <span className="srs-label-due">
                    <span className="srs-dot orange" /> Cần ôn {srsDuePct}%
                  </span>
                  <span className="srs-label-new">
                    <span className="srs-dot gray" /> Còn lại{" "}
                    {100 - srsLearnedPct - srsDuePct}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ── Streak record ── */}
        <section className="stats-section">
          <h2>
            <Flame size={17} /> Kỷ lục học tập
          </h2>
          <div className="stats-records">
            <div className="record-item">
              <Flame size={28} className="record-icon orange" />
              <span className="record-val">{data.currentStreak}</span>
              <span className="record-lbl">Chuỗi hiện tại (ngày)</span>
            </div>
            <div className="record-item">
              <TrendingUp size={28} className="record-icon blue" />
              <span className="record-val">{data.longestStreak}</span>
              <span className="record-lbl">Chuỗi dài nhất</span>
            </div>
            <div className="record-item">
              <Target size={28} className="record-icon green" />
              <span className="record-val">{data.overallAccuracy}%</span>
              <span className="record-lbl">Độ chính xác trung bình</span>
            </div>
            <div className="record-item">
              <BookOpen size={28} className="record-icon purple" />
              <span className="record-val">{data.totalSets}</span>
              <span className="record-lbl">Bộ thẻ đã tạo</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
