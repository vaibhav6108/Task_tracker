import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Admin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        api.get('/dashboard/users'),
        api.get('/dashboard/admin/stats'),
      ]);
      setUsers(usersRes.data);
      setAdminStats(statsRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/dashboard/admin/users/${userId}/role`, { role: newRole });
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Delete user "${userName}"? This cannot be undone.`)) return;
    try {
      await api.delete(`/dashboard/admin/users/${userId}`);
      fetchData();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to delete user');
    }
  };

  if (user?.role !== 'admin') {
    return <div className="loading">Access denied. Admin only.</div>;
  }

  if (loading) return <div className="loading">Loading admin panel...</div>;

  return (
    <div>
      <div className="topbar">
        <div className="top-left">
          <h1>Admin Panel</h1>
          <div className="search-box">
            <i className="fa-solid fa-search"></i>
            <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
        <div className="top-right">
          <span style={{ color: '#94a3b8', fontSize: 14 }}>{user?.name}</span>
          <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
        </div>
      </div>

      {adminStats && (
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-left">
              <div className="icon-box" style={{ color: '#38bdf8' }}>
                <i className="fa-solid fa-users"></i>
              </div>
              <div>
                <h3>Total Users</h3>
                <p>{adminStats.totalUsers}</p>
              </div>
            </div>
          </div>
          <div className="stat-card" onClick={() => navigate('/projects')} style={{ cursor: 'pointer' }}>
            <div className="stat-left">
              <div className="icon-box" style={{ color: '#fbbf24' }}>
                <i className="fa-solid fa-diagram-project"></i>
              </div>
              <div>
                <h3>Total Projects</h3>
                <p>{adminStats.totalProjects}</p>
              </div>
            </div>
            <i className="fa-solid fa-chevron-right" style={{ color: '#64748b' }}></i>
          </div>
          <div className="stat-card" onClick={() => navigate('/tasks')} style={{ cursor: 'pointer' }}>
            <div className="stat-left">
              <div className="icon-box" style={{ color: '#34d399' }}>
                <i className="fa-solid fa-list-check"></i>
              </div>
              <div>
                <h3>Total Tasks</h3>
                <p>{adminStats.totalTasks}</p>
              </div>
            </div>
            <i className="fa-solid fa-chevron-right" style={{ color: '#64748b' }}></i>
          </div>
          <div className="stat-card">
            <div className="stat-left">
              <div className="icon-box" style={{ color: '#f87171' }}>
                <i className="fa-solid fa-shield-halved"></i>
              </div>
              <div>
                <h3>Admins</h3>
                <p>{users.filter((u) => u.role === 'admin').length}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="table-section">
        <div className="table-header">
          <h2>User Management</h2>
          <span style={{ color: '#64748b', fontSize: 14 }}>
            {search ? users.filter((u) => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase())).length : users.length} users
          </span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Projects</th>
              <th>Tasks</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const filteredUsers = users.filter((u) =>
                u.name.toLowerCase().includes(search.toLowerCase()) ||
                u.email.toLowerCase().includes(search.toLowerCase())
              );
              if (filteredUsers.length === 0) {
                return (
                  <tr>
                    <td colSpan={6} style={{ color: '#64748b', textAlign: 'center', padding: 20 }}>
                      {search ? 'No users match your search.' : 'No users found.'}
                    </td>
                  </tr>
                );
              }
              return filteredUsers.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>{u.name}</td>
                  <td style={{ color: '#94a3b8' }}>{u.email}</td>
                  <td>
                    <select
                      className="select-inline"
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.id, e.target.value)}
                      disabled={u.id === user.id}
                    >
                      <option value="member">Member</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td style={{ fontSize: 14 }}>{u.project_count}</td>
                  <td style={{ fontSize: 14 }}>{u.task_count}</td>
                  <td>
                    {u.id !== user.id && (
                      <button
                        className="btn btn-danger"
                        style={{ padding: '6px 14px', fontSize: 12 }}
                        onClick={() => handleDeleteUser(u.id, u.name)}
                      >
                        <i className="fa-solid fa-trash-can" style={{ marginRight: 4 }}></i>
                        Delete
                      </button>
                    )}
                    {u.id === user.id && (
                      <span style={{ color: '#64748b', fontSize: 13 }}>You</span>
                    )}
                  </td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </div>
    </div>
  );
}
