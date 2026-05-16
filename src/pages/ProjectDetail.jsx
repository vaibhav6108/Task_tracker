import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function ProjectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showEditTaskModal, setShowEditTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showMemberModal, setShowMemberModal] = useState(false);
  const [taskForm, setTaskForm] = useState({
    title: '', description: '', priority: 'medium', due_date: '', assigned_to: '',
  });
  const [editTaskForm, setEditTaskForm] = useState({
    title: '', description: '', priority: 'medium', due_date: '', assigned_to: '', status: 'pending',
  });
  const [memberForm, setMemberForm] = useState({ userId: '', role: 'member' });
  const [taskSearch, setTaskSearch] = useState('');

  const fetchData = async () => {
    try {
      const [projRes, tasksRes, membersRes, usersRes] = await Promise.all([
        api.get(`/projects/${id}`),
        api.get(`/tasks/project/${id}`),
        api.get(`/projects/${id}/members`),
        api.get('/dashboard/users'),
      ]);
      setProject(projRes.data);
      setTasks(tasksRes.data);
      setMembers(membersRes.data);
      setUsers(usersRes.data);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleCreateTask = async (e) => {
    e.preventDefault();
    await api.post(`/tasks/project/${id}`, {
      ...taskForm,
      assigned_to: taskForm.assigned_to || null,
    });
    setShowTaskModal(false);
    setTaskForm({ title: '', description: '', priority: 'medium', due_date: '', assigned_to: '' });
    const res = await api.get(`/tasks/project/${id}`);
    setTasks(res.data);
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    await api.post(`/projects/${id}/members`, memberForm);
    setShowMemberModal(false);
    setMemberForm({ userId: '', role: 'member' });
    const res = await api.get(`/projects/${id}/members`);
    setMembers(res.data);
  };

  const handleStatusChange = async (taskId, status) => {
    await api.put(`/tasks/${taskId}`, { status });
    const res = await api.get(`/tasks/project/${id}`);
    setTasks(res.data);
  };

  const handleAssignChange = async (taskId, assignedTo) => {
    await api.put(`/tasks/${taskId}`, { assigned_to: assignedTo || null });
    const res = await api.get(`/tasks/project/${id}`);
    setTasks(res.data);
  };

  const handleEditTask = async (e) => {
    e.preventDefault();
    await api.put(`/tasks/${editingTask.id}`, {
      title: editTaskForm.title,
      description: editTaskForm.description,
      priority: editTaskForm.priority,
      due_date: editTaskForm.due_date || null,
      assigned_to: editTaskForm.assigned_to || null,
      status: editTaskForm.status,
    });
    setShowEditTaskModal(false);
    setEditingTask(null);
    const res = await api.get(`/tasks/project/${id}`);
    setTasks(res.data);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Delete this task?')) return;
    await api.delete(`/tasks/${taskId}`);
    const res = await api.get(`/tasks/project/${id}`);
    setTasks(res.data);
  };

  const handleDeleteProject = async () => {
    if (!window.confirm('Delete this project and all its tasks? This cannot be undone.')) return;
    await api.delete(`/projects/${id}`);
    navigate('/projects');
  };

  const openEditModal = (task) => {
    setEditingTask(task);
    setEditTaskForm({
      title: task.title,
      description: task.description || '',
      priority: task.priority,
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      assigned_to: task.assigned_to ? String(task.assigned_to) : '',
      status: task.status,
    });
    setShowEditTaskModal(true);
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (!project) return <div className="loading">Project not found</div>;

  const nonMembers = users.filter(
    (u) => !members.some((m) => m.user_id === u.id)
  );

  const taskCounts = {
    pending: tasks.filter((t) => t.status === 'pending').length,
    in_progress: tasks.filter((t) => t.status === 'in_progress').length,
    completed: tasks.filter((t) => t.status === 'completed').length,
  };

  const filteredTasks = tasks.filter((t) => {
    const q = taskSearch.toLowerCase();
    return (
      !q ||
      t.title.toLowerCase().includes(q) ||
      (t.assigned_to_name || '').toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <Link to="/projects" style={{ color: '#60a5fa', fontSize: 14, marginBottom: 16, display: 'block' }}>
        <i className="fa-solid fa-arrow-left" style={{ marginRight: 6 }}></i>Back to Projects
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 30, fontWeight: 600 }}>{project.name}</h1>
          <p style={{ color: '#94a3b8', marginTop: 4, fontSize: 14 }}>{project.description}</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn btn-primary" onClick={() => setShowTaskModal(true)}>
            <i className="fa-solid fa-plus"></i> Add Task
          </button>
          <button className="btn btn-secondary" onClick={() => setShowMemberModal(true)}>
            <i className="fa-solid fa-user-plus"></i> Add Member
          </button>
          <button className="btn btn-danger" onClick={handleDeleteProject}>
            <i className="fa-solid fa-trash-can"></i> Delete
          </button>
        </div>
      </div>

      <div className="stats-grid" style={{ marginBottom: 25 }}>
        <div className="stat-card">
          <div className="stat-left">
            <div className="icon-box" style={{ color: '#fbbf24' }}>
              <i className="fa-solid fa-clock"></i>
            </div>
            <div>
              <h3>Pending</h3>
              <p>{taskCounts.pending}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-left">
            <div className="icon-box" style={{ color: '#60a5fa' }}>
              <i className="fa-solid fa-bars-progress"></i>
            </div>
            <div>
              <h3>In Progress</h3>
              <p>{taskCounts.in_progress}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-left">
            <div className="icon-box" style={{ color: '#34d399' }}>
              <i className="fa-solid fa-circle-check"></i>
            </div>
            <div>
              <h3>Completed</h3>
              <p>{taskCounts.completed}</p>
            </div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-left">
            <div className="icon-box" style={{ color: '#38bdf8' }}>
              <i className="fa-solid fa-users"></i>
            </div>
            <div>
              <h3>Members</h3>
              <p>{members.length}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="table-section" style={{ marginBottom: 20 }}>
        <div className="table-header">
          <h2>Members</h2>
        </div>
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {members.map((m) => (
              <tr key={m.id}>
                <td style={{ fontWeight: 500 }}>{m.name}</td>
                <td style={{ color: '#94a3b8' }}>{m.email}</td>
                <td>
                  <span className={`badge ${m.role === 'admin' ? 'badge-admin' : 'badge-member'}`}>
                    {m.role}
                  </span>
                </td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr><td colSpan={3} style={{ color: '#64748b', textAlign: 'center', padding: 20 }}>No members yet</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="table-section">
        <div className="table-header">
          <h2>Tasks ({tasks.length})</h2>
          <div className="search-box" style={{ width: 220, height: 40 }}>
            <i className="fa-solid fa-search"></i>
            <input type="text" placeholder="Search tasks..." value={taskSearch} onChange={(e) => setTaskSearch(e.target.value)} />
          </div>
        </div>
        {filteredTasks.length === 0 ? (
          <p style={{ color: '#64748b', textAlign: 'center', padding: 30 }}>
            {taskSearch ? 'No tasks match your search.' : 'No tasks yet. Click "Add Task" to create one.'}
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>Due Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((task) => (
                <tr key={task.id}>
                  <td style={{ fontWeight: 500 }}>{task.title}</td>
                  <td>
                    <select
                      className="select-inline"
                      value={task.assigned_to ? String(task.assigned_to) : ''}
                      onChange={(e) => handleAssignChange(task.id, e.target.value)}
                    >
                      <option value="">Unassigned</option>
                      {members.map((m) => (
                        <option key={m.user_id} value={m.user_id}>{m.name}</option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                  </td>
                  <td style={{ fontSize: 14 }}>
                    {task.due_date ? new Date(task.due_date).toLocaleDateString() : '-'}
                  </td>
                  <td>
                    <select
                      className="select-inline"
                      value={task.status}
                      onChange={(e) => handleStatusChange(task.id, e.target.value)}
                    >
                      <option value="pending">Pending</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                    </select>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '6px 10px', fontSize: 13 }}
                        onClick={() => openEditModal(task)}
                      >
                        <i className="fa-solid fa-pen"></i>
                      </button>
                      <button
                        className="btn btn-ghost"
                        style={{ padding: '6px 10px', fontSize: 13, color: '#f87171' }}
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <i className="fa-solid fa-trash-can"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showTaskModal && (
        <div className="modal-overlay" onClick={() => setShowTaskModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2><i className="fa-solid fa-plus" style={{ marginRight: 8 }}></i>Add Task</h2>
            <form onSubmit={handleCreateTask}>
              <div className="form-group">
                <label>Title</label>
                <input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} placeholder="Task title" required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={3} value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} placeholder="Task description" />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select value={taskForm.priority} onChange={(e) => setTaskForm({ ...taskForm, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={taskForm.due_date} onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select value={taskForm.assigned_to} onChange={(e) => setTaskForm({ ...taskForm, assigned_to: e.target.value })}>
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.user_id} value={m.user_id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Task</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditTaskModal && editingTask && (
        <div className="modal-overlay" onClick={() => setShowEditTaskModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2><i className="fa-solid fa-pen" style={{ marginRight: 8 }}></i>Edit Task</h2>
            <form onSubmit={handleEditTask}>
              <div className="form-group">
                <label>Title</label>
                <input value={editTaskForm.title} onChange={(e) => setEditTaskForm({ ...editTaskForm, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea rows={3} value={editTaskForm.description} onChange={(e) => setEditTaskForm({ ...editTaskForm, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Priority</label>
                <select value={editTaskForm.priority} onChange={(e) => setEditTaskForm({ ...editTaskForm, priority: e.target.value })}>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="form-group">
                <label>Due Date</label>
                <input type="date" value={editTaskForm.due_date} onChange={(e) => setEditTaskForm({ ...editTaskForm, due_date: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Status</label>
                <select value={editTaskForm.status} onChange={(e) => setEditTaskForm({ ...editTaskForm, status: e.target.value })}>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              <div className="form-group">
                <label>Assign To</label>
                <select value={editTaskForm.assigned_to} onChange={(e) => setEditTaskForm({ ...editTaskForm, assigned_to: e.target.value })}>
                  <option value="">Unassigned</option>
                  {members.map((m) => (
                    <option key={m.user_id} value={m.user_id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowEditTaskModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showMemberModal && (
        <div className="modal-overlay" onClick={() => setShowMemberModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2><i className="fa-solid fa-user-plus" style={{ marginRight: 8 }}></i>Add Member</h2>
            <form onSubmit={handleAddMember}>
              <div className="form-group">
                <label>User</label>
                <select value={memberForm.userId} onChange={(e) => setMemberForm({ ...memberForm, userId: e.target.value })} required>
                  <option value="">Select a user...</option>
                  {nonMembers.map((u) => (
                    <option key={u.id} value={u.id}>{u.name} ({u.email})</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>Role</label>
                <select value={memberForm.role} onChange={(e) => setMemberForm({ ...memberForm, role: e.target.value })}>
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowMemberModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Add Member</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
