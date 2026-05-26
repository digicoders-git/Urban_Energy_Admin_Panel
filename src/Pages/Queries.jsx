import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Trash2, Eye, Phone, MapPin, X, Copy, Check, Calendar, MessageSquare, Zap
} from 'lucide-react'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { queriesApi } from '../api'

const S = {
  Pending: { bg: 'rgba(255,193,7,0.12)', color: '#FFC107', border: 'rgba(255,193,7,0.25)' },
  Reviewed: { bg: 'rgba(0,163,224,0.12)', color: '#00A3E0', border: 'rgba(0,163,224,0.25)' },
  Closed: { bg: 'rgba(0,201,167,0.12)', color: '#00C9A7', border: 'rgba(0,201,167,0.25)' },
}

export default function Queries() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [selectedId, setSelectedId] = useState(null)
  const [copiedField, setCopiedField] = useState(null)

  const copyToClipboard = (text, fieldName) => {
    navigator.clipboard.writeText(text)
    setCopiedField(fieldName)
    toast.success(`${fieldName} copied to clipboard!`)
    setTimeout(() => setCopiedField(null), 2000)
  }

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
      setData(prev => prev.map(q => q._id === id ? updated : q))
      toast.success(`Status updated to ${status}`)
    } catch (e) { 
      toast.error(e.message) 
    }
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
        if (selectedId === id) setSelectedId(null)
        toast.success('Query deleted.')
      } catch (e) { toast.error(e.message) }
    }
  }

  const selectedQuery = data.find(q => q._id === selectedId)

  return (
    <div className="page pb-12">
      <div className="page-header">
        <div>
          <h1 className="page-title">Queries <span className="glow-text">Management</span></h1>
          <p className="page-subtitle">{data.length} total calculator queries</p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="filter-bar">
        <div className="relative" style={{ flex: '1 1 220px', maxWidth: 340 }}>
          <Search size={14} color="#94a3b8"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input className="input" style={{ paddingLeft: 36 }} placeholder="Search name or city..."
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

      {/* Main Split Layout container */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
        
        {/* LEFT COLUMN: TABLE CONTAINER */}
        <div className={`${selectedId ? 'lg:col-span-3' : 'lg:col-span-5'} transition-all duration-300 flex flex-col gap-4 relative z-10`}>
          <div className="glass shadow-xl border border-white/[0.08]" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>City</th>
                    <th>Requirement</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>Loading...</td></tr>
                    : filtered.length === 0
                      ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>No queries found.</td></tr>
                      : filtered.map((q, i) => {
                          const isActive = selectedId === q._id;
                          return (
                            <motion.tr key={q._id}
                              initial={{ opacity: 0 }} 
                              animate={{ opacity: 1 }} 
                              transition={{ delay: i * 0.04 }}
                              onClick={() => setSelectedId(q._id)}
                              style={{ 
                                cursor: 'pointer',
                                background: isActive ? 'rgba(255,122,0,0.05)' : 'transparent',
                              }}
                              className="transition-all duration-150"
                            >
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
                                  <button onClick={e => { e.stopPropagation(); setSelectedId(isActive ? null : q._id); }}
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
                          );
                        })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: SIDE DETAILS PANEL */}
        <AnimatePresence>
          {selectedId && selectedQuery && (
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
              <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, background: 'radial-gradient(circle, rgba(0,163,224,0.18) 0%, transparent 70%)', pointerEvents: 'none', borderRadius: '50%', zIndex: 0 }} />
              <div style={{ position: 'absolute', bottom: -50, left: -50, width: 180, height: 180, background: 'radial-gradient(circle, rgba(0,201,167,0.1) 0%, transparent 70%)', pointerEvents: 'none', borderRadius: '50%', zIndex: 0 }} />

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
                onMouseEnter={e => { e.currentTarget.style.color = '#00A3E0'; e.currentTarget.style.borderColor = 'rgba(0,163,224,0.3)'; e.currentTarget.style.background = 'rgba(0,163,224,0.08)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.6)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
              >
                <X size={15} />
              </button>

              <div style={{ flex: 1, overflowY: 'auto', zIndex: 1, paddingRight: '4px' }} className="space-y-6">
                
                {/* Profile Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left', paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', inset: -3, borderRadius: 16, background: 'linear-gradient(135deg,#00A3E0,#00C9A7)', opacity: 0.35, filter: 'blur(5px)' }} />
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-md flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#00A3E0,#00C9A7)', border: '1.5px solid rgba(255,255,255,0.25)', position: 'relative', zIndex: 1 }}>
                      {selectedQuery.name?.[0] ?? '?'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 style={{ margin: 0, fontWeight: 800, fontSize: 20, color: '#ffffff', letterSpacing: '0.3px', lineHeight: 1.25 }}>{selectedQuery.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="badge" style={{ background: S[selectedQuery.status].bg, color: S[selectedQuery.status].color, border: `1px solid ${S[selectedQuery.status].border}`, fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 20 }}>
                        {selectedQuery.status}
                      </span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>ID: {selectedQuery._id.slice(-6).toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Section: Overview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                  <span style={{ fontSize: 10, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#00A3E0', display: 'block', paddingLeft: 4 }}>Query Overview</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 14 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', uppercase: true }}>RECORD TYPE</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>Calculator Inquiry</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', uppercase: true }}>SUBMITTED DATE</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>{new Date(selectedQuery.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Contact Credentials */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                  <span style={{ fontSize: 10, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#00A3E0', display: 'block', paddingLeft: 4 }}>Contact Credentials</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    
                    {[
                      { label: "Phone Number", val: selectedQuery.phone, icon: Phone, color: "#FF7A00", copyable: true },
                      { label: "Location City", val: selectedQuery.city, icon: MapPin, color: "#22c55e", copyable: false },
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

                {/* Requirement Specification */}
                {selectedQuery.requirement && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                    <span style={{ fontSize: 10, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#00A3E0', display: 'block', paddingLeft: 4 }}>System Requirement</span>
                    <div style={{ 
                      background: 'rgba(0,163,224,0.04)', 
                      border: '1px solid rgba(0,163,224,0.12)', 
                      borderRadius: 16, 
                      padding: '14px 18px', 
                      position: 'relative'
                    }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: 'linear-gradient(180deg,#00A3E0,#00C9A7)', borderRadius: '3px 0 0 3px' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}><MessageSquare size={12} color="#00A3E0" /> Calculations Summary</div>
                      <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'rgba(255,255,255,0.85)', fontWeight: 500 }}>{selectedQuery.requirement}</p>
                    </div>
                  </div>
                )}

              </div>

              {/* Status Switcher */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 18, marginTop: 'auto', textAlign: 'left', zIndex: 1 }}>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.4)', display: 'block', paddingLeft: 4, marginBottom: 10 }}>Update Status</span>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr 1fr', 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.06)', 
                  padding: 4, 
                  borderRadius: 14, 
                  gap: 4 
                }}>
                  {['Pending', 'Reviewed', 'Closed'].map(statusOption => {
                    const isActive = selectedQuery.status === statusOption;
                    return (
                      <button
                        key={statusOption}
                        onClick={() => setStatus(selectedQuery._id, statusOption)}
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
