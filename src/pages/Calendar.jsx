import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

export default function Calendar() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  useEffect(() => {
    api.get('/tasks/with-due-dates').then((res) => {
      setTasks(res.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const daysInPrevMonth = new Date(year, month, 0).getDate();

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDate(null);
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDate(null);
  };

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const tasksByDate = {};
  tasks.forEach((t) => {
    if (!t.due_date) return;
    const d = t.due_date.split('T')[0];
    if (!tasksByDate[d]) tasksByDate[d] = [];
    tasksByDate[d].push(t);
  });

  const getTasksForDate = (day, isCurrent) => {
    if (!isCurrent) return [];
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return tasksByDate[dateStr] || [];
  };

  const handleDayClick = (day, isCurrent) => {
    if (!isCurrent) return;
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    setSelectedDate(selectedDate === dateStr ? null : dateStr);
  };

  const days = [];
  for (let i = firstDay - 1; i >= 0; i--) {
    days.push({ day: daysInPrevMonth - i, current: false });
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ day: i, current: true });
  }
  const remaining = 42 - days.length;
  for (let i = 1; i <= remaining; i++) {
    days.push({ day: i, current: false });
  }

  const selectedTasks = selectedDate ? (tasksByDate[selectedDate] || []) : [];

  if (loading) return <div className="loading">Loading calendar...</div>;

  return (
    <div>
      <div className="topbar">
        <div className="top-left">
          <h1>Calendar</h1>
        </div>
        <div className="top-right">
          <span style={{ color: 'var(--text-muted)', fontSize: 14 }}>{user?.name}</span>
          <div className="avatar">{user?.name?.charAt(0).toUpperCase()}</div>
        </div>
      </div>

      <div className="calendar-container">
        <div className="calendar-header">
          <button className="calendar-nav-btn" onClick={prevMonth}>
            <i className="fa-solid fa-chevron-left"></i>
          </button>
          <h2>{MONTHS[month]} {year}</h2>
          <button className="calendar-nav-btn" onClick={nextMonth}>
            <i className="fa-solid fa-chevron-right"></i>
          </button>
        </div>

        <div className="calendar-weekdays">
          {WEEKDAYS.map((d) => (
            <div key={d} className="calendar-weekday">{d}</div>
          ))}
        </div>

        <div className="calendar-days">
          {days.map((d, i) => {
            const dateTasks = getTasksForDate(d.day, d.current);
            const dateStr = d.current
              ? `${year}-${String(month + 1).padStart(2, '0')}-${String(d.day).padStart(2, '0')}`
              : null;
            const isToday = dateStr === todayStr;
            const isSelected = dateStr === selectedDate;

            return (
              <div
                key={i}
                className={`calendar-day ${!d.current ? 'other-month' : ''} ${isToday ? 'today' : ''} ${isSelected ? 'today' : ''} ${dateTasks.length > 0 ? 'has-task' : ''}`}
                onClick={() => handleDayClick(d.day, d.current)}
                style={isSelected && !isToday ? { background: 'var(--bg-menu-hover)' } : {}}
              >
                <span className="day-number">{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="calendar-task-list">
        <h3>
          {selectedDate
            ? `Tasks due on ${new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}`
            : 'Click a date to see tasks'}
        </h3>
        {selectedTasks.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 20 }}>
            {selectedDate ? 'No tasks due on this date.' : 'Select a date from the calendar above.'}
          </p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Task</th>
                <th>Project</th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {selectedTasks.map((task) => (
                <tr key={task.id}>
                  <td style={{ fontWeight: 500 }}>{task.title}</td>
                  <td>{task.project_name || 'Unknown'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>
                    {task.assigned_to_name || <em style={{ color: 'var(--text-muted-darker)' }}>Unassigned</em>}
                  </td>
                  <td>
                    <span className={`badge badge-${task.priority}`}>{task.priority}</span>
                  </td>
                  <td>
                    <span className={`badge badge-${task.status}`}>{task.status.replace('_', ' ')}</span>
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
