const statusClass = {
  Todo: 'status todo',
  'In Progress': 'status progress',
  Done: 'status done',
}

export default function TaskCard({ task, onStatusChange }) {
  const overdue = task.status !== 'Done' && new Date(task.dueDate) < new Date()

  return (
    <article className="task-card">
      <div className="task-top">
        <span className={statusClass[task.status]}>{task.status}</span>
        <span className={`priority ${task.priority.toLowerCase()}`}>{task.priority}</span>
      </div>
      <h3>{task.title}</h3>
      <p>{task.description || 'No description'}</p>
      <dl>
        <div>
          <dt>Project</dt>
          <dd>{task.project?.name || 'Project'}</dd>
        </div>
        <div>
          <dt>Assignee</dt>
          <dd>{task.assignedTo?.name || 'Unassigned'}</dd>
        </div>
        <div>
          <dt>Due</dt>
          <dd className={overdue ? 'overdue' : ''}>{new Date(task.dueDate).toLocaleDateString()}</dd>
        </div>
      </dl>
      {onStatusChange ? (
        <select value={task.status} onChange={(event) => onStatusChange(task._id, event.target.value)}>
          <option>Todo</option>
          <option>In Progress</option>
          <option>Done</option>
        </select>
      ) : null}
    </article>
  )
}
