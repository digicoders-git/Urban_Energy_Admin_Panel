import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, Phone, Mail, MapPin, IndianRupee, Briefcase, Download, Calendar, 
  User, Info, Star, FileText, Award, Gift, Zap, MessageSquare, Building, Percent
} from 'lucide-react'

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

  // Render Status Badge
  const renderStatusBadge = (status, styles) => {
    const style = styles?.[status] || { bg: 'rgba(255,255,255,0.08)', color: '#ffffff', border: 'rgba(255,255,255,0.15)' }
    const label = style.label || status
    return (
      <span className="badge" style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}` }}>
        {label}
      </span>
    )
  }

  // 1. APPLICATIONS PAGE DATA
  const renderApplicationData = () => (
    <div className="grid grid-cols-2 gap-6">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Email Address</span>
        <div className="flex items-center gap-2 text-white/80"><Mail size={14} className="text-orange" /> {data.email}</div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Phone Number</span>
        <div className="flex items-center gap-2 text-white/80"><Phone size={14} className="text-orange" /> {data.phone}</div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Applied Position</span>
        <div className="flex items-center gap-2 text-white/80"><Briefcase size={14} className="text-orange" /> {data.role}</div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Applied Date</span>
        <div className="flex items-center gap-2 text-white/80"><Calendar size={14} className="text-orange" /> {formatDate(data.createdAt)}</div>
      </div>
      {data.message && (
        <div className="col-span-2 flex flex-col gap-1.5 bg-white/[0.03] p-4 rounded-xl border border-white/5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Cover Note / Message</span>
          <p className="text-xs text-white/70 leading-relaxed font-outfit">{data.message}</p>
        </div>
      )}
    </div>
  )

  // 2. CONTACTS PAGE DATA
  const renderContactData = () => (
    <div className="grid grid-cols-2 gap-6">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Email Address</span>
        <div className="flex items-center gap-2 text-white/80"><Mail size={14} className="text-orange" /> {data.email}</div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Phone Number</span>
        <div className="flex items-center gap-2 text-white/80"><Phone size={14} className="text-orange" /> {data.phone}</div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">City / Location</span>
        <div className="flex items-center gap-2 text-white/80"><MapPin size={14} className="text-orange" /> {data.city}</div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Monthly Bill</span>
        <div className="flex items-center gap-2 text-white/80"><IndianRupee size={14} className="text-orange" /> ₹{data.bill?.toLocaleString('en-IN')}/month</div>
      </div>
      <div className="flex flex-col gap-1.5 col-span-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Inquiry Date</span>
        <div className="flex items-center gap-2 text-white/80"><Calendar size={14} className="text-orange" /> {formatDate(data.createdAt)}</div>
      </div>
      {data.message && (
        <div className="col-span-2 flex flex-col gap-1.5 bg-white/[0.03] p-4 rounded-xl border border-white/5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Message</span>
          <p className="text-xs text-white/70 leading-relaxed font-outfit">{data.message}</p>
        </div>
      )}
    </div>
  )

  // 3. REFERRALS PAGE DATA
  const renderReferralData = () => (
    <div className="grid grid-cols-2 gap-8">
      {/* Referrer Box */}
      <div className="bg-orange/5 border border-orange/15 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-orange font-bold text-xs uppercase tracking-wider">
          <User size={14} /> Referrer (Who Sent It)
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="text-sm font-bold text-white">{data.referrerName}</div>
          <div className="text-white/60 flex items-center gap-1.5"><Phone size={11} /> {data.referrerPhone}</div>
          {data.referrerId && (
            <div className="text-white/40 flex items-center gap-1.5 font-mono">
              <Info size={11} /> ID: {data.referrerId}
            </div>
          )}
        </div>
      </div>

      {/* Referee Box */}
      <div className="bg-sky/5 border border-sky/15 rounded-xl p-4 flex flex-col gap-3">
        <div className="flex items-center gap-2 text-sky font-bold text-xs uppercase tracking-wider">
          <Gift size={14} /> Friend (Referee / Lead)
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="text-sm font-bold text-white">{data.refereeName}</div>
          <div className="text-white/60 flex items-center gap-1.5"><Phone size={11} /> {data.refereePhone}</div>
          {data.refereeEmail && (
            <div className="text-white/60 flex items-center gap-1.5"><Mail size={11} /> {data.refereeEmail}</div>
          )}
          <div className="text-white/60 flex items-center gap-1.5"><MapPin size={11} /> {data.refereeCity}</div>
        </div>
      </div>

      {/* Connection Details */}
      <div className="col-span-2 grid grid-cols-3 gap-4 border-t border-white/5 pt-4">
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Interest Connection Type</span>
          <span className="capitalize text-sm font-bold text-white flex items-center gap-1.5"><Zap size={14} className="text-orange" /> {data.refereeType}</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Monthly Bill</span>
          <span className="text-sm font-bold text-white flex items-center gap-1.5"><IndianRupee size={14} className="text-orange" /> ₹{data.refereeBill?.toLocaleString('en-IN')}/month</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Referral Date</span>
          <span className="text-sm font-bold text-white flex items-center gap-1.5"><Calendar size={14} className="text-orange" /> {formatDate(data.createdAt)}</span>
        </div>
      </div>

      {data.refereeMessage && (
        <div className="col-span-2 flex flex-col gap-1.5 bg-white/[0.03] p-4 rounded-xl border border-white/5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Referrer Notes</span>
          <p className="text-xs text-white/70 leading-relaxed font-outfit">{data.refereeMessage}</p>
        </div>
      )}
    </div>
  )

  // 4. PARTNERS PAGE DATA
  const renderPartnerData = () => (
    <div className="grid grid-cols-2 gap-6">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Organization / Company</span>
        <div className="flex items-center gap-2 text-white/80"><Building size={14} className="text-orange" /> {data.company || '—'}</div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Mobile Number</span>
        <div className="flex items-center gap-2 text-white/80"><Phone size={14} className="text-orange" /> {data.phone}</div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Email Address</span>
        <div className="flex items-center gap-2 text-white/80"><Mail size={14} className="text-orange" /> {data.email}</div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Location (City)</span>
        <div className="flex items-center gap-2 text-white/80"><MapPin size={14} className="text-orange" /> {data.city}</div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Partner Role Type</span>
        <div className="flex items-center gap-2 text-white/80"><Zap size={14} className="text-orange" /> {data.type}</div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Application Date</span>
        <div className="flex items-center gap-2 text-white/80"><Calendar size={14} className="text-orange" /> {formatDate(data.createdAt)}</div>
      </div>
      {data.message && (
        <div className="col-span-2 flex flex-col gap-1.5 bg-white/[0.03] p-4 rounded-xl border border-white/5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Business Background / Info</span>
          <p className="text-xs text-white/70 leading-relaxed font-outfit">{data.message}</p>
        </div>
      )}
    </div>
  )

  // 5. QUERIES PAGE DATA
  const renderQueryData = () => (
    <div className="grid grid-cols-2 gap-6">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Email Address</span>
        <div className="flex items-center gap-2 text-white/80"><Mail size={14} className="text-orange" /> {data.email || '—'}</div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Phone Number</span>
        <div className="flex items-center gap-2 text-white/80"><Phone size={14} className="text-orange" /> {data.phone || '—'}</div>
      </div>
      <div className="flex flex-col gap-1.5 col-span-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Submission Date</span>
        <div className="flex items-center gap-2 text-white/80"><Calendar size={14} className="text-orange" /> {formatDate(data.createdAt)}</div>
      </div>
      {(data.message || data.requirement) && (
        <div className="col-span-2 flex flex-col gap-1.5 bg-white/[0.03] p-4 rounded-xl border border-white/5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Question / Requirement</span>
          <p className="text-xs text-white/70 leading-relaxed font-outfit">{data.message || data.requirement}</p>
        </div>
      )}
    </div>
  )

  // 6. GET QUOTES PAGE DATA
  const renderQuoteData = () => (
    <div className="grid grid-cols-2 gap-6">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Email Address</span>
        <div className="flex items-center gap-2 text-white/80"><Mail size={14} className="text-orange" /> {data.email}</div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Phone Number</span>
        <div className="flex items-center gap-2 text-white/80"><Phone size={14} className="text-orange" /> {data.phone}</div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Location (City / State)</span>
        <div className="flex items-center gap-2 text-white/80"><MapPin size={14} className="text-orange" /> {data.city || '—'} {data.state ? `, ${data.state}` : ''}</div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Monthly Bill</span>
        <div className="flex items-center gap-2 text-white/80"><IndianRupee size={14} className="text-orange" /> ₹{(data.bill || data.monthlyBill || 0).toLocaleString('en-IN')}/month</div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Roof Area / Solar Capacity</span>
        <div className="flex items-center gap-2 text-white/80"><Building size={14} className="text-orange" /> {data.systemSize || `${data.area || '—'} Sq.Ft (${data.capacity || '—'} kW)`}</div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Power Phase Type</span>
        <div className="flex items-center gap-2 text-white/80"><Zap size={14} className="text-orange" /> {data.phase || data.powerPhase || '—'} Phase</div>
      </div>
      <div className="flex flex-col gap-1.5 col-span-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Request Date</span>
        <div className="flex items-center gap-2 text-white/80"><Calendar size={14} className="text-orange" /> {formatDate(data.createdAt)}</div>
      </div>
      {data.message && (
        <div className="col-span-2 flex flex-col gap-1.5 bg-white/[0.03] p-4 rounded-xl border border-white/5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Message / Notes</span>
          <p className="text-xs text-white/70 leading-relaxed font-outfit">{data.message}</p>
        </div>
      )}
    </div>
  )

  // 7. REVIEWS PAGE DATA
  const renderReviewData = () => (
    <div className="grid grid-cols-2 gap-6">
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Designation / Role</span>
        <div className="flex items-center gap-2 text-white/80"><Briefcase size={14} className="text-orange" /> {data.designation || data.role || 'Customer'}</div>
      </div>
      <div className="flex flex-col gap-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Star Rating</span>
        <div className="flex items-center gap-1 text-white/85">
          {[...Array(5)].map((_, i) => {
            const stars = data.stars ?? data.rating ?? 5
            return (
              <Star key={i} size={15} fill={i < stars ? '#FFB800' : 'transparent'} stroke={i < stars ? '#FFB800' : 'rgba(255,255,255,0.2)'} />
            )
          })}
          <span className="ml-1.5 font-bold font-orbitron">{(data.stars ?? data.rating ?? 5)}/5</span>
        </div>
      </div>
      <div className="flex flex-col gap-1.5 col-span-2">
        <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Submitted Date</span>
        <div className="flex items-center gap-2 text-white/80"><Calendar size={14} className="text-orange" /> {formatDate(data.createdAt)}</div>
      </div>
      {data.review && (
        <div className="col-span-2 flex flex-col gap-1.5 bg-white/[0.03] p-4 rounded-xl border border-white/5">
          <span className="text-[10px] font-bold uppercase tracking-wider text-white/30">Review Content</span>
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

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-navy-dark/85 backdrop-blur-md p-4">
        
        {/* Animated Landscape Box Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="w-full max-w-5xl bg-navy/90 border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row relative"
          style={{ height: 'auto', minHeight: '520px', maxHeight: '90vh' }}
        >
          {/* Decorative glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-sky/5 rounded-full blur-3xl pointer-events-none" />

          {/* CLOSE BUTTON */}
          <button 
            onClick={onClose} 
            className="absolute top-4 right-4 z-50 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/15 transition-all text-white/60 hover:text-white cursor-pointer"
          >
            <X size={15} />
          </button>

          {/* ── LEFT PANEL: META DETAILS & ACTIONS (30% Width) ── */}
          <div className="w-full md:w-[32%] bg-white/[0.02] border-r border-white/5 p-6 flex flex-col justify-between z-10 gap-6">
            
            <div className="space-y-5">
              {/* Profile/Avatar header */}
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl text-white shadow-lg"
                  style={{ background: 'linear-gradient(135deg,#FF7A00,#FFB800)' }}>
                  {data.name?.[0] ?? '?'}
                </div>
                <div className="space-y-1">
                  <h3 className="font-orbitron font-extrabold text-sm text-white tracking-wide max-w-[160px] truncate">{data.name}</h3>
                  <div className="flex items-center gap-2">
                    {renderStatusBadge(data.status, statusStyles)}
                  </div>
                </div>
              </div>

              {/* Quick Info details */}
              <div className="space-y-2 border-t border-white/5 pt-4">
                <div className="flex justify-between text-xs text-white/50">
                  <span>Record Type:</span>
                  <span className="font-bold text-orange capitalize">{type}</span>
                </div>
                <div className="flex justify-between text-xs text-white/50">
                  <span>Created At:</span>
                  <span className="font-medium text-white/80">{new Date(data.createdAt).toLocaleDateString('en-IN')}</span>
                </div>
              </div>

              {/* Commission panel (For referrals only) */}
              {type === 'referral' && (
                <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-3 space-y-2">
                  <div className="flex justify-between items-center text-xs text-green-500 font-bold uppercase tracking-wider">
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
                    <div className="text-lg font-black text-green-500 flex items-center">
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
              <div className="space-y-2 border-t border-white/5 pt-4">
                <span className="text-[10px] font-bold uppercase tracking-wider text-white/30 block mb-1">Set Quick Status</span>
                <div className="flex flex-col gap-2">
                  {getStatusOptions().map(statusOption => (
                    <button
                      key={statusOption}
                      onClick={() => onStatusUpdate(data._id, statusOption)}
                      className="w-full text-left py-2 px-3 rounded-lg text-xs font-semibold border transition-all cursor-pointer"
                      style={{
                        background: data.status === statusOption && statusStyles?.[statusOption] ? statusStyles[statusOption].bg : 'rgba(255,255,255,0.03)',
                        color: data.status === statusOption && statusStyles?.[statusOption] ? statusStyles[statusOption].color : 'rgba(255,255,255,0.5)',
                        borderColor: data.status === statusOption && statusStyles?.[statusOption] ? statusStyles[statusOption].border : 'rgba(255,255,255,0.06)'
                      }}
                    >
                      {statusStyles?.[statusOption]?.label || capitalize(statusOption)}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* ── RIGHT PANEL: DETAILED FIELDS GRID (70% Width) ── */}
          <div className="flex-1 p-6 md:p-8 overflow-y-auto flex flex-col justify-between z-10">
            <div>
              {/* Header Title */}
              <div className="pb-4 mb-6 border-b border-white/5 flex items-center gap-2">
                <Info size={16} className="text-orange" />
                <h2 className="font-orbitron font-extrabold text-sm uppercase tracking-wider text-white/60">
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
            <div className="text-[10px] text-white/20 font-mono mt-8 text-right border-t border-white/5 pt-4">
              URBAN ENERGY ADMINISTRATION PANEL &bull; SECURED DATABASE &bull; ID: {data._id}
            </div>
          </div>

        </motion.div>

      </div>
    </AnimatePresence>
  )
}
