import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  HandCoins, Trash2, Eye, X, Phone, Mail, MapPin, Zap, 
  ChevronLeft, ChevronRight, Copy, Check, Calendar, IndianRupee, MessageSquare
} from 'lucide-react'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { quotesApi } from '../api'

const S = {
  new: { bg: 'rgba(0,163,224,0.12)', color: '#00A3E0', border: 'rgba(0,163,224,0.25)', label: 'New' },
  contacted: { bg: 'rgba(255,184,0,0.12)', color: '#FFB800', border: 'rgba(255,184,0,0.25)', label: 'Contacted' },
  closed: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', border: 'rgba(34,197,94,0.25)', label: 'Closed' },
}

const CATEGORIES = {
  residential: { bg: 'rgba(59,130,246,0.12)', color: '#3B82F6', border: 'rgba(59,130,246,0.25)', label: '🏠 Residential' },
  ongrid: { bg: 'rgba(34,197,94,0.12)', color: '#22C55E', border: 'rgba(34,197,94,0.25)', label: '⚡ On-Grid' },
  offgrid: { bg: 'rgba(168,85,247,0.12)', color: '#A855F7', border: 'rgba(168,85,247,0.25)', label: '🔋 Off-Grid' },
  commercial: { bg: 'rgba(249,115,22,0.12)', color: '#F97316', border: 'rgba(249,115,22,0.25)', label: '🏢 Commercial' },
}

const PER_PAGE = 5

export default function GetQuotes() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [categoryFilter, setCategoryFilter] = useState('all')
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
    quotesApi.getAll()
      .then(setData)
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = data.filter(d => {
    const statusMatch = filter === 'all' ? true : d.status === filter
    const categoryMatch = categoryFilter === 'all' ? true : d.category === categoryFilter
    return statusMatch && categoryMatch
  })

  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  
  const counts = {
    all: data.length,
    new: data.filter(d => d.status === 'new').length,
    contacted: data.filter(d => d.status === 'contacted').length,
    closed: data.filter(d => d.status === 'closed').length,
  }

  const categoryCounts = {
    all: data.length,
    residential: data.filter(d => d.category === 'residential').length,
    ongrid: data.filter(d => d.category === 'ongrid').length,
    offgrid: data.filter(d => d.category === 'offgrid').length,
    commercial: data.filter(d => d.category === 'commercial').length,
  }

  const updateStatus = async (id, status) => {
    try {
      const updated = await quotesApi.updateStatus(id, status)
      setData(prev => prev.map(d => d._id === id ? updated : d))
      toast.success(`Status updated to ${status}`)
    } catch (e) { 
      toast.error(e.message) 
    }
  }

  const remove = async (id) => {
    const res = await Swal.fire({
      title: 'Delete Quote?', text: 'This cannot be undone.', icon: 'warning', showCancelButton: true,
      confirmButtonText: 'Delete', cancelButtonText: 'Cancel', background: '#0B1D51', color: '#ffffff',
      confirmButtonColor: '#ef4444', cancelButtonColor: 'rgba(255,255,255,0.08)',
    })
    if (res.isConfirmed) {
      try {
        await quotesApi.delete(id)
        setData(prev => prev.filter(d => d._id !== id))
        if (selectedId === id) setSelectedId(null)
        toast.success('Quote deleted.')
      } catch (e) { toast.error(e.message) }
    }
  }

  const changePage = (p) => { if (p >= 1 && p <= totalPages) setPage(p) }

  const selectedQuote = data.find(q => q._id === selectedId)

  return (
    <div className="page pb-12">
      <div className="page-header">
        <div>
          <h1 className="page-title">Get <span className="glow-text">Quotes</span></h1>
          <p className="page-subtitle">{data.length} total quote requests</p>
        </div>
        <div style={{ background: 'rgba(0,163,224,0.12)', border: '1px solid rgba(0,163,224,0.25)', borderRadius: 12, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <HandCoins size={15} color="#00A3E0" />
          <span style={{ color: '#00A3E0', fontWeight: 700, fontSize: 13 }}>Quote Requests</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid-4">
        {[
          { label: 'Total', val: counts.all, color: '#00A3E0', bg: 'rgba(0,163,224,0.08)', border: 'rgba(0,163,224,0.15)' },
          { label: 'New', val: counts.new, color: '#FFB800', bg: 'rgba(255,184,0,0.08)', border: 'rgba(255,184,0,0.15)' },
          { label: 'Contacted', val: '#a78bfa', bg: 'rgba(167,139,250,0.08)', border: 'rgba(167,139,250,0.15)', customVal: counts.contacted },
          { label: 'Closed', val: counts.closed, color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.15)' },
        ].map(s => (
          <div key={s.label} className="stat-card glass" style={{ padding: '16px 20px', border: `1px solid ${s.border}`, background: s.bg }}>
            <div style={{ color: s.color || s.val, fontWeight: 800, fontSize: 28 }}>{s.customVal !== undefined ? s.customVal : s.val}</div>
            <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 12, marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Status Filters */}
      <div className="filter-bar">
        {['all', 'new', 'contacted', 'closed'].map(f => (
          <button key={f} onClick={() => { setFilter(f); setPage(1) }} className="btn"
            style={{ 
              background: filter === f ? 'linear-gradient(135deg,#FFB800,#FF7A00)' : 'rgba(255,255,255,0.06)', 
              color: filter === f ? 'white' : 'rgba(255,255,255,0.5)', 
              border: filter === f ? 'none' : '1px solid rgba(255,255,255,0.1)', 
              textTransform: 'capitalize', 
              padding: '8px 16px', 
              fontSize: 12.5 
            }}>
            {f} ({counts[f] ?? filtered.length})
          </button>
        ))}
      </div>

      {/* Category Filters */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, paddingLeft: 4 }}>Filter Category:</span>
        {['all', 'residential', 'ongrid', 'offgrid', 'commercial'].map(cat => {
          const catInfo = CATEGORIES[cat] || { bg: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)', border: 'rgba(255,255,255,0.1)', label: 'All' }
          return (
            <button key={cat} onClick={() => { setCategoryFilter(cat); setPage(1) }} className="btn"
              style={{ 
                background: categoryFilter === cat ? catInfo.bg : 'rgba(255,255,255,0.03)',
                color: categoryFilter === cat ? catInfo.color : 'rgba(255,255,255,0.4)',
                border: categoryFilter === cat ? `1px solid ${catInfo.border}` : '1px solid rgba(255,255,255,0.08)',
                textTransform: 'capitalize',
                padding: '7px 14px',
                fontSize: 12,
                fontWeight: 600,
                transition: 'all 0.2s'
              }}>
              {cat === 'all' ? 'All' : CATEGORIES[cat].label} ({categoryCounts[cat]})
            </button>
          )
        })}
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
                    <th>Category</th>
                    <th>Type</th>
                    <th>Size</th>
                    <th>City</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.4)' }}>Loading...</td></tr>
                    : paginated.length === 0
                      ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>No records found.</td></tr>
                      : paginated.map((row, i) => {
                          const s = S[row.status]
                          const cat = CATEGORIES[row.category] || CATEGORIES.residential
                          const isActive = selectedId === row._id
                          return (
                            <motion.tr key={row._id}
                              initial={{ opacity: 0 }} 
                              animate={{ opacity: 1 }} 
                              transition={{ delay: i * 0.04 }}
                              onClick={() => setSelectedId(row._id)}
                              style={{ 
                                cursor: 'pointer',
                                background: isActive ? 'rgba(255,122,0,0.05)' : 'transparent'
                              }}
                              className="transition-all duration-150"
                            >
                              <td>
                                <div style={{ fontWeight: 700, color: '#ffffff', fontSize: 13 }}>{row.name}</div>
                                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 }}>{row.phone}</div>
                              </td>
                              <td><span className="badge" style={{ background: cat.bg, color: cat.color, border: `1px solid ${cat.border}` }}>{cat.label}</span></td>
                              <td><span className="badge" style={{ background: 'rgba(255,122,0,0.12)', color: '#FF7A00', border: '1px solid rgba(255,122,0,0.2)' }}>{row.type}</span></td>
                              <td style={{ color: '#ffffff', fontWeight: 700, fontSize: 13 }}>{row.systemSize}</td>
                              <td style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13 }}>{row.city}</td>
                              <td style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>{new Date(row.createdAt).toLocaleDateString('en-IN')}</td>
                              <td><span className="badge" style={{ background: s.bg, color: s.color, border: `1px solid ${s.border}` }}>{s.label}</span></td>
                              <td>
                                <div className="flex gap-1.5 justify-end" onClick={e => e.stopPropagation()}>
                                  <button onClick={() => setSelectedId(isActive ? null : row._id)} 
                                    style={{ background: 'rgba(0,163,224,0.1)', border: '1px solid rgba(0,163,224,0.2)', borderRadius: 7, padding: '5px 7px', cursor: 'pointer' }}>
                                    <Eye size={12} color="#00A3E0" />
                                  </button>
                                  <button onClick={() => remove(row._id)} 
                                    style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 7, padding: '5px 7px', cursor: 'pointer' }}>
                                    <Trash2 size={12} color="#f87171" />
                                  </button>
                                </div>
                              </td>
                            </motion.tr>
                          )
                        })}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px', borderTop: '1px solid var(--border-card)' }}>
                <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 12 }}>Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, filtered.length)} of {filtered.length}</span>
                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                  <button onClick={() => changePage(page - 1)} disabled={page === 1} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 8px', cursor: page === 1 ? 'not-allowed' : 'pointer', color: page === 1 ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)' }}><ChevronLeft size={14} /></button>
                  {[...Array(totalPages)].map((_, i) => <button key={i} onClick={() => changePage(i + 1)} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 700, background: page === i + 1 ? 'linear-gradient(135deg,#FFB800,#FF7A00)' : 'rgba(255,255,255,0.06)', color: page === i + 1 ? 'white' : 'rgba(255,255,255,0.5)' }}>{i + 1}</button>)}
                  <button onClick={() => changePage(page + 1)} disabled={page === totalPages} style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '5px 8px', cursor: page === totalPages ? 'not-allowed' : 'pointer', color: page === totalPages ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.6)' }}><ChevronRight size={14} /></button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: SIDE DETAILS PANEL */}
        <AnimatePresence>
          {selectedId && selectedQuote && (
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
              <div style={{ position: 'absolute', top: -40, right: -40, width: 180, height: 180, background: 'radial-gradient(circle, rgba(0,163,224,0.18) 0%, transparent 70%)', pointerEvents: 'none', borderRadius: '50%', zIndex: 0 }} />
              <div style={{ position: 'absolute', bottom: -50, left: -50, width: 180, height: 180, background: 'radial-gradient(circle, rgba(255,122,0,0.1) 0%, transparent 70%)', pointerEvents: 'none', borderRadius: '50%', zIndex: 0 }} />

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
                
                {/* Profile/Avatar Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, textAlign: 'left', paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ position: 'absolute', inset: -3, borderRadius: 16, background: 'linear-gradient(135deg, #00A3E0, #00C9A7)', opacity: 0.35, filter: 'blur(5px)' }} />
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center font-bold text-xl text-white shadow-md flex-shrink-0"
                      style={{ background: 'linear-gradient(135deg,#00A3E0,#00C9A7)', border: '1.5px solid rgba(255,255,255,0.25)', position: 'relative', zIndex: 1 }}>
                      {selectedQuote.name?.[0] ?? '?'}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <h3 style={{ margin: 0, fontWeight: 800, fontSize: 20, color: '#ffffff', letterSpacing: '0.3px', lineHeight: 1.25 }}>{selectedQuote.name}</h3>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span className="badge" style={{ background: S[selectedQuote.status].bg, color: S[selectedQuote.status].color, border: `1px solid ${S[selectedQuote.status].border}`, fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 20 }}>
                        {S[selectedQuote.status].label}
                      </span>
                      <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600 }}>ID: {selectedQuote._id.slice(-6).toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Section: Overview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                  <span style={{ fontSize: 10, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#00A3E0', display: 'block', paddingLeft: 4 }}>Quote Parameters</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: 16, padding: 14 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', uppercase: true }}>SOLAR CATEGORY</span>
                      <div>
                        <span className="badge" style={{ background: CATEGORIES[selectedQuote.category]?.bg, color: CATEGORIES[selectedQuote.category]?.color, border: `1px solid ${CATEGORIES[selectedQuote.category]?.border}`, display: 'inline-block', fontSize: 10, padding: '2px 8px' }}>
                          {CATEGORIES[selectedQuote.category]?.label || 'Standard'}
                        </span>
                      </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      <span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', uppercase: true }}>REQUESTED DATE</span>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>{new Date(selectedQuote.createdAt).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                {/* Solar Calculations overview */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                  <span style={{ fontSize: 10, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#22c55e', display: 'block', paddingLeft: 4 }}>System Specifications</span>
                  <div style={{ background: 'linear-gradient(135deg, rgba(34,197,94,0.06), rgba(0,163,224,0.03))', border: '1px solid rgba(34,197,94,0.15)', borderRadius: 20, padding: 18, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                      
                      <div style={{ background: 'rgba(9, 22, 64, 0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.35)', uppercase: true, letterSpacing: '0.5px' }}>REQUIRED SIZE</span>
                        <div style={{ fontSize: 16, fontWeight: 800, color: '#ffffff', fontFamily: 'Space Grotesk, sans-serif', display: 'flex', alignItems: 'baseline', gap: 2, marginTop: 'auto' }}>
                          {selectedQuote.systemSize}
                        </div>
                      </div>

                      <div style={{ background: 'rgba(9, 22, 64, 0.5)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                        <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.35)', uppercase: true, letterSpacing: '0.5px' }}>CONNECTION TYPE</span>
                        <div style={{ fontSize: 14, fontWeight: 800, color: '#FF7A00', fontFamily: 'Space Grotesk, sans-serif', display: 'flex', alignItems: 'baseline', gap: 1, marginTop: 'auto', textTransform: 'capitalize' }}>
                          {selectedQuote.type}
                        </div>
                      </div>

                    </div>
                  </div>
                </div>

                {/* Contact Credentials */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                  <span style={{ fontSize: 10, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#00A3E0', display: 'block', paddingLeft: 4 }}>Contact Credentials</span>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    
                    {[
                      { label: "Email Address", val: selectedQuote.email, icon: Mail, color: "#00A3E0", copyable: true },
                      { label: "Phone Number", val: selectedQuote.phone, icon: Phone, color: "#FF7A00", copyable: true },
                      { label: "Location City", val: selectedQuote.city, icon: MapPin, color: "#22c55e", copyable: false },
                      { label: "Current Electric Bill", val: selectedQuote.bill ? `₹${selectedQuote.bill}/Month` : 'N/A', icon: IndianRupee, color: "#eab308", copyable: false }
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
                {selectedQuote.message && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                    <span style={{ fontSize: 10, fontFamily: 'Space Grotesk, sans-serif', fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#00A3E0', display: 'block', paddingLeft: 4 }}>Inquiry message</span>
                    <div style={{ 
                      background: 'rgba(0,163,224,0.04)', 
                      border: '1px solid rgba(0,163,224,0.12)', 
                      borderRadius: 16, 
                      padding: '14px 18px', 
                      position: 'relative'
                    }}>
                      <div style={{ position: 'absolute', top: 0, left: 0, width: 3, height: '100%', background: 'linear-gradient(180deg,#00A3E0,#00C9A7)', borderRadius: '3px 0 0 3px' }} />
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'rgba(255,255,255,0.3)', fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 }}><MessageSquare size={12} color="#00A3E0" /> Client Notes</div>
                      <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic', fontWeight: 500 }}>"{selectedQuote.message}"</p>
                    </div>
                  </div>
                )}

              </div>

              {/* Status Switcher */}
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 18, marginTop: 'auto', textAlign: 'left', zIndex: 1 }}>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1, color: 'rgba(255,255,255,0.4)', display: 'block', paddingLeft: 4, marginBottom: 10 }}>Update Request Status</span>
                <div style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '1fr 1fr 1fr', 
                  background: 'rgba(255,255,255,0.03)', 
                  border: '1px solid rgba(255,255,255,0.06)', 
                  padding: 4, 
                  borderRadius: 14, 
                  gap: 4 
                }}>
                  {['new', 'contacted', 'closed'].map(statusOption => {
                    const isActive = selectedQuote.status === statusOption;
                    return (
                      <button
                        key={statusOption}
                        onClick={() => updateStatus(selectedQuote._id, statusOption)}
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
                          textTransform: 'capitalize'
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
