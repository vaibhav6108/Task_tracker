import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Tasks() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    api.get('/projects').then((projRes) => {
      setProjects(projRes.data);
      const projectIds = projRes.data.map((p) => p.id);
      if (projectIds.length > 0) {
        Promise.all(
          projectIds.map((pid) => api.get(`/tasks/project/${pid}`))
        ).then((results) => {
          const merged = results.flatMap((r) => r.data);
          merged.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
          setTasks(merged);
          setLoading(false);
        });
      } else {
        setLoading(false);
      }
    }).catch(() => setLoading(false));
  }, []);

  const filtered = filter === 'all' ? tasks : tasks.filter((t) => t.status === filter);

  const projectMap = {};
  projects.forEach((p) => { projectMap[p.id] = p.name; });

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'in_progress', label: 'In Progress' },
    { key: 'completed', label: 'Completed' },
  ];

  return (
    <div>
      <div className="topbar">
        <div className="top-left">
          <h1>Tasks</h1>
        </div>
        <div className="top-right">
          <span style={{ color: '#94a3b8', fontSize: 14 }}>{user?.name}</span>
          <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
        </div>
      </div>

      <div style={{ marginBottom: 25, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {filters.map((f) => (
          <button
            key={f.key}
            className={`btn ${filter === f.key ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setFilter(f.key)}
            style={{ padding: '8px 18px', fontSize: 13 }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading">Loading...</div>
      ) : filtered.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <i className="fa-solid fa-list-check" style={{ fontSize: 48, color: '#64748b', marginBottom: 16 }}></i>
          <p style={{ color: '#64748b' }}>No tasks found</p>
        </div>
      ) : (
        <div className="table-section">
          <div className="table-header">
            <h2>{filter === 'all' ? 'All Tasks' : `${filter.replace('_', ' ')} Tasks`}</h2>
            <span style={{ color: '#64748b', fontSize: 14 }}>{filtered.length} tasks</span>
          </div>
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Project</th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((task) => (
                <tr key={task.id}>
                  <td style={{ fontWeight: 500 }}>{task.title}</td>
                  <td>
                    <Link to={`/projects/${task.project_id}`} className="link">
                      {task.project_name || projectMap[task.project_id] || 'Unknown'}
                    </Link>
                  </td>
                  <td style={{ color: '#94a3b8' }}>
                    {task.assigned_to_name || <em style={{ color: '#64748b' }}>Unassigned</em>}
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
        </div>
      )}
    </div>
  );
}
