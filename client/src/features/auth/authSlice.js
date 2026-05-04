import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { apiRequest } from '../../api/client'

export const fetchMe = createAsyncThunk('auth/me', async (_, { rejectWithValue }) => {
  try {
    return await apiRequest('/auth/me')
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const login = createAsyncThunk('auth/login', async (payload, { rejectWithValue }) => {
  try {
    return await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const signup = createAsyncThunk('auth/signup', async (payload, { rejectWithValue }) => {
  try {
    return await apiRequest('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  } catch (error) {
    return rejectWithValue(error.message)
  }
})

export const logout = createAsyncThunk('auth/logout', async () => {
  return apiRequest('/auth/logout', { method: 'POST' })
})

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: null,
    status: 'idle',
    error: '',
    bootstrapped: false,
  },
  reducers: {
    clearAuthError(state) {
      state.error = ''
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMe.pending, (state) => {
        state.status = 'loading'
      })
      .addCase(fetchMe.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.status = 'succeeded'
        state.bootstrapped = true
      })
      .addCase(fetchMe.rejected, (state) => {
        state.user = null
        state.status = 'idle'
        state.bootstrapped = true
      })
      .addCase(login.pending, (state) => {
        state.status = 'loading'
        state.error = ''
      })
      .addCase(login.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.status = 'succeeded'
      })
      .addCase(login.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(signup.pending, (state) => {
        state.status = 'loading'
        state.error = ''
      })
      .addCase(signup.fulfilled, (state, action) => {
        state.user = action.payload.user
        state.status = 'succeeded'
      })
      .addCase(signup.rejected, (state, action) => {
        state.status = 'failed'
        state.error = action.payload
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null
        state.status = 'idle'
      })
  },
})

export const { clearAuthError } = authSlice.actions
export default authSlice.reducer
