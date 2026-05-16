import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const navItems = [
  { path: '/', icon: 'fa-solid fa-house', label: 'Home' },
  { path: '/projects', icon: 'fa-solid fa-diagram-project', label: 'Projects' },
  { path: '/tasks', icon: 'fa-solid fa-list-check', label: 'Tasks' },
  { path: '/calendar', icon: 'fa-solid fa-calendar-days', label: 'Calendar' },
  { path: '/overdue-students', icon: 'fa-solid fa-clock', label: 'Overdue' },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => (location.pathname === path ? 'active' : '');

  return (
    <div className="sidebar">
      <div>
        <div className="logo">
          <span>✦</span> Task
        </div>

        <div className="menu">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`menu-item ${isActive(item.path)}`}
            >
              <i className={item.icon}></i>
              <span>{item.label}</span>
            </Link>
          ))}

          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`menu-item ${isActive('/admin')}`}
            >
              <i className="fa-solid fa-shield-halved"></i>
              <span>Admin</span>
            </Link>
          )}
        </div>
      </div>

      <div>
        <button
          className="menu-item"
          onClick={toggleTheme}
          style={{ width: '100%' }}
        >
          <i className={`fa-solid ${theme === 'dark' ? 'fa-sun' : 'fa-moon'}`}></i>
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>

        <button
          className="menu-item"
          onClick={() => { logout(); navigate('/login'); }}
          style={{ width: '100%' }}
        >
          <i className="fa-solid fa-arrow-right-from-bracket"></i>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
