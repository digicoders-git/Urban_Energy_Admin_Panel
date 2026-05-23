import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Search, Trash2, Eye, Phone, Mail, MapPin, IndianRupee, X, Maximize2 } from 'lucide-react'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { contactsApi } from '../api'
import LandscapeModal from '../components/LandscapeModal'

const S = {
  New: { bg: 'rgba(255,122,0,0.12)', color: '#FF7A00', border: 'rgba(255,122,0,0.25)' },
  Contacted: { bg: 'rgba(0,163,224,0.12)', color: '#00A3E0', border: 'rgba(0,163,224,0.25)' },
  Converted: { bg: 'rgba(0,201,167,0.12)', color: '#00C9A7', border: 'rgba(0,201,167,0.25)' },
}

export default function Contacts() {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [selected, setSelected] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

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
      setData(d => d.map(c => c._id === id ? updated : c))
      setSelected(s => s?._id === id ? updated : s)
      toast.success(`Status updated to ${status}`)
    } catch (e) { toast.error(e.message) }
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
        if (selected?._id === id) setSelected(null)
        toast.success('Contact deleted.')
      } catch (e) { toast.error(e.message) }
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Contacts <span className="glow-text">Management</span></h1>
          <p className="page-subtitle">{data.length} total leads</p>
        </div>
      </div>

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

      {/* Table */}
      <div className="glass" style={{ overflow: 'hidden' }}>
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
                  : filtered.map((c, i) => (
                    <motion.tr key={c._id}
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.04 }}
                      onClick={() => { setSelected(c); setIsModalOpen(true); }}
                      style={{ cursor: 'pointer', background: selected?._id === c._id ? 'rgba(255,122,0,0.05)' : 'transparent' }}>
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
                          <button onClick={e => { e.stopPropagation(); setSelected(c); setIsModalOpen(true); }}
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
                  ))}
            </tbody>
          </table>
        </div>
      </div>

      <LandscapeModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setSelected(null); }}
        type="contact"
        data={selected}
        statusStyles={S}
        onStatusUpdate={setStatus}
      />
    </div>
  )
}