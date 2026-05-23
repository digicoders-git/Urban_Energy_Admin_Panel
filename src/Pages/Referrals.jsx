import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Trash2, Eye, Phone, Mail, MapPin, IndianRupee, X, User, Gift, Zap, MessageSquare, Maximize2 } from 'lucide-react'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { referralsApi } from '../api'
import LandscapeModal from '../components/LandscapeModal'

const S = {
  New:       { bg: 'rgba(255,122,0,0.12)', color: '#FF7A00', border: 'rgba(255,122,0,0.25)' },
  Contacted: { bg: 'rgba(0,163,224,0.12)', color: '#00A3E0', border: 'rgba(0,163,224,0.25)' },
  Converted: { bg: 'rgba(234,179,8,0.12)',  color: '#EAB308', border: 'rgba(234,179,8,0.25)' },
  Paid:      { bg: 'rgba(34,197,94,0.12)',  color: '#22C55E', border: 'rgba(34,197,94,0.25)' },
}

export default function Referrals() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [editingComm, setEditingComm] = useState(false)
  const [commValue, setCommValue] = useState('')
  const [savingComm, setSavingComm] = useState(false)

  useEffect(() => {
    if (selected) {
      setCommValue(selected.commission ?? '')
      setEditingComm(false)
    }
  }, [selected])

  useEffect(() => {
    referralsApi.getAll()
      .then(setData)
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [])

  const filtered = data.filter(r => {
    const q = search.toLowerCase()
    const matchesSearch = 
      (r.refereeName?.toLowerCase() ?? '').includes(q) ||
      (r.referrerName?.toLowerCase() ?? '').includes(q) ||
      (r.refereeCity?.toLowerCase() ?? '').includes(q) ||
      (r.referrerPhone ?? '').includes(q) ||
      (r.refereePhone ?? '').includes(q)

    return matchesSearch && (filter === 'All' || r.status === filter)
  })

  const setStatus = async (id, status) => {
    try {
      const updated = await referralsApi.updateStatus(id, status)
      setData(d => d.map(r => r._id === id ? updated : r))
      setSelected(s => s?._id === id ? updated : s)
      toast.success(`Status updated to ${status}`)
    } catch (e) { toast.error(e.message) }
  }

  const del = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Referral?', text: 'This action cannot be undone.', icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Delete', cancelButtonText: 'Cancel',
      background: '#0B1D51', color: '#ffffff', confirmButtonColor: '#ef4444', cancelButtonColor: 'rgba(255,255,255,0.08)',
    })
    if (result.isConfirmed) {
      try {
        await referralsApi.delete(id)
        setData(d => d.filter(r => r._id !== id))
        if (selected?._id === id) setSelected(null)
        toast.success('Referral deleted.')
      } catch (e) { toast.error(e.message) }
    }
  }

  const updateCommission = async () => {
    if (commValue === '' || isNaN(commValue)) {
      return toast.error('Please enter a valid number for commission.')
    }
    setSavingComm(true)
    try {
      const updated = await referralsApi.updateCommission(selected._id, Number(commValue))
      setData(d => d.map(r => r._id === selected._id ? updated : r))
      setSelected(updated)
      setEditingComm(false)
      toast.success('Referral commission updated!')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSavingComm(false)
    }
  }

  // Helper for commission update directly inside the LandscapeModal
  const handleCommissionUpdateFromModal = async (id, value) => {
    try {
      const updated = await referralsApi.updateCommission(id, value)
      setData(d => d.map(r => r._id === id ? updated : r))
      setSelected(updated)
      toast.success('Referral commission updated!')
    } catch (e) {
      toast.error(e.message)
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Referrals <span className="glow-text">Management</span></h1>
          <p className="page-subtitle">{data.length} total referrals tracked</p>
        </div>
      </div>

      <div className="filter-bar">
        <div className="relative" style={{ flex: '1 1 220px', maxWidth: 340 }}>
          <Search size={14} color="#94a3b8"
            style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
          <input className="input" style={{ paddingLeft: 36 }} placeholder="Search referrer, referee, or city..."
            value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2 flex-wrap">
          {['All', 'New', 'Contacted', 'Converted', 'Paid'].map(f => (
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

      {/* Table */}
      <div className="glass" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr>
                <th>Referrer (Sender)</th>
                <th>Friend (Referee)</th>
                <th>Type</th>
                <th>Commission</th>
                <th>Status</th>
                <th>Date</th>
                <th></th></tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)' }}>Loading...</td></tr>
                : filtered.length === 0
                  ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.4)', fontSize: 13 }}>No referrals found.</td></tr>
                  : filtered.map((r, i) => (
                    <motion.tr key={r._id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      onClick={() => { setSelected(r); setIsModalOpen(true); }}
                      style={{ cursor: 'pointer', background: selected?._id === r._id ? 'rgba(255,122,0,0.05)' : 'transparent' }}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0"
                            style={{ background: 'linear-gradient(135deg,#FF7A00,#FFB800)', color: 'white' }}>
                            {r.referrerName?.[0] ?? '?'}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#ffffff' }}>{r.referrerName}</div>
                            <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)' }}>{r.referrerPhone}</div>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div>
                          <div style={{ fontWeight: 600, color: '#ffffff' }}>{r.refereeName}</div>
                          <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.4)' }}>{r.refereeCity}</div>
                        </div>
                      </td>
                      <td style={{ color: 'rgba(255,255,255,0.6)', textTransform: 'capitalize' }}>{r.refereeType}</td>
                      <td style={{ color: '#22C55E', fontWeight: 700 }}>₹{(r.commission ?? 0).toLocaleString('en-IN')}</td>
                      <td>
                        <span className="badge" style={{ background: S[r.status].bg, color: S[r.status].color, border: `1px solid ${S[r.status].border}` }}>
                          {r.status}
                        </span>
                      </td>
                      <td style={{ color: 'rgba(255,255,255,0.35)', fontSize: 11.5 }}>{new Date(r.createdAt).toLocaleDateString('en-IN')}</td>
                      <td>
                        <div className="flex gap-1.5 text-right justify-end">
                          <button onClick={e => { e.stopPropagation(); setSelected(r); setIsModalOpen(true); }}
                            style={{ background: 'rgba(0,163,224,0.1)', border: '1px solid rgba(0,163,224,0.2)', borderRadius: 7, padding: '5px 7px', cursor: 'pointer' }}>
                            <Eye size={12} color="#00A3E0" />
                          </button>
                          <button onClick={e => { e.stopPropagation(); del(r._id) }}
                            style={{ background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.2)', borderRadius: 7, padding: '5px 7px', cursor: 'pointer' }}>
                            <Trash2 size={12} color="#f87171" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      <LandscapeModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelected(null); }}
        type="referral"
        data={selected}
        statusStyles={S}
        onStatusUpdate={setStatus}
        onUpdateCommission={handleCommissionUpdateFromModal}
      />
    </div>
  )
}
