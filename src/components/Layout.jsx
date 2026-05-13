import React, { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, Users, MessageSquare, FileText,
  Settings, LogOut, Menu, X, Bell, Handshake, HandCoins, Star
} from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { notificationsApi } from '../api'
import Logo from '/urbanlogo.png'

const NAV = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard'  },
  { to: '/contacts',   icon: Users,           label: 'Contacts'   },
  { to: '/queries',    icon: MessageSquare,   label: 'Queries'    },
  { to: '/get-quotes', icon: HandCoins,       label: 'Get Quotes' },
  { to: '/partners',   icon: Handshake,       label: 'Partners'   },
  { to: '/reviews',    icon: Star,            label: 'Reviews'    },
  { to: '/blogs',      icon: FileText,        label: 'Blogs'      },
  { to: '/settings',   icon: Settings,        label: 'Settings'   },
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
      <div className="flex items-center gap-3 px-2 mb-8">
        <img src={Logo} alt="" className="w-9 h-9 object-contain flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="font-orbitron font-black text-white" style={{ fontSize: 14, lineHeight: 1.2 }}>
            Urban <span className="glow-text">Energy</span>
          </div>
          <div style={{ fontSize: 9.5, color: 'rgba(255,255,255,0.28)', fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            Admin Panel
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
            <X size={18} color="rgba(255,255,255,0.4)" />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-col gap-3 flex-1">
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
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 14, marginTop: 14 }}>
        <div className="flex items-center gap-3 px-2 mb-3">
          {profile?.avatar
            ? <img src={profile.avatar} alt="" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,122,0,0.4)', flexShrink: 0 }} />
            : <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                style={{ background: 'linear-gradient(135deg, #FF7A00, #FFB800)', color: 'white' }}>
                {(profile?.name || user?.username)?.[0]?.toUpperCase()}
              </div>
          }
          <div className="min-w-0">
            <div style={{ fontSize: 13, fontWeight: 700, color: 'white', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile?.name || user?.username}
            </div>
            <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>{profile?.role || user?.role}</div>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="nav-link w-full"
          style={{ color: 'rgba(255,100,100,0.65)', border: 'none', background: 'none' }}
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
    notificationsApi.getAll().then(setNotifs).catch(() => {})
  }

  useEffect(() => {
    fetchNotifs()
    const interval = setInterval(fetchNotifs, 30000) // poll every 30s
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const markAllRead = async () => {
    await notificationsApi.markAllRead().catch(() => {})
    setNotifs(n => n.map(x => ({ ...x, read: true })))
  }

  const handleClick = async (notif) => {
    if (!notif.read) {
      await notificationsApi.markRead(notif._id).catch(() => {})
      setNotifs(n => n.map(x => x._id === notif._id ? { ...x, read: true } : x))
    }
    setOpen(false)
    navigate(notif.route)
  }

  return (
    <div className="flex items-center gap-2.5">
      {/* Bell */}
      <div ref={ref} style={{ position: 'relative' }}>
        <button
          onClick={() => setOpen(v => !v)}
          style={{ width: 32, height: 32, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', cursor: 'pointer', position: 'relative' }}
        >
          <Bell size={15} color="rgba(255,255,255,0.45)" />
          {unreadCount > 0 && (
            <span style={{
              position: 'absolute', top: -5, right: -5,
              minWidth: 16, height: 16, borderRadius: 8,
              background: '#FF7A00', border: '2px solid #080f2e',
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
                background: '#0d1f55', border: '1px solid rgba(255,255,255,0.09)',
                borderRadius: 14, boxShadow: '0 16px 48px rgba(0,0,0,0.7)', overflow: 'hidden'
              }}
            >
              {/* Header */}
              <div style={{ padding: '11px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12.5, fontWeight: 700, color: 'white' }}>
                  Notifications {unreadCount > 0 && <span style={{ fontSize: 11, color: '#FF7A00', fontWeight: 700 }}>({unreadCount})</span>}
                </span>
                {unreadCount > 0 && (
                  <button onClick={markAllRead} style={{ fontSize: 10.5, color: '#00A3E0', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    Mark all read
                  </button>
                )}
              </div>

              {/* List */}
              {notifs.length === 0
                ? <div style={{ padding: '28px 14px', textAlign: 'center', color: 'rgba(255,255,255,0.2)', fontSize: 12.5 }}>No notifications yet.</div>
                : notifs.map((n) => (
                <div
                  key={n._id}
                  onClick={() => handleClick(n)}
                  style={{
                    display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 14px',
                    borderBottom: '1px solid rgba(255,255,255,0.04)', cursor: 'pointer',
                    background: n.read ? 'transparent' : 'rgba(255,255,255,0.025)',
                    transition: 'background 0.15s'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                  onMouseLeave={e => e.currentTarget.style.background = n.read ? 'transparent' : 'rgba(255,255,255,0.025)'}
                >
                  <div style={{ width: 7, height: 7, borderRadius: '50%', background: n.read ? 'rgba(255,255,255,0.15)' : n.color, marginTop: 5, flexShrink: 0, boxShadow: n.read ? 'none' : `0 0 6px ${n.color}` }} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 12.5, fontWeight: n.read ? 500 : 700, color: n.read ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.85)', marginBottom: 2 }}>{n.name}</div>
                    <div style={{ fontSize: 11.5, color: 'rgba(255,255,255,0.32)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.msg}</div>
                  </div>
                  <span style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.22)', flexShrink: 0, marginTop: 1 }}>{timeAgo(n.createdAt)}</span>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Avatar */}
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
    <div className="flex h-screen overflow-hidden" style={{ background: '#080f2e' }}>

      {/* ── Desktop Sidebar ── */}
      <aside
        className="hidden md:flex flex-col w-56 flex-shrink-0"
        style={{
          background: 'linear-gradient(180deg, #0B1D51 0%, #091640 100%)',
          borderRight: '1px solid rgba(255,255,255,0.055)'
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
                background: 'linear-gradient(180deg, #0B1D51 0%, #091640 100%)',
                borderRight: '1px solid rgba(255,255,255,0.055)'
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
          className="flex items-center justify-between px-5 flex-shrink-0"
          style={{
            height: 60,
            background: 'rgba(11,29,81,0.75)',
            borderBottom: '1px solid rgba(255,255,255,0.055)',
            backdropFilter: 'blur(16px)',
            overflow: 'visible',
            position: 'relative',
            zIndex: 50
          }}
        >
          {/* Left */}
          <div className="flex items-center gap-3">
            <button
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
            >
              <Menu size={20} color="rgba(255,255,255,0.7)" />
            </button>
          
            
          </div>

          {/* Right */}
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
