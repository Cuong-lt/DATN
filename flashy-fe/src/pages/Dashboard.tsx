import { DollarSign, Users, ShoppingCart, TrendingUp } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import RevenueChart from '../components/RevenueChart';
import OrdersChart from '../components/OrdersChart';
import RecentOrders from '../components/RecentOrders';
import './Dashboard.css';

const statsData = [
  {
    title: 'Total Revenue',
    value: '$54,230',
    change: 12.5,
    icon: DollarSign,
    color: '#3b82f6',
  },
  {
    title: 'Total Users',
    value: '2,340',
    change: 8.2,
    icon: Users,
    color: '#10b981',
  },
  {
    title: 'Total Orders',
    value: '1,456',
    change: -3.1,
    icon: ShoppingCart,
    color: '#8b5cf6',
  },
  {
    title: 'Growth Rate',
    value: '23.5%',
    change: 4.7,
    icon: TrendingUp,
    color: '#f59e0b',
  },
];

export default function Dashboard() {
  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">Dashboard</h1>
          <p className="dashboard-subtitle">Welcome back, Admin! Here's what's happening today.</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-grid">
        {statsData.map((stat) => (
          <StatsCard key={stat.title} {...stat} />
        ))}
      </div>

      {/* Charts */}
      <div className="charts-grid">
        <RevenueChart />
        <OrdersChart />
      </div>

      {/* Recent Orders Table */}
      <RecentOrders />
    </div>
  );
}
