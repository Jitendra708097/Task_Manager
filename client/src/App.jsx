import { Navigate, Route, Routes } from 'react-router-dom'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { fetchMe } from './features/auth/authSlice'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import ProjectsPage from './pages/ProjectsPage'
import TasksPage from './pages/TasksPage'
import AppLayout from './components/AppLayout'

function ProtectedRoute({ children }) {
  const { user, bootstrapped } = useSelector((state) => state.auth)

  if (!bootstrapped) {
    return <div className="screen-message">Loading workspace...</div>
  }

  return user ? children : <Navigate to="/login" replace />
}

function GuestRoute({ children }) {
  const { user, bootstrapped } = useSelector((state) => state.auth)

  if (!bootstrapped) {
    return <div className="screen-message">Loading workspace...</div>
  }

  return user ? <Navigate to="/" replace /> : children
}

export default function App() {
  const dispatch = useDispatch()

  useEffect(() => {
    dispatch(fetchMe())
  }, [dispatch])

  return (
    <Routes>
      <Route
        path="/login"
        element={
          <GuestRoute>
            <AuthPage mode="login" />
          </GuestRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <GuestRoute>
            <AuthPage mode="signup" />
          </GuestRoute>
        }
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="projects" element={<ProjectsPage />} />
        <Route path="tasks" element={<TasksPage />} />
      </Route>
    </Routes>
  )
}
