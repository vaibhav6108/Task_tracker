import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export default function OverdueStudents() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/overdue-students').then((res) => {
      setStudents(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const grouped = {};
  students.forEach((s) => {
    if (!grouped[s.id]) {
      grouped[s.id] = {
        id: s.id,
        name: s.name,
        email: s.email,
        tasks: [],
      };
    }
    grouped[s.id].tasks.push({
      task_id: s.task_id,
      task_title: s.task_title,
      due_date: s.due_date,
      status: s.status,
      priority: s.priority,
      project_name: s.project_name,
      project_id: s.project_id,
    });
  });

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div>
      <div className="topbar">
        <div className="top-left">
          <h1>Overdue Students</h1>
        </div>
        <div className="top-right">
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{user?.name}</span>
          <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
        </div>
      </div>

      {students.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: 60 }}>
          <i className="fa-solid fa-circle-check" style={{ fontSize: 48, color: 'var(--text-success)', marginBottom: 16 }}></i>
          <p style={{ color: 'var(--text-muted)' }}>No overdue tasks. Everyone is on track!</p>
        </div>
      ) : (
        <>
          <div style={{ marginBottom: 20, color: 'var(--text-muted)', fontSize: 14 }}>
            {Object.keys(grouped).length} student{Object.keys(grouped).length !== 1 ? 's' : ''} with overdue tasks
          </div>

          {Object.values(grouped).map((student) => (
            <div key={student.id} className="overdue-student-card">
              <div className="overdue-student-header">
                <div className="overdue-student-avatar">
                  {student.name.charAt(0).toUpperCase()}
                </div>
                <div className="overdue-student-info">
                  <h4>{student.name}</h4>
                  <span>{student.email} &middot; {student.tasks.length} overdue task{student.tasks.length !== 1 ? 's' : ''}</span>
                </div>
                <div style={{ marginLeft: 'auto' }}>
                  <span className="overdue-count-badge">{student.tasks.length}</span>
                </div>
              </div>

              {student.tasks.map((task) => (
                <div key={task.task_id} className="overdue-task-item">
                  <div>
                    <div className="overdue-task-title">{task.task_title}</div>
                    <div className="overdue-task-meta" style={{ marginTop: 4 }}>
                      <Link to={`/projects/${task.project_id}`} className="link" style={{ fontSize: 13 }}>
                        {task.project_name}
                      </Link>
                      <span>Due: {new Date(task.due_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                    <span className={`badge badge-${task.status}`}>{task.status.replace('_', ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </>
      )}
    </div>
  );
}
