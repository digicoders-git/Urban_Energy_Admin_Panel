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
  const [viewing, setViewing] = useState(null)

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
      if (viewing?._id === id) setViewing(v => ({ ...v, status: updated.status }))
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
        if (viewing?._id === row._id) setViewing(v => ({ ...v, commission: updated.commission }))
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
        toast.success('Referral deleted successfully.')
      } catch (e) { toast.error(e.message) }
    }
  }

  const changePage = (p) => { if (p >= 1 && p <= totalPages) setPage(p) }

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
                      return (
                        <tr key={row._id}>
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
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ color: '#22c55e', fontWeight: 800, fontSize: 13 }}>₹{row.commission || 0}</span>
                              <button onClick={() => editCommission(row)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(255,255,255,0.35)', padding: 2, display: 'flex' }} title="Set Commission"><Edit2 size={11.5} /></button>
                            </div>
                          </td>
                          <td style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11.5 }}>{new Date(row.createdAt).toLocaleDateString('en-IN')}</td>
                          <td>
                            <select 
                              value={row.status} 
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
                            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                              <button onClick={() => setViewing(row)} style={{ background: 'rgba(0,163,224,0.1)', border: '1px solid rgba(0,163,224,0.2)', borderRadius: 8, padding: '5px 7px', cursor: 'pointer', color: '#00A3E0' }}><Eye size={13} /></button>
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

      {viewing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }} onClick={() => setViewing(null)}>
          <div style={{ background: 'linear-gradient(160deg,#0d1f55,#091640)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 20, width: '100%', maxWidth: 540, padding: 28, position: 'relative', overflowY: 'auto', maxHeight: '90vh' }} onClick={e => e.stopPropagation()}>
            <button onClick={() => setViewing(null)} style={{ position: 'absolute', top: 16, right: 16, background: 'rgba(255,255,255,0.07)', border: 'none', borderRadius: 8, padding: 6, cursor: 'pointer', color: 'rgba(255,255,255,0.5)' }}><X size={15} /></button>
            
            <div style={{ fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 16 }}>Referral Lead Detail</div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20, paddingBottom: 20, borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#FF7A00,#FFB800)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 18, flexShrink: 0 }}>{viewing.refereeName?.[0] ?? '?'}</div>
              <div>
                <div style={{ color: 'white', fontWeight: 800, fontSize: 17 }}>{viewing.refereeName}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 3 }}>Submitted: {new Date(viewing.createdAt).toLocaleDateString('en-IN')}</div>
              </div>
              <span style={{ marginLeft: 'auto', background: (S[viewing.status] || S.New).bg, color: (S[viewing.status] || S.New).color, border: `1px solid ${(S[viewing.status] || S.New).border}`, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>{(S[viewing.status] || S.New).label}</span>
            </div>

            {/* SECTION A: REFEREE INFO */}
            <div style={{ color: '#FF7A00', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Referee (Lead) Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              {[
                { icon: <Phone size={13} />, label: 'Phone', val: viewing.refereePhone },
                { icon: <Mail size={13} />, label: 'Email', val: viewing.refereeEmail || 'N/A' },
                { icon: <MapPin size={13} />, label: 'City', val: viewing.refereeCity },
                { icon: <Gift size={13} />, label: 'Solar Type', val: viewing.refereeType },
                { icon: <IndianRupee size={13} />, label: 'Monthly Bill', val: `₹${viewing.refereeBill || 0}` },
              ].map(item => (
                <div key={item.label} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#FF7A00', marginBottom: 5 }}>{item.icon}<span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1 }}>{item.label}</span></div>
                  <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600 }}>{item.val}</div>
                </div>
              ))}
            </div>

            {/* SECTION B: REFERRER INFO & PAYOUT */}
            <div style={{ color: '#FF7A00', fontWeight: 700, fontSize: 12, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>Referrer (Partner) Payout Details</div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#FF7A00', marginBottom: 5 }}><User size={13} /><span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1 }}>Partner Name</span></div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: 600 }}>{viewing.referrerName}</div>
                <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginTop: 2 }}>{viewing.referrerPhone}</div>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#FF7A00', marginBottom: 5 }}><Wallet size={13} /><span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1 }}>UPI ID</span></div>
                <div style={{ color: '#22c55e', fontSize: 13, fontWeight: 700, fontFamily: 'monospace' }}>{viewing.referrerId?.upiId || 'Not Configured'}</div>
              </div>
            </div>

            {/* QR CODE SCAN */}
            {viewing.referrerId?.qrCode?.contentType && (
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 14px', marginBottom: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
                <div style={{ width: 80, height: 80, background: 'white', borderRadius: 8, overflow: 'hidden', padding: 4, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img 
                    src={`${BASE}/referrers/qrcode/${viewing.referrerId._id}`} 
                    alt="Partner QR" 
                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                  />
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>UPI Scanner QR Code</div>
                  <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, margin: '4px 0 0 0', lineHeight: 1.4 }}>Scan this QR using PhonePe, GPay, or Paytm to execute commission transfer for this partner.</p>
                </div>
              </div>
            )}

            {/* MESSAGE */}
            {viewing.refereeMessage && (
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 10, padding: '12px 14px', marginBottom: 24 }}>
                <div style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.3)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 }}>Lead Remarks</div>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, lineHeight: 1.65, margin: 0 }}>{viewing.refereeMessage}</p>
              </div>
            )}

            {/* COMMISSION ACTION BUTTONS */}
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => editCommission(viewing)} style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'rgba(255,122,0,0.15)', color: '#FF7A00', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><Edit2 size={14} /> Update Commission</button>
              {viewing.status !== 'Paid' && (
                <button onClick={() => updateStatus(viewing._id, 'Paid')} style={{ flex: 1, padding: '11px', borderRadius: 10, border: 'none', cursor: 'pointer', background: 'rgba(34,197,94,0.15)', color: '#22c55e', fontWeight: 700, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}><CheckCircle size={14} /> Mark as Paid</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
