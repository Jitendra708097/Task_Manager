import axios from 'axios'

const API_URL = import.meta.env.VITE_API_URL || '/api'

export const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

export async function apiRequest(path, options = {}) {
  try {
    const response = await api.request({
      url: path,
      method: options.method || 'GET',
      data: options.body ? JSON.parse(options.body) : options.data,
      headers: options.headers,
      params: options.params,
    })

    return response.data
  } catch (error) {
    const data = error.response?.data
    const message =
      data?.errors?.map((item) => item.message).join(', ') ||
      data?.message ||
      error.message ||
      'Request failed'
    throw new Error(message, { cause: error })
  }
}
