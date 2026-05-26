import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, Trash2, Eye, Phone, Mail, Briefcase, Download, X, FileText, Maximize2 } from 'lucide-react'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { applicationsApi } from '../api'

const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

const STATUS_STYLE = {
  New:         { bg: 'rgba(255,122,0,0.15)',   color: '#FF7A00',  border: 'rgba(255,122,0,0.3)' },
  Reviewed:    { bg: 'rgba(0,163,224,0.15)',   color: '#00A3E0',  border: 'rgba(0,163,224,0.3)' },
  Shortlisted: { bg: 'rgba(0,201,167,0.15)',   color: '#00C9A7',  border: 'rgba(0,201,167,0.3)' },
  Rejected:    { bg: 'rgba(239,68,68,0.15)',   color: '#f87171',  border: 'rgba(239,68,68,0.3)' },
}

export default function Applications() {
  const navigate = useNavigate()
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('All')

  useEffect(() => {
    applicationsApi.getAll()
      .then(setData)
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = data.filter(a => {
    const q = search.toLowerCase()
    return (
      (a.name?.toLowerCase().includes(q) || a.role?.toLowerCase().includes(q) || a.email?.toLowerCase().includes(q)) &&
      (filter === 'All' || a.status === filter)
    )
  })

  const del = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Application?', text: 'This action cannot be undone.', icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Delete', cancelButtonText: 'Cancel',
      background: '#0B1D51', color: '#ffffff', confirmButtonColor: '#ef4444', cancelButtonColor: 'rgba(255,255,255,0.08)',
    })
    if (result.isConfirmed) {
      try {
        await applicationsApi.delete(id)
        setData(d => d.filter(a => a._id !== id))
        toast.success('Application deleted.')
      } catch (e) { toast.error(e.message) }
    }
  }

  const downloadCv = (id) => {
    const token = localStorage.getItem('ue_token')
    fetch(`${BASE}/applications/${id}/cv`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (!res.ok) throw new Error('CV not found')
        const disposition = res.headers.get('Content-Disposition')
        const filename = disposition?.match(/filename="(.+)"/)?.[1] || 'cv'
        return res.blob().then(blob => ({ blob, filename }))
      })
      .then(({ blob, filename }) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = filename; a.click()
        URL.revokeObjectURL(url)
      })
      .catch(e => toast.error(e.message))
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Job <span className="glow-text">Applications</span></h1>
          <p className="page-subtitle">{data.length} total applications</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="relative" style={{ flex: '1 1 220px', maxWidth: 340 }}>
          <Search size={14} color="#94a3b8"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input className="input" style={{ paddingLeft: 36 }} placeholder="Search name, role or email..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All', 'New', 'Reviewed', 'Shortlisted', 'Rejected'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className="btn"
              style={{
                background: filter === f ? 'linear-gradient(135deg,#FFB800,#FF7A00)' : 'var(--bg-input)',
                color: filter === f ? 'white' : 'var(--text-dim)',
                border: filter === f ? 'none' : '1px solid var(--border-card)',
                padding: '8px 16px', fontSize: 12.5
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr><th>Applicant</th><th>Role</th><th>Status</th><th>CV</th><th>Date</th><th></th></tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>Loading...</td></tr>
                : filtered.length === 0
                  ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)', fontSize: 13 }}>No applications found.</td></tr>
                  : filtered.map((a, i) => (
                    <motion.tr key={a._id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      onClick={() => navigate(`/applications/${a._id}`)}
                      style={{ cursor: 'pointer' }}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg,#FF7A00,#FFB800)', color: 'white' }}>
                            {a.name?.[0] ?? '?'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: 'var(--text-main)', fontSize: 13 }}>{a.name}</div>
                            <div style={{ fontSize: 11, color: 'var(--text-dim)' }}>{a.email}</div>
                          </div>
                        </div>
                      </td>
                      <td style={{ color: 'var(--text-dim)', fontSize: 12.5 }}>{a.role}</td>
                      <td>
                        <span className="badge" style={{ background: STATUS_STYLE[a.status]?.bg, color: STATUS_STYLE[a.status]?.color, border: `1px solid ${STATUS_STYLE[a.status]?.border}` }}>
                           {a.status}
                        </span>
                      </td>
                      <td>
                        {a.cv?.filename
                          ? <button onClick={e => { e.stopPropagation(); downloadCv(a._id) }}
                              style={{ background: 'rgba(0,201,167,0.1)', border: '1px solid rgba(0,201,167,0.25)', borderRadius: 7, padding: '5px 9px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#00C9A7', fontWeight: 600 }}>
                              <Download size={11} /> CV
                            </button>
                          : <span style={{ fontSize: 11, color: 'var(--text-label)' }}>—</span>
                        }
                      </td>
                      <td style={{ color: 'var(--text-label)', fontSize: 11.5 }}>{new Date(a.createdAt).toLocaleDateString('en-IN')}</td>
                      <td>
                        <div className="flex gap-1.5 text-right justify-end">
                          <button onClick={e => { e.stopPropagation(); navigate(`/applications/${a._id}`) }}
                            style={{ background: 'rgba(0,163,224,0.1)', border: '1px solid rgba(0,163,224,0.2)', borderRadius: 7, padding: '5px 7px', cursor: 'pointer' }}>
                            <Eye size={12} color="#00A3E0" />
                          </button>
                          <button onClick={e => { e.stopPropagation(); del(a._id) }}
                            style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 7, padding: '5px 7px', cursor: 'pointer' }}>
                            <Trash2 size={12} color="#f87171" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
