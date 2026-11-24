import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// 로그인한 사용자만 하위 페이지에 접근할 수 있게 합니다.
// 로그인하지 않았으면 로그인 화면으로 보내고, 로그인 후 원래 주소로 돌아오도록 경로를 넘깁니다.
function ProtectedRoute() {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <p className="muted">로그인 상태 확인 중…</p>;
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  return <Outlet />;
}

export default ProtectedRoute;
