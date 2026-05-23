import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Users, MessageSquare, TrendingUp, HandCoins, ArrowUpRight, Gift } from 'lucide-react'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { dashboardApi } from '../api'

const S = {
  New: { bg: 'rgba(255,122,0,0.12)', color: '#FF7A00', border: 'rgba(255,122,0,0.25)' },
  Contacted: { bg: 'rgba(0,163,224,0.12)', color: '#00A3E0', border: 'rgba(0,163,224,0.25)' },
  Converted: { bg: 'rgba(0,201,167,0.12)', color: '#00C9A7', border: 'rgba(0,201,167,0.25)' },
}

const ChartTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="glass" style={{ padding: '8px 12px' }}>
      <p style={{ color: 'var(--text-dim)', fontSize: 10.5, marginBottom: 3 }}>{label}</p>
      {payload.map(p => <p key={p.name} style={{ color: p.color, fontSize: 12.5, fontWeight: 700 }}>{p.name}: {p.value}</p>)}
    </div>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([dashboardApi.stats(), dashboardApi.recentContacts()])
      .then(([s, r]) => { setStats(s); setRecent(r) })
      .finally(() => setLoading(false))
  }, [])

  const STATS = stats ? [
    { label: 'Total Contacts', value: stats.totalContacts, icon: Users, color: '#FF7A00' },
    { label: 'Total Queries', value: stats.totalQueries, icon: MessageSquare, color: '#00A3E0' },
    { label: 'Quote Requests', value: stats.totalQuotes, icon: HandCoins, color: '#FFB800' },
    { label: 'Conversions', value: stats.conversions, icon: TrendingUp, color: '#00C9A7' },
    { label: 'Total Referrals', value: stats.totalReferrals || 0, icon: Gift, color: '#10B981' },
  ] : []

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
      <div style={{ width: 32, height: 32, border: '3px solid rgba(255,122,0,0.2)', borderTopColor: '#FF7A00', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
    </div>
  )

  return (
    <div className="flex flex-col gap-6">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        {STATS.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
            className="glass stat-card" style={{ padding: '20px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${s.color}15`, border: `1px solid ${s.color}28` }}>
                <s.icon size={18} color={s.color} />
              </div>
              <ArrowUpRight size={13} color="var(--text-label)" />
            </div>
            <div className="font-orbitron font-black" style={{ fontSize: 28, color: s.color, lineHeight: 1, marginBottom: '12px' }}>{s.value}</div>
            <div style={{ color: 'var(--text-dim)', fontSize: 13 }}>{s.label}</div>
          </motion.div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 16, alignItems: 'start' }} className="split-tablet">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass" style={{ padding: '20px' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--text-main)' }}>Leads Overview</div>
              <div style={{ color: 'var(--text-label)', fontSize: 12, marginTop: 2 }}>Contacts & Queries — Last 8 months</div>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={stats?.chartData ?? []} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="cG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF7A00" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#FF7A00" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="qG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00A3E0" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#00A3E0" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-card)" vertical={false} />
              <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-label)', fontSize: 11 }} />
              <YAxis axisLine={false} tickLine={false} tick={{ fill: 'var(--text-label)', fontSize: 11 }} />
              <Tooltip content={<ChartTip />} />
              <Area type="monotone" dataKey="contacts" stroke="#FF7A00" strokeWidth={2.5} fill="url(#cG)" />
              <Area type="monotone" dataKey="queries" stroke="#00A3E0" strokeWidth={2.5} fill="url(#qG)" />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass" style={{ padding: '18px' }}>
          <div style={{ fontWeight: 700, fontSize: 14.5, color: 'var(--text-main)', marginBottom: 16 }}>Recent Contacts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {recent.length === 0
              ? <div style={{ color: 'var(--text-label)', fontSize: 13, textAlign: 'center', padding: '20px 0' }}>No contacts yet.</div>
              : recent.map((c) => (
                <div key={c._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#FF7A00,#FFB800)', color: 'white' }}>
                      {c.name?.[0] ?? '?'}
                    </div>
                    <div>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: 'var(--text-main)' }}>{c.name}</div>
                      <div style={{ fontSize: 10.5, color: 'var(--text-dim)' }}>{c.city}</div>
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
