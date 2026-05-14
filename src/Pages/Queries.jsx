import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Trash2, Eye, Phone, MapPin, Zap, X } from 'lucide-react'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { queriesApi } from '../api'

const S = {
  Pending:  { bg: 'rgba(255,193,7,0.12)',  color: '#FFC107', border: 'rgba(255,193,7,0.25)'  },
  Reviewed: { bg: 'rgba(0,163,224,0.12)', color: '#00A3E0', border: 'rgba(0,163,224,0.25)' },
  Closed:   { bg: 'rgba(0,201,167,0.12)', color: '#00C9A7', border: 'rgba(0,201,167,0.25)' },
}

export default function Queries() {
  const [data, setData]         = useState([])
  const [loading, setLoading]   = useState(true)
  const [search, setSearch]     = useState('')
  const [filter, setFilter]     = useState('All')
  const [selected, setSelected] = useState(null)

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

  const setStatus = async (id, status) => {
    try {
      const updated = await queriesApi.updateStatus(id, status)
      setData(d => d.map(q => q._id === id ? updated : q))
      setSelected(s => s?._id === id ? updated : s)
      toast.success(`Status updated to ${status}`)
    } catch (e) { toast.error(e.message) }
  }

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
        if (selected?._id === id) setSelected(null)
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
          <Search size={14} color="rgba(255,255,255,0.28)"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input className="input" style={{ paddingLeft: 36 }} placeholder="Search queries..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All', 'Pending', 'Reviewed', 'Closed'].map(f => (
            <button key={f} onClick={() => setFilter(f)} className="btn"
              style={{
                background: filter === f ? 'linear-gradient(135deg,#FFB800,#FF7A00)' : 'rgba(255,255,255,0.06)',
                color: filter === f ? 'white' : 'rgba(255,255,255,0.45)',
                border: filter === f ? 'none' : '1px solid rgba(255,255,255,0.08)',
                padding: '8px 16px', fontSize: 12.5
              }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="split">
        <div className="glass" style={{ overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table className="tbl">
              <thead>
                <tr><th>Name</th><th>City</th><th>Requirement</th><th>Status</th><th>Date</th><th></th></tr>
              </thead>
              <tbody>
                {loading
                  ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.2)' }}>Loading...</td></tr>
                  : filtered.length === 0
                  ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No queries found.</td></tr>
                  : filtered.map((q, i) => (
                    <motion.tr key={q._id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      onClick={() => setSelected(q)}
                      style={{ cursor: 'pointer', background: selected?._id === q._id ? 'rgba(0,163,224,0.04)' : 'transparent' }}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg,#00A3E0,#00C9A7)', color: 'white' }}>
                            {q.name?.[0] ?? '?'}
                          </div>
                          <span style={{ fontWeight: 600, color: 'white' }}>{q.name}</span>
                        </div>
                      </td>
                      <td style={{ color: 'rgba(255,255,255,0.45)' }}>{q.city}</td>
                      <td style={{ color: 'rgba(255,255,255,0.38)', maxWidth: 200 }}>
                        <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{q.requirement}</span>
                      </td>
                      <td>
                        <span className="badge" style={{ background: S[q.status].bg, color: S[q.status].color, border: `1px solid ${S[q.status].border}` }}>
                          {q.status}
                        </span>
                      </td>
                      <td style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11.5 }}>{new Date(q.createdAt).toLocaleDateString('en-IN')}</td>
                      <td>
                        <div className="flex gap-1.5">
                          <button onClick={e => { e.stopPropagation(); setSelected(q) }}
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

        <div className="glass" style={{ padding: '18px', position: 'sticky', top: 0 }}>
          {selected ? (
            <motion.div key={selected._id} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}>
              <div className="flex items-start justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-base flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#00A3E0,#00C9A7)', color: 'white' }}>
                    {selected.name?.[0] ?? '?'}
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'white', marginBottom: 4 }}>{selected.name}</div>
                    <span className="badge" style={{ background: S[selected.status].bg, color: S[selected.status].color, border: `1px solid ${S[selected.status].border}` }}>
                      {selected.status}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                  <X size={16} color="rgba(255,255,255,0.3)" />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
                {[
                  { Icon: Phone,  val: selected.phone },
                  { Icon: MapPin, val: selected.city  },
                ].map(({ Icon, val }, i) => val && (
                  <div key={i} className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                      style={{ background: 'rgba(0,163,224,0.1)', border: '1px solid rgba(0,163,224,0.18)' }}>
                      <Icon size={13} color="#00A3E0" />
                    </div>
                    <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.62)' }}>{val}</span>
                  </div>
                ))}
              </div>

              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px', marginBottom: 16 }}>
                <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 5 }}>Requirement</div>
                <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{selected.requirement}</p>
              </div>

              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.28)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>Update Status</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {['Pending', 'Reviewed', 'Closed'].map(s => (
                  <button key={s} onClick={() => setStatus(selected._id, s)}
                    style={{
                      padding: '8px 12px', borderRadius: 9, fontSize: 12.5, fontWeight: 600, cursor: 'pointer', textAlign: 'left',
                      background: selected.status === s ? S[s].bg : 'rgba(255,255,255,0.04)',
                      color: selected.status === s ? S[s].color : 'rgba(255,255,255,0.38)',
                      border: selected.status === s ? `1px solid ${S[s].border}` : '1px solid rgba(255,255,255,0.06)',
                      transition: 'all 0.15s'
                    }}>
                    {s}
                  </button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div style={{ textAlign: 'center', padding: '52px 16px', color: 'rgba(255,255,255,0.18)', fontSize: 13 }}>
              <Zap size={30} color="rgba(255,255,255,0.07)" style={{ margin: '0 auto 10px' }} />
              Select a query to view details
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
