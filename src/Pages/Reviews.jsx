import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Star, Trash2, CheckCircle, XCircle, ChevronLeft, ChevronRight, Eye, X, 
  MessageSquare, Copy, Check, Calendar, User
} from 'lucide-react'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { reviewsApi } from '../api'

const S = {
  pending: { bg: 'rgba(255,184,0,0.12)', color: '#FFB800', border: 'rgba(255,184,0,0.25)', label: 'Pending' },
  published: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', border: 'rgba(34,197,94,0.25)', label: 'Published' },
  rejected: { bg: 'rgba(239,68,68,0.12)', color: '#ef4444', border: 'rgba(239,68,68,0.25)', label: 'Rejected' },
}

function StarRow({ count, size = 12 }) {
  return (
    <div style={{ display: 'flex', gap: 3 }}>
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i} 
          size={size} 
          fill={i < count ? '#FFB800' : 'transparent'} 
          color={i < count ? '#FFB800' : 'rgba(255,255,255,0.15)'} 
        />
      ))}
    </div>
  )
}

const PER_PAGE = 5

export default function Reviews() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(null)
  const [copiedField, setCopiedField] = useState(null)

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    toast.success(`${fieldName} copied to clipboard!`)
    setTimeout(() => setCopiedField(null), 2000)
  }

  useEffect(() => {
    reviewsApi.getAll()
      .then(setData)
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? data : data.filter(d => d.status === filter)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const counts = { 
    all: data.length, 
    pending: data.filter(d => d.status === 'pending').length, 
    published: data.filter(d => d.status === 'published').length, 
    rejected: data.filter(d => d.status === 'rejected').length 
  }

  const updateStatus = async (id, status) => {
    try {
      const updated = await reviewsApi.updateStatus(id, status)
      setData(prev => prev.map(d => d._id === id ? updated : d))
      toast.success(status === 'published' ? 'Review Published ✓' : 'Review Rejected ✕')
    } catch (e) { 
      toast.error(e.message) 
    }
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
        if (selectedId === id) setSelectedId(null)
        toast.success('Review deleted.')
      } catch (e) { toast.error(e.message) }
    }
  }

  const changePage = (p) => { if (p >= 1 && p <= totalPages) setPage(p) }

  const selectedReview = data.find(d => d._id === selectedId)

  return (
    <div className="page pb-12">
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

      {/* Stat Cards Grid */}
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

      {/* Filter Bar */}
      <div className="filter-bar">
        {['all', 'pending', 'published', 'rejected'].map(f => (
          <button key={f} onClick={() => { setFilter(f); setPage(1) }} className="btn"
            style={{ 
              background: filter === f ? 'linear-gradient(135deg,#FFB800,#FF7A00)' : 'rgba(255,255,255,0.06)', 
              color: filter === f ? 'white' : 'rgba(255,255,255,0.45)', 
              border: filter === f ? 'none' : '1px solid rgba(255,255,255,0.08)', 
              textTransform: 'capitalize', 
              padding: '8px 16px', 
              fontSize: 12.5 
            }}>
            {f} ({counts[f] ?? filtered.length})
          </button>
        ))}
      </div>

      {/* Main Split Layout container */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
        
        {/* LEFT COLUMN: TABLE CONTAINER */}
        <div className={`${selectedId ? 'lg:col-span-3' : 'lg:col-span-5'} transition-all duration-300 flex flex-col gap-4 relative z-10`}>
          <div className="glass shadow-xl border border-white/[0.08]" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Reviewer</th>
                    <th>Role</th>
                    <th>Stars</th>
                    <th>Review</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.2)' }}>Loading...</td></tr>
                    : paginated.length === 0
                      ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No reviews found.</td></tr>
                      : paginated.map((row, i) => {
                          const s = S[row.status]
                          const isActive = selectedId === row._id
                          return (
                            <motion.tr key={row._id}
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              transition={{ delay: i * 0.04 }}
                              onClick={() => setSelectedId(row._id)}
                              style={{ 
                                cursor: 'pointer',
                                background: isActive ? 'rgba(255,122,0,0.05)' : 'transparent',
                              }}
                              className="transition-all duration-150"
                            >
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
                              <td style={{ maxWidth: 200 }}>
                                <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', margin: 0 }}>{row.review}</p>
                              </td>
                              <td style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12, whiteSpace: 'nowrap' }}>{new Date(row.createdAt).toLocaleDateString('en-IN')}</td>
                              <td><span className="badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{s.label}</span></td>
                              <td>
                                <div style={{ display: 'flex', gap: 1.5, alignItems: 'center', justifyContent: 'end' }} onClick={e => e.stopPropagation()}>
                                  <button onClick={() => setSelectedId(isActive ? null : row._id)} 
                                    style={{ background: 'rgba(0,163,224,0.1)', border: '1px solid rgba(0,163,224,0.2)', borderRadius: 7, padding: '5px 7px', cursor: 'pointer', color: '#00A3E0' }}>
                                    <Eye size={12} />
                                  </button>
                                  <button onClick={() => remove(row._id)} 
                                    style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 7, padding: '5px 7px', cursor: 'pointer', color: '#f87171' }}>
                                    <Trash2 size={12} />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          )
                        })}
                </tbody>
              </table>
            </div>
            
            {/* Pagination */}
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
        </div>

        {/* RIGHT COLUMN: SIDE DETAILS PANEL */}
        <AnimatePresence>
          {selectedId && selectedReview && (
            <motion.div
              initial={{ opacity: 0, x: 40, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.98 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
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
                flexDirection: 'col',
                justifyContent: 'space-between',
                gap: '24px',
                height: '100%',
                minHeight: '520px',
                zIndex: 30
              }}
              className="lg:col-span-2 shadow-2xl flex flex-col justify-between"
            >
              {/* Backglow elements */}
              <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, background: 'radial-gradient(circle, rgba(255,184,0,0.15) 0%, transparent 70%)', pointerEvents: 'none', borderRadius: '50%', zIndex: 0 }} />
              <div style={{ position: 'absolute', bottom: -50, left: -50, width: 180, height: 180, background: 'radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)', pointerEvents: 'none', borderRadius: '50%', zIndex: 0 }} />

              {/* CLOSE BUTTON */}
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
                onMouseEnter={e => { e.currentTarget.style.color = '#FFB800'; e.currentTarget.style.borderColor = 'rgba(255,184,0,0.3)'; e.currentTarget.style.background = 'rgba(255,184,0,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              >
                <X size={15} />
              </button>

              <div style={{ flex: 1, overflowY: 'auto', zIndex: 1, paddingRight: '4px' }} className="space-y-6">
                
                {/* Profile Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left', paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifycontent: 'center' }}>
                    <div style={{ position: 'absolute', inset: -3, borderRadius: 16, background: 'linear-gradient(135deg,#FF7A00,#FFB800)', opacity: 0.35, filter: 'blur(5px)' }} />
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-md flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#FF7A00,#FFB800)', border: '1.5px solid rgba(255,255,255,0.25)', position: 'relative', zIndex: 1 }}>
                      {selectedReview.initials || selectedReview.name?.[0] || '?'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 style={{ margin: 0, fontWeight: 800, fontSize: 20, color: '#ffffff', letterSpacing: '0.3px', lineHeight: 1.25 }}>{selectedReview.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="badge" style={{ background: S[selectedReview.status].bg, color: S[selectedReview.status].color, border: `1px solid ${S[selectedReview.status].border}`, fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 20 }}>
                        {S[selectedReview.status].label}
                      </span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>ID: {selectedReview._id.slice(-6).toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Star Rating Overview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                  <span style={{ fontSize: 10, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#FFB800', display: 'block', paddingLeft: 4 }}>Review Score</span>
                  <div style={{ display: 'flex', alignItems: 'center', justifycontent: 'space-between', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: '14px 18px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', uppercase: true }}>RATING ACCORDED</span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                        <span style={{ fontSize: 20, fontWeight: 800, color: '#ffffff', fontFamily: 'Space Grotesk' }}>{selectedReview.stars}.0</span>
                        <StarRow count={selectedReview.stars} size={15} />
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3, textAlign: 'right' }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', uppercase: true }}>PUBLISH DATE</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff', marginTop: 4 }}>{new Date(selectedReview.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Contact/Bio Credentials */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                  <span style={{ fontSize: 10, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#FFB800', display: 'block', paddingLeft: 4 }}>Reviewer Professional Info</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      background: 'rgba(255,255,255,0.03)', 
                      border: '1px solid rgba(255,255,255,0.05)', 
                      borderRadius: 16, 
                      padding: '12px 16px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0, flex: 1 }}>
                        <div style={{ 
                          width: 32, 
                          height: 32, 
                          borderRadius: 10, 
                          background: 'rgba(255,255,255,0.04)', 
                          border: '1px solid rgba(255,255,255,0.08)', 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center',
                          color: '#00A3E0',
                          flexShrink: 0
                        }}><User size={14} /></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', uppercase: true }}>Designation / Role</span>
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{selectedReview.role || '—'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Review Text */}
                {selectedReview.review && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                    <span style={{ fontSize: 10, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#FFB800', display: 'block', paddingLeft: 4 }}>Review Content</span>
                    <div style={{ 
                      background: 'rgba(255,184,0,0.04)', 
                      border: '1px solid rgba(255,184,0,0.12)', 
                      borderRadius: 16, 
                      padding: '14px 18px', 
                      position: 'relative'
                    }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: 'linear-gradient(180deg,#FF7A00,#FFB800)', borderRadius: '3px 0 0 3px' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}><MessageSquare size={12} color="#FFB800" /> Customer Notes</div>
                      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.8)', fontStyle: 'italic', fontWeight: 500 }}>"{selectedReview.review}"</p>
                    </div>
                  </div>
                )}

              </div>

              {/* Status Action Buttons */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 18, marginTop: 'auto', textAlign: 'left', zIndex: 1 }}>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.4)', display: 'block', paddingLeft: 4, marginBottom: 12 }}>Review Action Controls</span>
                <div style={{ display: 'flex', gap: 10 }}>
                  <button
                    onClick={() => updateStatus(selectedReview._id, 'published')}
                    disabled={selectedReview.status === 'published'}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '12px 16px',
                      borderRadius: 14,
                      fontSize: 12.5,
                      fontWeight: 800,
                      cursor: selectedReview.status === 'published' ? 'not-allowed' : 'pointer',
                      border: 'none',
                      transition: 'all 0.2s',
                      background: selectedReview.status === 'published' ? 'rgba(34,197,94,0.05)' : 'rgba(34,197,94,0.12)',
                      color: selectedReview.status === 'published' ? 'rgba(34,197,94,0.4)' : '#22c55e',
                      border: selectedReview.status === 'published' ? '1px solid rgba(34,197,94,0.1)' : '1px solid rgba(34,197,94,0.25)',
                    }}
                    className="hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <CheckCircle size={14} /> Publish Review
                  </button>
                  <button
                    onClick={() => updateStatus(selectedReview._id, 'rejected')}
                    disabled={selectedReview.status === 'rejected'}
                    style={{
                      flex: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      padding: '12px 16px',
                      borderRadius: 14,
                      fontSize: 12.5,
                      fontWeight: 800,
                      cursor: selectedReview.status === 'rejected' ? 'not-allowed' : 'pointer',
                      border: 'none',
                      transition: 'all 0.2s',
                      background: selectedReview.status === 'rejected' ? 'rgba(239,68,68,0.05)' : 'rgba(239,68,68,0.1)',
                      color: selectedReview.status === 'rejected' ? 'rgba(239,68,68,0.4)' : '#ef4444',
                      border: selectedReview.status === 'rejected' ? '1px solid rgba(239,68,68,0.1)' : '1px solid rgba(239,68,68,0.2)',
                    }}
                    className="hover:scale-[1.02] active:scale-95 transition-all"
                  >
                    <XCircle size={14} /> Reject Review
                  </button>
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
