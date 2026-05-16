import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function Projects() {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: '', description: '' });

  const fetchProjects = () => {
    setLoading(true);
    api.get('/projects').then((res) => {
      setProjects(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  };

  useEffect(() => { fetchProjects(); }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    await api.post('/projects', form);
    setShowModal(false);
    setForm({ name: '', description: '' });
    fetchProjects();
  };

  return (
    <div>
      <div className="topbar">
        <div className="top-left">
          <h1>Projects</h1>
        </div>
        <div className="top-right">
          <span style={{ color: '#94a3b8', fontSize: 14 }}>{user?.name}</span>
          <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
        </div>
      </div>

      {user?.role === 'admin' && (
        <div style={{ marginBottom: 25 }}>
          <button className="btn btn-primary" onClick={() => setShowModal(true)}>
            <i className="fa-solid fa-plus"></i> New Project
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading">Loading...</div>
      ) : projects.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <i className="fa-solid fa-folder-open" style={{ fontSize: 48, color: '#64748b', marginBottom: 16 }}></i>
          <p style={{ color: '#64748b', marginBottom: 16 }}>No projects yet</p>
          {user?.role === 'admin' && (
            <button className="btn btn-primary" onClick={() => setShowModal(true)}>
              Create your first project
            </button>
          )}
        </div>
      ) : (
        <div className="grid-auto">
          {projects.map((project) => (
            <Link to={`/projects/${project.id}`} key={project.id}>
              <div className="card card-hover" style={{ cursor: 'pointer', height: '100%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div className="icon-box" style={{ color: '#38bdf8' }}>
                    <i className="fa-solid fa-diagram-project"></i>
                  </div>
                  <i className="fa-solid fa-chevron-right" style={{ color: '#64748b' }}></i>
                </div>
                <h3 style={{ marginBottom: 8, fontSize: 18 }}>{project.name}</h3>
                <p style={{ color: '#64748b', fontSize: 14, marginBottom: 16, lineHeight: 1.5 }}>
                  {project.description || 'No description'}
                </p>
                {parseInt(project.task_count) > 0 && (
                  <div style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#94a3b8', marginBottom: 6 }}>
                      <span>Progress</span>
                      <span>{Math.round((parseInt(project.completed_task_count) / parseInt(project.task_count)) * 100)}%</span>
                    </div>
                    <div className="progress-bar">
                      <div
                        className={`progress-bar-fill ${parseInt(project.completed_task_count) === parseInt(project.task_count) ? 'complete' : ''}`}
                        style={{ width: `${(parseInt(project.completed_task_count) / parseInt(project.task_count)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#94a3b8' }}>
                  <span><i className="fa-solid fa-users" style={{ marginRight: 6 }}></i>{project.member_count} members</span>
                  <span><i className="fa-solid fa-list-check" style={{ marginRight: 6 }}></i>{project.completed_task_count || 0}/{project.task_count} tasks</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2>New Project</h2>
            <form onSubmit={handleCreate}>
              <div className="form-group">
                <label>Project Name</label>
                <input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Enter project name"
                  required
                />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  rows={3}
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Enter project description"
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
