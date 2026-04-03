import axios from 'axios'

// ─── Axios Instances ─────────────────────────────────────────────────────────

export const aiAPI = axios.create({
  baseURL: 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

export const authAPI = axios.create({
  baseURL: 'http://localhost:5000',
  headers: { 'Content-Type': 'application/json' },
})

// ─── Request Interceptor: attach JWT ─────────────────────────────────────────

aiAPI.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function login(email, password) {
  const res = await authAPI.post('/auth/login', { email, password })
  return res.data // { token, user }
}

export async function signup(name, email, password) {
  const res = await authAPI.post('/auth/signup', { name, email, password })
  return res.data // { token, user }
}

export async function getMe() {
  const res = await authAPI.get('/auth/me', {
    headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
  })
  return res.data
}

// ─── Reviews ──────────────────────────────────────────────────────────────────

export async function createSession(userId, language) {
  const res = await aiAPI.post('/sessions', { user_id: userId, language })
  return res.data
}

export async function reviewCode(code, language, modelUsed, userId, sessionId, prevReviewId = null) {
  const res = await aiAPI.post('/review', {
    code,
    language,
    model_used: modelUsed,
    user_id: userId,
    session_id: sessionId,
    prev_review_id: prevReviewId,
  })
  return res.data
}

export async function getSessionReviews(sessionId) {
  const res = await aiAPI.get(`/reviews/session/${sessionId}`)
  return res.data
}

export async function getUserReviews(userId) {
  const res = await aiAPI.get(`/reviews/${userId}`)
  return res.data
}
// Dashboard
export async function getStats(userId) {
  const res = await aiAPI.get(`/dashboard/${userId}`)
  return res.data
}

export async function getRecentReviews(userId) {
  const res = await aiAPI.get(`/reviews/${userId}`)
  return res.data
}

// ─── Annotations ──────────────────────────────────────────────────────────────

export async function saveAnnotation(reviewId, userId, selectedText, start, end, chatType) {
  const res = await aiAPI.post('/annotations', {
    review_id: reviewId,
    user_id: userId,
    selected_text: selectedText,
    position_start: start,   
    position_end: end, 
    chat_type: chatType,
  })
  return res.data
}

export async function sendAnnotationMessage(annotationId, userId, message) {
  const res = await aiAPI.post(`/annotations/${annotationId}/messages`, {
    user_id: userId,
    message,
  })
  return res.data
}

export async function getAnnotations(reviewId) {
  const res = await aiAPI.get(`/annotations/${reviewId}`)
  return res.data
}

// ─── Profile + Dashboard ──────────────────────────────────────────────────────

export async function getUserProfile(userId) {
  const res = await aiAPI.get(`/profile/${userId}`)
  return res.data
}

export async function getDashboard(userId) {
  const res = await aiAPI.get(`/dashboard/${userId}`)
  return res.data
}

// ─── Contact + Suggestions ───────────────────────────────────────────────────

export async function submitContact(name, email, subject, message) {
  const res = await aiAPI.post('/contact', { name, email, subject, message })
  return res.data
}

export async function getSuggestions() {
  const res = await aiAPI.get('/suggestions')
  return res.data
}

export async function submitSuggestion(userId, title, description) {
  const res = await aiAPI.post('/suggestions', { user_id: userId, title, description })
  return res.data
}

export async function voteSuggestion(suggestionId, userId) {
  const res = await aiAPI.post(`/suggestions/${suggestionId}/vote`, { user_id: userId })
  return res.data
}
