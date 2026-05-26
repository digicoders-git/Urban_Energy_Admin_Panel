import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Search, Trash2, Eye, Phone, Mail, MapPin, IndianRupee, X, Calendar, MessageSquare, Copy, Check, Zap
} from 'lucide-react'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { contactsApi } from '../api'

const S = {
  New: { bg: 'rgba(255,122,0,0.12)', color: '#FF7A00', border: 'rgba(255,122,0,0.25)' },
  Contacted: { bg: 'rgba(0,163,224,0.12)', color: '#00A3E0', border: 'rgba(0,163,224,0.25)' },
  Converted: { bg: 'rgba(0,201,167,0.12)', color: '#00C9A7', border: 'rgba(0,201,167,0.25)' },
}

const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''

export default function Contacts() {
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
    contactsApi.getAll()
      .then(setData)
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = data.filter(c => {
    const q = search.toLowerCase()
    return ((c.name?.toLowerCase() ?? '').includes(q) || (c.city?.toLowerCase() ?? '').includes(q)) &&
      (filter === 'All' || c.status === filter)
  })

  const setStatus = async (id, status) => {
    try {
      const updated = await contactsApi.updateStatus(id, status)
      setData(prev => prev.map(c => c._id === id ? updated : c))
      toast.success(`Status updated to ${status}`)
    } catch (e) { 
      toast.error(e.message) 
    }
  }

  const del = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Contact?', text: 'This action cannot be undone.', icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Delete', cancelButtonText: 'Cancel',
      background: '#0B1D51', color: '#ffffff', confirmButtonColor: '#ef4444', cancelButtonColor: 'rgba(255,255,255,0.08)',
    })
    if (result.isConfirmed) {
      try {
        await contactsApi.delete(id)
        setData(d => d.filter(c => c._id !== id))
        if (selectedId === id) setSelectedId(null)
        toast.success('Contact deleted.')
      } catch (e) { toast.error(e.message) }
    }
  }

  const selectedContact = data.find(c => c._id === selectedId)

  const formatDate = (dateStr) => {
    if (!dateStr) return '—'
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const renderInfoCard = (label, value, IconComponent, iconColorClass = "text-orange", isCopyable = false, copyName = "") => (
    <div className="flex flex-col gap-3 bg-gradient-to-br from-[var(--bg-input)] to-transparent border border-[var(--border-card)] p-4 rounded-2xl transition-all duration-300 group hover:-translate-y-0.5 shadow-sm text-left relative overflow-hidden">
      <div className="absolute inset-0 border border-transparent rounded-2xl group-hover:border-orange/20 transition-colors duration-300 pointer-events-none" />
      <span className="text-[9px] font-space font-bold uppercase tracking-widest text-[var(--text-label)] block">{label}</span>
      <div className="flex items-center gap-3 text-xs font-semibold text-[var(--text-main)]">
        <div className={`w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--bg-input)] to-transparent flex items-center justify-center ${iconColorClass} group-hover:scale-105 transition-all duration-300 flex-shrink-0 border border-[var(--border-card)]`}>
          <IconComponent size={15} />
        </div>
        <div className="flex-1 min-w-0 pr-1">
          <span className="select-all font-outfit truncate block tracking-wide text-sm">{value || '—'}</span>
        </div>
        {isCopyable && value && (
          <button 
            onClick={() => copyToClipboard(value, copyName)}
            className="w-7 h-7 rounded-lg bg-[var(--bg-input)] hover:bg-orange/10 hover:text-orange text-[var(--text-dim)] border border-[var(--border-card)] hover:border-orange/20 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 flex-shrink-0"
          >
            {copiedField === copyName ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="page pb-12">
      <div className="page-header">
        <div>
          <h1 className="page-title">Contacts <span className="glow-text">Management</span></h1>
          <p className="page-subtitle">{data.length} total leads</p>
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
          {['All', 'New', 'Contacted', 'Converted'].map(f => (
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
                    <th>Bill/mo</th>
                    <th>Status</th>
                    <th>Date</th>
                    <th></th></tr>
                </thead>
                <tbody>
                  {loading
                    ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>Loading...</td></tr>
                    : filtered.length === 0
                      ? <tr><td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>No contacts found.</td></tr>
                      : filtered.map((c, i) => {
                          const isActive = selectedId === c._id;
                          return (
                            <motion.tr key={c._id}
                              initial={{ opacity: 0 }} 
                              animate={{ opacity: 1 }} 
                              transition={{ delay: i * 0.04 }}
                              onClick={() => setSelectedId(c._id)}
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
                                    {c.name?.[0] ?? '?'}
                                  </div>
                                  <span style={{ fontWeight: 600, color: '#ffffff' }}>{c.name}</span>
                                </div>
                              </td>
                              <td style={{ color: 'rgba(255,255,255,0.6)' }}>{c.city}</td>
                              <td style={{ color: '#FFB800', fontWeight: 700 }}>₹{c.bill?.toLocaleString('en-IN')}</td>
                              <td>
                                <span className="badge" style={{ background: S[c.status].bg, color: S[c.status].color, border: `1px solid ${S[c.status].border}` }}>
                                  {c.status}
                                </span>
                              </td>
                              <td style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11.5 }}>{new Date(c.createdAt).toLocaleDateString('en-IN')}</td>
                              <td>
                                <div className="flex gap-1.5 text-right justify-end">
                                  <button onClick={e => { e.stopPropagation(); setSelectedId(isActive ? null : c._id); }}
                                    style={{ background: 'rgba(0,163,224,0.1)', border: '1px solid rgba(0,163,224,0.2)', borderRadius: 7, padding: '5px 7px', cursor: 'pointer' }}>
                                    <Eye size={12} color="#00A3E0" />
                                  </button>
                                  <button onClick={e => { e.stopPropagation(); del(c._id) }}
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
          {selectedId && selectedContact && (
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
                minHeight: '620px',
                zIndex: 30
              }}
              className="lg:col-span-2 shadow-2xl flex flex-col justify-between"
            >
              {/* Backglow element */}
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
                
                {/* Profile/Avatar Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left', paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', inset: -3, borderRadius: 16, background: 'linear-gradient(135deg, #FF7A00, #FFB800)', opacity: 0.35, filter: 'blur(5px)' }} />
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-md flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#FF7A00,#FFB800)', border: '1.5px solid rgba(255,255,255,0.25)', position: 'relative', zIndex: 1 }}>
                      {selectedContact.name?.[0] ?? '?'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 style={{ margin: 0, fontWeight: 800, fontSize: 20, color: '#ffffff', letterSpacing: '0.3px', lineHeight: 1.25 }}>{selectedContact.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="badge" style={{ background: S[selectedContact.status].bg, color: S[selectedContact.status].color, border: `1px solid ${S[selectedContact.status].border}`, fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 20 }}>
                        {selectedContact.status}
                      </span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>ID: {selectedContact._id.slice(-6).toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Section: Overview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                  <span style={{ fontSize: 10, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#FF7A00', display: 'block', paddingLeft: 4 }}>Lead Overview</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 14 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', uppercase: true, tracking: '0.5px' }}>RECORD TYPE</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>Direct Inquiry</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', uppercase: true, tracking: '0.5px' }}>RECEIVED DATE</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>{new Date(selectedContact.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Technical ROI Assessment */}
                {selectedContact.bill > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                    <span style={{ fontSize: 10, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#22c55e', display: 'block', paddingLeft: 4 }}>Rooftop ROI Analysis</span>
                    <div style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(0,163,224,0.03))', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 20, padding: 18, relative: 'true', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
                        
                        <div style={{ background: 'rgba(9, 22, 64, 0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.35)', uppercase: true, letterSpacing: '0.5px', lineHeight: 1.1 }}>RECOMMENDED</span>
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#ffffff', fontFamily: 'Space Grotesk, sans-serif', display: 'flex', alignItems: 'baseline', gap: 2, marginTop: 'auto' }}>
                            {Math.max(1, Math.ceil(selectedContact.bill / 1500))} <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>kWp</span>
                          </div>
                        </div>

                        <div style={{ background: 'rgba(9, 22, 64, 0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.35)', uppercase: true, letterSpacing: '0.5px', lineHeight: 1.1 }}>EST. SAVINGS</span>
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#22c55e', fontFamily: 'Space Grotesk, sans-serif', display: 'flex', alignItems: 'baseline', gap: 1, marginTop: 'auto' }}>
                            ₹{Math.floor(selectedContact.bill * 0.85).toLocaleString('en-IN')}
                          </div>
                        </div>

                        <div style={{ background: 'rgba(9, 22, 64, 0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 10, display: 'flex', flexDirection: 'column', gap: 6 }}>
                          <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.35)', uppercase: true, letterSpacing: '0.5px', lineHeight: 1.1 }}>CO₂ OFFSETS</span>
                          <div style={{ fontSize: 14, fontWeight: 800, color: '#00A3E0', fontFamily: 'Space Grotesk, sans-serif', display: 'flex', alignItems: 'baseline', gap: 2, marginTop: 'auto' }}>
                            {((selectedContact.bill / 8) * 12 * 0.0008).toFixed(1)} <span style={{ fontSize: 9, color: 'rgba(255,255,255,0.4)', fontWeight: 500 }}>T/Yr</span>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                )}

                {/* Contact Information Fields */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                  <span style={{ fontSize: 10, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#FF7A00', display: 'block', paddingLeft: 4 }}>Contact Credentials</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    
                    {[
                      { label: "Email Address", val: selectedContact.email, icon: Mail, color: "#00A3E0", copyable: true },
                      { label: "Phone Number", val: selectedContact.phone, icon: Phone, color: "#FF7A00", copyable: true },
                      { label: "Location City", val: selectedContact.city, icon: MapPin, color: "#22c55e", copyable: false },
                      { label: "Current Electric Bill", val: selectedContact.bill ? `₹${selectedContact.bill.toLocaleString('en-IN')}/Month` : 'N/A', icon: IndianRupee, color: "#eab308", copyable: false }
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

                {/* Client Message */}
                {selectedContact.message && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                    <span style={{ fontSize: 10, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#FF7A00', display: 'block', paddingLeft: 4 }}>Inquiry message</span>
                    <div style={{ 
                      background: 'rgba(255,122,0,0.04)', 
                      border: '1px solid rgba(255,122,0,0.12)', 
                      borderRadius: 16, 
                      padding: '14px 18px', 
                      position: 'relative'
                    }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: 'linear-gradient(180deg, #FF7A00, #FFB800)', borderRadius: '3px 0 0 3px' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}><MessageSquare size={12} color="#FF7A00" /> Client Notes</div>
                      <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', fontWeight: 500 }}>"{selectedContact.message}"</p>
                    </div>
                  </div>
                )}

              </div>

              {/* Sophisticated Segmented Tab Control Status Switcher */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 18, marginTop: 'auto', textAlign: 'left', zIndex: 1 }}>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.4)', display: 'block', paddingLeft: 4, marginBottom: 10 }}>Update Lead Status</span>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr 1fr', 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.06)', 
                  padding: 4, 
                  borderRadius: 14, 
                  gap: 4 
                }}>
                  {['New', 'Contacted', 'Converted'].map(statusOption => {
                    const isActive = selectedContact.status === statusOption;
                    return (
                      <button
                        key={statusOption}
                        onClick={() => setStatus(selectedContact._id, statusOption)}
                        style={{
                          py: '10px',
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
