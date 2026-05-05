import React, { useState, useEffect, useRef } from 'react'
import Logo from '../../public/urbanlogo.png'
import MDEditor from '@uiw/react-md-editor'
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import {
  FaUsers, FaComments, FaBlog, FaPenNib, FaRocket,
  FaPhoneAlt, FaEnvelope, FaMapMarkerAlt, FaRupeeSign, FaCalendarAlt,
  FaTrash, FaEdit, FaSave, FaUser, FaEye, FaChartPie,
  FaAddressBook, FaStar, FaCheckCircle, FaArrowUp, FaSearch,
  FaSignOutAlt, FaTimes, FaBook, FaPlus
} from "react-icons/fa"

const API = import.meta.env.VITE_API_URL
const getToken = () => localStorage.getItem('token')
const authHeaders = () => ({ 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` })

const CHART_QUERIES = [
  { month: 'Jan', contacts: 38, queries: 22, conversions: 14 },
  { month: 'Feb', contacts: 52, queries: 31, conversions: 19 },
  { month: 'Mar', contacts: 61, queries: 38, conversions: 24 },
  { month: 'Apr', contacts: 78, queries: 45, conversions: 31 },
  { month: 'May', contacts: 45, queries: 28, conversions: 18 },
]

const CHART_CITY = [
  { city: 'Lucknow', value: 38 },
  { city: 'Kanpur', value: 24 },
  { city: 'Agra', value: 18 },
  { city: 'Varanasi', value: 12 },
  { city: 'Others', value: 8 },
]

const CHART_STATUS = [
  { name: 'New', value: 42, color: '#FF7A00' },
  { name: 'Contacted', value: 31, color: '#FFC107' },
  { name: 'Converted', value: 27, color: '#16a34a' },
]

const BLOG_CATEGORIES = ['Government Schemes', 'Product Guide', 'Installation', 'Finance', 'Commercial', 'Maintenance', 'News']

// ══════════════════════════════════════════════════════
//  THEME
// ══════════════════════════════════════════════════════
const S = {
  navy: '#0B1F3A',
  navyLight: '#122944',
  navyBorder: 'rgba(255,255,255,0.08)',
  sideText: 'rgba(255,255,255,0.85)',
  sideTextMuted: 'rgba(255,255,255,0.45)',
  sideTextDim: 'rgba(255,255,255,0.25)',
  bg: '#F4F6FA',
  card: '#FFFFFF',
  cardBorder: '#E8ECF4',
  cardBorderHover: '#FF7A00',
  cardShadow: '0 2px 12px rgba(11,31,58,0.07)',
  cardShadowHover: '0 8px 32px rgba(255,122,0,0.18)',
  text: '#0B1F3A',
  textMuted: '#64748b',
  textDim: '#94a3b8',
  inputBg: '#F8FAFF',
  inputBorder: '#E2E8F4',
  orange: '#FF7A00',
  orangeLight: 'rgba(255,122,0,0.10)',
  orangeBorder: 'rgba(255,122,0,0.3)',
  yellow: '#F59E0B',
  green: '#16a34a',
  greenLight: 'rgba(22,163,74,0.10)',
  red: '#dc2626',
  redLight: 'rgba(220,38,38,0.10)',
  blue: '#2563eb',
  blueLight: 'rgba(37,99,235,0.10)',
}

// ══════════════════════════════════════════════════════
//  HELPERS
// ══════════════════════════════════════════════════════
const Badge = ({ label }) => {
  const map = {
    new: { bg: 'rgba(255,122,0,0.12)', color: '#FF7A00', border: 'rgba(255,122,0,0.25)' },
    contacted: { bg: 'rgba(245,158,11,0.12)', color: '#d97706', border: 'rgba(245,158,11,0.25)' },
    converted: { bg: 'rgba(22,163,74,0.12)', color: '#16a34a', border: 'rgba(22,163,74,0.25)' },
    open: { bg: 'rgba(220,38,38,0.10)', color: '#dc2626', border: 'rgba(220,38,38,0.22)' },
    resolved: { bg: 'rgba(22,163,74,0.12)', color: '#16a34a', border: 'rgba(22,163,74,0.25)' },
    'in-progress': { bg: 'rgba(37,99,235,0.10)', color: '#2563eb', border: 'rgba(37,99,235,0.22)' },
    published: { bg: 'rgba(22,163,74,0.12)', color: '#16a34a', border: 'rgba(22,163,74,0.25)' },
    draft: { bg: 'rgba(100,116,139,0.10)', color: '#64748b', border: 'rgba(100,116,139,0.22)' },
    high: { bg: 'rgba(220,38,38,0.10)', color: '#dc2626', border: 'rgba(220,38,38,0.22)' },
    medium: { bg: 'rgba(245,158,11,0.12)', color: '#d97706', border: 'rgba(245,158,11,0.25)' },
    low: { bg: 'rgba(22,163,74,0.12)', color: '#16a34a', border: 'rgba(22,163,74,0.25)' },
  }
  const s = map[label] || { bg: '#f1f5f9', color: '#64748b', border: '#e2e8f0' }
  return (
    <span style={{
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      fontSize: 11, fontWeight: 700, padding: '3px 10px',
      borderRadius: 999, textTransform: 'capitalize', whiteSpace: 'nowrap',
      fontFamily: 'Outfit, sans-serif', letterSpacing: '0.03em'
    }}>
      {label}
    </span>
  )
}

const StatCard = ({ icon, label, value, sub, color, bgColor }) => {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: hov ? color : S.card,
        border: `1.5px solid ${hov ? color : S.cardBorder}`,
        borderRadius: 18, padding: '22px 24px',
        boxShadow: hov ? `0 12px 40px ${color}30` : S.cardShadow,
        transition: 'all 0.25s cubic-bezier(.4,0,.2,1)',
        cursor: 'default', position: 'relative', overflow: 'hidden',
      }}
    >
      <div style={{
        position: 'absolute', top: -16, right: -16, width: 80, height: 80,
        borderRadius: '50%', background: hov ? 'rgba(255,255,255,0.15)' : bgColor,
        transition: 'all 0.25s'
      }} />
      <div style={{ fontSize: 26, marginBottom: 10 }}>{icon}</div>
      <div style={{
        fontFamily: 'Outfit,sans-serif', fontSize: 32, fontWeight: 900,
        color: hov ? '#fff' : color, lineHeight: 1, transition: 'color 0.2s'
      }}>{value}</div>
      <div style={{ color: hov ? 'rgba(255,255,255,0.9)' : S.text, fontSize: 14, fontWeight: 700, marginTop: 5, transition: 'color 0.2s' }}>{label}</div>
      {sub && <div style={{ color: hov ? 'rgba(255,255,255,0.65)' : S.textMuted, fontSize: 12, marginTop: 3, transition: 'color 0.2s' }}>{sub}</div>}
    </div>
  )
}

const Card = ({ children, style = {}, hoverable = true }) => {
  const [hov, setHov] = useState(false)
  return (
    <div
      onMouseEnter={() => hoverable && setHov(true)}
      onMouseLeave={() => hoverable && setHov(false)}
      style={{
        background: S.card,
        border: `1.5px solid ${hov ? S.cardBorderHover : S.cardBorder}`,
        borderRadius: 16,
        boxShadow: hov ? S.cardShadowHover : S.cardShadow,
        transition: 'all 0.22s cubic-bezier(.4,0,.2,1)',
        ...style
      }}
    >
      {children}
    </div>
  )
}

const Input = ({ label, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    {label && <label style={{ color: S.textMuted, fontSize: 11, fontWeight: 700, fontFamily: 'Outfit,sans-serif', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</label>}
    <input {...props} style={{
      background: S.inputBg, border: `1.5px solid ${S.inputBorder}`,
      borderRadius: 10, padding: '10px 14px', color: S.text, fontSize: 14,
      fontFamily: 'Outfit,sans-serif', outline: 'none', width: '100%',
      transition: 'border-color 0.15s, box-shadow 0.15s', ...props.style
    }}
      onFocus={e => { e.target.style.borderColor = S.orange; e.target.style.boxShadow = '0 0 0 3px rgba(255,122,0,0.12)' }}
      onBlur={e => { e.target.style.borderColor = S.inputBorder; e.target.style.boxShadow = 'none' }}
    />
  </div>
)

const Textarea = ({ label, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    {label && <label style={{ color: S.textMuted, fontSize: 11, fontWeight: 700, fontFamily: 'Outfit,sans-serif', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</label>}
    <textarea {...props} style={{
      background: S.inputBg, border: `1.5px solid ${S.inputBorder}`,
      borderRadius: 10, padding: '10px 14px', color: S.text, fontSize: 14,
      fontFamily: 'Outfit,sans-serif', outline: 'none', resize: 'vertical',
      minHeight: 120, width: '100%', transition: 'border-color 0.15s, box-shadow 0.15s', ...props.style
    }}
      onFocus={e => { e.target.style.borderColor = S.orange; e.target.style.boxShadow = '0 0 0 3px rgba(255,122,0,0.12)' }}
      onBlur={e => { e.target.style.borderColor = S.inputBorder; e.target.style.boxShadow = 'none' }}
    />
  </div>
)

const Select = ({ label, children, ...props }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    {label && <label style={{ color: S.textMuted, fontSize: 11, fontWeight: 700, fontFamily: 'Outfit,sans-serif', textTransform: 'uppercase', letterSpacing: '0.07em' }}>{label}</label>}
    <select {...props} style={{
      background: S.inputBg, border: `1.5px solid ${S.inputBorder}`,
      borderRadius: 10, padding: '10px 14px', color: S.text, fontSize: 14,
      fontFamily: 'Outfit,sans-serif', outline: 'none', width: '100%',
      transition: 'border-color 0.15s', cursor: 'pointer', ...props.style
    }}
      onFocus={e => { e.target.style.borderColor = S.orange }}
      onBlur={e => { e.target.style.borderColor = S.inputBorder }}
    >
      {children}
    </select>
  </div>
)

const Btn = ({ children, variant = 'primary', onClick, style = {}, size = 'md' }) => {
  const [hov, setHov] = useState(false)
  const base = {
    border: 'none', borderRadius: 10, cursor: 'pointer',
    fontFamily: 'Outfit,sans-serif', fontWeight: 700,
    fontSize: size === 'sm' ? 12 : 14,
    padding: size === 'sm' ? '6px 14px' : '10px 20px',
    transition: 'all 0.15s', display: 'inline-flex', alignItems: 'center', gap: 6,
  }
  const variants = {
    primary: { background: hov ? '#e06900' : S.orange, color: '#fff', boxShadow: hov ? '0 4px 16px rgba(255,122,0,0.35)' : 'none' },
    secondary: { background: hov ? '#f1f5f9' : '#fff', border: `1.5px solid ${S.cardBorder}`, color: S.text, boxShadow: hov ? S.cardShadow : 'none' },
    danger: { background: hov ? '#fef2f2' : S.redLight, border: '1.5px solid rgba(220,38,38,0.25)', color: S.red },
    success: { background: hov ? '#f0fdf4' : S.greenLight, border: '1.5px solid rgba(22,163,74,0.25)', color: S.green },
  }
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{ ...base, ...variants[variant], ...style }}
    >
      {children}
    </button>
  )
}

const ChartTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div style={{ background: '#fff', border: `1.5px solid ${S.cardBorder}`, borderRadius: 10, padding: '10px 14px', boxShadow: S.cardShadow }}>
      <div style={{ color: S.text, fontSize: 13, fontWeight: 700, marginBottom: 6, fontFamily: 'Outfit,sans-serif' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ color: p.color, fontSize: 12, fontFamily: 'Outfit,sans-serif' }}>
          {p.name}: <b>{p.value}</b>
        </div>
      ))}
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  DASHBOARD
// ══════════════════════════════════════════════════════
function Dashboard({ contacts, queries, blogs }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
        <StatCard icon={<FaUsers color="#FF7A00" />} label="Total Contacts" value={contacts.length} sub="All time leads" color={S.orange} bgColor="rgba(255,122,0,0.08)" />
        <StatCard icon={<FaComments color="#FF7A00" />} label="Open Queries" value={queries.filter(q => q.status === 'open').length} sub="Needs response" color={S.red} bgColor={S.redLight} />
        <StatCard icon={<FaPenNib color="#FF7A00" />} label="Published Blogs" value={blogs.filter(b => b.status === 'published').length} sub={`${blogs.filter(b => b.status === 'draft').length} drafts`} color={S.blue} bgColor={S.blueLight} />
        <StatCard icon={<FaRocket color="#FF7A00" />} label="Conversions" value={contacts.filter(c => c.status === 'converted').length} sub="Closed deals" color={S.green} bgColor={S.greenLight} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <Card style={{ padding: 24 }}>
          <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: 15, fontWeight: 800, color: S.text, marginBottom: 3 }}>Monthly Overview</div>
          <div style={{ color: S.textMuted, fontSize: 12, marginBottom: 20 }}>Contacts · Queries · Conversions</div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={CHART_QUERIES}>
              <defs>
                <linearGradient id="cGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={S.orange} stopOpacity={0.2} /><stop offset="95%" stopColor={S.orange} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="qGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={S.yellow} stopOpacity={0.2} /><stop offset="95%" stopColor={S.yellow} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="cnGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={S.green} stopOpacity={0.2} /><stop offset="95%" stopColor={S.green} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fill: S.textMuted, fontSize: 12, fontFamily: 'Outfit,sans-serif' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: S.textMuted, fontSize: 12, fontFamily: 'Outfit,sans-serif' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Area type="monotone" dataKey="contacts" name="Contacts" stroke={S.orange} fill="url(#cGrad)" strokeWidth={2.5} dot={{ fill: S.orange, r: 4, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="queries" name="Queries" stroke={S.yellow} fill="url(#qGrad)" strokeWidth={2.5} dot={{ fill: S.yellow, r: 4, strokeWidth: 0 }} />
              <Area type="monotone" dataKey="conversions" name="Conversions" stroke={S.green} fill="url(#cnGrad)" strokeWidth={2.5} dot={{ fill: S.green, r: 4, strokeWidth: 0 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{ padding: 24 }}>
          <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: 15, fontWeight: 800, color: S.text, marginBottom: 3 }}>Lead Status</div>
          <div style={{ color: S.textMuted, fontSize: 12, marginBottom: 12 }}>Distribution</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={CHART_STATUS} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                {CHART_STATUS.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip content={<ChartTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 10 }}>
            {CHART_STATUS.map(s => (
              <div key={s.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 9, height: 9, borderRadius: '50%', background: s.color }} />
                  <span style={{ color: S.textMuted, fontSize: 13, fontFamily: 'Outfit,sans-serif' }}>{s.name}</span>
                </div>
                <span style={{ color: S.text, fontSize: 13, fontWeight: 800, fontFamily: 'Outfit,sans-serif' }}>{s.value}%</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <Card style={{ padding: 24 }}>
          <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: 15, fontWeight: 800, color: S.text, marginBottom: 3 }}>Blog Performance</div>
          <div style={{ color: S.textMuted, fontSize: 12, marginBottom: 20 }}>Views by post</div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={blogs.filter(b => b.status === 'published').map(b => ({ name: b.title.slice(0, 16) + '…', views: b.views }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="name" tick={{ fill: S.textMuted, fontSize: 10, fontFamily: 'Outfit,sans-serif' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: S.textMuted, fontSize: 11, fontFamily: 'Outfit,sans-serif' }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="views" name="Views" fill={S.orange} radius={[7, 7, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card style={{ padding: 24 }}>
          <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: 15, fontWeight: 800, color: S.text, marginBottom: 3 }}>Leads by City</div>
          <div style={{ color: S.textMuted, fontSize: 12, marginBottom: 18 }}>Top cities</div>
          {CHART_CITY.map((c, i) => (
            <div key={c.city} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ color: S.text, fontSize: 13, fontFamily: 'Outfit,sans-serif', fontWeight: 600 }}>{c.city}</span>
                <span style={{ color: S.textMuted, fontSize: 12, fontFamily: 'Outfit,sans-serif' }}>{c.value}%</span>
              </div>
              <div style={{ height: 7, background: '#f1f5f9', borderRadius: 999, overflow: 'hidden' }}>
                <div style={{ height: '100%', borderRadius: 999, width: `${c.value}%`, background: i === 0 ? S.orange : i === 1 ? S.yellow : `rgba(255,122,0,${0.55 - i * 0.1})`, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          ))}
        </Card>
      </div>

      <Card style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ fontFamily: 'Outfit,sans-serif', fontSize: 15, fontWeight: 800, color: S.text }}>Recent Contacts</div>
          <Badge label="new" />
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#F8FAFF' }}>
              {['Name', 'City', 'Monthly Bill', 'Date', 'Status'].map(h => (
                <th key={h} style={{ color: S.textMuted, fontSize: 11, fontWeight: 700, textAlign: 'left', padding: '10px 14px', fontFamily: 'Outfit,sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em', borderBottom: `1.5px solid ${S.cardBorder}` }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {contacts.slice(0, 5).map((c, i) => (
              <tr key={c._id} style={{ background: i % 2 === 0 ? '#fff' : '#FAFBFF', transition: 'background 0.15s' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,122,0,0.04)'}
                onMouseLeave={e => e.currentTarget.style.background = i % 2 === 0 ? '#fff' : '#FAFBFF'}
              >
                <td style={{ padding: '12px 14px', color: S.text, fontSize: 13, fontFamily: 'Outfit,sans-serif', fontWeight: 700, borderBottom: `1px solid ${S.cardBorder}` }}>{c.fullName}</td>
                <td style={{ padding: '12px 14px', color: S.textMuted, fontSize: 13, fontFamily: 'Outfit,sans-serif', borderBottom: `1px solid ${S.cardBorder}` }}>{c.city}</td>
                <td style={{ padding: '12px 14px', color: S.orange, fontSize: 13, fontFamily: 'Outfit,sans-serif', fontWeight: 700, borderBottom: `1px solid ${S.cardBorder}` }}>₹{c.monthlyBill}</td>
                <td style={{ padding: '12px 14px', color: S.textDim, fontSize: 12, fontFamily: 'Outfit,sans-serif', borderBottom: `1px solid ${S.cardBorder}` }}>{c.createdAt?.slice(0, 10)}</td>
                <td style={{ padding: '12px 14px', borderBottom: `1px solid ${S.cardBorder}` }}><Badge label={c.status || 'new'} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  CONTACTS
// ══════════════════════════════════════════════════════
function Contacts({ contacts, setContacts }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const filtered = contacts.filter(c => {
    const m = (c.fullName || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.city || '').toLowerCase().includes(search.toLowerCase()) ||
      (c.email || '').toLowerCase().includes(search.toLowerCase())
    return m && (filter === 'all' || c.status === filter)
  })

  const updateStatus = (id, status) => {
    setContacts(prev => prev.map(c => c._id === id ? { ...c, status } : c))
    if (selected?._id === id) setSelected(p => ({ ...p, status }))
  }
  const deleteContact = async id => {
    await fetch(`${API}/contact/${id}`, { method: 'DELETE', headers: authHeaders() })
    setContacts(prev => prev.filter(c => c._id !== id))
    setSelected(null)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <FaSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: S.textDim, fontSize: 13, pointerEvents: 'none' }} />
          <input
            placeholder="Search contacts..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', background: '#fff', border: `1.5px solid ${S.cardBorder}`, borderRadius: 10, padding: '9px 14px 9px 36px', color: S.text, fontSize: 14, fontFamily: 'Outfit,sans-serif', outline: 'none', boxShadow: S.cardShadow, boxSizing: 'border-box' }}
            onFocus={e => { e.target.style.borderColor = S.orange; e.target.style.boxShadow = '0 0 0 3px rgba(255,122,0,0.1)' }}
            onBlur={e => { e.target.style.borderColor = S.cardBorder; e.target.style.boxShadow = S.cardShadow }}
          />
        </div>
        {['all', 'new', 'contacted', 'converted'].map(f => (
          <Btn key={f} variant={filter === f ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Btn>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {filtered.map(c => (
          <div key={c._id} onClick={() => setSelected(c)}
            style={{
              background: '#fff', border: `1.5px solid ${S.cardBorder}`,
              borderRadius: 14, padding: '14px 16px', cursor: 'pointer',
              boxShadow: S.cardShadow, transition: 'all 0.18s',
              display: 'flex', alignItems: 'center', gap: 14,
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = S.orange; e.currentTarget.style.boxShadow = S.cardShadowHover }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = S.cardBorder; e.currentTarget.style.boxShadow = S.cardShadow }}
          >
            <div style={{
              width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,122,0,0.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: S.orange, fontWeight: 800, fontSize: 16, fontFamily: 'Outfit,sans-serif', flexShrink: 0
            }}>{(c.fullName || 'U').charAt(0)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: S.text, fontSize: 14, fontWeight: 700, fontFamily: 'Outfit,sans-serif' }}>{c.fullName}</div>
              <div style={{ color: S.textMuted, fontSize: 12, fontFamily: 'Outfit,sans-serif' }}>{c.city} · ₹{c.monthlyBill}/mo</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 5 }}>
              <Badge label={c.status || 'new'} />
              <span style={{ color: S.textDim, fontSize: 11 }}>{c.createdAt?.slice(0, 10)}</span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ textAlign: 'center', color: S.textMuted, padding: 40, fontFamily: 'Outfit,sans-serif', gridColumn: '1/-1' }}>No contacts found</div>}
      </div>

      {/* MODAL */}
      {selected && (
        <div onClick={() => setSelected(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}
        >
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 20, padding: 28, width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 22 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 52, height: 52, borderRadius: '50%', background: S.orange, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 900, fontSize: 20, boxShadow: '0 4px 16px rgba(255,122,0,0.35)' }}>
                  {(selected.fullName || 'U').charAt(0)}
                </div>
                <div>
                  <div style={{ color: S.text, fontSize: 17, fontWeight: 800, fontFamily: 'Outfit,sans-serif' }}>{selected.fullName}</div>
                  <Badge label={selected.status || 'new'} />
                </div>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.textMuted }}>
                <FaTimes />
              </button>
            </div>

            {[
              { icon: <FaPhoneAlt style={{ color: S.orange, fontSize: 11 }} />, label: 'Phone', val: selected.phoneNumber },
              { icon: <FaEnvelope style={{ color: S.orange, fontSize: 11 }} />, label: 'Email', val: selected.email },
              { icon: <FaMapMarkerAlt style={{ color: S.orange, fontSize: 11 }} />, label: 'City', val: selected.city },
              { icon: <FaRupeeSign style={{ color: S.orange, fontSize: 11 }} />, label: 'Monthly Bill', val: `₹${selected.monthlyBill}` },
              { icon: <FaCalendarAlt style={{ color: S.orange, fontSize: 11 }} />, label: 'Date', val: selected.createdAt?.slice(0, 10) },
            ].map(row => (
              <div key={row.label} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${S.cardBorder}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: S.textMuted, fontSize: 11, fontFamily: 'Outfit,sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
                  {row.icon} {row.label}
                </div>
                <div style={{ color: S.text, fontSize: 13, fontFamily: 'Outfit,sans-serif', fontWeight: 600 }}>{row.val}</div>
              </div>
            ))}

            {selected.message && (
              <div style={{ marginBottom: 18 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: S.textMuted, fontSize: 11, fontFamily: 'Outfit,sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 6 }}>
                  <FaComments style={{ color: S.orange, fontSize: 11 }} /> Message
                </div>
                <div style={{ color: S.text, fontSize: 13, fontFamily: 'Outfit,sans-serif', lineHeight: 1.65, background: '#F8FAFF', borderRadius: 10, padding: 12, border: `1px solid ${S.cardBorder}` }}>{selected.message}</div>
              </div>
            )}

            <div style={{ marginBottom: 18 }}>
              <div style={{ color: S.textMuted, fontSize: 11, fontFamily: 'Outfit,sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Update Status</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['new', 'contacted', 'converted'].map(s => (
                  <Btn key={s} variant={selected.status === s ? 'primary' : 'secondary'} size="sm" onClick={() => updateStatus(selected._id, s)}>{s}</Btn>
                ))}
              </div>
            </div>

            <Btn variant="danger" onClick={() => deleteContact(selected._id)} style={{ width: '100%', justifyContent: 'center' }}>
              <FaTrash style={{ fontSize: 12 }} /> Delete Contact
            </Btn>
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  QUERIES
// ══════════════════════════════════════════════════════
function Queries({ queries, setQueries }) {
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)

  const filtered = queries.filter(q => {
    const m = (q.name || '').toLowerCase().includes(search.toLowerCase()) ||
      (q.requirement || '').toLowerCase().includes(search.toLowerCase())
    return m && (filter === 'all' || q.status === filter)
  })

  const updateQuery = (id, key, val) => {
    setQueries(prev => prev.map(q => q._id === id ? { ...q, [key]: val } : q))
    if (selected?._id === id) setSelected(p => ({ ...p, [key]: val }))
  }
  const deleteQuery = async id => {
    await fetch(`${API}/query/${id}`, { method: 'DELETE', headers: authHeaders() })
    setQueries(prev => prev.filter(q => q._id !== id))
    setSelected(null)
  }

  const priorityColor = { high: '#dc2626', medium: '#d97706', low: '#16a34a' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200, position: 'relative' }}>
          <FaSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: S.textDim, fontSize: 13, pointerEvents: 'none' }} />
          <input
            placeholder="Search queries..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', background: '#fff', border: `1.5px solid ${S.cardBorder}`, borderRadius: 10, padding: '9px 14px 9px 36px', color: S.text, fontSize: 14, fontFamily: 'Outfit,sans-serif', outline: 'none', boxShadow: S.cardShadow, boxSizing: 'border-box' }}
            onFocus={e => { e.target.style.borderColor = S.orange; e.target.style.boxShadow = '0 0 0 3px rgba(255,122,0,0.1)' }}
            onBlur={e => { e.target.style.borderColor = S.cardBorder; e.target.style.boxShadow = S.cardShadow }}
          />
        </div>
        {['all', 'open', 'in-progress', 'resolved'].map(f => (
          <Btn key={f} variant={filter === f ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter(f)}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Btn>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
        {filtered.map(q => (
          <div key={q._id} onClick={() => setSelected(q)}
            style={{
              background: '#fff', border: `1.5px solid ${S.cardBorder}`,
              borderRadius: 14, padding: '14px 16px', cursor: 'pointer',
              boxShadow: S.cardShadow, transition: 'all 0.18s',
            }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = S.orange; e.currentTarget.style.boxShadow = S.cardShadowHover }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = S.cardBorder; e.currentTarget.style.boxShadow = S.cardShadow }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: priorityColor[q.priority] || '#94a3b8', flexShrink: 0 }} />
                  <div style={{ color: S.text, fontSize: 14, fontWeight: 700, fontFamily: 'Outfit,sans-serif', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.requirement}</div>
                </div>
                <div style={{ color: S.textMuted, fontSize: 12, fontFamily: 'Outfit,sans-serif', marginBottom: 4 }}>{q.name} · {q.phone}</div>
                <div style={{ color: S.textDim, fontSize: 12, fontFamily: 'Outfit,sans-serif' }}>{q.city}</div>
              </div>
              <Badge label={q.status || 'open'} />
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div style={{ textAlign: 'center', color: S.textMuted, padding: 40, fontFamily: 'Outfit,sans-serif', gridColumn: '1/-1' }}>No queries found</div>}
      </div>

      {/* MODAL */}
      {selected && (
        <div onClick={() => setSelected(null)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: 20 }}
        >
          <div onClick={e => e.stopPropagation()}
            style={{ background: '#fff', borderRadius: 20, padding: 28, width: '100%', maxWidth: 460, boxShadow: '0 20px 60px rgba(0,0,0,0.25)', maxHeight: '90vh', overflowY: 'auto' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div>
                <div style={{ color: S.text, fontSize: 17, fontWeight: 800, fontFamily: 'Outfit,sans-serif', marginBottom: 6 }}>{selected.requirement}</div>
                <Badge label={selected.status || 'open'} />
              </div>
              <button onClick={() => setSelected(null)} style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: 32, height: 32, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: S.textMuted }}>
                <FaTimes />
              </button>
            </div>

            {[
              { icon: <FaUser style={{ color: S.orange, fontSize: 11 }} />, label: 'Name', val: selected.name },
              { icon: <FaPhoneAlt style={{ color: S.orange, fontSize: 11 }} />, label: 'Phone', val: selected.phone },
              { icon: <FaMapMarkerAlt style={{ color: S.orange, fontSize: 11 }} />, label: 'City', val: selected.city },
              { icon: <FaCalendarAlt style={{ color: S.orange, fontSize: 11 }} />, label: 'Date', val: selected.createdAt?.slice(0, 10) },
            ].map(row => (
              <div key={row.label} style={{ marginBottom: 14, paddingBottom: 14, borderBottom: `1px solid ${S.cardBorder}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: S.textMuted, fontSize: 11, fontFamily: 'Outfit,sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 3 }}>
                  {row.icon} {row.label}
                </div>
                <div style={{ color: S.text, fontSize: 13, fontFamily: 'Outfit,sans-serif', fontWeight: 600 }}>{row.val}</div>
              </div>
            ))}

            <div style={{ marginBottom: 18 }}>
              <div style={{ color: S.textMuted, fontSize: 11, fontFamily: 'Outfit,sans-serif', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 8 }}>Update Status</div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['open', 'in-progress', 'resolved'].map(s => (
                  <Btn key={s} variant={selected.status === s ? 'primary' : 'secondary'} size="sm" onClick={() => updateQuery(selected._id, 'status', s)}>{s}</Btn>
                ))}
              </div>
            </div>

            <Btn variant="danger" onClick={() => deleteQuery(selected._id)} style={{ width: '100%', justifyContent: 'center' }}>
              <FaTrash style={{ fontSize: 12 }} /> Delete Query
            </Btn>
          </div>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  BLOG EDITOR
// ══════════════════════════════════════════════════════
function BlogEditor({ blog, onSave, onCancel }) {
  const [form, setForm] = useState(blog || {
    title: '', slug: '', category: '', author: '', content: '', excerpt: '',
    tags: '', status: 'draft', featured: false, image: ''
  })
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSave = (forceStatus) => {
    if (!form.title || !form.content) return alert('Title aur Content required hai!')
    const tags = typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : form.tags
    const slug = form.slug || form.title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const status = forceStatus || form.status
    onSave({ ...form, tags, slug, status, views: form.views || 0, date: form.date || new Date().toISOString().slice(0, 10) })
  }

  return (
    <Card hoverable={false} style={{ padding: 28, maxHeight: 'calc(100vh - 150px)', overflowY: 'auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontFamily: 'Outfit,sans-serif', fontSize: 18, fontWeight: 800, color: S.text }}>
          {blog ? <FaEdit style={{ color: S.orange }} /> : <FaPenNib style={{ color: S.orange }} />}
          {blog ? 'Edit Blog Post' : 'New Blog Post'}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Btn variant="secondary" onClick={onCancel}>Cancel</Btn>
          <Btn variant="success" onClick={() => handleSave('published')}>
            <FaRocket style={{ fontSize: 12 }} /> Publish
          </Btn>
          <Btn variant="primary" onClick={() => handleSave()}>
            <FaSave style={{ fontSize: 12 }} /> Save Draft
          </Btn>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Input label="Blog Title *" value={form.title} onChange={e => { set('title', e.target.value); set('slug', e.target.value.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')) }} placeholder="How PM Surya Ghar Works in 2025" />
        <Input label="URL Slug" value={form.slug} onChange={e => set('slug', e.target.value)} placeholder="auto-generated-from-title" />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 16 }}>
        <Select label="Category" value={form.category} onChange={e => set('category', e.target.value)}>
          <option value="">Select category...</option>
          {BLOG_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
        </Select>
        <Input label="Author Name" value={form.author} onChange={e => set('author', e.target.value)} placeholder="Arjun Mehta" />
        <Select label="Status" value={form.status} onChange={e => set('status', e.target.value)}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </Select>
      </div>
      <div style={{ marginBottom: 16 }}>
        <Input label="Featured Image URL" value={form.image} onChange={e => set('image', e.target.value)} placeholder="https://example.com/image.jpg" />
      </div>
      {form.image && (
        <div style={{ marginBottom: 16 }}>
          <img src={form.image} alt="preview" style={{ width: '100%', height: 180, objectFit: 'cover', borderRadius: 12, border: `1.5px solid ${S.cardBorder}` }} onError={e => e.target.style.display = 'none'} />
        </div>
      )}
      <div style={{ marginBottom: 16 }}>
        <Textarea label="Short Excerpt (blog listing pe dikhega)" value={form.excerpt} onChange={e => set('excerpt', e.target.value)} placeholder="1-2 line description..." style={{ minHeight: 72 }} />
      </div>
      <div style={{ marginBottom: 16 }}>
        <label style={{ color: S.textMuted, fontSize: 11, fontWeight: 700, fontFamily: 'Outfit,sans-serif', textTransform: 'uppercase', letterSpacing: '0.07em', display: 'block', marginBottom: 8 }}>Full Blog Content *</label>
        <div data-color-mode="light">
          <MDEditor
            value={form.content}
            onChange={(val) => set('content', val || '')}
            height={380}
            preview="edit"
          />
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'end' }}>
        <Input label="Tags (comma separated)" value={typeof form.tags === 'string' ? form.tags : form.tags?.join(', ')} onChange={e => set('tags', e.target.value)} placeholder="solar, subsidy, government, UP" />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <label style={{ color: S.textMuted, fontSize: 11, fontWeight: 700, fontFamily: 'Outfit,sans-serif', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Featured</label>
          <div onClick={() => set('featured', !form.featured)}
            style={{ width: 52, height: 28, borderRadius: 999, cursor: 'pointer', transition: 'background 0.2s', background: form.featured ? S.orange : '#e2e8f0', position: 'relative', padding: 3 }}>
            <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#fff', transition: 'transform 0.2s', transform: form.featured ? 'translateX(24px)' : 'translateX(0)', boxShadow: '0 1px 4px rgba(0,0,0,0.2)' }} />
          </div>
        </div>
      </div>
      {form.title && (
        <div style={{ marginTop: 24, background: '#F8FAFF', border: `1.5px solid ${S.cardBorder}`, borderRadius: 12, padding: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: S.textMuted, fontSize: 11, fontFamily: 'Outfit,sans-serif', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 12, fontWeight: 700 }}>
            <FaBook style={{ color: S.orange, fontSize: 12 }} /> Card Preview
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' }}>
            {form.category && <span style={{ background: S.orangeLight, color: S.orange, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, fontFamily: 'Outfit,sans-serif' }}>{form.category}</span>}
            {form.featured && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(245,158,11,0.12)', color: S.yellow, fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 999, fontFamily: 'Outfit,sans-serif' }}>
                <FaStar style={{ fontSize: 9 }} /> Featured
              </span>
            )}
            <Badge label={form.status} />
          </div>
          <div style={{ color: S.text, fontSize: 16, fontWeight: 800, fontFamily: 'Outfit,sans-serif', marginBottom: 6, lineHeight: 1.3 }}>{form.title}</div>
          {form.excerpt && <div style={{ color: S.textMuted, fontSize: 13, fontFamily: 'Outfit,sans-serif', lineHeight: 1.6, marginBottom: 10 }}>{form.excerpt}</div>}
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(typeof form.tags === 'string' ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : form.tags || []).map(tag => (
              <span key={tag} style={{ background: '#e8ecf4', color: S.textMuted, fontSize: 11, padding: '2px 8px', borderRadius: 6, fontFamily: 'Outfit,sans-serif' }}>#{tag}</span>
            ))}
          </div>
        </div>
      )}
    </Card>
  )
}

// ══════════════════════════════════════════════════════
//  BLOGS
// ══════════════════════════════════════════════════════
function Blogs({ blogs, setBlogs }) {
  const [view, setView] = useState('list')
  const [editing, setEditing] = useState(null)
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')

  const filtered = blogs.filter(b => {
    const m = (b.title || '').toLowerCase().includes(search.toLowerCase()) || (b.category || '').toLowerCase().includes(search.toLowerCase())
    return m && (filter === 'all' || b.status === filter)
  })

  const handleSave = async data => {
    const token = getToken()
    if (editing?._id) {
      const res = await fetch(`${API}/blog/${editing._id}`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify(data)
      })
      const json = await res.json()
      if (json.success) setBlogs(prev => prev.map(b => b._id === editing._id ? json.data : b))
    } else {
      const res = await fetch(`${API}/blog/add`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify(data)
      })
      const json = await res.json()
      if (json.success) setBlogs(prev => [json.data, ...prev])
    }
    setView('list'); setEditing(null)
  }
  const deleteBlog = async id => {
    await fetch(`${API}/blog/${id}`, { method: 'DELETE', headers: authHeaders() })
    setBlogs(prev => prev.filter(b => b._id !== id))
  }
  const toggleStatus = async id => {
    const blog = blogs.find(b => b._id === id)
    const newStatus = blog.status === 'published' ? 'draft' : 'published'
    const res = await fetch(`${API}/blog/${id}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ status: newStatus })
    })
    const json = await res.json()
    if (json.success) setBlogs(prev => prev.map(b => b._id === id ? json.data : b))
  }

  if (view === 'editor') return <BlogEditor blog={editing} onSave={handleSave} onCancel={() => { setView('list'); setEditing(null) }} />

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', flex: 1 }}>
          <div style={{ flex: 1, minWidth: 200, maxWidth: 300, position: 'relative' }}>
            <FaSearch style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: S.textDim, fontSize: 13, pointerEvents: 'none' }} />
            <input
              placeholder="Search blogs..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ width: '100%', background: '#fff', border: `1.5px solid ${S.cardBorder}`, borderRadius: 10, padding: '9px 14px 9px 36px', color: S.text, fontSize: 14, fontFamily: 'Outfit,sans-serif', outline: 'none', boxShadow: S.cardShadow, boxSizing: 'border-box' }}
              onFocus={e => { e.target.style.borderColor = S.orange; e.target.style.boxShadow = '0 0 0 3px rgba(255,122,0,0.1)' }}
              onBlur={e => { e.target.style.borderColor = S.cardBorder; e.target.style.boxShadow = S.cardShadow }}
            />
          </div>
          {['all', 'published', 'draft'].map(f => (
            <Btn key={f} variant={filter === f ? 'primary' : 'secondary'} size="sm" onClick={() => setFilter(f)}>
              {f.charAt(0).toUpperCase() + f.slice(1)} {f !== 'all' && `(${blogs.filter(b => b.status === f).length})`}
            </Btn>
          ))}
        </div>
        <Btn variant="primary" onClick={() => { setEditing(null); setView('editor') }}>
          <FaPlus style={{ fontSize: 12 }} /> New Blog Post
        </Btn>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 18 }}>
        {filtered.map(b => (
          <Card key={b._id} style={{ overflow: 'hidden' }}>
            <div style={{
              height: 130,
              background: b.image ? 'none' : 'linear-gradient(135deg, #fff7ed, #fef3c7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative', overflow: 'hidden', borderBottom: `1px solid ${S.cardBorder}`
            }}>
              {b.image
                ? <img src={b.image} alt={b.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => e.target.style.display = 'none'} />
                : <FaPenNib style={{ fontSize: 36, color: S.orange, opacity: 0.35 }} />
              }
              {b.featured && (
                <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', alignItems: 'center', gap: 4, background: S.yellow, color: '#fff', fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 999, fontFamily: 'Outfit,sans-serif', boxShadow: '0 2px 8px rgba(245,158,11,0.4)' }}>
                  <FaStar style={{ fontSize: 9 }} /> FEATURED
                </div>
              )}
              <div style={{ position: 'absolute', top: 10, right: 10 }}>
                <Badge label={b.status} />
              </div>
            </div>
            <div style={{ padding: '16px 18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <span style={{ background: S.orangeLight, color: S.orange, fontSize: 10, fontWeight: 800, padding: '4px 10px', borderRadius: 999, fontFamily: 'Outfit,sans-serif', letterSpacing: '0.03em' }}>
                  {b.category || 'Uncategorized'}
                </span>
                <span style={{ color: S.textDim, fontSize: 11, fontFamily: 'Outfit,sans-serif' }}>{b.date}</span>
              </div>
              <div style={{ color: S.text, fontSize: 14, fontWeight: 800, fontFamily: 'Outfit,sans-serif', lineHeight: 1.35, marginBottom: 7 }}>{b.title}</div>
              <div style={{ color: S.textMuted, fontSize: 12, fontFamily: 'Outfit,sans-serif', lineHeight: 1.55, marginBottom: 12, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>{b.excerpt}</div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                {(b.tags || []).slice(0, 3).map(tag => (
                  <span key={tag} style={{ background: '#f1f5f9', color: S.textMuted, fontSize: 10, padding: '3px 9px', borderRadius: 6, fontFamily: 'Outfit,sans-serif', fontWeight: 600 }}>#{tag}</span>
                ))}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: `1px solid ${S.cardBorder}`, paddingTop: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: S.textMuted, fontSize: 11, fontFamily: 'Outfit,sans-serif' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FaUser style={{ fontSize: 10 }} /> {b.author}
                  </span>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <FaEye style={{ fontSize: 10 }} /> {b.views.toLocaleString()}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 7 }}>
                  <Btn variant="secondary" size="sm" onClick={() => { setEditing(b); setView('editor') }}>
                    <FaEdit style={{ fontSize: 11 }} />
                  </Btn>
                  <Btn variant={b.status === 'published' ? 'secondary' : 'success'} size="sm" onClick={() => toggleStatus(b._id)}>
                    {b.status === 'published' ? 'Unpublish' : <><FaRocket style={{ fontSize: 11 }} /> Publish</>}
                  </Btn>
                  <Btn variant="danger" size="sm" onClick={() => deleteBlog(b._id)}>
                    <FaTrash style={{ fontSize: 11 }} />
                  </Btn>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <FaPenNib style={{ fontSize: 44, color: S.textDim, marginBottom: 12 }} />
          <div style={{ color: S.textMuted, fontFamily: 'Outfit,sans-serif', fontSize: 15, marginBottom: 16 }}>No blog posts found</div>
          <Btn variant="primary" onClick={() => { setEditing(null); setView('editor') }}>
            <FaPlus style={{ fontSize: 12 }} /> Write First Post
          </Btn>
        </div>
      )}
    </div>
  )
}

// ══════════════════════════════════════════════════════
//  NAV 
// ══════════════════════════════════════════════════════
const NAV = [
  { id: 'dashboard', icon: <FaChartPie />, label: 'Dashboard' },
  { id: 'contacts', icon: <FaAddressBook />, label: 'Contacts' },
  { id: 'queries', icon: <FaComments />, label: 'Queries' },
  { id: 'blogs', icon: <FaPenNib />, label: 'Blogs' },
]

// ══════════════════════════════════════════════════════
//  ROOT
// ══════════════════════════════════════════════════════
export default function DashboardLayout() {
  const [page, setPage] = useState('dashboard')
  const [contacts, setContacts] = useState([])
  const [queries, setQueries] = useState([])
  const [blogs, setBlogs] = useState([])
  const [showProfile, setShowProfile] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [cRes, qRes, bRes] = await Promise.all([
          fetch(`${API}/contact`, { headers: authHeaders() }),
          fetch(`${API}/query`, { headers: authHeaders() }),
          fetch(`${API}/blog`, { headers: authHeaders() }),
        ])
        const [cData, qData, bData] = await Promise.all([cRes.json(), qRes.json(), bRes.json()])
        if (cData.success) setContacts(cData.data)
        if (qData.success) setQueries(qData.data)
        if (bData.success) setBlogs(bData.data)
      } catch (err) {
        console.error('Fetch error:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchAll()
  }, [])

  const badge = {
    contacts: contacts.filter(c => c.status === 'new').length,
    queries: queries.filter(q => q.status === 'open').length,
    blogs: blogs.filter(b => b.status === 'draft').length,
  }

  const currentNav = NAV.find(n => n.id === page)

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Outfit,sans-serif', color: S.textMuted, fontSize: 16 }}>
      Loading...
    </div>
  )

  return (
    <>
      <div style={{ display: 'flex', minHeight: '100vh', fontFamily: 'Outfit, sans-serif' }}>

        {/* ── SIDEBAR ── */}
        <div style={{
          width: 224, background: S.navy, borderRight: `1px solid ${S.navyBorder}`,
          display: 'flex', flexDirection: 'column', padding: '0 0 24px',
          flexShrink: 0, position: 'sticky', top: 0, height: '100vh'
        }}>
          <div style={{ padding: '22px 20px 18px', borderBottom: `1px solid ${S.navyBorder}` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <img src={Logo} className='w-10 object-contain' alt="" />
              <div>
                <div style={{ color: '#fff', fontWeight: 800, fontSize: 15, marginTop: 10, lineHeight: 1.1 }}>Urban <span style={{ color: S.orange }}>Energy</span></div>
                <div style={{ color: S.sideTextDim, fontSize: 10, fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' }}>Admin Panel</div>
              </div>
            </div>
          </div>

          <nav style={{ flex: 1, padding: '14px 10px', display: 'flex', flexDirection: 'column', gap: 3 }}>
            {NAV.map(item => {
              const active = page === item.id
              return (
                <button key={item.id} onClick={() => setPage(item.id)} style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  gap: 10, padding: '11px 13px', borderRadius: 11, border: 'none', cursor: 'pointer',
                  background: active ? 'linear-gradient(135deg, rgba(255,122,0,0.18), rgba(255,193,7,0.08))' : 'transparent',
                  color: active ? S.orange : S.sideTextMuted,
                  fontFamily: 'Outfit,sans-serif', fontSize: 14, fontWeight: 600,
                  transition: 'all 0.15s', textAlign: 'left', width: '100%',
                  borderLeft: active ? `3px solid ${S.orange}` : '3px solid transparent',
                }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.color = '#fff' } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = S.sideTextMuted } }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ fontSize: 15, display: 'flex', alignItems: 'center' }}>{item.icon}</span>
                    {item.label}
                  </span>
                  {badge[item.id] > 0 && (
                    <span style={{
                      background: item.id === 'queries' ? '#dc2626' : S.orange,
                      color: '#fff', fontSize: 10, fontWeight: 800, padding: '2px 8px',
                      borderRadius: 999, minWidth: 20, textAlign: 'center',
                      boxShadow: `0 2px 8px ${item.id === 'queries' ? 'rgba(220,38,38,0.4)' : 'rgba(255,122,0,0.4)'}`
                    }}>{badge[item.id]}</span>
                  )}
                </button>
              )
            })}
          </nav>

          <div style={{ padding: '14px 16px', borderTop: `1px solid ${S.navyBorder}`, display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div onClick={() => setShowProfile(true)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 34, height: 34, borderRadius: '50%', background: S.orange,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: '#fff', fontWeight: 800, fontSize: 13,
                boxShadow: '0 3px 10px rgba(255,122,0,0.35)'
              }}>A</div>
              <div>
                <div style={{ color: '#fff', fontSize: 13, fontWeight: 700 }}>Admin</div>
                <div style={{ color: S.sideTextDim, fontSize: 11 }}>Super Admin</div>
              </div>
            </div>
            <button
              onClick={() => { localStorage.removeItem('token'); window.location.href = '/' }}
              style={{
                width: '100%', padding: '9px', background: 'rgba(220,38,38,0.15)',
                border: '1px solid rgba(220,38,38,0.3)', borderRadius: 10, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                fontFamily: 'Outfit,sans-serif', fontSize: 13, fontWeight: 700, color: '#f87171',
                transition: 'all 0.15s'
              }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.28)' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220,38,38,0.15)' }}
            >
              <FaSignOutAlt style={{ fontSize: 13 }} /> Logout
            </button>
          </div>
        </div>

        {/* ── MAIN ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0, background: S.bg }}>
          {/* Topbar */}
          <div style={{
            background: '#fff', borderBottom: `1.5px solid ${S.cardBorder}`,
            padding: '14px 28px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 12px rgba(11,31,58,0.06)'
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: S.text, fontSize: 19, fontWeight: 900, fontFamily: 'Outfit,sans-serif' }}>
                <span style={{ color: S.orange, fontSize: 18, display: 'flex', alignItems: 'center' }}>{currentNav?.icon}</span>
                {currentNav?.label}
              </div>
              <div style={{ color: S.textDim, fontSize: 12, fontFamily: 'Outfit,sans-serif' }}>Urban Energy — Solar Admin</div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 7, background: 'rgba(22,163,74,0.08)', border: '1.5px solid rgba(22,163,74,0.22)', borderRadius: 999, padding: '5px 13px' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: S.green, boxShadow: '0 0 0 3px rgba(22,163,74,0.2)' }} />
                <span style={{ color: S.green, fontSize: 12, fontWeight: 700, fontFamily: 'Outfit,sans-serif' }}>Live</span>
              </div>
              <div style={{ color: S.textMuted, fontSize: 12, fontFamily: 'Outfit,sans-serif', fontWeight: 600 }}>
                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
            </div>
          </div>

          {/* Page content */}
          <div style={{ padding: 28, flex: 1, overflowY: 'auto' }}>
            {page === 'dashboard' && <Dashboard contacts={contacts} queries={queries} blogs={blogs} />}
            {page === 'contacts' && <Contacts contacts={contacts} setContacts={setContacts} />}
            {page === 'queries' && <Queries queries={queries} setQueries={setQueries} />}
            {page === 'blogs' && <Blogs blogs={blogs} setBlogs={setBlogs} />}
          </div>
        </div>

      </div>

      {/* ── PROFILE MODAL ── */}
      {showProfile && (
        <div
          onClick={() => setShowProfile(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{ width: 320, background: '#fff', borderRadius: 16, padding: 24, boxShadow: '0 10px 30px rgba(0,0,0,0.2)' }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ width: 50, height: 50, borderRadius: '50%', background: '#FF7A00', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 18 }}>A</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: S.text }}>Admin User</div>
                <div style={{ fontSize: 12, color: S.textMuted }}>Super Admin</div>
              </div>
            </div>

            {/* Info rows with react-icons */}
            {[
              { icon: <FaEnvelope style={{ color: S.orange, fontSize: 13 }} />, text: 'admin@urbanenergy.com' },
              { icon: <FaMapMarkerAlt style={{ color: S.orange, fontSize: 13 }} />, text: 'Lucknow, India' },
              { icon: <FaCheckCircle style={{ color: S.green, fontSize: 13 }} />, text: 'Status: Active' },
            ].map((row, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: S.text, marginBottom: 12, fontFamily: 'Outfit,sans-serif' }}>
                {row.icon} {row.text}
              </div>
            ))}

            <div style={{ borderTop: `1px solid ${S.cardBorder}`, marginTop: 8, paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <button
                style={{ width: '100%', padding: '10px', background: S.orange, color: '#fff', border: 'none', borderRadius: 10, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Outfit,sans-serif', fontSize: 14 }}
                onClick={() => { alert('Logged out!'); setShowProfile(false) }}
              >
                <FaSignOutAlt style={{ fontSize: 14 }} /> Logout
              </button>
              <button
                style={{ width: '100%', padding: '10px', background: '#eee', border: 'none', borderRadius: 10, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, fontFamily: 'Outfit,sans-serif', fontSize: 14, color: S.text }}
                onClick={() => setShowProfile(false)}
              >
                <FaTimes style={{ fontSize: 13 }} /> Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
