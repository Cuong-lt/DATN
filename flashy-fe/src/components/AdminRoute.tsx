import { Navigate } from 'react-router-dom';
import { isAdmin } from '../services/authService';

export default function AdminRoute({ children }: { children: React.ReactNode }) {
  if (!isAdmin()) {
    return <Navigate to="/home" replace />;
  }
  return <>{children}</>;
}
