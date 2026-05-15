import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const FILTERS = [
  { key: 'all', label: 'All Tasks' },
  { key: 'completed', label: 'Completed' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'pending', label: 'Pending' },
  { key: 'overdue', label: 'Overdue' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/dashboard/stats').then((res) => {
      setStats(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!stats) return <div className="loading">Failed to load dashboard</div>;

  const totalTasks =
    parseInt(stats.tasks.pending) +
    parseInt(stats.tasks.in_progress) +
    parseInt(stats.tasks.completed);

  const getFilteredTasks = () => {
    if (activeFilter === 'all') return stats.recentTasks;
    if (activeFilter === 'overdue') return stats.overdue;
    return stats.recentTasks.filter((t) => t.status === activeFilter);
  };

  const filteredTasks = getFilteredTasks();
  const searchedTasks = filteredTasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase())
  );

  const makeConicGradient = () => {
    if (totalTasks === 0) return 'conic-gradient(#1e293b 0deg 360deg)';
    const pendingDeg = (parseInt(stats.tasks.pending) / totalTasks) * 360;
    const inProgressDeg = (parseInt(stats.tasks.in_progress) / totalTasks) * 360;
    const completedDeg = (parseInt(stats.tasks.completed) / totalTasks) * 360;
    return `conic-gradient(
      #fbbf24 0deg ${pendingDeg}deg,
      #60a5fa ${pendingDeg}deg ${pendingDeg + inProgressDeg}deg,
      #34d399 ${pendingDeg + inProgressDeg}deg ${pendingDeg + inProgressDeg + completedDeg}deg,
      #1e293b ${pendingDeg + inProgressDeg + completedDeg}deg 360deg
    )`;
  };

  return (
    <div>
      <div className="topbar">
        <div className="top-left">
          <h1>Dashboard</h1>
          <div className="search-box">
            <i className="fa-solid fa-search"></i>
            <input type="text" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="top-right">
          <span style={{ color: '#94a3b8', fontSize: 14 }}>
            {user?.name}
          </span>
          <div className="avatar">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card" onClick={() => navigate('/tasks')}>
          <div className="stat-left">
            <div className="icon-box">
              <i className="fa-solid fa-list"></i>
            </div>
            <div>
              <h3>Total Tasks</h3>
              <p>{totalTasks}</p>
            </div>
          </div>
          <i className="fa-solid fa-chevron-right" style={{ color: '#64748b' }}></i>
        </div>

        <div className="stat-card" onClick={() => navigate('/tasks?status=completed')}>
          <div className="stat-left">
            <div className="icon-box" style={{ color: '#34d399' }}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div>
              <h3>Completed</h3>
              <p>{stats.tasks.completed}</p>
            </div>
          </div>
          <i className="fa-solid fa-chevron-right" style={{ color: '#64748b' }}></i>
        </div>

        <div className="stat-card" onClick={() => navigate('/tasks?status=in_progress')}>
          <div className="stat-left">
            <div className="icon-box" style={{ color: '#fbbf24' }}>
              <i className="fa-solid fa-bars-progress"></i>
            </div>
            <div>
              <h3>In Progress</h3>
              <p>{stats.tasks.in_progress}</p>
            </div>
          </div>
          <i className="fa-solid fa-chevron-right" style={{ color: '#64748b' }}></i>
        </div>

        <div className="stat-card" onClick={() => navigate('/tasks?status=overdue')}>
          <div className="stat-left">
            <div className="icon-box" style={{ color: '#f87171' }}>
              <i className="fa-solid fa-clock"></i>
            </div>
            <div>
              <h3>Overdue</h3>
              <p>{stats.overdue.length}</p>
            </div>
          </div>
          <i className="fa-solid fa-chevron-right" style={{ color: '#64748b' }}></i>
        </div>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <div className="chart-title">Tasks by status</div>
          {totalTasks > 0 ? (
            <>
              <div className="pie-chart" style={{ background: makeConicGradient() }}>
                <div className="pie-chart-center">
                  {totalTasks}
                </div>
              </div>
              <div className="chart-legend">
                <div className="chart-legend-item">
                  <span className="chart-legend-dot" style={{ background: '#fbbf24' }}></span>
                  Pending ({stats.tasks.pending})
                </div>
                <div className="chart-legend-item">
                  <span className="chart-legend-dot" style={{ background: '#60a5fa' }}></span>
                  In Progress ({stats.tasks.in_progress})
                </div>
                <div className="chart-legend-item">
                  <span className="chart-legend-dot" style={{ background: '#34d399' }}></span>
                  Completed ({stats.tasks.completed})
                </div>
              </div>
            </>
          ) : (
            <p style={{ color: '#64748b', textAlign: 'center', padding: 40 }}>No tasks yet</p>
          )}
        </div>

        <div className="chart-card">
          <div className="chart-title">Projects overview</div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: 'calc(100% - 40px)' }}>
            <div style={{
              width: 180,
              height: 180,
              borderRadius: '50%',
              border: '25px solid #1d9bf0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 42,
              fontWeight: 700,
            }}>
              {stats.totalProjects}
            </div>
            <p style={{ color: '#94a3b8', marginTop: 16, fontSize: 14 }}>Total Projects</p>
          </div>
        </div>
      </div>

      <div className="table-section">
        <div className="table-header">
          <h2>Tasks</h2>
          <div style={{ display: 'flex', gap: 6 }}>
            {FILTERS.map((f) => (
              <button
                key={f.key}
                className={`btn ${activeFilter === f.key ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => setActiveFilter(f.key)}
                style={{ padding: '6px 14px', fontSize: 12 }}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {searchedTasks.length === 0 ? (
          <p style={{ color: '#64748b', padding: 20, textAlign: 'center' }}>
            {search ? 'No tasks match your search.' : activeFilter === 'overdue' ? 'No overdue tasks!' : 'No tasks found.'}
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {searchedTasks.map((task) => (
                <tr key={task.id}>
                  <td style={{ fontWeight: 500 }}>{task.title}</td>
                  <td>{task.project_name}</td>
                  <td style={{ color: '#94a3b8' }}>
                    {task.assigned_to_name || <em>Unassigned</em>}
                  </td>
                  <td>
                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                  </td>
                  <td style={{ fontSize: 14 }}>
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                  </td>
                  <td>
                    <span className={`badge badge-${task.status}`}>
                      {task.status.replace('_', ' ')}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
