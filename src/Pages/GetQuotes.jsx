import React, { useState, useEffect } from 'react'
import { HandCoins, Trash2, Eye, X, Phone, Mail, MapPin, Zap, ChevronLeft, ChevronRight, Maximize2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { quotesApi } from '../api'

const S = {
  new: { bg: 'rgba(0,163,224,0.12)', color: '#00A3E0', border: 'rgba(0,163,224,0.25)', label: 'New' },
  contacted: { bg: 'rgba(255,184,0,0.12)', color: '#FFB800', border: 'rgba(255,184,0,0.25)', label: 'Contacted' },
  closed: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', border: 'rgba(34,197,94,0.25)', label: 'Closed' },
}
const PER_PAGE = 5

export default function GetQuotes() {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    quotesApi.getAll()
      .then(setData)
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? data : data.filter(d => d.status === filter)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const counts = { all: data.length, new: data.filter(d => d.status === 'new').length, contacted: data.filter(d => d.status === 'contacted').length, closed: data.filter(d => d.status === 'closed').length }

  const updateStatus = async (id, status) => {
    try {
      const updated = await quotesApi.updateStatus(id, status)
      setData(prev => prev.map(d => d._id === id ? updated : d))
      toast.success(`Status updated to ${status}`)
    } catch (e) { toast.error(e.message) }
  }

  const remove = async (id) => {
    const res = await Swal.fire({
      title: 'Delete Quote?', text: 'This cannot be undone.', icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Delete', cancelButtonText: 'Cancel', background: '#0B1D51', color: '#ffffff',
      confirmButtonColor: '#ef4444', cancelButtonColor: 'rgba(255,255,255,0.08)',
    })
    if (res.isConfirmed) {
      try {
        await quotesApi.delete(id)
        setData(prev => prev.filter(d => d._id !== id))
        toast.success('Quote deleted.')
      } catch (e) { toast.error(e.message) }
    }
  }

  const changePage = (p) => { if (p >= 1 && p <= totalPages) setPage(p) }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Get <span className="glow-text">Quotes</span></h1>
          <p className="page-subtitle">{data.length} quote requests received</p>
        </div>
        <div style={{ background: 'rgba(0,163,224,0.12)', border: '1px solid rgba(0,163,224,0.25)', borderRadius: 12, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <HandCoins size={15} color="#00A3E0" />
          <span style={{ color: '#00A3E0', fontWeight: 700, fontSize: 13 }}>Quote Requests</span>
        </div>
      </div>

      <div className="grid-4">
        {[
          { label: 'Total', val: counts.all, color: '#00A3E0', bg: 'rgba(0,163,224,0.08)', border: 'rgba(0,163,224,0.15)' },
          { label: 'New', val: counts.new, color: '#FFB800', bg: 'rgba(255,184,0,0.08)', border: 'rgba(255,184,0,0.15)' },
          { label: 'Contacted', val: counts.contacted, color: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.15)' },
          { label: 'Closed', val: counts.closed, color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.15)' },
        ].map(s => (
          <div key={s.label} className="stat-card glass" style={{ padding: '16px 20px', border: `1px solid ${s.border}`, background: s.bg }}>
            <div style={{ color: s.color, fontWeight: 800, fontSize: 28 }}>{s.val}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        {['all', 'new', 'contacted', 'closed'].map(f => (
          <button key={f} onClick={() => { setFilter(f); setPage(1) }} className="btn"
            style={{ background: filter === f ? 'linear-gradient(135deg,#FFB800,#FF7A00)' : 'rgba(255,255,255,0.06)', color: filter === f ? 'white' : 'rgba(255,255,255,0.5)', border: filter === f ? 'none' : '1px solid rgba(255,255,255,0.1)', textTransform: 'capitalize', padding: '7px 16px', fontSize: 12.5 }}>
            {f} ({counts[f] ?? filtered.length})
          </button>
        ))}
      </div>

      <div className="glass" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead><tr><th>Name</th><th>Type</th><th>Size</th><th>City</th><th>Date</th><th>Status</th><th></th></tr></thead>
            <tbody>
              {loading
                ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.4)' }}>Loading...</td></tr>
                : paginated.length === 0
                  ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>No records found.</td></tr>
                  : paginated.map((row) => {
                    const s = S[row.status]
                    return (
                      <tr key={row._id} onClick={() => navigate(`/get-quotes/${row._id}`)} style={{ cursor: 'pointer' }}>
                        <td>
                          <div style={{ fontWeight: 700, color: '#ffffff', fontSize: 13 }}>{row.name}</div>
                          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 }}>{row.phone}</div>
                        </td>
                        <td><span className="badge" style={{ background: 'rgba(255,122,0,0.12)', color: '#FF7A00', border: '1px solid rgba(255,122,0,0.2)' }}>{row.type}</span></td>
                        <td style={{ color: '#ffffff', fontWeight: 700, fontSize: 13 }}>{row.systemSize}</td>
                        <td style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{row.city}</td>
                        <td style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{new Date(row.createdAt).toLocaleDateString('en-IN')}</td>
                        <td><span className="badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{s.label}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 5, justifyContent: 'end' }} onClick={e => e.stopPropagation()}>
                            <button onClick={() => navigate(`/get-quotes/${row._id}`)} style={{ background: 'rgba(0,163,224,0.1)', border: '1px solid rgba(0,163,224,0.2)', borderRadius: 7, padding: '5px 7px', cursor: 'pointer' }}><Eye size={12} color="#00A3E0" /></button>
                            <button onClick={() => remove(row._id)} style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 7, padding: '5px 7px', cursor: 'pointer' }}><Trash2 size={12} color="#f87171" /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--border-card)' }}>
            <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}</span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button onClick={() => changePage(page - 1)} disabled={page === 1} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 8px', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)' }}><ChevronLeft size={14} /></button>
              {[...Array(totalPages)].map((_, i) => <button key={i} onClick={() => changePage(i + 1)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, background: page === i + 1 ? 'linear-gradient(135deg,#FFB800,#FF7A00)' : 'rgba(255,255,255,0.06)', color: page === i + 1 ? 'white' : 'rgba(255,255,255,0.5)' }}>{i + 1}</button>)}
              <button onClick={() => changePage(page + 1)} disabled={page === totalPages} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 8px', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: page === totalPages ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)' }}><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

    </div>
  )
}
