import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Phone, Mail, MapPin, IndianRupee, Briefcase, Download, Calendar, 
  User, Info, Star, FileText, Award, Gift, Zap, MessageSquare, Building, Percent,
  Maximize2
} from 'lucide-react'
import { toast } from 'react-toastify'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

export default function LandscapeModal({ 
  isOpen, 
  onClose, 
  type, 
  data, 
  statusStyles, 
  onStatusUpdate, 
  onDownloadCv,
  onUpdateCommission 
}) {
  const [commInput, setCommInput] = useState('')
  const [editingComm, setEditingComm] = useState(false)
  const [zoomedQrUrl, setZoomedQrUrl] = useState(null)

  if (!isOpen || !data) return null

  // Format Date Helper
  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Set initial commission input value when editing starts
  const startEditCommission = () => {
    setCommInput(data.commission ?? '')
    setEditingComm(true)
  }

  const saveCommission = () => {
    if (onUpdateCommission && commInput !== '') {
      onUpdateCommission(data._id, Number(commInput))
      setEditingComm(false)
    }
  }

  // Reusable Premium Info Card Component
  const renderInfoCard = (label, value, IconComponent, colorClass = "text-orange") => (
    <div className="flex flex-col gap-3 bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/8 hover:border-white/15 p-5 rounded-2xl transition-all duration-300 group hover:-translate-y-1 shadow-md hover:shadow-lg hover:shadow-orange/5 text-left">
      <span className="text-[8px] font-bold uppercase tracking-widest text-white/25 font-space block">{label}</span>
      <div className="flex items-center gap-3.5 text-sm font-semibold text-white/95">
        <div className={`w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center ${colorClass} group-hover:scale-125 transition-transform duration-300 flex-shrink-0 shadow-md`}>
          <IconComponent size={16} className="stroke-[1.5]" />
        </div>
        <span className="font-outfit truncate text-sm">{value || '—'}</span>
      </div>
    </div>
  )

  // Render Status Badge
  const renderStatusBadge = (status, styles) => {
    const style = styles?.[status] || { bg: 'rgba(255,255,255,0.08)', color: '#ffffff', border: 'rgba(255,255,255,0.15)' }
    const label = style.label || status
    return (
      <span className="badge" style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}`, padding: '4px 10px', fontSize: '10.5px' }}>
        {label}
      </span>
    )
  }

  // 1. APPLICATIONS PAGE DATA
  const renderApplicationData = () => (
    <div className="grid grid-cols-2 gap-4">
      {renderInfoCard("Email Address", data.email, Mail)}
      {renderInfoCard("Phone Number", data.phone, Phone)}
      {renderInfoCard("Applied Position", data.role, Briefcase)}
      {renderInfoCard("Applied Date", formatDate(data.createdAt), Calendar)}
      {data.message && (
        <div className="col-span-2 flex flex-col gap-2 bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-left">
          <span className="text-[9px] font-bold uppercase tracking-widest text-white/20 font-space block">Cover Note / Message</span>
          <p className="text-xs text-white/70 leading-relaxed font-outfit">{data.message}</p>
        </div>
      )}
    </div>
  )

  // 2. CONTACTS PAGE DATA
  const renderContactData = () => (
    <div className="grid grid-cols-2 gap-5">
      <div className="group">
        {renderInfoCard("Email Address", data.email, Mail, "text-sky")}
      </div>
      <div className="group">
        {renderInfoCard("Phone Number", data.phone, Phone, "text-orange")}
      </div>
      <div className="group">
        {renderInfoCard("City / Location", data.city, MapPin, "text-emerald-400")}
      </div>
      <div className="group">
        {renderInfoCard("Monthly Bill", `₹${data.bill?.toLocaleString('en-IN')}/month`, IndianRupee, "text-yellow-400")}
      </div>
      <div className="col-span-2 group">
        {renderInfoCard("Inquiry Date", formatDate(data.createdAt), Calendar, "text-purple-400")}
      </div>
      {data.message && (
        <div className="col-span-2 flex flex-col gap-3 bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/8 hover:border-white/15 p-5 rounded-2xl text-left transition-all duration-300 hover:bg-white/[0.06] shadow-lg hover:shadow-xl hover:shadow-orange/5">
          <div className="flex items-center gap-2">
            <MessageSquare size={14} className="text-orange flex-shrink-0" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-white/30 font-space block">Client Message</span>
          </div>
          <p className="text-xs text-white/75 leading-relaxed font-outfit pl-6 border-l-2 border-orange/30">"{data.message}"</p>
        </div>
      )}
    </div>
  )

  // 3. REFERRALS PAGE DATA
  const renderReferralData = () => (
    <div className="grid grid-cols-2 gap-6">
      {/* Referrer Box */}
      <div className="bg-orange/5 border border-orange/15 rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 hover:bg-orange/10 text-left">
        <div className="flex items-center gap-2 text-orange font-bold text-xs uppercase tracking-wider font-space">
          <User size={14} /> Referrer (Who Sent It)
        </div>
        <div className="space-y-2 text-xs">
          <div className="text-sm font-bold text-white font-outfit">{data.referrerName}</div>
          <div className="text-white/60 flex items-center gap-1.5"><Phone size={12} className="text-orange" /> {data.referrerPhone}</div>
          {data.referrerId && (
            <div className="text-white/40 flex items-center gap-1.5 font-mono text-[10px]">
              <Info size={11} /> ID: {data.referrerId._id || data.referrerId}
            </div>
          )}
        </div>
      </div>

      {/* Referee Box */}
      <div className="bg-sky/5 border border-sky/15 rounded-2xl p-5 flex flex-col gap-3 transition-all duration-300 hover:bg-sky/10 text-left">
        <div className="flex items-center gap-2 text-sky font-bold text-xs uppercase tracking-wider font-space">
          <Gift size={14} /> Friend (Referee / Lead)
        </div>
        <div className="space-y-2 text-xs">
          <div className="text-sm font-bold text-white font-outfit">{data.refereeName}</div>
          <div className="text-white/60 flex items-center gap-1.5"><Phone size={12} className="text-sky" /> {data.refereePhone}</div>
          {data.refereeEmail && (
            <div className="text-white/60 flex items-center gap-1.5"><Mail size={12} className="text-sky" /> {data.refereeEmail}</div>
          )}
          <div className="text-white/60 flex items-center gap-1.5"><MapPin size={12} className="text-sky" /> {data.refereeCity}</div>
        </div>
      </div>

      {/* Connection Details */}
      <div className="col-span-2 grid grid-cols-3 gap-4 border-t border-white/5 pt-4">
        {renderInfoCard("Interest Connection Type", data.refereeType, Zap, "text-orange")}
        {renderInfoCard("Monthly Bill", `₹${data.refereeBill?.toLocaleString('en-IN')}/month`, IndianRupee, "text-orange")}
        {renderInfoCard("Referral Date", formatDate(data.createdAt), Calendar, "text-orange")}
      </div>

      {data.refereeMessage && (
        <div className="col-span-2 flex flex-col gap-2 bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-left">
          <span className="text-[9px] font-bold uppercase tracking-widest text-white/20 font-space block">Referrer Notes</span>
          <p className="text-xs text-white/70 leading-relaxed font-outfit">{data.refereeMessage}</p>
        </div>
      )}

      {/* Referrer Payout Details */}
      {data.referrerId && typeof data.referrerId === 'object' && (data.referrerId.upiId || (data.referrerId.qrCode && data.referrerId.qrCode.contentType)) && (
        <div className="col-span-2 border-t border-white/5 pt-4 flex flex-col gap-3">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 text-left block font-space">Referrer Payout Credentials</span>
          <div className="grid grid-cols-2 gap-6 bg-white/[0.02] border border-white/5 rounded-2xl p-4">
            
            {/* UPI Section */}
            <div className="flex flex-col gap-1.5 justify-center text-left">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 font-space">Linked UPI ID</span>
              {data.referrerId.upiId ? (
                <div className="flex items-center gap-2">
                  <div className="bg-white/5 border border-white/10 px-3 py-2 rounded-lg font-mono text-xs font-bold text-white tracking-wide max-w-[240px] truncate select-all">
                    {data.referrerId.upiId}
                  </div>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(data.referrerId.upiId)
                      toast.success('UPI ID copied to clipboard!')
                    }}
                    className="px-2.5 py-2 bg-orange/10 hover:bg-orange/20 text-orange font-bold text-[10px] rounded-lg border border-orange/20 transition-all cursor-pointer"
                  >
                    Copy
                  </button>
                </div>
              ) : (
                <span className="text-xs text-white/40 italic">No UPI ID provided</span>
              )}
            </div>

            {/* QR Code Section */}
            <div className="flex items-center gap-4 border-l border-white/5 pl-6 text-left">
              {data.referrerId.qrCode && data.referrerId.qrCode.contentType ? (
                <>
                  <div 
                    className="w-14 h-14 bg-white rounded-lg p-0.5 border border-white/15 cursor-pointer hover:scale-105 active:scale-95 transition-all overflow-hidden flex-shrink-0 relative group"
                    onClick={() => {
                      setZoomedQrUrl(`${API_BASE}/referrers/qrcode/${data.referrerId._id || data.referrerId}`)
                    }}
                  >
                    <img 
                      src={`${API_BASE}/referrers/qrcode/${data.referrerId._id || data.referrerId}`} 
                      alt="Referrer QR" 
                      className="w-full h-full object-cover rounded"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white">
                      <Maximize2 size={12} />
                    </div>
                  </div>
                  <div className="text-left space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 font-space block">Linked QR Code</span>
                    <button
                      onClick={() => {
                        setZoomedQrUrl(`${API_BASE}/referrers/qrcode/${data.referrerId._id || data.referrerId}`)
                      }}
                      className="text-[10px] text-sky hover:text-sky/80 font-bold hover:underline cursor-pointer border-none bg-transparent"
                    >
                      Click to Scan / Full View
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 block">Linked QR Code</span>
                  <span className="text-xs text-white/40 italic font-outfit">No QR Code uploaded</span>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  )

  // 4. PARTNERS PAGE DATA
  const renderPartnerData = () => (
    <div className="grid grid-cols-2 gap-4">
      {renderInfoCard("Organization / Company", data.company || '—', Building)}
      {renderInfoCard("Mobile Number", data.phone, Phone)}
      {renderInfoCard("Email Address", data.email, Mail)}
      {renderInfoCard("Location (City)", data.city, MapPin)}
      {renderInfoCard("Partner Role Type", data.type, Zap)}
      {renderInfoCard("Application Date", formatDate(data.createdAt), Calendar)}
      {data.message && (
        <div className="col-span-2 flex flex-col gap-2 bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-left">
          <span className="text-[9px] font-bold uppercase tracking-widest text-white/20 font-space block">Business Background / Info</span>
          <p className="text-xs text-white/70 leading-relaxed font-outfit">{data.message}</p>
        </div>
      )}
    </div>
  )

  // 5. QUERIES PAGE DATA
  const renderQueryData = () => (
    <div className="grid grid-cols-2 gap-4">
      {renderInfoCard("Email Address", data.email || '—', Mail)}
      {renderInfoCard("Phone Number", data.phone || '—', Phone)}
      <div className="col-span-2">
        {renderInfoCard("Submission Date", formatDate(data.createdAt), Calendar)}
      </div>
      {(data.message || data.requirement) && (
        <div className="col-span-2 flex flex-col gap-2 bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-left">
          <span className="text-[9px] font-bold uppercase tracking-widest text-white/20 font-space block">Question / Requirement</span>
          <p className="text-xs text-white/70 leading-relaxed font-outfit">{data.message || data.requirement}</p>
        </div>
      )}
    </div>
  )

  // 6. GET QUOTES PAGE DATA
  const renderQuoteData = () => (
    <div className="grid grid-cols-2 gap-4">
      {renderInfoCard("Email Address", data.email, Mail)}
      {renderInfoCard("Phone Number", data.phone, Phone)}
      {renderInfoCard("Location (City / State)", `${data.city || '—'}${data.state ? `, ${data.state}` : ''}`, MapPin)}
      {renderInfoCard("Monthly Bill", `₹${(data.bill || data.monthlyBill || 0).toLocaleString('en-IN')}/month`, IndianRupee)}
      {renderInfoCard("Roof Area / Solar Capacity", data.systemSize || `${data.area || '—'} Sq.Ft (${data.capacity || '—'} kW)`, Building)}
      {renderInfoCard("Power Phase Type", `${data.phase || data.powerPhase || '—'} Phase`, Zap)}
      <div className="col-span-2">
        {renderInfoCard("Request Date", formatDate(data.createdAt), Calendar)}
      </div>
      {data.message && (
        <div className="col-span-2 flex flex-col gap-2 bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-left">
          <span className="text-[9px] font-bold uppercase tracking-widest text-white/20 font-space block">Message / Notes</span>
          <p className="text-xs text-white/70 leading-relaxed font-outfit">{data.message}</p>
        </div>
      )}
    </div>
  )

  // 7. REVIEWS PAGE DATA
  const renderReviewData = () => (
    <div className="grid grid-cols-2 gap-4">
      {renderInfoCard("Designation / Role", data.designation || data.role || 'Customer', Briefcase)}
      <div className="flex flex-col gap-2 bg-white/[0.02] border border-white/5 p-4 rounded-2xl transition-all duration-300 text-left">
        <span className="text-[9px] font-bold uppercase tracking-widest text-white/20 font-space block">Star Rating</span>
        <div className="flex items-center gap-1.5 text-sm font-semibold text-white/90">
          <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-orange flex-shrink-0">
            <Star size={14} fill="#FFB800" stroke="#FFB800" />
          </div>
          <div className="flex items-center gap-1">
            {[...Array(5)].map((_, i) => {
              const stars = data.stars ?? data.rating ?? 5
              return (
                <Star key={i} size={11} fill={i < stars ? '#FFB800' : 'transparent'} stroke={i < stars ? '#FFB800' : 'rgba(255,255,255,0.2)'} />
              )
            })}
            <span className="ml-1.5 font-bold font-orbitron text-xs">{(data.stars ?? data.rating ?? 5)}/5</span>
          </div>
        </div>
      </div>
      <div className="col-span-2">
        {renderInfoCard("Submitted Date", formatDate(data.createdAt), Calendar)}
      </div>
      {data.review && (
        <div className="col-span-2 flex flex-col gap-2 bg-white/[0.02] border border-white/5 p-4 rounded-2xl text-left">
          <span className="text-[9px] font-bold uppercase tracking-widest text-white/20 font-space block">Review Content</span>
          <p className="text-xs text-white/70 leading-relaxed font-outfit">"{data.review}"</p>
        </div>
      )}
    </div>
  )

  // Decide dynamically which body layout to use
  const renderBody = () => {
    switch (type) {
      case 'application': return renderApplicationData()
      case 'contact':     return renderContactData()
      case 'referral':    return renderReferralData()
      case 'partner':     return renderPartnerData()
      case 'query':       return renderQueryData()
      case 'quote':       return renderQuoteData()
      case 'review':      return renderReviewData()
      default: return null
    }
  }

  // Get status list for dynamic actions
  const getStatusOptions = () => {
    switch (type) {
      case 'application': return ['New', 'Reviewed', 'Shortlisted', 'Rejected']
      case 'contact':     return ['New', 'Contacted', 'Converted']
      case 'referral':    return ['New', 'Contacted', 'Converted', 'Paid']
      case 'partner':     return ['pending', 'approved', 'rejected']
      case 'query':       return ['Pending', 'Reviewed', 'Closed']
      case 'quote':       return ['new', 'contacted', 'closed']
      case 'review':      return ['pending', 'published', 'rejected']
      default: return []
    }
  }

  const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''

  // Get active styling dynamically with soft glow matching the status color
  const getActiveStatusStyle = (statusOption) => {
    const optStyle = statusStyles?.[statusOption] || { color: '#ffffff', bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.06)' }
    const color = optStyle.color || '#ffffff'
    
    let rgbaBg = 'rgba(255, 255, 255, 0.08)'
    let rgbaBorder = 'rgba(255, 255, 255, 0.15)'
    
    if (color.startsWith('#')) {
      const hex = color.replace('#', '')
      let r = 255, g = 255, b = 255
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16)
        g = parseInt(hex[1] + hex[1], 16)
        b = parseInt(hex[2] + hex[2], 16)
      } else if (hex.length === 6) {
        r = parseInt(hex.substring(0, 2), 16)
        g = parseInt(hex.substring(2, 4), 16)
        b = parseInt(hex.substring(4, 6), 16)
      }
      rgbaBg = `rgba(${r}, ${g}, ${b}, 0.08)`
      rgbaBorder = `rgba(${r}, ${g}, ${b}, 0.25)`
    } else if (color.startsWith('rgba')) {
      rgbaBg = color.replace('1)', '0.08)').replace('1.0)', '0.08)')
      rgbaBorder = color.replace('1)', '0.25)').replace('1.0)', '0.25)')
    }
    
    return {
      color,
      background: rgbaBg,
      borderColor: rgbaBorder,
      boxShadow: `inset 0 0 12px ${rgbaBg}`
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
        
        {/* Floating Glassmorphic Animated Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          className="w-full max-w-5xl bg-gradient-to-br from-slate-950/95 to-slate-900/90 border border-white/10 rounded-3xl overflow-hidden shadow-[0_25px_70px_-15px_rgba(0,0,0,0.95)] flex flex-col md:flex-row relative backdrop-blur-3xl"
          style={{ height: 'auto', minHeight: '540px', maxHeight: '90vh' }}
        >
          {/* Animated/Breathing decorative HSL glows */}
          <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-[#FF7A00]/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
          <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-[#00A3E0]/5 rounded-full blur-[120px] pointer-events-none animate-pulse" />
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 rounded-full blur-[100px] pointer-events-none" />

          {/* CLOSE BUTTON */}
          <button 
            onClick={onClose} 
            className="absolute top-5 right-5 md:top-6 md:right-6 z-50 w-9 h-9 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/15 transition-all text-white/60 hover:text-white cursor-pointer hover:rotate-90 duration-300"
          >
            <X size={16} />
          </button>

          {/* ── LEFT PANEL: INTEGRATED SIDEBAR ── */}
          <div className="w-full md:w-80 md:shrink-0 bg-white/[0.01] border-b md:border-b-0 md:border-r border-white/8 p-6 md:p-7 flex flex-col justify-between z-10 gap-7 overflow-y-auto max-h-[45vh] md:max-h-full scrollbar-thin select-none">
            
            <div className="space-y-6">
              {/* Profile/Avatar header */}
              <div className="flex items-center gap-4 bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/8 p-5 rounded-2xl shadow-md hover:shadow-lg hover:bg-white/[0.06] transition-all duration-300 group">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-lg relative overflow-hidden flex-shrink-0 group-hover:scale-110 transition-transform duration-300"
                  style={{ background: 'linear-gradient(135deg,#FF7A00,#FFB800)' }}>
                  <div className="absolute inset-0 bg-white/15 animate-pulse" />
                  <span className="relative z-10 font-orbitron">{data.name?.[0] ?? '?'}</span>
                </div>
                <div className="space-y-2 text-left min-w-0 flex-1">
                  <h3 className="font-orbitron font-bold text-base text-white tracking-wide truncate w-full" title={data.name}>{data.name}</h3>
                  <div className="flex items-center gap-2">
                    {renderStatusBadge(data.status, statusStyles)}
                  </div>
                </div>
              </div>

              {/* Quick Info details */}
              <div className="space-y-3 border-t border-white/8 pt-5 text-left">
                <span className="text-[8px] font-bold uppercase tracking-widest text-white/25 block font-space">Record Information</span>
                <div className="flex justify-between items-center text-xs bg-gradient-to-r from-white/[0.04] to-white/[0.01] border border-white/8 p-3.5 rounded-xl font-space hover:bg-white/[0.06] transition-all">
                  <span className="text-white/45 font-medium">Record Type:</span>
                  <span className="font-bold text-orange capitalize text-sm">{type}</span>
                </div>
                <div className="flex justify-between items-center text-xs bg-gradient-to-r from-white/[0.04] to-white/[0.01] border border-white/8 p-3.5 rounded-xl font-space hover:bg-white/[0.06] transition-all">
                  <span className="text-white/45 font-medium">Created At:</span>
                  <span className="font-medium text-white/85 text-sm">{new Date(data.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              {/* Commission panel (For referrals only) */}
              {type === 'referral' && (
                <div className="bg-green-500/5 border border-green-500/15 rounded-2xl p-4 space-y-2 text-left">
                  <div className="flex justify-between items-center text-[9px] text-green-500 font-bold uppercase tracking-widest font-space">
                    <span>Commission Payout</span>
                    {!editingComm && onUpdateCommission && (
                      <button onClick={startEditCommission} className="text-[10px] text-sky font-bold hover:underline cursor-pointer border-none bg-transparent">
                        Edit
                      </button>
                    )}
                  </div>
                  {editingComm ? (
                    <div className="flex gap-1.5 items-center mt-1">
                      <div className="relative flex-1">
                        <IndianRupee size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-white/40" />
                        <input 
                          type="number" 
                          value={commInput} 
                          onChange={e => setCommInput(e.target.value)} 
                          className="input" 
                          style={{ paddingLeft: 22, height: 30, fontSize: 12, paddingTop: 0, paddingBottom: 0 }}
                        />
                      </div>
                      <button onClick={saveCommission} className="btn btn-orange" style={{ padding: '4px 8px', fontSize: 10 }}>Save</button>
                      <button onClick={() => setEditingComm(false)} className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: 10 }}>Cancel</button>
                    </div>
                  ) : (
                    <div className="text-xl font-black text-green-500 flex items-center font-orbitron">
                      <IndianRupee size={16} className="stroke-[2.5]" />
                      {(data.commission ?? 0).toLocaleString('en-IN')}
                    </div>
                  )}
                </div>
              )}

              {/* Action CV Download */}
              {type === 'application' && data.cv?.filename && onDownloadCv && (
                <button 
                  onClick={() => onDownloadCv(data._id)}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-teal/10 hover:bg-teal/20 border border-teal/30 text-[#00C9A7] font-bold text-xs rounded-xl transition-all cursor-pointer"
                >
                  <FileText size={14} /> Download CV File
                  <Download size={13} />
                </button>
              )}
            </div>

            {/* Dynamic Status Update Area */}
            {onStatusUpdate && (
              <div className="space-y-4 border-t border-white/8 pt-5 text-left">
                <span className="text-[8px] font-bold uppercase tracking-widest text-white/25 block font-space">Set Quick Status</span>
                <div className="flex flex-col gap-2.5">
                  {getStatusOptions().map(statusOption => {
                    const isActive = data.status === statusOption
                    const optStyle = statusStyles?.[statusOption] || { color: '#ffffff', bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.06)' }
                    const activeStyles = getActiveStatusStyle(statusOption)
                    return (
                      <button
                        key={statusOption}
                        onClick={() => onStatusUpdate(data._id, statusOption)}
                        className="w-full text-left py-3 px-4 rounded-xl text-xs font-bold border transition-all duration-300 hover:-translate-y-0.5 cursor-pointer flex items-center justify-between group"
                        style={{
                          background: isActive ? activeStyles.background : 'rgba(255,255,255,0.02)',
                          color: isActive ? activeStyles.color : 'rgba(255,255,255,0.45)',
                          borderColor: isActive ? activeStyles.borderColor : 'rgba(255,255,255,0.08)',
                          boxShadow: isActive ? activeStyles.boxShadow : 'none'
                        }}
                      >
                        <span className="group-hover:translate-x-1 transition-transform">{optStyle.label || capitalize(statusOption)}</span>
                        {isActive && <div className="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" style={{ backgroundColor: activeStyles.color }} />}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

          </div>

          {/* ── RIGHT PANEL: INTEGRATED CONTENT PANE ── */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col justify-between z-10">
            <div>
              {/* Header Title */}
              <div className="pb-5 mb-7 border-b border-white/8 flex items-center gap-3 pr-10">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange/20 to-orange/10 flex items-center justify-center">
                  <Info size={18} className="text-orange" />
                </div>
                <h2 className="font-orbitron font-extrabold text-base uppercase tracking-wider text-white/70">
                  {type === 'application' && 'Job Candidate Details'}
                  {type === 'contact' && 'Lead Client Details'}
                  {type === 'referral' && 'Referral Case Details'}
                  {type === 'partner' && 'Partner Franchise Details'}
                  {type === 'query' && 'Website Inquiry Details'}
                  {type === 'quote' && 'Solar Quote Request Details'}
                  {type === 'review' && 'Review Submission Details'}
                </h2>
              </div>

              {/* Dynamic content rendering */}
              <div className="text-white">
                {renderBody()}
              </div>
            </div>

            {/* Bottom info footer */}
            <div className="text-[9px] text-white/25 font-mono mt-8 text-right border-t border-white/8 pt-5 tracking-wider">
              URBAN ENERGY ADMINISTRATION PANEL &bull; SECURED DATABASE &bull; ID: {data._id}
            </div>
          </div>

        </motion.div>

        {/* Interactive QR Code Lightbox / Zoom Modal */}
        {zoomedQrUrl && (
          <div 
            onClick={() => setZoomedQrUrl(null)}
            className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-black/95 backdrop-blur-md p-4 cursor-pointer"
          >
            <button 
              onClick={() => setZoomedQrUrl(null)} 
              className="absolute top-6 right-6 w-12 h-12 rounded-full bg-white/10 border border-white/10 flex items-center justify-center hover:bg-white/20 transition-all text-white cursor-pointer"
            >
              <X size={20} />
            </button>
            <div
              onClick={e => e.stopPropagation()}
              className="bg-white p-6 rounded-2xl max-w-sm w-full text-center space-y-4 border border-white/20 shadow-2xl cursor-default"
            >
              <h3 className="font-orbitron font-extrabold text-sm text-navy uppercase tracking-wider text-slate-800">
                Scan QR to Pay
              </h3>
              <p className="text-xs text-slate-500 font-outfit">
                Scan this QR code using any UPI app (GPay, PhonePe, Paytm) to transfer the referral commission of ₹{(data.commission ?? 0).toLocaleString('en-IN')}.
              </p>
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 max-w-[240px] mx-auto overflow-hidden flex items-center justify-center">
                <img 
                  src={zoomedQrUrl} 
                  alt="Referrer QR Zoomed" 
                  className="w-full h-auto max-h-[240px] object-contain rounded-lg border border-slate-200 shadow-sm"
                />
              </div>
              <div className="flex justify-between items-center text-xs text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono">
                <span>Referrer Name:</span>
                <span className="font-bold text-slate-800">{data.referrerName}</span>
              </div>
              {data.referrerId?.upiId && (
                <div className="flex justify-between items-center text-xs text-slate-400 bg-slate-50 p-2.5 rounded-lg border border-slate-100 font-mono">
                  <span>UPI ID:</span>
                  <span className="font-bold text-slate-800 select-all">{data.referrerId.upiId}</span>
                </div>
              )}
              <button 
                onClick={() => setZoomedQrUrl(null)}
                className="w-full py-3 bg-navy hover:bg-slate-800 text-white font-bold text-xs rounded-xl transition-all cursor-pointer border-none bg-slate-900"
              >
                Close View
              </button>
            </div>
          </div>
        )}
      </div>
    </AnimatePresence>
  )
}
