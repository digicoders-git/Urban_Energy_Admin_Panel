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
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 30 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border-card)] rounded-3xl p-6 md:p-7 relative z-30 shadow-2xl flex flex-col justify-between gap-6 h-full min-h-[580px] overflow-hidden"
            >
              {/* CLOSE BUTTON */}
              <button 
                onClick={() => setSelectedId(null)} 
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[var(--bg-input)] border border-[var(--border-card)] flex items-center justify-center hover:bg-orange/10 hover:border-orange/20 transition-all text-[var(--text-dim)] hover:text-orange cursor-pointer shadow-sm active:scale-95 z-10"
              >
                <X size={14} />
              </button>

              <div className="flex-1 overflow-y-auto space-y-6 pr-1">
                {/* Profile/Avatar header */}
                <div className="flex items-center gap-4 text-left pb-2">
                  <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-md flex-shrink-0"
                    style={{ background: 'linear-gradient(135deg,#FF7A00,#FFB800)' }}>
                    {selectedContact.name?.[0] ?? '?'}
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-outfit font-extrabold text-xl text-[var(--text-main)] tracking-wide max-w-[200px] truncate leading-tight">{selectedContact.name}</h3>
                    <div className="flex items-center gap-2">
                      <span className="badge font-space text-[10.5px] px-2.5 py-0.5" style={{ background: S[selectedContact.status].bg, color: S[selectedContact.status].color, border: `1px solid ${S[selectedContact.status].border}` }}>
                        {selectedContact.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Section: Overview */}
                <div className="space-y-3 text-left">
                  <span className="text-[9px] font-space font-bold uppercase tracking-widest text-orange block pl-1">Lead Overview</span>
                  <div className="grid grid-cols-2 gap-4 bg-[var(--bg-input)]/30 border border-[var(--border-card)] rounded-2xl p-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[8.5px] font-bold text-[var(--text-label)] uppercase tracking-wider font-orbitron">Record Type</span>
                      <span className="text-xs font-semibold text-[var(--text-main)]">Contact Lead</span>
                    </div>
                    <div className="flex flex-col gap-0.5">
                      <span className="text-[8.5px] font-bold text-[var(--text-label)] uppercase tracking-wider font-orbitron">Created Date</span>
                      <span className="text-xs font-semibold text-[var(--text-main)]">{new Date(selectedContact.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Smart Solar Technical ROI Card */}
                {selectedContact.bill && (
                  <div className="space-y-3 text-left">
                    <span className="text-[9px] font-space font-bold uppercase tracking-widest text-emerald-400 block pl-1">Technical ROI Assessment</span>
                    <div className="bg-gradient-to-br from-emerald-500/[0.06] to-transparent border border-emerald-500/15 rounded-2xl p-4 text-left relative overflow-hidden shadow-md">
                      <div className="absolute -top-12 -right-12 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
                      
                      <div className="grid grid-cols-3 gap-3">
                        {/* System Size Recommendation */}
                        <div className="bg-[var(--bg-card)]/60 border border-[var(--border-card)] rounded-xl p-3 flex flex-col gap-1.5 transition-all duration-300 hover:border-emerald-500/10">
                          <span className="text-[7.5px] font-bold text-[var(--text-dim)]/70 uppercase tracking-wider font-space leading-tight">Recommended</span>
                          <div className="text-[13px] font-extrabold text-[var(--text-main)] font-orbitron flex items-baseline gap-0.5 mt-auto">
                            {Math.ceil(selectedContact.bill / 1500)} <span className="text-[9px] text-[var(--text-dim)]/80 font-sans font-medium">kWp</span>
                          </div>
                        </div>

                        {/* Estimated Monthly Savings */}
                        <div className="bg-[var(--bg-card)]/60 border border-[var(--border-card)] rounded-xl p-3 flex flex-col gap-1.5 transition-all duration-300 hover:border-emerald-500/10">
                          <span className="text-[7.5px] font-bold text-[var(--text-dim)]/70 uppercase tracking-wider font-space leading-tight">Est. Savings</span>
                          <div className="text-[13px] font-extrabold text-emerald-400 font-orbitron flex items-baseline gap-0.5 mt-auto">
                            ₹{Math.floor(selectedContact.bill * 0.85).toLocaleString('en-IN')}
                          </div>
                        </div>

                        {/* Green Impact */}
                        <div className="bg-[var(--bg-card)]/60 border border-[var(--border-card)] rounded-xl p-3 flex flex-col gap-1.5 transition-all duration-300 hover:border-emerald-500/10">
                          <span className="text-[7.5px] font-bold text-[var(--text-dim)]/70 uppercase tracking-wider font-space leading-tight">CO2 Offsets</span>
                          <div className="text-[13px] font-extrabold text-sky-400 font-orbitron flex items-baseline gap-0.5 mt-auto">
                            {((selectedContact.bill / 8) * 12 * 0.0008).toFixed(1)} <span className="text-[9px] text-[var(--text-dim)]/80 font-sans font-medium">T</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Detailed fields grid */}
                <div className="space-y-3 text-left">
                  <span className="text-[9px] font-space font-bold uppercase tracking-widest text-orange block pl-1">Contact Information</span>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {renderInfoCard("Email Address", selectedContact.email, Mail, "text-sky", true, "Email")}
                    {renderInfoCard("Phone Number", selectedContact.phone, Phone, "text-orange", true, "Phone")}
                    {renderInfoCard("City / Location", selectedContact.city, MapPin, "text-emerald-400")}
                    {renderInfoCard("Monthly Bill", `₹${selectedContact.bill?.toLocaleString('en-IN')}/month`, IndianRupee, "text-yellow-400")}
                    
                    <div className="md:col-span-2">
                      {renderInfoCard("Inquiry Date & Time", formatDate(selectedContact.createdAt), Calendar, "text-purple-400")}
                    </div>
                    
                    {selectedContact.message && (
                      <div className="md:col-span-2 flex flex-col gap-3 bg-gradient-to-br from-[var(--bg-input)] to-transparent border border-[var(--border-card)] p-4.5 rounded-2xl text-left relative overflow-hidden shadow-inner mt-1">
                        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange to-orange-light" />
                        <div className="flex items-center gap-2 text-[var(--text-label)]">
                          <MessageSquare size={13} className="text-orange flex-shrink-0" />
                          <span className="text-[9px] font-bold uppercase tracking-wider font-space block">Client Message</span>
                        </div>
                        <p className="text-xs text-[var(--text-dim)] leading-relaxed font-outfit font-light italic">"{selectedContact.message}"</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sophisticated Segmented Tab Control Status Switcher */}
              <div className="space-y-3 border-t border-[var(--border-card)] pt-4 text-left mt-auto">
                <span className="text-[9px] font-bold uppercase tracking-wider text-[var(--text-label)] block font-orbitron pl-1">Set Lead Status</span>
                <div className="grid grid-cols-3 bg-[var(--bg-input)] border border-[var(--border-card)] p-1 rounded-xl gap-1">
                  {['New', 'Contacted', 'Converted'].map(statusOption => {
                    const isActive = selectedContact.status === statusOption;
                    return (
                      <button
                        key={statusOption}
                        onClick={() => setStatus(selectedContact._id, statusOption)}
                        className="py-2.5 text-center rounded-lg text-xs font-bold transition-all duration-200 cursor-pointer border-0"
                        style={{
                          background: isActive ? S[statusOption].bg : 'transparent',
                          color: isActive ? S[statusOption].color : 'var(--text-dim)',
                          opacity: isActive ? 1 : 0.65,
                          boxShadow: isActive ? `0 2px 8px rgba(0,0,0,0.15)` : 'none'
                        }}
                      >
                        {capitalize(statusOption)}
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
