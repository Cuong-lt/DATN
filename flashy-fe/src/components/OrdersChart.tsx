import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import './ChartCard.css';

const data = [
  { day: 'Mon', orders: 45 },
  { day: 'Tue', orders: 52 },
  { day: 'Wed', orders: 38 },
  { day: 'Thu', orders: 65 },
  { day: 'Fri', orders: 78 },
  { day: 'Sat', orders: 90 },
  { day: 'Sun', orders: 60 },
];

export default function OrdersChart() {
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <h3 className="chart-card-title">Orders This Week</h3>
        <select className="chart-select">
          <option>This Week</option>
          <option>Last Week</option>
        </select>
      </div>
      <div className="chart-container">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
            <YAxis stroke="#94a3b8" fontSize={12} />
            <Tooltip
              contentStyle={{
                background: '#fff',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
              }}
            />
            <Bar
              dataKey="orders"
              fill="#8b5cf6"
              radius={[6, 6, 0, 0]}
              barSize={36}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
