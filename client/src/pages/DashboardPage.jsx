import { useEffect, useState } from 'react'
import { apiRequest } from '../api/client'
import TaskCard from '../components/TaskCard'

export default function DashboardPage() {
  const [dashboard, setDashboard] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    apiRequest('/dashboard')
      .then(setDashboard)
      .catch((err) => setError(err.message))
  }, [])

  if (error) return <div className="panel danger">{error}</div>
  if (!dashboard) return <div className="panel">Loading dashboard...</div>

  const stats = [
    ['Projects', dashboard.summary.projects],
    ['Tasks', dashboard.summary.totalTasks],
    ['Todo', dashboard.summary.todo],
    ['In progress', dashboard.summary.inProgress],
    ['Done', dashboard.summary.done],
    ['Overdue', dashboard.summary.overdue],
  ]

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Overview</p>
          <h2>Dashboard</h2>
        </div>
      </header>
      <div className="stats-grid">
        {stats.map(([label, value]) => (
          <article className="stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </article>
        ))}
      </div>
      <section className="page-stack">
        <h2>My tasks</h2>
        <div className="task-grid">
          {dashboard.myTasks.length ? (
            dashboard.myTasks.map((task) => <TaskCard key={task._id} task={task} />)
          ) : (
            <div className="panel">No tasks assigned yet.</div>
          )}
        </div>
      </section>
    </section>
  )
}
