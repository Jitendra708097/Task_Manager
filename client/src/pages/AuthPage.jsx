import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'
import { z } from 'zod'
import { useDispatch, useSelector } from 'react-redux'
import { login, signup } from '../features/auth/authSlice'
import FormField from '../components/FormField'

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(1, 'Password is required'),
})

const signupSchema = loginSchema.extend({
  name: z.string().min(2, 'Name needs at least 2 characters'),
  password: z
    .string()
    .min(8, 'Use at least 8 characters')
    .regex(/[A-Z]/, 'Add an uppercase letter')
    .regex(/[a-z]/, 'Add a lowercase letter')
    .regex(/\d/, 'Add a number'),
})

export default function AuthPage({ mode }) {
  const isSignup = mode === 'signup'
  const dispatch = useDispatch()
  const { status, error } = useSelector((state) => state.auth)
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(isSignup ? signupSchema : loginSchema),
  })

  const onSubmit = (values) => {
    dispatch(isSignup ? signup(values) : login(values))
  }

  return (
    <main className="auth-page">
      <section className="auth-panel">
        <div>
          <p className="eyebrow">Task Manager</p>
          <h1>{isSignup ? 'Create your account' : 'Welcome back'}</h1>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          {isSignup ? (
            <FormField label="Name" error={errors.name?.message}>
              <input {...register('name')} placeholder="Jitendra Kumar" />
            </FormField>
          ) : null}
          <FormField label="Email" error={errors.email?.message}>
            <input {...register('email')} type="email" placeholder="you@example.com" />
          </FormField>
          <FormField label="Password" error={errors.password?.message}>
            <input {...register('password')} type="password" placeholder="********" />
          </FormField>
          {error ? <p className="form-error">{error}</p> : null}
          <button type="submit" disabled={status === 'loading'}>
            {status === 'loading' ? 'Please wait...' : isSignup ? 'Sign up' : 'Log in'}
          </button>
        </form>
        <p className="switch-auth">
          {isSignup ? 'Already have an account?' : 'New here?'}{' '}
          <Link to={isSignup ? '/login' : '/signup'}>{isSignup ? 'Log in' : 'Create account'}</Link>
        </p>
      </section>
    </main>
  )
}
