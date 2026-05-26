import React, { useState, useEffect } from 'react'
import { Gift, Trash2, CheckCircle, XCircle, ChevronLeft, ChevronRight, Eye, X, Mail, Phone, MapPin, IndianRupee, Edit2, Calendar, User, Wallet } from 'lucide-react'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { referralsApi } from '../api'

const S = {
  New: { bg: 'rgba(255,122,0,0.12)', color: '#FF7A00', border: 'rgba(255,122,0,0.25)', label: 'New' },
  Contacted: { bg: 'rgba(0,163,224,0.12)', color: '#00A3E0', border: 'rgba(0,163,224,0.25)', label: 'Contacted' },
  Converted: { bg: 'rgba(234,179,8,0.12)', color: '#eab308', border: 'rgba(234,179,8,0.25)', label: 'Converted' },
  Paid: { bg: 'rgba(34,197,94,0.12)', color: '#22c55e', border: 'rgba(34,197,94,0.25)', label: 'Paid' },
}
const BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
const PER_PAGE = 5

export default function Referrals() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState(null)

  useEffect(() => {
    referralsApi.getAll()
      .then(setData)
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = filter === 'all' ? data : data.filter(d => d.status === filter)
  const totalPages = Math.ceil(filtered.length / PER_PAGE)
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE)
  const counts = {
    all: data.length,
    New: data.filter(d => d.status === 'New').length,
    Contacted: data.filter(d => d.status === 'Contacted').length,
    Converted: data.filter(d => d.status === 'Converted').length,
    Paid: data.filter(d => d.status === 'Paid').length,
  }

  const updateStatus = async (id, status) => {
    try {
      const updated = await referralsApi.updateStatus(id, status)
      setData(prev => prev.map(d => d._id === id ? { ...d, status: updated.status } : d))
      toast.success(`Referral marked as ${status}`)
    } catch (e) { toast.error(e.message) }
  }

  const editCommission = async (row) => {
    const res = await Swal.fire({
      title: 'Update Commission',
      input: 'number',
      inputValue: row.commission || 0,
      inputLabel: 'Enter commission amount (₹) for ' + row.refereeName,
      showCancelButton: true,
      confirmButtonText: 'Save',
      cancelButtonText: 'Cancel',
      background: '#0B1D51',
      color: '#fff',
      confirmButtonColor: '#FF7A00',
      cancelButtonColor: 'rgba(255,255,255,0.08)',
      inputValidator: (value) => {
        if (!value || isNaN(value) || Number(value) < 0) {
          return 'Please enter a valid positive number'
        }
      }
    })
    if (res.isConfirmed) {
      try {
        const amt = Number(res.value)
        const updated = await referralsApi.updateCommission(row._id, amt)
        setData(prev => prev.map(d => d._id === row._id ? { ...d, commission: updated.commission } : d))
        toast.success('Commission updated successfully.')
      } catch (e) { toast.error(e.message) }
    }
  }

  const remove = async (id) => {
    const res = await Swal.fire({
      title: 'Delete Referral?',
      text: 'This cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      background: '#0B1D51',
      color: '#fff',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: 'rgba(255,255,255,0.08)',
    })
    if (res.isConfirmed) {
      try {
        await referralsApi.delete(id)
        setData(prev => prev.filter(d => d._id !== id))
        if (selectedId === id) setSelectedId(null)
        toast.success('Referral deleted successfully.')
      } catch (e) { toast.error(e.message) }
    }
  }

  const changePage = (p) => { if (p >= 1 && p <= totalPages) setPage(p) }
  const selectedRow = data.find(d => d._id === selectedId)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Referral <span className="glow-text">Leads</span></h1>
          <p className="page-subtitle">{data.length} total referrals submitted by partners</p>
        </div>
        <div style={{ background: 'rgba(255,122,0,0.12)', border: '1px solid rgba(255,122,0,0.25)', borderRadius: 12, padding: '8px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
          <Gift size={15} color="#FF7A00" />
          <span style={{ color: '#FF7A00', fontWeight: 700, fontSize: 13 }}>Referral Program</span>
        </div>
      </div>

      <div className="grid-4">
        {[
          { label: 'Total Referrals', val: counts.all, color: '#00A3E0', bg: 'rgba(0,163,224,0.08)', border: 'rgba(0,163,224,0.15)' },
          { label: 'Pending Action', val: counts.New + counts.Contacted, color: '#FFB800', bg: 'rgba(255,184,0,0.08)', border: 'rgba(255,184,0,0.15)' },
          { label: 'Converted', val: counts.Converted, color: '#FF7A00', bg: 'rgba(255,122,0,0.08)', border: 'rgba(255,122,0,0.15)' },
          { label: 'Paid Payouts', val: counts.Paid, color: '#22c55e', bg: 'rgba(34,197,94,0.08)', border: 'rgba(34,197,94,0.15)' },
        ].map(s => (
          <div key={s.label} className="stat-card glass" style={{ padding: '16px 20px', border: `1px solid ${s.border}`, background: s.bg }}>
            <div style={{ color: s.color, fontWeight: 800, fontSize: 28 }}>{s.val}</div>
            <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        {['all', 'New', 'Contacted', 'Converted', 'Paid'].map(f => (
          <button key={f} onClick={() => { setFilter(f); setPage(1) }} className="btn"
            style={{ background: filter === f ? 'linear-gradient(135deg,#FFB800,#FF7A00)' : 'rgba(255,255,255,0.06)', color: filter === f ? 'white' : 'rgba(255,255,255,0.45)', border: filter === f ? 'none' : '1px solid rgba(255,255,255,0.08)', textTransform: 'capitalize', padding: '7px 16px', fontSize: 12.5 }}>
            {f === 'New' ? 'New' : f} ({f === 'all' ? counts.all : counts[f]})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-stretch">
        
        {/* Left Table Panel */}
        <div className={`${selectedId ? 'lg:col-span-3' : 'lg:col-span-5'} transition-all duration-300 flex flex-col gap-4 relative z-10`}>
          <div className="glass" style={{ overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table className="tbl">
                <thead>
                  <tr>
                    <th>Referee (Lead)</th>
                    <th>Referrer (Partner)</th>
                    <th>Type / City</th>
                    <th>Monthly Bill</th>
                    <th>Commission</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {loading
                    ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.2)' }}>Loading...</td></tr>
                    : paginated.length === 0
                      ? <tr><td colSpan={8} style={{ textAlign: 'center', padding: 40, color: 'rgba(255,255,255,0.2)', fontSize: 13 }}>No records found.</td></tr>
                      : paginated.map((row) => {
                          const s = S[row.status] || S.New
                          const isActive = selectedId === row._id
                          return (
                            <tr key={row._id} onClick={() => setSelectedId(row._id)} style={{ cursor: 'pointer', background: isActive ? 'rgba(255,122,0,0.05)' : 'transparent' }}>
                              <td>
                                <div style={{ fontWeight: 700, color: 'white', fontSize: 13 }}>{row.refereeName}</div>
                                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11, marginTop: 2 }}>{row.refereePhone}</div>
                              </td>
                              <td>
                                <div style={{ fontWeight: 600, color: 'rgba(255,255,255,0.8)', fontSize: 12.5 }}>{row.referrerName}</div>
                                <div style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10.5, marginTop: 2 }}>{row.referrerPhone}</div>
                              </td>
                              <td>
                                <span className="badge" style={{ background: 'rgba(0,163,224,0.12)', color: '#00A3E0', border: '1px solid rgba(0,163,224,0.2)', textTransform: 'capitalize', fontSize: 10.5, padding: '3px 8px' }}>{row.refereeType}</span>
                                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 4 }}>{row.refereeCity}</div>
                              </td>
                              <td style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, fontWeight: 600 }}>₹{row.refereeBill || 0}</td>
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }} onClick={e => e.stopPropagation()}>
                                  <span style={{ color: '#22c55e', fontWeight: 800, fontSize: 13 }}>₹{row.commission || 0}</span>
                                  <button onClick={() => editCommission(row)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 2, display: 'flex' }} title="Set Commission"><Edit2 size={11.5} /></button>
                                </div>
                              </td>
                              <td style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11.5 }}>{new Date(row.createdAt).toLocaleDateString('en-IN')}</td>
                              <td>
                                <select 
                                  value={row.status} 
                                  onClick={e => e.stopPropagation()}
                                  onChange={(e) => updateStatus(row._id, e.target.value)}
                                  style={{ 
                                    background: s.bg, 
                                    color: s.color, 
                                    border: `1px solid ${s.border}`, 
                                    borderRadius: 8, 
                                    padding: '4px 8px', 
                                    fontSize: 11.5, 
                                    fontWeight: 700, 
                                    outline: 'none', 
                                    cursor: 'pointer' 
                                  }}
                                >
                                  <option value="New" style={{ background: '#091640', color: '#fff' }}>New</option>
                                  <option value="Contacted" style={{ background: '#091640', color: '#fff' }}>Contacted</option>
                                  <option value="Converted" style={{ background: '#091640', color: '#fff' }}>Converted</option>
                                  <option value="Paid" style={{ background: '#091640', color: '#fff' }}>Paid</option>
                                </select>
                              </td>
                              <td>
                                <div style={{ display: 'flex', gap: 6, alignItems: 'center' }} onClick={e => e.stopPropagation()}>
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
                    {selectedRow.refereeName?.[0] ?? '?'}
                  </div>
                </div>
                <div className="space-y-2">
                  <h3 style={{ margin: 0, fontWeight: 800, fontSize: 19, color: '#ffffff', letterSpacing: '0.3px', lineHeight: 1.25 }}>{selectedRow.refereeName}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span className="badge" style={{ background: (S[selectedRow.status] || S.New).bg, color: (S[selectedRow.status] || S.New).color, border: `1px solid ${(S[selectedRow.status] || S.New).border}`, fontSize: 10, fontWeight: 800, padding: '3px 10px', borderRadius: 20 }}>
                      {(S[selectedRow.status] || S.New).label}
                    </span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#FF7A00', display: 'block', paddingLeft: 4 }}>Referee (Lead) Details</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
                  {[
                    { icon: <Phone size={13} />, label: 'Phone', val: selectedRow.refereePhone },
                    { icon: <Mail size={13} />, label: 'Email', val: selectedRow.refereeEmail || 'N/A' },
                    { icon: <MapPin size={13} />, label: 'City', val: selectedRow.refereeCity },
                    { icon: <Gift size={13} />, label: 'Solar Type', val: selectedRow.refereeType },
                    { icon: <IndianRupee size={13} />, label: 'Monthly Bill', val: `₹${selectedRow.refereeBill || 0}` },
                  ].map(item => (
                    <div key={item.label} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '10px 12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#FF7A00', marginBottom: 5 }}>{item.icon}<span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>{item.label}</span></div>
                      <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600 }}>{item.val}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#FF7A00', display: 'block', paddingLeft: 4 }}>Referrer Payout Details</span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#FF7A00', marginBottom: 5 }}><User size={13} /><span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>Partner Name</span></div>
                    <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600 }}>{selectedRow.referrerName}</div>
                    <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>{selectedRow.referrerPhone}</div>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 12, padding: '10px 12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#FF7A00', marginBottom: 5 }}><Wallet size={13} /><span style={{ fontSize: 9, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 0.5 }}>UPI ID</span></div>
                    <div style={{ color: '#22c55e', fontSize: 12.5, fontWeight: 700, fontFamily: 'monospace' }}>{selectedRow.referrerId?.upiId || 'Not Configured'}</div>
                  </div>
                </div>
              </div>

              {selectedRow.referrerId?.qrCode?.contentType && (
                <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 14, display: 'flex', gap: 16, alignItems: 'center' }}>
                  <div style={{ width: 80, height: 80, bg: 'white', background: 'white', borderRadius: 10, overflow: 'hidden', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <img src={`${BASE}/referrers/qrcode/${selectedRow.referrerId._id}`} alt="QR" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ textAlign: 'left' }}>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#ffffff' }}>Partner Payout QR</span>
                    <p style={{ margin: '4px 0 0 0', fontSize: 11, color: 'rgba(255,255,255,0.4)', lineHeight: 1.4 }}>Scan this QR code using any GPay or Paytm app to process direct payouts to this partner.</p>
                  </div>
                </div>
              )}

              {selectedRow.refereeMessage && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, textAlign: 'left' }}>
                  <span style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: 1.2, color: '#FF7A00', display: 'block', paddingLeft: 4 }}>Lead Remarks</span>
                  <div style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: 14 }}>
                    <p style={{ margin: 0, fontSize: 12.5, lineHeight: 1.6, color: 'rgba(255,255,255,0.7)', fontStyle: 'italic' }}>"{selectedRow.refereeMessage}"</p>
                  </div>
                </div>
              )}

            </div>

            <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: 18, display: 'flex', gap: 12 }}>
              <button onClick={() => editCommission(selectedRow)} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'rgba(255,122,0,0.15)', color: '#FF7A00', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifycontent: 'center', display: 'flex', justifyContent: 'center', gap: 6 }}><Edit2 size={14} /> Update Commission</button>
              {selectedRow.status !== 'Paid' && (
                <button onClick={() => updateStatus(selectedRow._id, 'Paid')} style={{ flex: 1, padding: '12px', borderRadius: 12, border: 'none', cursor: 'pointer', background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifycontent: 'center', display: 'flex', justifyContent: 'center', gap: 6 }}><CheckCircle size={14} /> Mark Paid</button>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  )
}
