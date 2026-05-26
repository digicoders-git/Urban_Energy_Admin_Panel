const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

function getToken() {
  return localStorage.getItem('ue_token')
}

async function request(path, options = {}) {
  const token = getToken()
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.message || 'Request failed')
  return data
}

const get  = (path)         => request(path)
const post = (path, body)   => request(path, { method: 'POST',  body: JSON.stringify(body) })
const put  = (path, body)   => request(path, { method: 'PUT',   body: JSON.stringify(body) })
const patch= (path, body)   => request(path, { method: 'PATCH', body: JSON.stringify(body) })
const del  = (path)         => request(path, { method: 'DELETE' })

export const authApi = {
  login:          (body) => post('/auth/login', body),
  me:             ()     => get('/auth/me'),
  updateProfile:  (body) => put('/auth/profile', body),
  changePassword: (body) => put('/auth/password', body),
}

export const contactsApi = {
  getAll:      ()              => get('/contacts'),
  updateStatus:(id, status)   => patch(`/contacts/${id}/status`, { status }),
  delete:      (id)           => del(`/contacts/${id}`),
}

export const queriesApi = {
  getAll:      ()              => get('/queries'),
  updateStatus:(id, status)   => patch(`/queries/${id}/status`, { status }),
  delete:      (id)           => del(`/queries/${id}`),
}

export const blogsApi = {
  getAll:  ()         => get('/blogs'),
  create:  (body)     => post('/blogs', body),
  update:  (id, body) => put(`/blogs/${id}`, body),
  delete:  (id)       => del(`/blogs/${id}`),
}

export const partnersApi = {
  getAll:      ()              => get('/partners'),
  updateStatus:(id, status)   => patch(`/partners/${id}/status`, { status }),
  delete:      (id)           => del(`/partners/${id}`),
}

export const referralsApi = {
  getAll:           ()                         => get('/referrals'),
  updateStatus:     (id, status)               => patch(`/referrals/${id}/status`, { status }),
  updateCommission: (id, commission)           => patch(`/referrals/${id}/commission`, { commission }),
  delete:           (id)                       => del(`/referrals/${id}`),
}

export const referrersApi = {
  getAll:      ()              => get('/referrers/admin/all'),
  updateStatus:(id, status)   => patch(`/referrers/admin/${id}/status`, { status }),
  delete:      (id)           => del(`/referrers/admin/${id}`),
}

export const quotesApi = {
  getAll:      ()              => get('/quotes'),
  updateStatus:(id, status)   => patch(`/quotes/${id}/status`, { status }),
  delete:      (id)           => del(`/quotes/${id}`),
}

export const reviewsApi = {
  getAll:      ()              => get('/reviews'),
  updateStatus:(id, status)   => patch(`/reviews/${id}/status`, { status }),
  delete:      (id)           => del(`/reviews/${id}`),
}

export const applicationsApi = {
  getAll:      ()              => get('/applications'),
  updateStatus:(id, status)   => patch(`/applications/${id}/status`, { status }),
  delete:      (id)           => del(`/applications/${id}`),
  downloadCv:  (id)           => `${BASE}/applications/${id}/cv`,
}

export const notificationsApi = {
  getAll:     () => get('/notifications'),
  markRead:   (id) => patch(`/notifications/${id}/read`, {}),
  markAllRead:()   => patch('/notifications/mark-all-read', {}),
}

export const dashboardApi = {
  stats:          () => get('/dashboard/stats'),
  recentContacts: () => get('/dashboard/recent-contacts'),
}
