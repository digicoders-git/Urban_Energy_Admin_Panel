import React, { useState, useEffect } from 'react'
import { Star, Trash2, CheckCircle, XCircle, ChevronLeft, ChevronRight, Eye, X, Maximize2 } from 'lucide-react'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { reviewsApi } from '../api'
import LandscapeModal from '../components/LandscapeModal'

const S = {
  pending: { bg: 'rgba(255,184,0,0.12)', color: '#FFB800', border: 'rgba(255,184,0,0.25)', label: 'Pending' },
  published: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', border: 'rgba(34,197,94,0.25)', label: 'Published' },
  rejected: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', border: 'rgba(239,68,68,0.25)', label: 'Rejected' },
}

function StarRow({ count }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[...Array(5)].map((_, i) => <Star key={i} size={12} fill={i < count ? '#FFB800' : 'transparent'} color={i < count ? '#FFB800' : 'rgba(255,255,255,0.15)'} />)}
    </div>
  )
}

const PER_PAGE = 5

export default function Reviews() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [viewing, setViewing] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    reviewsApi.getAll()
      .then(setData)
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? data : data.filter(d => d.status === filter)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const counts = { all: data.length, pending: data.filter(d => d.status === 'pending').length, published: data.filter(d => d.status === 'published').length, rejected: data.filter(d => d.status === 'rejected').length }

  const updateStatus = async (id, status) => {
    try {
      const updated = await reviewsApi.updateStatus(id, status)
      setData(prev => prev.map(d => d._id === id ? updated : d))
      setViewing(v => v?._id === id ? updated : v)
      toast.success(status === 'published' ? 'Review Published ✓' : 'Review Rejected ✕')
    } catch (e) { toast.error(e.message) }
  }

  const remove = async (id) => {
    const res = await Swal.fire({
      title: 'Delete Review?', text: 'This cannot be undone.', icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Delete', cancelButtonText: 'Cancel', background: '#0B1D51', color: '#fff',
      confirmButtonColor: '#ef4444', cancelButtonColor: 'rgba(255,255,255,0.08)',
    })
    if (res.isConfirmed) {
      try {
        await reviewsApi.delete(id)
        setData(prev => prev.filter(d => d._id !== id))
        if (viewing?._id === id) setViewing(null)
        toast.success('Review deleted.')
      } catch (e) { toast.error(e.message) }
    }
  }

  const changePage = (p) => { if (p >= 1 && p <= totalPages) setPage(p) }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Customer <span className="glow-text">Reviews</span></h1>
          <p className="page-subtitle">{counts.pending} pending · {counts.published} published</p>
        </div>
        <div style={{ background: 'rgba(255,184,0,0.12)', border: '1px solid rgba(255,184,0,0.25)', borderRadius: 12, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Star size={15} color="#FFB800" fill="#FFB800" />
          <span style={{ color: '#FFB800', fontWeight: 700, fontSize: 13 }}>Review Manager</span>
        </div>
      </div>

      <div className="grid-4">
        {[
          { label: 'Total', val: counts.all, color: '#00A3E0', bg: 'rgba(0,163,224,0.08)', border: 'rgba(0,163,224,0.15)' },
          { label: 'Pending', val: counts.pending, color: '#FFB800', bg: 'rgba(255,184,0,0.08)', border: 'rgba(255,184,0,0.15)' },
          { label: 'Published', val: counts.published, color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.15)' },
          { label: 'Rejected', val: counts.rejected, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.15)' },
        ].map(s => (
          <div key={s.label} className="stat-card glass" style={{ padding: '16px 20px', border: `1px solid ${s.border}`, background: s.bg }}>
            <div style={{ color: s.color, fontWeight: 800, fontSize: 28 }}>{s.val}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        {['all', 'pending', 'published', 'rejected'].map(f => (
          <button key={f} onClick={() => { setFilter(f); setPage(1) }} className="btn"
            style={{ background: filter === f ? 'linear-gradient(135deg,#FFB800,#FF7A00)' : 'rgba(255,255,255,0.06)', color: filter === f ? 'white' : 'rgba(255,255,255,0.45)', border: filter === f ? 'none' : '1px solid rgba(255,255,255,0.08)', textTransform: 'capitalize', padding: '7px 16px', fontSize: 12.5 }}>
            {f} ({counts[f] ?? filtered.length})
          </button>
        ))}
      </div>

      <div className="glass" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead><tr><th>Reviewer</th><th>Role</th><th>Stars</th><th>Review</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {loading
                ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.2)' }}>Loading...</td></tr>
                : paginated.length === 0
                  ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No reviews found.</td></tr>
                  : paginated.map((row) => {
                    const s = S[row.status]
                    return (
                      <tr key={row._id} onDoubleClick={() => { setViewing(row); setIsModalOpen(true); }} style={{ cursor: 'pointer' }}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'linear-gradient(135deg,#FF7A00,#FFB800)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 12, flexShrink: 0 }}>
                              {row.initials || row.name?.[0] || '?'}
                            </div>
                            <span style={{ fontWeight: 700, color: 'white', fontSize: 13 }}>{row.name}</span>
                          </div>
                        </td>
                        <td style={{ color: 'rgba(255,255,255,0.45)', fontSize: 12 }}>{row.role}</td>
                        <td><StarRow count={row.stars} /></td>
                        <td style={{ maxWidth: 240 }}>
                          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', margin: 0 }}>{row.review}</p>
                        </td>
                        <td style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, whiteSpace: 'nowrap' }}>{new Date(row.createdAt).toLocaleDateString('en-IN')}</td>
                        <td><span className="badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{s.label}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'end' }}>
                            <button onClick={() => { setViewing(row); setIsModalOpen(true); }} style={{ background: 'rgba(0,163,224,0.1)', border: '1px solid rgba(0,163,224,0.2)', borderRadius: 8, padding: '5px 7px', cursor: 'pointer', color: '#00A3E0' }}><Eye size={13} /></button>
                            {row.status !== 'published' && <button onClick={() => updateStatus(row._id, 'published')} style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700 }}><CheckCircle size={13} /> Publish</button>}
                            {row.status !== 'rejected' && <button onClick={() => updateStatus(row._id, 'rejected')} style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700 }}><XCircle size={13} /> Reject</button>}
                            <button onClick={() => remove(row._id)} style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, padding: '5px 7px', cursor: 'pointer', color: '#f87171' }}><Trash2 size={13} /></button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
            <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12 }}>Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}</span>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <button onClick={() => changePage(page - 1)} disabled={page === 1} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '5px 8px', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)' }}><ChevronLeft size={14} /></button>
              {[...Array(totalPages)].map((_, i) => <button key={i} onClick={() => changePage(i + 1)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, background: page === i + 1 ? 'linear-gradient(135deg,#FFB800,#FF7A00)' : 'rgba(255,255,255,0.06)', color: page === i + 1 ? 'white' : 'rgba(255,255,255,0.4)' }}>{i + 1}</button>)}
              <button onClick={() => changePage(page + 1)} disabled={page === totalPages} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '5px 8px', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: page === totalPages ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)' }}><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>

      <LandscapeModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setViewing(null); }}
        type="review"
        data={viewing}
        statusStyles={S}
        onStatusUpdate={updateStatus}
      />
    </div>
  )
}
