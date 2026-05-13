import React, { createContext, useContext, useState, useEffect } from 'react'
import { authApi } from '../api'

const Ctx = createContext()

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('ue_token')
    if (!token) { setLoading(false); return }
    authApi.me()
      .then(admin => { setUser({ username: admin.username, role: admin.role }); setProfile(admin) })
      .catch(() => localStorage.removeItem('ue_token'))
      .finally(() => setLoading(false))
  }, [])

  const login = async (username, password) => {
    const data = await authApi.login({ username, password })
    localStorage.setItem('ue_token', data.token)
    setUser({ username: data.admin.username, role: data.admin.role })
    setProfile(data.admin)
  }

  const logout = () => {
    localStorage.removeItem('ue_token')
    setUser(null)
    setProfile(null)
  }

  const updateProfile = async (data) => {
    const updated = await authApi.updateProfile(data)
    setProfile(updated)
    setUser(u => ({ ...u, role: updated.role }))
    return updated
  }

  return (
    <Ctx.Provider value={{ user, profile, login, logout, updateProfile, loading }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => useContext(Ctx)
