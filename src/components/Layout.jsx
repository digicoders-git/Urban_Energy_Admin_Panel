import React, { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, MessageSquare, FileText,
  Settings, LogOut, Menu, X, Bell, Handshake, HandCoins, Star, BriefcaseBusiness
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { notificationsApi } from '../api'
import Logo from '/urbanlogo.png'

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/contacts', icon: Users, label: 'Contacts' },
  { to: '/queries', icon: MessageSquare, label: 'Queries' },
  { to: '/get-quotes', icon: HandCoins, label: 'Get Quotes' },
  { to: '/partners', icon: Handshake, label: 'Partners' },
  { to: '/reviews', icon: Star, label: 'Reviews' },
  { to: '/applications', icon: BriefcaseBusiness, label: 'Applications' },
  { to: '/blogs', icon: FileText, label: 'Blogs' },
  { to: '/settings', icon: Settings, label: 'Settings' },
]

function SidebarContent({ onClose }) {
  const { user, logout, profile } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex flex-col h-full" style={{ padding: '20px 14px' }}>
      {/* Brand */}
      <div className="flex flex-col items-end mb-3 px-2" style={{ position: 'relative' }}>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, position: 'absolute', top: 0, right: 0 }}>
            <X size={18} color="var(--text-dim)" />
          </button>
        )}
        <img src={Logo} alt="Vaulix Solar" className="w-32 h-32 object-contain" style={{ marginRight: '60px' }} />
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-5 flex-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            onClick={onClose}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div style={{ borderTop: '1px solid var(--border-card)', paddingTop: 14, marginTop: 14 }}>
        <div className="flex items-center gap-3 px-2 mb-3">
          {profile?.avatar
            ? <img src={profile.avatar} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--orange)', flexShrink: 0 }} />
            : <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #FF7A00, #FFB800)', color: 'white' }}>
              {(profile?.name || user?.username)?.[0]?.toUpperCase()}
            </div>
          }
          <div className="min-w-0">
            <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.name || user?.username}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{profile?.role || user?.role}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="nav-link w-full"
          style={{ color: '#ef4444', border: 'none', background: 'none' }}
        >
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  )
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000)
  if (diff < 60) return `${diff}s ago`
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function RightActions({ user, profile }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [notifs, setNotifs] = useState([])
  const ref = useRef(null)

  const unreadCount = notifs.filter(n => !n.read).length

  const fetchNotifs = () => {
    notificationsApi.getAll().then(setNotifs).catch(() => { })
  }

  useEffect(() => {
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = async () => {
    await notificationsApi.markAllRead().catch(() => { })
    setNotifs(n => n.map(x => ({ ...x, read: true })))
  }

  const handleClick = async (notif) => {
    if (!notif.read) {
      await notificationsApi.markRead(notif._id).catch(() => { })
      setNotifs(n => n.map(x => x._id === notif._id ? { ...x, read: true } : x))
    }
    setOpen(false)
    navigate(notif.route)
  }

  return (
    <div className="flex items-center gap-3">
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(v => !v)}
          style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-input)', border: '1px solid var(--border-card)', cursor: 'pointer', position: 'relative' }}
        >
          <Bell size={15} color="var(--text-dim)" />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: -5, right: -5,
              minWidth: 16, height: 16, borderRadius: 8,
              background: 'var(--orange)', border: '2px solid var(--bg-main)',
              fontSize: 9, fontWeight: 800, color: 'white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: '0 3px'
            }}>
              {unreadCount}
            </span>
          )}
        </button>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 6, scale: 0.97 }}
              transition={{ duration: 0.15 }}
              style={{
                position: 'absolute', right: 0, top: 'calc(100% + 8px)', width: 300, zIndex: 9999,
                background: 'var(--bg-card)', border: '1px solid var(--border-card)',
                borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.3)', overflow: 'hidden'
              }}
            >
              <div style={{ padding: '11px 14px', borderBottom: '1px solid var(--border-card)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-main)' }}>
                  Notifications {unreadCount > 0 && <span style={{ fontSize: 11, color: 'var(--orange)', fontWeight: 700 }}>({unreadCount})</span>}
                </span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ fontSize: 10.5, color: '#00A3E0', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    Mark all read
                  </button>
                )}
              </div>

              <div style={{ maxHeight: 400, overflowY: 'auto' }}>
                {notifs.length === 0
                  ? <div style={{ padding: '28px 14px', textAlign: 'center', color: 'var(--text-label)', fontSize: 12.5 }}>No notifications yet.</div>
                  : notifs.map((n) => (
                    <div
                      key={n._id}
                      onClick={() => handleClick(n)}
                      style={{
                        display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px',
                        borderBottom: '1px solid var(--border-card)', cursor: 'pointer',
                        background: n.read ? 'transparent' : 'rgba(255,122,0,0.05)',
                        transition: 'background 0.15s'
                      }}
                    >
                      <div style={{ width: 7, height: 7, borderRadius: '50%', background: n.read ? 'var(--text-label)' : n.color, marginTop: 5, flexShrink: 0 }} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: n.read ? 500 : 700, color: 'var(--text-main)', marginBottom: 2 }}>{n.name}</div>
                        <div style={{ fontSize: 11.5, color: 'var(--text-dim)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.msg}</div>
                      </div>
                      <span style={{ fontSize: 10.5, color: 'var(--text-label)', flexShrink: 0, marginTop: 1 }}>{timeAgo(n.createdAt)}</span>
                    </div>
                  ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #FF7A00, #FFB800)', color: 'white' }}>
        {profile?.avatar
          ? <img src={profile.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          : (profile?.name || user?.username)?.[0]?.toUpperCase()
        }
      </div>
    </div>
  )
}

export default function Layout({ children }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const { user, profile } = useAuth()
  const location = useLocation()

  const pageTitle = NAV.find(n => n.to === location.pathname)?.label || 'Dashboard'

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: 'var(--bg-main)' }}>

      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden md:flex flex-col w-56 flex-shrink-0"
        style={{
          background: 'var(--bg-sidebar)',
          borderRight: '1px solid var(--border-card)'
        }}
      >
        <SidebarContent />
      </aside>

      {/* ── Mobile Sidebar ── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 md:hidden"
              style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(4px)' }}
            />
            <motion.aside
              key="sidebar"
              initial={{ x: -224 }} animate={{ x: 0 }} exit={{ x: -224 }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="fixed left-0 top-0 bottom-0 z-50 w-56 md:hidden"
              style={{
                background: 'var(--bg-sidebar)',
                borderRight: '1px solid var(--border-card)'
              }}
            >
              <SidebarContent onClose={() => setMobileOpen(false)} />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <header
          className="flex items-center justify-between px-8 flex-shrink-0"
          style={{
            height: 60,
            background: 'var(--bg-card)',
            borderBottom: '1px solid var(--border-card)',
            backdropFilter: 'blur(16px)',
            overflow: 'visible',
            position: 'relative',
            zIndex: 50,
            gap: '32px'
          }}
        >
          <div className="flex items-center gap-6 flex-1">
            <button
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              <Menu size={20} color="var(--text-dim)" />
            </button>
            <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--text-main)', margin: 0, marginLeft: '8px' }}>{pageTitle}</h2>
          </div>

          <RightActions user={user} profile={profile} />
        </header>

        {/* Page */}
        <main className="flex-1 overflow-y-auto" style={{ padding: '28px 24px' }}>
          {children}
        </main>
      </div>
    </div>
  )
}
