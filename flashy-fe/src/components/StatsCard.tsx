import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import './StatsCard.css';

interface StatsCardProps {
  title: string;
  value: string;
  change: number;
  icon: LucideIcon;
  color: string;
}

export default function StatsCard({ title, value, change, icon: Icon, color }: StatsCardProps) {
  const isPositive = change >= 0;

  return (
    <div className="stats-card">
      <div className="stats-card-header">
        <div>
          <p className="stats-card-title">{title}</p>
          <h3 className="stats-card-value">{value}</h3>
        </div>
        <div className="stats-card-icon" style={{ backgroundColor: `${color}15`, color }}>
          <Icon size={24} />
        </div>
      </div>
      <div className={`stats-card-change ${isPositive ? 'positive' : 'negative'}`}>
        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        <span>{Math.abs(change)}% so with last month</span>
      </div>
    </div>
  );
}
