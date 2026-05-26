import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Trash2, Eye, Phone, Mail, Briefcase, Download, X, 
  FileText, Copy, Check, MessageSquare
} from 'lucide-react'
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
  const [data, setData]       = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filter, setFilter]   = useState('All')
  const [selectedId, setSelectedId] = useState(null)
  const [copiedField, setCopiedField] = useState(null)

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    toast.success(`${fieldName} copied to clipboard!`)
    setTimeout(() => setCopiedField(null), 2000)
  }

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

  const setStatus = async (id, status) => {
    try {
      const updated = await applicationsApi.updateStatus(id, status)
      setData(prev => prev.map(a => a._id === id ? updated : a))
      toast.success(`Status updated to ${status}`)
    } catch (e) { 
      toast.error(e.message) 
    }
  }

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
        if (selectedId === id) setSelectedId(null)
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

  const selectedApplication = data.find(a => a._id === selectedId)

  return (
    <div className="page pb-12">
      <div className="page-header">
        <div>
          <h1 className="page-title">Job <span className="glow-text">Applications</span></h1>
          <p className="page-subtitle">{data.length} total applications</p>
        </div>
      </div>

      {/* Filter Bar */}
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

      {/* Main Split Layout container */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
        
        {/* LEFT COLUMN: TABLE CONTAINER */}
        <div className={`${selectedId ? 'lg:col-span-3' : 'lg:col-span-5'} transition-all duration-300 flex flex-col gap-4 relative z-10`}>
          <div className="glass shadow-xl border border-white/[0.08]" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>CV</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)' }}>Loading...</td></tr>
                    : filtered.length === 0
                      ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'var(--text-dim)', fontSize: 13 }}>No applications found.</td></tr>
                      : filtered.map((a, i) => {
                          const isActive = selectedId === a._id;
                          return (
                            <motion.tr key={a._id}
                              initial={{ opacity: 0 }} 
                              animate={{ opacity: 1 }} 
                              transition={{ delay: i * 0.04 }}
                              onClick={() => setSelectedId(a._id)}
                              style={{ 
                                cursor: 'pointer',
                                background: isActive ? 'rgba(255,122,0,0.05)' : 'transparent',
                              }}
                              className="transition-all duration-150"
                            >
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
                                  <button onClick={e => { e.stopPropagation(); setSelectedId(isActive ? null : a._id); }}
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
                          );
                        })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SIDE DETAILS PANEL */}
        <AnimatePresence>
          {selectedId && selectedApplication && (
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
                minHeight: '560px',
                zIndex: 30
              }}
              className="lg:col-span-2 shadow-2xl flex flex-col justify-between"
            >
              {/* Backglow elements */}
              <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, background: 'radial-gradient(circle, rgba(255,122,0,0.18) 0%, transparent 70%)', pointerEvents: 'none', borderRadius: '50%', zIndex: 0 }} />
              <div style={{ position: 'absolute', bottom: -50, left: -50, width: 180, height: 180, background: 'radial-gradient(circle, rgba(34,197,94,0.1) 0%, transparent 70%)', pointerEvents: 'none', borderRadius: '50%', zIndex: 0 }} />

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
                onMouseEnter={e => { e.currentTarget.style.color = '#FF7A00'; e.currentTarget.style.borderColor = 'rgba(255,122,0,0.3)'; e.currentTarget.style.background = 'rgba(255,122,0,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              >
                <X size={15} />
              </button>

              <div style={{ flex: 1, overflowY: 'auto', zIndex: 1, paddingRight: '4px' }} className="space-y-6">
                
                {/* Profile Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left', paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', inset: -3, borderRadius: 16, background: 'linear-gradient(135deg, #FF7A00, #FFB800)', opacity: 0.35, filter: 'blur(5px)' }} />
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-md flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#FF7A00,#FFB800)', border: '1.5px solid rgba(255,255,255,0.25)', position: 'relative', zIndex: 1 }}>
                      {selectedApplication.name?.[0] ?? '?'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 style={{ margin: 0, fontWeight: 800, fontSize: 20, color: '#ffffff', letterSpacing: '0.3px', lineHeight: 1.25 }}>{selectedApplication.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="badge" style={{ background: STATUS_STYLE[selectedApplication.status]?.bg, color: STATUS_STYLE[selectedApplication.status]?.color, border: `1px solid ${STATUS_STYLE[selectedApplication.status]?.border}`, fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 20 }}>
                        {selectedApplication.status}
                      </span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>ID: {selectedApplication._id.slice(-6).toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Section: Overview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                  <span style={{ fontSize: 10, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#FF7A00', display: 'block', paddingLeft: 4 }}>Application Overview</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 14 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', uppercase: true }}>ROLE APPLIED FOR</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>{selectedApplication.role}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', uppercase: true }}>RECEIVED DATE</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>{new Date(selectedApplication.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Information Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                  <span style={{ fontSize: 10, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#FF7A00', display: 'block', paddingLeft: 4 }}>Candidate Credentials</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    
                    {[
                      { label: "Email Address", val: selectedApplication.email, icon: Mail, color: "#00A3E0", copyable: true },
                      { label: "Phone Number", val: selectedApplication.phone, icon: Phone, color: "#FF7A00", copyable: true }
                    ].map((item, idx) => (
                      <div key={idx} style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'space-between', 
                        background: 'rgba(255,255,255,0.03)', 
                        border: '1px solid rgba(255,255,255,0.05)', 
                        borderRadius: 16, 
                        padding: '12px 16px',
                        transition: 'all 0.2s'
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
                            color: item.color,
                            flexShrink: 0
                          }}><item.icon size={14} /></div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0 }}>
                            <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', uppercase: true }}>{item.label}</span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: '#ffffff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.val || '—'}</span>
                          </div>
                        </div>
                        {item.copyable && item.val && (
                          <button 
                            onClick={() => copyToClipboard(item.val, item.label.split(' ')[0])}
                            style={{ 
                              width: 28, 
                              height: 28, 
                              borderRadius: 8, 
                              background: 'rgba(255,255,255,0.05)', 
                              border: '1px solid rgba(255,255,255,0.08)', 
                              display: 'flex', 
                              alignItems: 'center', 
                              justifyContent: 'center',
                              cursor: 'pointer',
                              color: 'rgba(255,255,255,0.5)',
                              transition: 'all 0.2s',
                              marginLeft: 8
                            }}
                            onMouseEnter={e => { e.currentTarget.style.color = '#ffffff'; e.currentTarget.style.background = 'rgba(255,255,255,0.1)' }}
                            onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                          >
                            {copiedField === item.label.split(' ')[0] ? <Check size={12} style={{ color: '#22c55e' }} /> : <Copy size={12} />}
                          </button>
                        )}
                      </div>
                    ))}

                  </div>
                </div>

                {/* CV Download card */}
                {selectedApplication.cv?.filename && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                    <span style={{ fontSize: 10, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#FF7A00', display: 'block', paddingLeft: 4 }}>Curriculum Vitae</span>
                    <div style={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between', 
                      background: 'linear-gradient(135deg, rgba(0,201,167,0.05), rgba(0,201,167,0.01))', 
                      border: '1px solid rgba(0,201,167,0.2)', 
                      borderRadius: 16, 
                      padding: '14px 18px',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 10, bg: 'rgba(0,201,167,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#00C9A7', border: '1px solid rgba(0,201,167,0.2)', flexShrink: 0 }}><FileText size={15} /></div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', uppercase: true }}>ATTACHED DOCUMENT</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>{selectedApplication.cv.filename}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => downloadCv(selectedApplication._id)}
                        style={{ 
                          padding: '8px 14px', 
                          borderRadius: 10, 
                          background: '#00C9A7', 
                          border: 'none', 
                          color: '#ffffff', 
                          fontSize: 12, 
                          fontWeight: 700, 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 6, 
                          cursor: 'pointer',
                          boxShadow: '0 4px 12px rgba(0,201,167,0.2)'
                        }}
                      >
                        <Download size={13} /> Download
                      </button>
                    </div>
                  </div>
                )}

                {/* Candidate Message / Notes */}
                {selectedApplication.message && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                    <span style={{ fontSize: 10, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#FF7A00', display: 'block', paddingLeft: 4 }}>Cover Message / Notes</span>
                    <div style={{ 
                      background: 'rgba(255,122,0,0.04)', 
                      border: '1px solid rgba(255,122,0,0.12)', 
                      borderRadius: 16, 
                      padding: '14px 18px', 
                      position: 'relative'
                    }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: 'linear-gradient(180deg, #FF7A00, #FFB800)', borderRadius: '3px 0 0 3px' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}><MessageSquare size={12} color="#FF7A00" /> Cover Notes</div>
                      <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', fontWeight: 500 }}>"{selectedApplication.message}"</p>
                    </div>
                  </div>
                )}

              </div>

              {/* Status Switcher */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 18, marginTop: 'auto', textAlign: 'left', zIndex: 1 }}>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.4)', display: 'block', paddingLeft: 4, marginBottom: 10 }}>Update Application Status</span>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr 1fr 1fr', 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.06)', 
                  padding: 4, 
                  borderRadius: 14, 
                  gap: 4 
                }}>
                  {['New', 'Reviewed', 'Shortlisted', 'Rejected'].map(statusOption => {
                    const isActive = selectedApplication.status === statusOption;
                    const style = STATUS_STYLE[statusOption];
                    return (
                      <button
                        key={statusOption}
                        onClick={() => setStatus(selectedApplication._id, statusOption)}
                        style={{
                          padding: '10px 2px',
                          textAlign: 'center',
                          borderRadius: 10,
                          fontSize: 11.5,
                          fontWeight: 700,
                          transition: 'all 0.25s',
                          cursor: 'pointer',
                          border: 'none',
                          outline: 'none',
                          background: isActive ? style.bg : 'transparent',
                          color: isActive ? style.color : 'rgba(255,255,255,0.4)',
                          border: isActive ? `1px solid ${style.border}` : '1px solid transparent',
                        }}
                      >
                        {statusOption}
                      </button>
                    );
                  })}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  )
}
