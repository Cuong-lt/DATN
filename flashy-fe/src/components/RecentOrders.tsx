import './RecentOrders.css';

interface Order {
  id: string;
  customer: string;
  product: string;
  amount: string;
  status: 'completed' | 'pending' | 'cancelled' | 'processing';
  date: string;
}

const orders: Order[] = [
  { id: '#ORD-001', customer: 'Nguyen Van A', product: 'MacBook Pro 14"', amount: '$2,499', status: 'completed', date: '2026-03-12' },
  { id: '#ORD-002', customer: 'Tran Thi B', product: 'iPhone 16 Pro', amount: '$1,199', status: 'processing', date: '2026-03-12' },
  { id: '#ORD-003', customer: 'Le Van C', product: 'AirPods Pro 3', amount: '$249', status: 'pending', date: '2026-03-11' },
  { id: '#ORD-004', customer: 'Pham Thi D', product: 'iPad Air M3', amount: '$799', status: 'completed', date: '2026-03-11' },
  { id: '#ORD-005', customer: 'Hoang Van E', product: 'Apple Watch Ultra', amount: '$899', status: 'cancelled', date: '2026-03-10' },
  { id: '#ORD-006', customer: 'Vo Thi F', product: 'Samsung Galaxy S25', amount: '$999', status: 'processing', date: '2026-03-10' },
];

export default function RecentOrders() {
  return (
    <div className="recent-orders">
      <div className="recent-orders-header">
        <h3 className="recent-orders-title">Recent Orders</h3>
        <a href="#" className="view-all-link">View All</a>
      </div>
      <div className="table-wrapper">
        <table className="orders-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id}>
                <td className="order-id">{order.id}</td>
                <td>{order.customer}</td>
                <td>{order.product}</td>
                <td className="order-amount">{order.amount}</td>
                <td>
                  <span className={`status-badge ${order.status}`}>
                    {order.status}
                  </span>
                </td>
                <td className="order-date">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
