import React, { useState, useEffect } from 'react'
import { Handshake, Trash2, CheckCircle, XCircle, ChevronLeft, ChevronRight, Eye, X, Mail, Phone, MapPin, Building2, Maximize2 } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { partnersApi } from '../api'

const S = {
  pending: { bg: 'rgba(255,184,0,0.12)', color: '#FFB800', border: 'rgba(255,184,0,0.25)', label: 'Pending' },
  approved: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', border: 'rgba(34,197,94,0.25)', label: 'Approved' },
  rejected: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', border: 'rgba(239,68,68,0.25)', label: 'Rejected' },
}
const PER_PAGE = 5

export default function Partners() {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    partnersApi.getAll()
      .then(setData)
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? data : data.filter(d => d.status === filter)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const counts = { all: data.length, pending: data.filter(d => d.status === 'pending').length, approved: data.filter(d => d.status === 'approved').length, rejected: data.filter(d => d.status === 'rejected').length }

  const updateStatus = async (id, status) => {
    try {
      const updated = await partnersApi.updateStatus(id, status)
      setData(prev => prev.map(d => d._id === id ? updated : d))
      toast.success(`Partner ${status === 'approved' ? 'Approved ✓' : 'Rejected ✕'}`)
    } catch (e) { toast.error(e.message) }
  }

  const remove = async (id) => {
    const res = await Swal.fire({
      title: 'Delete Partner?', text: 'This cannot be undone.', icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Delete', cancelButtonText: 'Cancel', background: '#0B1D51', color: '#fff',
      confirmButtonColor: '#ef4444', cancelButtonColor: 'rgba(255,255,255,0.08)',
    })
    if (res.isConfirmed) {
      try {
        await partnersApi.delete(id)
        setData(prev => prev.filter(d => d._id !== id))
        toast.success('Partner deleted.')
      } catch (e) { toast.error(e.message) }
    }
  }

  const changePage = (p) => { if (p >= 1 && p <= totalPages) setPage(p) }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Partner <span className="glow-text">Requests</span></h1>
          <p className="page-subtitle">{data.length} total applications received</p>
        </div>
        <div style={{ background: 'rgba(255,122,0,0.12)', border: '1px solid rgba(255,122,0,0.25)', borderRadius: 12, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Handshake size={15} color="#FF7A00" />
          <span style={{ color: '#FF7A00', fontWeight: 700, fontSize: 13 }}>Partner Portal</span>
        </div>
      </div>

      <div className="grid-4">
        {[
          { label: 'Total', val: counts.all, color: '#00A3E0', bg: 'rgba(0,163,224,0.08)', border: 'rgba(0,163,224,0.15)' },
          { label: 'Pending', val: counts.pending, color: '#FFB800', bg: 'rgba(255,184,0,0.08)', border: 'rgba(255,184,0,0.15)' },
          { label: 'Approved', val: counts.approved, color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.15)' },
          { label: 'Rejected', val: counts.rejected, color: '#ef4444', bg: 'rgba(239,68,68,0.08)', border: 'rgba(239,68,68,0.15)' },
        ].map(s => (
          <div key={s.label} className="stat-card glass" style={{ padding: '16px 20px', border: `1px solid ${s.border}`, background: s.bg }}>
            <div style={{ color: s.color, fontWeight: 800, fontSize: 28 }}>{s.val}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        {['all', 'pending', 'approved', 'rejected'].map(f => (
          <button key={f} onClick={() => { setFilter(f); setPage(1) }} className="btn"
            style={{ background: filter === f ? 'linear-gradient(135deg,#FFB800,#FF7A00)' : 'rgba(255,255,255,0.06)', color: filter === f ? 'white' : 'rgba(255,255,255,0.45)', border: filter === f ? 'none' : '1px solid rgba(255,255,255,0.08)', textTransform: 'capitalize', padding: '7px 16px', fontSize: 12.5 }}>
            {f} ({counts[f] ?? filtered.length})
          </button>
        ))}
      </div>

      <div className="glass" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead><tr><th>Name</th><th>Company</th><th>Type</th><th>City</th><th>Date</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {loading
                ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.2)' }}>Loading...</td></tr>
                : paginated.length === 0
                  ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No records found.</td></tr>
                  : paginated.map((row) => {
                    const s = S[row.status]
                    return (
                      <tr key={row._id} onDoubleClick={() => navigate(`/partners/${row._id}`)} style={{ cursor: 'pointer' }}>
                        <td>
                          <div style={{ fontWeight: 700, color: 'white', fontSize: 13 }}>{row.name}</div>
                          <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 }}>{row.email}</div>
                        </td>
                        <td style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{row.company}</td>
                        <td><span className="badge" style={{ background: 'rgba(0,163,224,0.12)', color: '#00A3E0', border: '1px solid rgba(0,163,224,0.2)' }}>{row.type}</span></td>
                        <td style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13 }}>{row.city}</td>
                        <td style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{new Date(row.createdAt).toLocaleDateString('en-IN')}</td>
                        <td><span className="badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{s.label}</span></td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'end' }}>
                            {row.status !== 'approved' && (
                              <button onClick={() => updateStatus(row._id, 'approved')} title="Approve"
                                style={{ background: 'rgba(34,197,94,0.12)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700 }}>
                                <CheckCircle size={13} strokeWidth={2.5} /> Approve
                              </button>
                            )}
                            {row.status !== 'rejected' && (
                              <button onClick={() => updateStatus(row._id, 'rejected')} title="Reject"
                                style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, padding: '5px 8px', cursor: 'pointer', color: '#ef4444', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 700 }}>
                                <XCircle size={13} strokeWidth={2.5} /> Reject
                              </button>
                            )}
                            <button onClick={() => navigate(`/partners/${row._id}`)} style={{ background: 'rgba(0,163,224,0.1)', border: '1px solid rgba(0,163,224,0.2)', borderRadius: 8, padding: '5px 7px', cursor: 'pointer', color: '#00A3E0' }}><Eye size={13} /></button>
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
              {[...Array(totalPages)].map((_, i) => (
                <button key={i} onClick={() => changePage(i + 1)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, background: page === i + 1 ? 'linear-gradient(135deg,#FFB800,#FF7A00)' : 'rgba(255,255,255,0.06)', color: page === i + 1 ? 'white' : 'rgba(255,255,255,0.4)' }}>{i + 1}</button>
              ))}
              <button onClick={() => changePage(page + 1)} disabled={page === totalPages} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 8, padding: '5px 8px', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: page === totalPages ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)' }}><ChevronRight size={14} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
