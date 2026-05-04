import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useSelector } from 'react-redux'
import { z } from 'zod'
import { apiRequest } from '../api/client'
import FormField from '../components/FormField'

const projectSchema = z.object({
  name: z.string().min(3, 'Project name needs at least 3 characters'),
  description: z.string().max(1000, 'Description is too long').optional(),
  members: z.array(z.string()).optional(),
})

export default function ProjectsPage() {
  const { user } = useSelector((state) => state.auth)
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(projectSchema), defaultValues: { members: [] } })

  const loadProjects = () => apiRequest('/projects').then((data) => setProjects(data.projects))

  useEffect(() => {
    loadProjects().catch((err) => setError(err.message))
    if (user?.role === 'Admin') {
      apiRequest('/projects/users')
        .then((data) => setUsers(data.users))
        .catch((err) => setError(err.message))
    }
  }, [user?.role])

  const onSubmit = async (values) => {
    setError('')
    await apiRequest('/projects', {
      method: 'POST',
      body: JSON.stringify({ ...values, members: values.members || [] }),
    })
    reset({ name: '', description: '', members: [] })
    await loadProjects()
  }

  return (
    <section className="page-stack">
      <header className="page-header">
        <div>
          <p className="eyebrow">Workspace</p>
          <h2>Projects</h2>
        </div>
      </header>
      {error ? <div className="panel danger">{error}</div> : null}
      {user?.role === 'Admin' ? (
        <form className="panel form-grid" onSubmit={handleSubmit(onSubmit)}>
          <FormField label="Project name" error={errors.name?.message}>
            <input {...register('name')} placeholder="Website launch" />
          </FormField>
          <FormField label="Description" error={errors.description?.message}>
            <textarea {...register('description')} placeholder="Goals, scope, or notes" />
          </FormField>
          <FormField label="Team members" error={errors.members?.message}>
            <select multiple {...register('members')}>
              {users.map((member) => (
                <option value={member._id} key={member._id}>
                  {member.name} - {member.role}
                </option>
              ))}
            </select>
          </FormField>
          <button type="submit" disabled={isSubmitting}>
            Create project
          </button>
        </form>
      ) : null}
      <div className="project-grid">
        {projects.map((project) => (
          <article className="project-card" key={project._id}>
            <h3>{project.name}</h3>
            <p>{project.description || 'No description'}</p>
            <div className="avatar-row">
              {project.members.map((member) => (
                <span key={member._id}>{member.name}</span>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
