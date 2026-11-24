import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { authService } from '../services/authService';

const NAV_ITEMS = [
  { to: '/', label: '대시보드', end: true },
  { to: '/animals', label: '개체 관리' },
];

function Layout() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [logoutError, setLogoutError] = useState('');

  const handleLogout = async () => {
    try {
      setLogoutError('');
      await authService.signOut();
      navigate('/login', { replace: true });
    } catch (error) {
      setLogoutError(error.message);
    }
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="brand">🐄 축산 케어</h1>
        {user && (
          <>
            <nav className="nav">
              {NAV_ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
            <div className="user-menu">
              <span className="muted" title={user.email}>
                {user.displayName || user.email}
              </span>
              <button className="btn btn-small" onClick={handleLogout}>
                로그아웃
              </button>
            </div>
          </>
        )}
      </header>
      {logoutError && <p className="alert alert-danger">{logoutError}</p>}
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;
