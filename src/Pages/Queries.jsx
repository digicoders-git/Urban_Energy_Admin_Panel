import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Search, Trash2, Eye, Phone, MapPin, Zap, X, Maximize2 } from 'lucide-react'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { queriesApi } from '../api'

const S = {
  Pending: { bg: 'rgba(255,193,7,0.12)', color: '#FFC107', border: 'rgba(255,193,7,0.25)' },
  Reviewed: { bg: 'rgba(0,163,224,0.12)', color: '#00A3E0', border: 'rgba(0,163,224,0.25)' },
  Closed: { bg: 'rgba(0,201,167,0.12)', color: '#00C9A7', border: 'rgba(0,201,167,0.25)' },
}

export default function Queries() {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')

  useEffect(() => {
    queriesApi.getAll()
      .then(setData)
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = data.filter(q => {
    const qr = search.toLowerCase()
    return ((q.name?.toLowerCase() ?? '').includes(qr) || (q.city?.toLowerCase() ?? '').includes(qr)) &&
      (filter === 'All' || q.status === filter)
  })

  const del = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Query?', text: 'This action cannot be undone.', icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Delete', cancelButtonText: 'Cancel',
      background: '#0B1D51', color: '#ffffff', confirmButtonColor: '#ef4444', cancelButtonColor: 'rgba(255,255,255,0.08)',
    })
    if (result.isConfirmed) {
      try {
        await queriesApi.delete(id)
        setData(d => d.filter(q => q._id !== id))
        toast.success('Query deleted.')
      } catch (e) { toast.error(e.message) }
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Queries <span className="glow-text">Management</span></h1>
          <p className="page-subtitle">{data.length} calculator queries</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="relative" style={{ flex: '1 1 220px', maxWidth: 340 }}>
          <Search size={14} color="#94a3b8"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input className="input" style={{ paddingLeft: 36 }} placeholder="Search queries..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All', 'Pending', 'Reviewed', 'Closed'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className="btn"
              style={{
                background: filter === f ? 'linear-gradient(135deg,#FFB800,#FF7A00)' : 'rgba(255,255,255,0.06)',
                color: filter === f ? 'white' : 'rgba(255,255,255,0.5)',
                border: filter === f ? 'none' : '1px solid rgba(255,255,255,0.1)',
                padding: '8px 16px', fontSize: 12.5
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="glass" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr><th>Name</th><th>City</th><th>Requirement</th><th>Status</th><th>Date</th><th></th></tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>Loading...</td></tr>
                : filtered.length === 0
                  ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>No queries found.</td></tr>
                  : filtered.map((q, i) => (
                    <motion.tr key={q._id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      onClick={() => navigate(`/queries/${q._id}`)}
                      style={{ cursor: 'pointer' }}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg,#00A3E0,#00C9A7)', color: 'white' }}>
                            {q.name?.[0] ?? '?'}
                          </div>
                          <span style={{ fontWeight: 600, color: '#ffffff' }}>{q.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'rgba(255,255,255,0.6)' }}>{q.city}</td>
                      <td style={{ color: 'rgba(255,255,255,0.4)', maxWidth: 200 }}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.requirement}</span>
                      </td>
                      <td>
                        <span className="badge" style={{ background: S[q.status].bg, color: S[q.status].color, border: `1px solid ${S[q.status].border}` }}>
                          {q.status}
                        </span>
                      </td>
                      <td style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11.5 }}>{new Date(q.createdAt).toLocaleDateString('en-IN')}</td>
                      <td>
                        <div className="flex gap-1.5 text-right justify-end">
                          <button onClick={e => { e.stopPropagation(); navigate(`/queries/${q._id}`) }}
                            style={{ background: 'rgba(0,163,224,0.1)', border: '1px solid rgba(0,163,224,0.2)', borderRadius: 7, padding: '5px 7px', cursor: 'pointer' }}>
                            <Eye size={12} color="#00A3E0" />
                          </button>
                          <button onClick={e => { e.stopPropagation(); del(q._id) }}
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
