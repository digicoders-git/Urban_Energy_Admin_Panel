import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import { AuthProvider, useAuth } from './context/AuthContext'
import { ThemeProvider } from './context/ThemeContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Contacts from './pages/Contacts'
import RecordDetails from './pages/RecordDetails'
import Queries from './pages/Queries'
import Blogs from './pages/Blogs'
import Settings from './pages/Settings'
import Partners from './pages/Partners'
import Referrals from './pages/Referrals'
import GetQuotes from './pages/GetQuotes'
import Reviews from './pages/Reviews'
import Applications from './pages/Applications'

function Guard({ children }) {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)' }}>
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
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<Guard><Layout><Dashboard /></Layout></Guard>} />
      <Route path="/contacts" element={<Guard><Layout><Contacts /></Layout></Guard>} />
      <Route path="/contacts/:id" element={<Guard><Layout><RecordDetails type="contact" /></Layout></Guard>} />
      <Route path="/queries" element={<Guard><Layout><Queries /></Layout></Guard>} />
      <Route path="/queries/:id" element={<Guard><Layout><RecordDetails type="query" /></Layout></Guard>} />
      <Route path="/blogs" element={<Guard><Layout><Blogs /></Layout></Guard>} />
      <Route path="/partners" element={<Guard><Layout><Partners /></Layout></Guard>} />
      <Route path="/partners/:id" element={<Guard><Layout><RecordDetails type="partner" /></Layout></Guard>} />
      <Route path="/referrals" element={<Guard><Layout><Referrals /></Layout></Guard>} />
      <Route path="/referrals/:id" element={<Guard><Layout><RecordDetails type="referral" /></Layout></Guard>} />
      <Route path="/get-quotes" element={<Guard><Layout><GetQuotes /></Layout></Guard>} />
      <Route path="/get-quotes/:id" element={<Guard><Layout><RecordDetails type="quote" /></Layout></Guard>} />
      <Route path="/reviews" element={<Guard><Layout><Reviews /></Layout></Guard>} />
      <Route path="/reviews/:id" element={<Guard><Layout><RecordDetails type="review" /></Layout></Guard>} />
      <Route path="/applications" element={<Guard><Layout><Applications /></Layout></Guard>} />
      <Route path="/applications/:id" element={<Guard><Layout><RecordDetails type="application" /></Layout></Guard>} />
      <Route path="/settings" element={<Guard><Layout><Settings /></Layout></Guard>} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
          <ToastContainer
            position="top-right" autoClose={3000} hideProgressBar={false}
            newestOnTop closeOnClick pauseOnHover
            toastStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border-card)', color: 'var(--text-main)', borderRadius: 12, fontFamily: 'Space Grotesk, sans-serif', fontSize: 13.5 }}
          />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  )
}
