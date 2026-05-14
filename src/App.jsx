import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout from './components/Layout'
import Login from './Pages/Login'
import Dashboard from './Pages/Dashboard'
import Contacts from './Pages/Contacts'
import Queries from './Pages/Queries'
import Blogs from './Pages/Blogs'
import Settings from './Pages/Settings'
import Partners from './Pages/Partners'
import GetQuotes from './Pages/GetQuotes'
import Reviews from './Pages/Reviews'

function Guard({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#060d24' }}>
      <div style={{ width: 36, height: 36, border: '3px solid rgba(255,122,0,0.2)', borderTopColor: '#FF7A00', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
  return user ? children : <Navigate to="/login" replace />
}

function AppRoutes() {
  const { user, loading } = useAuth()
  if (loading) return null
  return (
    <Routes>
      <Route path="/login"     element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/"          element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Guard><Layout><Dashboard /></Layout></Guard>} />
      <Route path="/contacts"  element={<Guard><Layout><Contacts /></Layout></Guard>} />
      <Route path="/queries"   element={<Guard><Layout><Queries /></Layout></Guard>} />
      <Route path="/blogs"     element={<Guard><Layout><Blogs /></Layout></Guard>} />
      <Route path="/partners"  element={<Guard><Layout><Partners /></Layout></Guard>} />
      <Route path="/get-quotes"element={<Guard><Layout><GetQuotes /></Layout></Guard>} />
      <Route path="/reviews"   element={<Guard><Layout><Reviews /></Layout></Guard>} />
      <Route path="/settings"  element={<Guard><Layout><Settings /></Layout></Guard>} />
      <Route path="*"          element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
        <ToastContainer
          position="top-right" autoClose={3000} hideProgressBar={false}
          newestOnTop closeOnClick pauseOnHover theme="dark"
          toastStyle={{ background: '#0d1f4e', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, fontFamily: 'Space Grotesk, sans-serif', fontSize: 13.5 }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}
