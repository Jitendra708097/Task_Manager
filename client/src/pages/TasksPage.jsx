import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useMemo, useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { z } from 'zod'
import { apiRequest } from '../api/client'
import FormField from '../components/FormField'
import TaskCard from '../components/TaskCard'

const taskSchema = z.object({
  title: z.string().min(3, 'Task title needs at least 3 characters'),
  description: z.string().max(1200, 'Description is too long').optional(),
  project: z.string().min(1, 'Choose a project'),
  assignedTo: z.string().min(1, 'Choose an assignee'),
  status: z.enum(['Todo', 'In Progress', 'Done']),
  priority: z.enum(['Low', 'Medium', 'High']),
  dueDate: z.string().min(1, 'Due date is required'),
})

export default function TasksPage() {
  const { user } = useSelector((state) => state.auth)
  const [tasks, setTasks] = useState([])
  const [projects, setProjects] = useState([])
  const [error, setError] = useState('')
  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: { status: 'Todo', priority: 'Medium' },
  })

  const selectedProjectId = useWatch({ control, name: 'project' })
  const selectedProject = useMemo(
    () => projects.find((project) => project._id === selectedProjectId),
    [projects, selectedProjectId],
  )

  const loadTasks = () => apiRequest('/tasks').then((data) => setTasks(data.tasks))

  useEffect(() => {
    Promise.all([loadTasks(), apiRequest('/projects').then((data) => setProjects(data.projects))]).catch((err) =>
      setError(err.message),
    )
  }, [])

  const onSubmit = async (values) => {
    setError('')
    await apiRequest('/tasks', {
      method: 'POST',
      body: JSON.stringify(values),
    })
    reset({ title: '', description: '', project: '', assignedTo: '', status: 'Todo', priority: 'Medium', dueDate: '' })
    await loadTasks()
  }

  const updateStatus = async (taskId, status) => {
    const { task } = await apiRequest(`/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
    setTasks((current) => current.map((item) => (item._id === taskId ? task : item)))
  }

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Delivery</p>
          <h2>Tasks</h2>
        </div>
      </header>
      {error ? <div className="panel danger">{error}</div> : null}
      {user?.role === 'Admin' ? (
        <form className="panel form-grid" onSubmit={handleSubmit(onSubmit)}>
          <FormField label="Title" error={errors.title?.message}>
            <input {...register('title')} placeholder="Create wireframes" />
          </FormField>
          <FormField label="Project" error={errors.project?.message}>
            <select {...register('project')}>
              <option value="">Select project</option>
              {projects.map((project) => (
                <option value={project._id} key={project._id}>
                  {project.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Assignee" error={errors.assignedTo?.message}>
            <select {...register('assignedTo')}>
              <option value="">Select assignee</option>
              {selectedProject?.members.map((member) => (
                <option value={member._id} key={member._id}>
                  {member.name}
                </option>
              ))}
            </select>
          </FormField>
          <FormField label="Due date" error={errors.dueDate?.message}>
            <input {...register('dueDate')} type="date" />
          </FormField>
          <FormField label="Status" error={errors.status?.message}>
            <select {...register('status')}>
              <option>Todo</option>
              <option>In Progress</option>
              <option>Done</option>
            </select>
          </FormField>
          <FormField label="Priority" error={errors.priority?.message}>
            <select {...register('priority')}>
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>
          </FormField>
          <FormField label="Description" error={errors.description?.message}>
            <textarea {...register('description')} placeholder="Task details" />
          </FormField>
          <button type="submit" disabled={isSubmitting}>
            Create task
          </button>
        </form>
      ) : null}
      <div className="task-grid">
        {tasks.map((task) => (
          <TaskCard key={task._id} task={task} onStatusChange={updateStatus} />
        ))}
      </div>
    </section>
  )
}
