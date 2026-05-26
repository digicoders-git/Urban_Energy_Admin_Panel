import React, { useState, useEffect } from 'react'
import { Handshake, Trash2, CheckCircle, XCircle, ChevronLeft, ChevronRight, Eye, X, Mail, Phone, MapPin, Building2, Calendar, MessageSquare, Maximize2 } from 'lucide-react'
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
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(null)

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
        if (selectedId === id) setSelectedId(null)
        toast.success('Partner deleted.')
      } catch (e) { toast.error(e.message) }
    }
  }

  const changePage = (p) => { if (p >= 1 && p <= totalPages) setPage(p) }
  const selectedRow = data.find(d => d._id === selectedId)

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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
        
        {/* Left Table Panel */}
        <div className={`${selectedId ? 'lg:col-span-3' : 'lg:col-span-5'} transition-all duration-300 flex flex-col gap-4 relative z-10`}>
          <div className="glass shadow-xl border border-white/[0.08]" style={{ overflow: 'hidden' }}>
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
                          const isActive = selectedId === row._id
                          return (
                            <tr key={row._id} onClick={() => setSelectedId(row._id)} style={{ cursor: 'pointer', background: isActive ? 'rgba(255,122,0,0.05)' : 'transparent' }}>
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
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center', justifyContent: 'end' }} onClick={e => e.stopPropagation()}>
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
                                  <button onClick={() => setSelectedId(row._id)} style={{ background: 'rgba(0,163,224,0.1)', border: '1px solid rgba(0,163,224,0.2)', borderRadius: 8, padding: '5px 7px', cursor: 'pointer', color: '#00A3E0' }}><Eye size={13} /></button>
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

        {/* Right Details Panel */}
        {selectedId && selectedRow && (
          <div 
            style={{
              background: 'linear-gradient(165deg, rgba(13, 31, 85, 0.75), rgba(9, 22, 64, 0.92))',
              backdropFilter: 'blur(24px)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              boxShadow: '0 32px 64px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)',
              borderRadius: 28,
              padding: '28px 24px',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              gap: '24px',
              height: '100%',
              minHeight: '620px',
              zIndex: 30
            }}
            className="lg:col-span-2 shadow-2xl flex flex-col justify-between"
          >
            <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, background: 'radial-gradient(circle, rgba(255,122,0,0.18) 0%, transparent 70%)', pointerEvents: 'none', borderRadius: '50%', zIndex: 0 }} />
            
            <button 
              onClick={() => setSelectedId(null)} 
              style={{
                position: 'absolute',
                top: 20,
                right: 20,
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'rgba(255,255,255,0.6)',
                transition: 'all 0.2s',
                zIndex: 10
              }}
              onMouseEnter={e => { e.currentTarget.style.color = '#FF7A00'; e.currentTarget.style.borderColor = 'rgba(255,122,0,0.3)'; e.currentTarget.style.background = 'rgba(255,122,0,0.08)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
            >
              <X size={15} />
            </button>

            <div style={{ flex: 1, overflowY: 'auto', zIndex: 1 }} className="space-y-6">
              
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left', paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ position: 'absolute', inset: -3, borderRadius: 16, background: 'linear-gradient(135deg, #FF7A00, #FFB800)', opacity: 0.35, filter: 'blur(5px)' }} />
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-md flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#FF7A00,#FFB800)', border: '1.5px solid rgba(255,255,255,0.25)', position: 'relative', zIndex: 1 }}>
                    {selectedRow.name?.[0] ?? '?'}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 style={{ margin: 0, fontWeight: 800, fontSize: 19, color: '#ffffff', letterSpacing: '0.3px', lineHeight: 1.25 }}>{selectedRow.name}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="badge" style={{ background: S[selectedRow.status].bg, color: S[selectedRow.status].color, border: `1px solid ${S[selectedRow.status].border}`, fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 20 }}>
                      {S[selectedRow.status].label}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#FF7A00', display: 'block', paddingLeft: 4 }}>Partner Overview</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 14 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', uppercase: true }}>COMPANY NAME</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>{selectedRow.company}</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                    <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', uppercase: true }}>APPLIED ON</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>{new Date(selectedRow.createdAt).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#FF7A00', display: 'block', paddingLeft: 4 }}>Contact Credentials</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  
                  {[
                    { label: "Phone Number", val: selectedRow.phone, icon: Phone, color: "#FF7A00" },
                    { label: "Email Address", val: selectedRow.email, icon: Mail, color: "#00A3E0" },
                    { label: "Location City", val: selectedRow.city, icon: MapPin, color: "#22c55e" },
                    { label: "Organization Type", val: selectedRow.type, icon: Building2, color: "#eab308" }
                  ].map((item, idx) => (
                    <div key={idx} style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      background: 'rgba(255,255,255,0.03)', 
                      border: '1px solid rgba(255,255,255,0.05)', 
                      borderRadius: 16, 
                      padding: '12px 16px'
                    }}>
                      <div style={{ 
                        width: 32, 
                        height: 32, 
                        borderRadius: 10, 
                        background: 'rgba(255,255,255,0.04)', 
                        border: '1px solid rgba(255,255,255,0.08)', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center',
                        color: item.color,
                        marginRight: 12,
                        flexShrink: 0
                      }}><item.icon size={14} /></div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                        <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', uppercase: true }}>{item.label}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.val}</span>
                      </div>
                    </div>
                  ))}

                </div>
              </div>

              {selectedRow.message && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#FF7A00', display: 'block', paddingLeft: 4 }}>Partner Message</span>
                  <div style={{ background: 'rgba(255,122,0,0.04)', border: '1px solid rgba(255,122,0,0.12)', borderRadius: 16, padding: '14px 18px', relative: 'true' }}>
                    <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: 'linear-gradient(180deg, #FF7A00, #FFB800)', borderRadius: '3px 0 0 3px' }} />
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}><MessageSquare size={12} color="#FF7A00" /> Professional Background</div>
                    <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>"{selectedRow.message}"</p>
                  </div>
                </div>
              )}

            </div>

            {selectedRow.status === 'pending' && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 18, display: 'flex', gap: 12 }}>
                <button onClick={() => updateStatus(selectedRow._id, 'approved')} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifycontent: 'center', display: 'flex', justifyContent: 'center', gap: 6 }}><CheckCircle size={15} /> Approve</button>
                <button onClick={() => updateStatus(selectedRow._id, 'rejected')} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'rgba(239,68,68,0.15)', color: '#ef4444', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifycontent: 'center', display: 'flex', justifyContent: 'center', gap: 6 }}><XCircle size={15} /> Reject</button>
              </div>
            )}
            {selectedRow.status !== 'pending' && (
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 18, textAlign: 'left' }}>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.4)', display: 'block', paddingLeft: 4, marginBottom: 10 }}>Update Status</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', padding: 4, borderRadius: 14, gap: 4 }}>
                  {['approved', 'rejected'].map(statusOption => {
                    const isActive = selectedRow.status === statusOption;
                    return (
                      <button
                        key={statusOption}
                        onClick={() => updateStatus(selectedRow._id, statusOption)}
                        style={{
                          padding: '10px 4px',
                          textAlign: 'center',
                          borderRadius: 10,
                          fontSize: 12,
                          fontWeight: 700,
                          transition: 'all 0.25s',
                          cursor: 'pointer',
                          border: 'none',
                          outline: 'none',
                          background: isActive ? S[statusOption].bg : 'transparent',
                          color: isActive ? S[statusOption].color : 'rgba(255,255,255,0.4)',
                          border: isActive ? `1px solid ${S[statusOption].border}` : '1px solid transparent',
                        }}
                      >
                        {statusOption === 'approved' ? 'Approved' : 'Rejected'}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

          </div>
        )}

      </div>
    </div>
  )
}
