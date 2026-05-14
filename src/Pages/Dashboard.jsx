import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, MessageSquare, TrendingUp, HandCoins, ArrowUpRight } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { dashboardApi } from '../api'

const S = {
  New:       { bg: 'rgba(255,122,0,0.12)',  color: '#FF7A00', border: 'rgba(255,122,0,0.25)'  },
  Contacted: { bg: 'rgba(0,163,224,0.12)', color: '#00A3E0', border: 'rgba(0,163,224,0.25)' },
  Converted: { bg: 'rgba(0,201,167,0.12)', color: '#00C9A7', border: 'rgba(0,201,167,0.25)' },
}

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass" style={{ padding: '8px 12px' }}>
      <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10.5, marginBottom: 3 }}>{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color, fontSize: 12.5, fontWeight: 700 }}>{p.name}: {p.value}</p>)}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats]     = useState(null)
  const [recent, setRecent]   = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([dashboardApi.stats(), dashboardApi.recentContacts()])
      .then(([s, r]) => { setStats(s); setRecent(r) })
      .finally(() => setLoading(false))
  }, [])

  const STATS = stats ? [
    { label: 'Total Contacts', value: stats.totalContacts, icon: Users,        color: '#FF7A00' },
    { label: 'Total Queries',  value: stats.totalQueries,  icon: MessageSquare, color: '#00A3E0' },
    { label: 'Conversions',    value: stats.conversions,   icon: TrendingUp,    color: '#00C9A7' },
    { label: 'Quote Requests', value: stats.totalQuotes,   icon: HandCoins,     color: '#FFB800' },
  ] : []

  if (loading) return (
    <div className="page" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ width: 32, height: 32, border: '3px solid rgba(255,122,0,0.2)', borderTopColor: '#FF7A00', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard <span className="glow-text">Overview</span></h1>
          <p className="page-subtitle">Welcome back! Here's what's happening.</p>
        </div>
      </div>

      <div className="grid-4">
        {STATS.map((s, i) => (
          <motion.div key={s.label}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="glass stat-card" style={{ padding: '18px' }}>
            <div className="flex items-start justify-between mb-3">
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: `${s.color}15`, border: `1px solid ${s.color}28` }}>
                <s.icon size={17} color={s.color} />
              </div>
              <ArrowUpRight size={13} color="rgba(0,201,167,0.5)" />
            </div>
            <div className="font-orbitron font-black" style={{ fontSize: 26, color: s.color, lineHeight: 1 }}>{s.value}</div>
            <div style={{ color: 'rgba(255,255,255,0.42)', fontSize: 12, marginTop: 5 }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }}>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass" style={{ padding: '20px' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <div style={{ fontWeight: 700, fontSize: 14.5, color: 'white' }}>Leads Overview</div>
              <div style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 2 }}>Contacts & Queries — Last 8 months</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats?.chartData ?? []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#FF7A00" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#FF7A00" stopOpacity={0}    />
                </linearGradient>
                <linearGradient id="qG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%"  stopColor="#00A3E0" stopOpacity={0.28} />
                  <stop offset="95%" stopColor="#00A3E0" stopOpacity={0}    />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.035)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'rgba(255,255,255,0.28)', fontSize: 11 }} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="contacts" stroke="#FF7A00" strokeWidth={2.5} fill="url(#cG)" />
              <Area type="monotone" dataKey="queries"  stroke="#00A3E0" strokeWidth={2.5} fill="url(#qG)" />
            </AreaChart>
          </ResponsiveContainer>
          <div className="flex gap-4 mt-3">
            {[['#FF7A00','Contacts'],['#00A3E0','Queries']].map(([c,l]) => (
              <div key={l} className="flex items-center gap-2">
                <span style={{ width: 12, height: 3, borderRadius: 2, background: c, display: 'inline-block' }} />
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11.5 }}>{l}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass" style={{ padding: '18px' }}>
          <div style={{ fontWeight: 700, fontSize: 14.5, color: 'white', marginBottom: 16 }}>Recent Contacts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {recent.length === 0
              ? <div style={{ color: 'rgba(255,255,255,0.2)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No contacts yet.</div>
              : recent.map((c) => (
                <div key={c._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#FF7A00,#FFB800)', color: 'white' }}>
                      {c.name?.[0] ?? '?'}
                    </div>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'white' }}>{c.name}</div>
                      <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.3)' }}>{c.city} · ₹{c.bill?.toLocaleString('en-IN')}/mo</div>
                    </div>
                  </div>
                  <span className="badge" style={{ background: S[c.status]?.bg, color: S[c.status]?.color, border: `1px solid ${S[c.status]?.border}` }}>
                    {c.status}
                  </span>
                </div>
              ))
            }
          </div>
        </motion.div>
      </div>
    </div>
  )
}
