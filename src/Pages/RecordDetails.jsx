import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft, Phone, Mail, MapPin, IndianRupee, Calendar,
  MessageSquare, Trash2, Info, User, CheckCircle, Clock, Zap,
  Briefcase, Download, Star, FileText, Award, Gift, Building,
  X, Maximize2, Copy, Check, ExternalLink
} from 'lucide-react'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import {
  contactsApi, queriesApi, partnersApi, quotesApi,
  reviewsApi, applicationsApi, referralsApi
} from '../api'

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Centralized status styles mapping
const STATUS_STYLES = {
  application: {
    New: { bg: 'rgba(255,122,0,0.1)', color: '#FF7A00', border: 'rgba(255,122,0,0.2)' },
    Reviewed: { bg: 'rgba(0,163,224,0.1)', color: '#00A3E0', border: 'rgba(0,163,224,0.2)' },
    Shortlisted: { bg: 'rgba(0,201,167,0.1)', color: '#00C9A7', border: 'rgba(0,201,167,0.2)' },
    Rejected: { bg: 'rgba(239,68,68,0.1)', color: '#f87171', border: 'rgba(239,68,68,0.2)' },
  },
  contact: {
    New: { bg: 'rgba(255,122,0,0.1)', color: '#FF7A00', border: 'rgba(255,122,0,0.2)' },
    Contacted: { bg: 'rgba(0,163,224,0.1)', color: '#00A3E0', border: 'rgba(0,163,224,0.2)' },
    Converted: { bg: 'rgba(0,201,167,0.1)', color: '#00C9A7', border: 'rgba(0,201,167,0.2)' },
  },
  referral: {
    New: { bg: 'rgba(255,122,0,0.1)', color: '#FF7A00', border: 'rgba(255,122,0,0.2)' },
    Contacted: { bg: 'rgba(0,163,224,0.1)', color: '#00A3E0', border: 'rgba(0,163,224,0.2)' },
    Converted: { bg: 'rgba(234,179,8,0.1)', color: '#EAB308', border: 'rgba(234,179,8,0.2)' },
    Paid: { bg: 'rgba(34,197,94,0.1)', color: '#22C55E', border: 'rgba(34,197,94,0.2)' },
  },
  partner: {
    pending: { bg: 'rgba(255,184,0,0.1)', color: '#FFB800', border: 'rgba(255,184,0,0.2)', label: 'Pending' },
    approved: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e', border: 'rgba(34,197,94,0.2)', label: 'Approved' },
    rejected: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'rgba(239,68,68,0.2)', label: 'Rejected' },
  },
  query: {
    Pending: { bg: 'rgba(255,193,7,0.1)', color: '#FFC107', border: 'rgba(255,193,7,0.2)' },
    Reviewed: { bg: 'rgba(0,163,224,0.1)', color: '#00A3E0', border: 'rgba(0,163,224,0.2)' },
    Closed: { bg: 'rgba(0,201,167,0.1)', color: '#00C9A7', border: 'rgba(0,201,167,0.2)' },
  },
  quote: {
    new: { bg: 'rgba(255,122,0,0.1)', color: '#FF7A00', border: 'rgba(255,122,0,0.2)', label: 'New' },
    contacted: { bg: 'rgba(0,163,224,0.1)', color: '#00A3E0', border: 'rgba(0,163,224,0.2)', label: 'Contacted' },
    closed: { bg: 'rgba(0,201,167,0.1)', color: '#00C9A7', border: 'rgba(0,201,167,0.2)', label: 'Closed' },
  },
  review: {
    pending: { bg: 'rgba(255,184,0,0.1)', color: '#FFB800', border: 'rgba(255,184,0,0.2)', label: 'Pending' },
    published: { bg: 'rgba(34,197,94,0.1)', color: '#22c55e', border: 'rgba(34,197,94,0.2)', label: 'Published' },
    rejected: { bg: 'rgba(239,68,68,0.1)', color: '#ef4444', border: 'rgba(239,68,68,0.2)', label: 'Rejected' },
  }
}

// Custom Bespoke Design System for individual grid cards
const CARD_THEME = {
  "text-sky": {
    glow: "rgba(0, 163, 224, 0.05)",
    border: "rgba(0, 163, 224, 0.2)",
    iconBg: "linear-gradient(135deg, rgba(0, 163, 224, 0.15), rgba(0, 163, 224, 0.03))",
    iconColor: "text-sky"
  },
  "text-orange": {
    glow: "rgba(255, 122, 0, 0.05)",
    border: "rgba(255, 122, 0, 0.2)",
    iconBg: "linear-gradient(135deg, rgba(255, 122, 0, 0.15), rgba(255, 122, 0, 0.03))",
    iconColor: "text-[#FF7A00]"
  },
  "text-emerald-400": {
    glow: "rgba(0, 201, 167, 0.05)",
    border: "rgba(0, 201, 167, 0.2)",
    iconBg: "linear-gradient(135deg, rgba(0, 201, 167, 0.15), rgba(0, 201, 167, 0.03))",
    iconColor: "text-emerald-400"
  },
  "text-yellow-400": {
    glow: "rgba(255, 184, 0, 0.05)",
    border: "rgba(255, 184, 0, 0.2)",
    iconBg: "linear-gradient(135deg, rgba(255, 184, 0, 0.15), rgba(255, 184, 0, 0.03))",
    iconColor: "text-yellow-400"
  },
  "text-purple-400": {
    glow: "rgba(168, 85, 247, 0.05)",
    border: "rgba(168, 85, 247, 0.2)",
    iconBg: "linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(168, 85, 247, 0.03))",
    iconColor: "text-purple-400"
  },
  "text-pink-400": {
    glow: "rgba(244, 63, 94, 0.05)",
    border: "rgba(244, 63, 94, 0.2)",
    iconBg: "linear-gradient(135deg, rgba(244, 63, 94, 0.15), rgba(244, 63, 94, 0.03))",
    iconColor: "text-[#FFC9A7]"
  },
  "text-teal-400": {
    glow: "rgba(20, 184, 166, 0.05)",
    border: "rgba(20, 184, 166, 0.2)",
    iconBg: "linear-gradient(135deg, rgba(20, 184, 166, 0.15), rgba(20, 184, 166, 0.03))",
    iconColor: "text-teal-400"
  }
}

export default function RecordDetails({ type }) {
  const { id } = useParams()
  const navigate = useNavigate()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  const [commInput, setCommInput] = useState('')
  const [editingComm, setEditingComm] = useState(false)
  const [zoomedQrUrl, setZoomedQrUrl] = useState(null)
  const [copiedField, setCopiedField] = useState(null)

  const copyToClipboard = (text, fieldId) => {
    if (!text) return;
    navigator.clipboard.writeText(text)
    setCopiedField(fieldId)
    toast.success(`${fieldId} copied successfully!`, {
      position: "bottom-right",
      autoClose: 1500,
      hideProgressBar: true,
      closeOnClick: true,
      pauseOnHover: false,
      draggable: false,
      theme: "dark"
    })
    setTimeout(() => setCopiedField(null), 2000)
  }

  // Dynamic API Mapping for fetching, deleting, and status changes
  const getApiHandlers = () => {
    switch (type) {
      case 'contact':
        return {
          fetchOne: () => contactsApi.getById(id),
          updateStatus: (status) => contactsApi.updateStatus(id, status),
          deleteOne: () => contactsApi.delete(id),
          backRoute: '/contacts',
          label: 'Contact Lead'
        }
      case 'application':
        return {
          fetchOne: async () => {
            const list = await applicationsApi.getAll()
            return list.find(x => x._id === id)
          },
          updateStatus: (status) => applicationsApi.updateStatus(id, status),
          deleteOne: () => applicationsApi.delete(id),
          backRoute: '/applications',
          label: 'Job Application'
        }
      case 'referral':
        return {
          fetchOne: async () => {
            const list = await referralsApi.getAll()
            return list.find(x => x._id === id)
          },
          updateStatus: (status) => referralsApi.updateStatus(id, status),
          deleteOne: () => referralsApi.delete(id),
          backRoute: '/referrals',
          label: 'Referral Case'
        }
      case 'partner':
        return {
          fetchOne: async () => {
            const list = await partnersApi.getAll()
            return list.find(x => x._id === id)
          },
          updateStatus: (status) => partnersApi.updateStatus(id, status),
          deleteOne: () => partnersApi.delete(id),
          backRoute: '/partners',
          label: 'Franchise Partner'
        }
      case 'query':
        return {
          fetchOne: async () => {
            const list = await queriesApi.getAll()
            return list.find(x => x._id === id)
          },
          updateStatus: (status) => queriesApi.updateStatus(id, status),
          deleteOne: () => queriesApi.delete(id),
          backRoute: '/queries',
          label: 'Inquiry'
        }
      case 'quote':
        return {
          fetchOne: async () => {
            const list = await quotesApi.getAll()
            return list.find(x => x._id === id)
          },
          updateStatus: (status) => quotesApi.updateStatus(id, status),
          deleteOne: () => quotesApi.delete(id),
          backRoute: '/get-quotes',
          label: 'Solar Quote'
        }
      case 'review':
        return {
          fetchOne: async () => {
            const list = await reviewsApi.getAll()
            return list.find(x => x._id === id)
          },
          updateStatus: (status) => reviewsApi.updateStatus(id, status),
          deleteOne: () => reviewsApi.delete(id),
          backRoute: '/reviews',
          label: 'Review'
        }
      default:
        return null
    }
  }

  const handlers = getApiHandlers()

  useEffect(() => {
    if (!handlers) {
      toast.error('Invalid record type')
      navigate('/dashboard')
      return
    }
    setLoading(true)
    handlers.fetchOne()
      .then(res => {
        if (!res) throw new Error('Record not found')
        setData(res)
      })
      .catch(e => {
        toast.error('Failed to load record: ' + e.message)
        navigate(handlers.backRoute)
      })
      .finally(() => setLoading(false))
  }, [type, id])

  const setStatus = async (status) => {
    try {
      const updated = await handlers.updateStatus(status)
      setData(updated)
      toast.success(`Status updated to ${status}`)
    } catch (e) {
      toast.error(e.message)
    }
  }

  const del = async () => {
    const result = await Swal.fire({
      title: `Delete ${handlers.label}?`,
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete',
      cancelButtonText: 'Cancel',
      background: '#0B1D51',
      color: '#ffffff',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: 'rgba(255,255,255,0.08)',
    })
    if (result.isConfirmed) {
      try {
        await handlers.deleteOne()
        toast.success(`${handlers.label} deleted successfully.`)
        navigate(handlers.backRoute)
      } catch (e) {
        toast.error(e.message)
      }
    }
  }

  const startEditCommission = () => {
    setCommInput(data.commission ?? '')
    setEditingComm(true)
  }

  const saveCommission = async () => {
    if (commInput !== '') {
      try {
        const updated = await referralsApi.updateCommission(data._id, Number(commInput))
        setData(updated)
        setEditingComm(false)
        toast.success('Commission updated!')
      } catch (e) {
        toast.error(e.message)
      }
    }
  }

  const downloadCv = () => {
    const token = localStorage.getItem('ue_token')
    fetch(`${API_BASE}/applications/${data._id}/cv`, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => {
        if (!res.ok) throw new Error('CV not found')
        const disposition = res.headers.get('Content-Disposition')
        const filename = disposition?.match(/filename="(.+)"/)?.[1] || 'cv'
        return res.blob().then(blob => ({ blob, filename }))
      })
      .then(({ blob, filename }) => {
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url; a.download = filename; a.click()
        URL.revokeObjectURL(url)
      })
      .catch(e => toast.error(e.message))
  }

  // Format Date Helper
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

  // Render Status Badge
  const renderStatusBadge = (status) => {
    const styles = STATUS_STYLES[type]
    const style = styles?.[status] || { bg: 'rgba(255,255,255,0.08)', color: '#ffffff', border: 'rgba(255,255,255,0.15)' }
    const label = style.label || status
    return (
      <span className="badge font-orbitron font-extrabold uppercase animate-fadeIn" style={{ background: style.bg, color: style.color, border: `1px solid ${style.border}`, padding: '4px 10px', fontSize: '10px', letterSpacing: '0.5px', boxShadow: `0 0 10px ${style.bg}` }}>
        {label}
      </span>
    )
  }

  // Helper for dynamic glowing buttons
  const getActiveStatusStyle = (statusOption) => {
    const styles = STATUS_STYLES[type]
    const optStyle = styles?.[statusOption] || { color: '#ffffff', bg: 'rgba(255,255,255,0.03)', border: 'rgba(255,255,255,0.06)' }
    const color = optStyle.color || '#ffffff'

    let rgbaBg = 'rgba(255, 255, 255, 0.08)'
    let rgbaBorder = 'rgba(255, 255, 255, 0.25)'

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

  const renderInfoCard = (label, value, IconComponent, colorClass = "text-orange", copyable = false, copyId = "") => {
    const isCopied = copiedField === copyId;
    const theme = CARD_THEME[colorClass] || {
      glow: "rgba(255, 122, 0, 0.03)",
      border: "rgba(255, 122, 0, 0.1)",
      iconBg: "linear-gradient(135deg, rgba(255, 122, 0, 0.15), rgba(255, 122, 0, 0.03))",
      iconColor: colorClass
    };

    return (
      <div
        className="flex flex-col gap-4 bg-gradient-to-br from-[#0B1D51]/95 to-[#080f2e]/90 border border-white/[0.08] hover:border-transparent p-5 rounded-2xl transition-all duration-300 group hover:-translate-y-1 shadow-lg text-left relative overflow-hidden"
      >
        {/* Glow overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-orange/0 via-orange/[0.01] to-orange/0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

        {/* Custom border glow */}
        <div className="absolute inset-0 border border-transparent rounded-2xl group-hover:border-current transition-colors duration-300 pointer-events-none" style={{ color: theme.border }} />

        <div className="flex justify-between items-center relative z-10">
          <span className="text-[10px] font-orbitron font-extrabold uppercase tracking-widest text-white/35 group-hover:text-white/60 transition-colors block">{label}</span>
          {copyable && value && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                copyToClipboard(value, copyId || label);
              }}
              className="text-white/20 hover:text-white transition-all p-1.5 rounded-lg hover:bg-white/5 cursor-pointer flex items-center justify-center"
              title={`Copy ${label}`}
            >
              {isCopied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            </button>
          )}
        </div>

        <div className="flex items-center gap-4 text-sm font-semibold text-white/95 relative z-10">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-all duration-300 flex-shrink-0 border border-white/5"
            style={{
              background: theme.iconBg,
              boxShadow: `0 4px 12px ${theme.glow}`
            }}
          >
            <IconComponent size={18} className={`${theme.iconColor} stroke-[1.5] drop-shadow-[0_0_5px_currentColor]`} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="font-outfit text-sm md:text-[15px] font-semibold block truncate text-white/90 hover:text-white transition-colors duration-200 select-all" title={value}>
              {value || '—'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Get status options based on type
  const getStatusOptions = () => {
    switch (type) {
      case 'application': return ['New', 'Reviewed', 'Shortlisted', 'Rejected']
      case 'contact': return ['New', 'Contacted', 'Converted']
      case 'referral': return ['New', 'Contacted', 'Converted', 'Paid']
      case 'partner': return ['pending', 'approved', 'rejected']
      case 'query': return ['Pending', 'Reviewed', 'Closed']
      case 'quote': return ['new', 'contacted', 'closed']
      case 'review': return ['pending', 'published', 'rejected']
      default: return []
    }
  }

  const capitalize = (s) => s ? s.charAt(0).toUpperCase() + s.slice(1) : ''

  // 1. APPLICATIONS VIEW
  const renderApplicationData = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {renderInfoCard("Email Address", data.email, Mail, "text-sky", true, "Email")}
      {renderInfoCard("Phone Number", data.phone, Phone, "text-orange", true, "Phone")}
      {renderInfoCard("Applied Position", data.role, Briefcase, "text-yellow-400")}
      {renderInfoCard("Applied Date", formatDate(data.createdAt), Calendar, "text-purple-400")}
      {data.message && (
        <div className="md:col-span-2 flex flex-col gap-4 bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/[0.08] p-6 rounded-2xl text-left relative overflow-hidden shadow-inner mt-2">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange to-orange-light" />
          <div className="flex items-center gap-2 text-white/40">
            <MessageSquare size={14} className="text-orange" />
            <span className="text-[10px] font-bold uppercase tracking-widest font-space block">Cover Note / Message</span>
          </div>
          <p className="text-sm text-white/80 leading-relaxed font-outfit pl-1 italic font-light">
            "{data.message}"
          </p>
        </div>
      )}
    </div>
  )

  // 2. CONTACTS VIEW
  const renderContactData = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
      {renderInfoCard("Email Address", data.email, Mail, "text-sky", true, "Email")}
      {renderInfoCard("Phone Number", data.phone, Phone, "text-orange", true, "Phone")}
      {renderInfoCard("City / Location", data.city, MapPin, "text-emerald-400")}
      {renderInfoCard("Monthly Bill", `₹${data.bill?.toLocaleString('en-IN')}/month`, IndianRupee, "text-yellow-400")}
      <div className="md:col-span-2">
        {renderInfoCard("Inquiry Date & Time", formatDate(data.createdAt), Calendar, "text-purple-400")}
      </div>

      {/* Smart Solar Technical ROI Card */}
      {data.bill && (
        <div className="md:col-span-2 bg-gradient-to-br from-emerald-500/[0.07] to-teal-500/[0.02] border border-emerald-500/20 rounded-3xl p-6 text-left relative overflow-hidden shadow-lg mt-3">
          <div className="absolute -top-12 -right-12 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

          <div className="flex items-center gap-2.5 text-emerald-400 font-orbitron font-extrabold text-[10px] uppercase tracking-widest pb-3 border-b border-emerald-500/10 mb-5">
            <div className="w-6 h-6 rounded-lg bg-emerald-500/15 flex items-center justify-center flex-shrink-0 border border-emerald-500/20 shadow-sm">
              <Zap size={12} className="text-emerald-400 drop-shadow-[0_0_3px_currentColor]" />
            </div>
            AI Solar Feasibility Assessment
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* System Size Recommendation */}
            <div className="bg-slate-950/50 border border-white/5 hover:border-emerald-500/20 rounded-2xl p-4.5 flex flex-col gap-2 transition-all duration-300 group/item relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-emerald-500/[0.01] opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <span className="text-[9px] font-orbitron font-extrabold text-white/45 uppercase tracking-wider">Recommended System</span>
              <div className="text-[19px] font-extrabold text-white font-orbitron flex items-baseline gap-1 mt-1">
                {Math.ceil(data.bill / 1500)} <span className="text-xs text-emerald-400 font-sans font-semibold">kWp</span>
              </div>
              <span className="text-[10px] text-white/40 font-outfit mt-1 leading-relaxed">Estimated peak solar capacity needed</span>
            </div>

            {/* Estimated Monthly Savings */}
            <div className="bg-slate-950/50 border border-white/5 hover:border-emerald-500/20 rounded-2xl p-4.5 flex flex-col gap-2 transition-all duration-300 group/item relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-emerald-500/[0.01] opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <span className="text-[9px] font-orbitron font-extrabold text-white/45 uppercase tracking-wider">Est. Monthly Savings</span>
              <div className="text-[19px] font-extrabold text-emerald-400 font-orbitron flex items-baseline gap-1 mt-1 drop-shadow-[0_0_6px_rgba(16,185,129,0.2)]">
                ₹{Math.floor(data.bill * 0.85).toLocaleString('en-IN')} <span className="text-[10px] text-emerald-400/70 font-sans font-medium">/mo</span>
              </div>
              <span className="text-[10px] text-emerald-400/50 font-outfit mt-1 leading-relaxed">Up to 85% average bill savings</span>
            </div>

            {/* Green Impact (CO2 Reductions) */}
            <div className="bg-slate-950/50 border border-white/5 hover:border-emerald-500/20 rounded-2xl p-4.5 flex flex-col gap-2 transition-all duration-300 group/item relative overflow-hidden shadow-inner">
              <div className="absolute inset-0 bg-emerald-500/[0.01] opacity-0 group-hover/item:opacity-100 transition-opacity duration-300 pointer-events-none" />
              <span className="text-[9px] font-orbitron font-extrabold text-white/45 uppercase tracking-wider">Annual CO2 Offsets</span>
              <div className="text-[19px] font-extrabold text-sky-400 font-orbitron flex items-baseline gap-1 mt-1 drop-shadow-[0_0_6px_rgba(56,189,248,0.2)]">
                {((data.bill / 8) * 12 * 0.0008).toFixed(1)} <span className="text-xs text-sky-400/70 font-sans font-medium">Tons</span>
              </div>
              <span className="text-[10px] text-white/40 font-outfit mt-1 leading-relaxed">CO2 reduction impact per year</span>
            </div>
          </div>
        </div>
      )}

      {data.message && (
        <div className="md:col-span-2 flex flex-col gap-4 bg-gradient-to-br from-[#0B1D51]/40 to-[#080f2e]/30 border border-white/[0.08] p-6 rounded-3xl text-left relative overflow-hidden shadow-inner mt-2">
          <div className="absolute top-0 left-0 w-[3px] h-full bg-gradient-to-b from-[#FF7A00] to-[#FFB800] drop-shadow-[0_0_8px_rgba(255,122,0,0.5)]" />
          <div className="flex items-center gap-2 text-white/40">
            <MessageSquare size={14} className="text-orange" />
            <span className="text-[10px] font-orbitron font-extrabold uppercase tracking-widest">Client Message</span>
          </div>
          <p className="text-sm text-white/80 leading-relaxed font-outfit pl-1 italic font-light">
            "{data.message}"
          </p>
        </div>
      )}
    </div>
  )

  // 3. REFERRALS VIEW
  const renderReferralData = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Referrer Box */}
      <div className="bg-gradient-to-br from-orange-500/[0.07] to-transparent border border-orange-500/15 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 hover:border-orange-500/30 hover:shadow-[0_10px_30px_rgba(255,122,0,0.04)] text-left relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-orange-500/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center gap-3 text-orange font-bold text-[10px] uppercase tracking-widest font-space pb-2 border-b border-orange-500/10">
          <div className="w-6 h-6 rounded-lg bg-orange-500/10 flex items-center justify-center flex-shrink-0">
            <User size={12} />
          </div>
          Referrer Details
        </div>
        <div className="space-y-4">
          <div className="text-base font-bold text-white font-outfit tracking-wide">{data.referrerName}</div>
          <div className="space-y-2">
            <div className="text-white/70 flex items-center gap-2 text-xs font-medium font-space">
              <Phone size={13} className="text-orange/80 flex-shrink-0" />
              <span className="select-all">{data.referrerPhone}</span>
              <button
                onClick={() => copyToClipboard(data.referrerPhone, "Referrer Phone")}
                className="ml-auto text-white/30 hover:text-orange p-1 rounded transition-colors cursor-pointer"
              >
                {copiedField === "Referrer Phone" ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              </button>
            </div>
            {data.referrerId && (
              <div className="text-white/40 flex items-center gap-2 font-mono text-[10px] border-t border-white/5 pt-2">
                <Info size={12} className="text-white/30" />
                <span className="truncate">ID: {data.referrerId._id || data.referrerId}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Referee Box */}
      <div className="bg-gradient-to-br from-sky-500/[0.07] to-transparent border border-sky-500/15 rounded-2xl p-6 flex flex-col gap-4 transition-all duration-300 hover:border-sky-500/30 hover:shadow-[0_10px_30px_rgba(0,163,224,0.04)] text-left relative overflow-hidden">
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-sky-500/10 rounded-full blur-xl pointer-events-none" />
        <div className="flex items-center gap-3 text-sky font-bold text-[10px] uppercase tracking-widest font-space pb-2 border-b border-sky-500/10">
          <div className="w-6 h-6 rounded-lg bg-sky-500/10 flex items-center justify-center flex-shrink-0">
            <Gift size={12} />
          </div>
          Referee (Lead/Friend)
        </div>
        <div className="space-y-4">
          <div className="text-base font-bold text-white font-outfit tracking-wide">{data.refereeName}</div>
          <div className="space-y-2 text-xs">
            <div className="text-white/70 flex items-center gap-2 text-xs font-medium font-space">
              <Phone size={13} className="text-sky/80 flex-shrink-0" />
              <span className="select-all">{data.refereePhone}</span>
              <button
                onClick={() => copyToClipboard(data.refereePhone, "Referee Phone")}
                className="ml-auto text-white/30 hover:text-sky p-1 rounded transition-colors cursor-pointer"
              >
                {copiedField === "Referee Phone" ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
              </button>
            </div>
            {data.refereeEmail && (
              <div className="text-white/70 flex items-center gap-2 text-xs font-medium font-space">
                <Mail size={13} className="text-sky/80 flex-shrink-0" />
                <span className="select-all truncate">{data.refereeEmail}</span>
                <button
                  onClick={() => copyToClipboard(data.refereeEmail, "Referee Email")}
                  className="ml-auto text-white/30 hover:text-sky p-1 rounded transition-colors cursor-pointer"
                >
                  {copiedField === "Referee Email" ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                </button>
              </div>
            )}
            <div className="text-white/60 flex items-center gap-2 text-xs font-medium">
              <MapPin size={13} className="text-sky/80 flex-shrink-0" />
              <span>{data.refereeCity}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Connection Details */}
      <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-5 border-t border-white/5 pt-4">
        {renderInfoCard("Interest Connection Type", data.refereeType, Zap, "text-orange")}
        {renderInfoCard("Monthly Bill", `₹${data.refereeBill?.toLocaleString('en-IN')}/month`, IndianRupee, "text-yellow-400")}
        {renderInfoCard("Referral Date", formatDate(data.createdAt), Calendar, "text-purple-400")}
      </div>

      {data.refereeMessage && (
        <div className="md:col-span-2 flex flex-col gap-4 bg-gradient-to-br from-[#0B1D51]/40 to-[#080f2e]/30 border border-white/[0.08] p-6 rounded-2xl text-left relative overflow-hidden shadow-inner mt-2">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange to-orange-light" />
          <div className="flex items-center gap-2 text-white/40">
            <MessageSquare size={14} className="text-orange" />
            <span className="text-[10px] font-bold uppercase tracking-widest font-space block">Referrer Notes</span>
          </div>
          <p className="text-sm text-white/80 leading-relaxed font-outfit pl-1 italic font-light">
            "{data.refereeMessage}"
          </p>
        </div>
      )}

      {/* Referrer Payout Details */}
      {data.referrerId && typeof data.referrerId === 'object' && (data.referrerId.upiId || (data.referrerId.qrCode && data.referrerId.qrCode.contentType)) && (
        <div className="md:col-span-2 border-t border-white/10 pt-6 flex flex-col gap-4">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 text-left block font-space">Referrer Payout Credentials</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gradient-to-br from-white/[0.04] to-white/[0.01] border border-white/[0.08] rounded-2xl p-6 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-[60px] pointer-events-none" />

            {/* UPI Section */}
            <div className="flex flex-col gap-3 justify-center text-left">
              <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 font-space block">Linked UPI ID</span>
              {data.referrerId.upiId ? (
                <div className="flex items-center gap-2">
                  <div className="bg-slate-950/60 border border-white/10 px-4 py-2.5 rounded-xl font-mono text-xs font-semibold text-emerald-400 tracking-wider max-w-[260px] truncate select-all shadow-inner flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {data.referrerId.upiId}
                  </div>
                  <button
                    onClick={() => copyToClipboard(data.referrerId.upiId, "Referrer UPI")}
                    className="px-4 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 font-bold text-[10px] font-space rounded-xl border border-emerald-500/20 hover:border-emerald-500/40 transition-all cursor-pointer shadow-sm hover:shadow-emerald-500/10 flex items-center gap-1.5"
                  >
                    {copiedField === "Referrer UPI" ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    {copiedField === "Referrer UPI" ? "Copied" : "Copy"}
                  </button>
                </div>
              ) : (
                <span className="text-xs text-white/40 italic font-outfit">No UPI ID provided</span>
              )}
            </div>

            {/* QR Code Section */}
            <div className="flex items-center gap-5 border-t md:border-t-0 md:border-l border-white/10 pt-5 md:pt-0 md:pl-6 text-left">
              {data.referrerId.qrCode && data.referrerId.qrCode.contentType ? (
                <>
                  <div
                    className="w-16 h-16 bg-white rounded-2xl p-1.5 border border-white/15 cursor-pointer hover:scale-105 active:scale-95 hover:border-orange/50 transition-all overflow-hidden flex-shrink-0 relative group shadow-md"
                    onClick={() => {
                      setZoomedQrUrl(`${API_BASE}/referrers/qrcode/${data.referrerId._id || data.referrerId}`)
                    }}
                  >
                    <img
                      src={`${API_BASE}/referrers/qrcode/${data.referrerId._id || data.referrerId}`}
                      alt="Referrer QR"
                      className="w-full h-full object-cover rounded-xl"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all text-white rounded-xl">
                      <Maximize2 size={14} className="text-orange" />
                    </div>
                  </div>
                  <div className="text-left space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 font-space block">Linked QR Code</span>
                    <button
                      onClick={() => {
                        setZoomedQrUrl(`${API_BASE}/referrers/qrcode/${data.referrerId._id || data.referrerId}`)
                      }}
                      className="text-xs text-sky hover:text-sky-400 font-bold hover:underline cursor-pointer border-none bg-transparent font-space flex items-center gap-1.5"
                    >
                      <Maximize2 size={11} /> Scan / Full View
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/40 font-space block">Linked QR Code</span>
                  <span className="text-xs text-white/40 italic font-outfit">No QR Code uploaded</span>
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  )

  // 4. PARTNERS VIEW
  const renderPartnerData = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {renderInfoCard("Organization / Company", data.company || '—', Building, "text-yellow-400")}
      {renderInfoCard("Mobile Number", data.phone, Phone, "text-orange", true, "Phone")}
      {renderInfoCard("Email Address", data.email, Mail, "text-sky", true, "Email")}
      {renderInfoCard("Location (City)", data.city, MapPin, "text-emerald-400")}
      {renderInfoCard("Partner Role Type", data.type, Zap, "text-purple-400")}
      {renderInfoCard("Application Date", formatDate(data.createdAt), Calendar, "text-pink-400")}
      {data.message && (
        <div className="md:col-span-2 flex flex-col gap-4 bg-gradient-to-br from-[#0B1D51]/40 to-[#080f2e]/30 border border-white/[0.08] p-6 rounded-2xl text-left relative overflow-hidden shadow-inner mt-2">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange to-orange-light" />
          <div className="flex items-center gap-2 text-white/40">
            <MessageSquare size={14} className="text-orange" />
            <span className="text-[10px] font-bold uppercase tracking-widest font-space block">Business Background / Info</span>
          </div>
          <p className="text-sm text-white/80 leading-relaxed font-outfit pl-1 italic font-light">
            "{data.message}"
          </p>
        </div>
      )}
    </div>
  )

  // 5. QUERIES VIEW
  const renderQueryData = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {renderInfoCard("Email Address", data.email || '—', Mail, "text-sky", true, "Email")}
      {renderInfoCard("Phone Number", data.phone || '—', Phone, "text-orange", true, "Phone")}
      <div className="md:col-span-2">
        {renderInfoCard("Submission Date", formatDate(data.createdAt), Calendar, "text-purple-400")}
      </div>
      {(data.message || data.requirement) && (
        <div className="md:col-span-2 flex flex-col gap-4 bg-gradient-to-br from-[#0B1D51]/40 to-[#080f2e]/30 border border-white/[0.08] p-6 rounded-2xl text-left relative overflow-hidden shadow-inner mt-2">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange to-orange-light" />
          <div className="flex items-center gap-2 text-white/40">
            <MessageSquare size={14} className="text-orange" />
            <span className="text-[10px] font-bold uppercase tracking-widest font-space block">Question / Requirement</span>
          </div>
          <p className="text-sm text-white/80 leading-relaxed font-outfit pl-1 italic font-light">
            "{data.message || data.requirement}"
          </p>
        </div>
      )}
    </div>
  )

  // 6. GET QUOTES VIEW
  const renderQuoteData = () => {
    const billVal = data.bill || data.monthlyBill || 0;
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderInfoCard("Email Address", data.email, Mail, "text-sky", true, "Email")}
        {renderInfoCard("Phone Number", data.phone, Phone, "text-orange", true, "Phone")}
        {renderInfoCard("Location (City / State)", `${data.city || '—'}${data.state ? `, ${data.state}` : ''}`, MapPin, "text-emerald-400")}
        {renderInfoCard("Monthly Bill", `₹${billVal.toLocaleString('en-IN')}/month`, IndianRupee, "text-yellow-400")}
        {renderInfoCard("Roof Area / Solar Capacity", data.systemSize || `${data.area || '—'} Sq.Ft (${data.capacity || '—'} kW)`, Building, "text-pink-400")}
        {renderInfoCard("Power Phase Type", `${data.phase || data.powerPhase || '—'} Phase`, Zap, "text-purple-400")}
        <div className="md:col-span-2">
          {renderInfoCard("Request Date", formatDate(data.createdAt), Calendar, "text-teal-400")}
        </div>

        {/* Smart Solar Technical ROI Card for Quotes */}
        {billVal > 0 && (
          <div className="md:col-span-2 bg-gradient-to-br from-emerald-500/[0.05] to-teal-500/[0.01] border border-emerald-500/15 rounded-2xl p-6 text-left relative overflow-hidden shadow-lg mt-2 animate-fadeIn">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="flex items-center gap-3 text-emerald-400 font-bold text-[10px] uppercase tracking-widest font-space pb-3 border-b border-emerald-500/10 mb-4">
              <div className="w-6 h-6 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                <Zap size={12} className="text-emerald-400" />
              </div>
              Smart Solar Technical Assessment
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              {/* System Size Recommendation */}
              <div className="bg-slate-950/45 border border-white/5 rounded-xl p-4 flex flex-col gap-2 transition-all duration-300 hover:border-emerald-500/10">
                <span className="text-[9px] font-bold text-white/45 uppercase tracking-wider font-space">Recommended System</span>
                <div className="text-[17px] font-extrabold text-white font-orbitron flex items-baseline gap-1">
                  {Math.ceil(billVal / 1500)} <span className="text-xs text-white/50 font-sans font-medium">kWp</span>
                </div>
                <span className="text-[10px] text-white/40 font-outfit leading-none">Est. energy capacity required</span>
              </div>

              {/* Estimated Monthly Savings */}
              <div className="bg-slate-950/45 border border-white/5 rounded-xl p-4 flex flex-col gap-2 transition-all duration-300 hover:border-emerald-500/10">
                <span className="text-[9px] font-bold text-white/45 uppercase tracking-wider font-space">Est. Monthly Savings</span>
                <div className="text-[17px] font-extrabold text-emerald-400 font-orbitron flex items-baseline gap-1">
                  ₹{Math.floor(billVal * 0.85).toLocaleString('en-IN')} <span className="text-[10px] text-emerald-400/70 font-sans font-medium">/mo</span>
                </div>
                <span className="text-[10px] text-emerald-400/50 font-outfit leading-none">Up to 85% bill savings</span>
              </div>

              {/* Green Impact (CO2 Reductions) */}
              <div className="bg-slate-950/45 border border-white/5 rounded-xl p-4 flex flex-col gap-2 transition-all duration-300 hover:border-emerald-500/10">
                <span className="text-[9px] font-bold text-white/45 uppercase tracking-wider font-space">Annual CO2 Offsets</span>
                <div className="text-[17px] font-extrabold text-sky-400 font-orbitron flex items-baseline gap-1">
                  {((billVal / 8) * 12 * 0.0008).toFixed(1)} <span className="text-xs text-white/50 font-sans font-medium">Tons</span>
                </div>
                <span className="text-[10px] text-white/40 font-outfit leading-none">Equivalent clean green lung impact</span>
              </div>
            </div>
          </div>
        )}

        {data.message && (
          <div className="md:col-span-2 flex flex-col gap-4 bg-gradient-to-br from-[#0B1D51]/40 to-[#080f2e]/30 border border-white/[0.08] p-6 rounded-2xl text-left relative overflow-hidden shadow-inner mt-2">
            <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange to-orange-light" />
            <div className="flex items-center gap-2 text-white/40">
              <MessageSquare size={14} className="text-orange" />
              <span className="text-[10px] font-orbitron font-extrabold uppercase tracking-widest">Message / Notes</span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed font-outfit pl-1 italic font-light">
              "{data.message}"
            </p>
          </div>
        )}
      </div>
    )
  }

  // 7. REVIEWS VIEW
  const renderReviewData = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {renderInfoCard("Designation / Role", data.designation || data.role || 'Customer', Briefcase, "text-sky")}

      <div className="flex flex-col gap-4 bg-gradient-to-br from-white/[0.05] to-white/[0.015] border border-white/[0.08] hover:border-transparent p-5 rounded-2xl transition-all duration-300 group hover:-translate-y-1 shadow-lg text-left relative overflow-hidden"
        style={{
          boxShadow: "0 4px 12px rgba(255, 184, 0, 0.03)",
          borderColor: "rgba(255, 184, 0, 0.15)"
        }}
      >
        <div className="absolute inset-0 border border-transparent rounded-2xl group-hover:border-yellow-400/30 transition-colors duration-300 pointer-events-none" />
        <span className="text-[10px] font-orbitron font-extrabold uppercase tracking-widest text-white/35 block">Star Rating</span>

        <div className="flex items-center gap-4 text-sm font-semibold text-white/95">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-yellow-400 group-hover:scale-110 group-hover:shadow-[0_0_15px_rgba(255,193,7,0.15)] transition-all duration-300 flex-shrink-0 border border-white/5">
            <Star size={18} fill="#FFB800" stroke="#FFB800" className="drop-shadow-[0_0_5px_rgba(255,184,0,0.4)]" />
          </div>
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5 shadow-inner">
              {[...Array(5)].map((_, i) => {
                const stars = data.stars ?? data.rating ?? 5
                return (
                  <Star key={i} size={13} fill={i < stars ? '#FFB800' : 'transparent'} stroke={i < stars ? '#FFB800' : 'rgba(255,255,255,0.2)'} className={i < stars ? "drop-shadow-[0_0_2px_rgba(255,184,0,0.5)]" : ""} />
                )
              })}
              <span className="ml-2 font-black font-orbitron text-xs text-yellow-400">{(data.stars ?? data.rating ?? 5)}.0/5.0</span>
            </div>
          </div>
        </div>
      </div>

      <div className="md:col-span-2">
        {renderInfoCard("Submitted Date", formatDate(data.createdAt), Calendar, "text-purple-400")}
      </div>
      {data.review && (
        <div className="md:col-span-2 flex flex-col gap-4 bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/[0.08] p-6 rounded-2xl text-left relative overflow-hidden shadow-inner mt-2">
          <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-orange to-orange-light" />
          <div className="flex items-center gap-2 text-white/40">
            <MessageSquare size={14} className="text-orange" />
            <span className="text-[10px] font-orbitron font-extrabold uppercase tracking-widest">Review Content</span>
          </div>
          <p className="text-sm text-white/80 leading-relaxed font-outfit pl-1 italic font-light">
            "{data.review}"
          </p>
        </div>
      )}
    </div>
  )

  const renderBody = () => {
    switch (type) {
      case 'application': return renderApplicationData()
      case 'contact': return renderContactData()
      case 'referral': return renderReferralData()
      case 'partner': return renderPartnerData()
      case 'query': return renderQueryData()
      case 'quote': return renderQuoteData()
      case 'review': return renderReviewData()
      default: return null
    }
  }

  if (loading) {
    return (
      <div className="page animate-fadeIn" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: 36, height: 36, border: '3px solid rgba(255,122,0,0.2)', borderTopColor: '#FF7A00', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  if (!data) return null

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="page pb-12 animate-slideInUp"
    >

      {/* HEADER SECTION WITH BACK BUTTON */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex items-center justify-between gap-4 flex-wrap px-6 py-4 rounded-2xl bg-gradient-to-r from-slate-950/70 to-slate-900/60 border border-white/10 backdrop-blur-xl shadow-[0_10px_40px_-15px_rgba(0,0,0,0.7)] mb-8 group"
      >
        <button
          onClick={() => navigate(handlers.backRoute)}
          className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange hover:text-white hover:bg-gradient-to-r hover:from-[#FFB800] hover:to-[#FF7A00] hover:border-transparent hover:shadow-[0_4px_15px_rgba(255,122,0,0.25)] transition-all duration-300 cursor-pointer text-xs font-bold font-space group"
        >
          <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform duration-200" />
          Back to {capitalize(type === 'quote' ? 'quotes' : type === 'query' ? 'queries' : type) + 's'}
        </button>

        <div className="flex gap-2">
          <button
            onClick={del}
            className="flex items-center gap-3 px-5 py-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:text-white hover:bg-gradient-to-r hover:from-red-600 hover:to-red-500 hover:border-transparent transition-all duration-300 cursor-pointer text-xs font-bold font-space shadow-md hover:shadow-red-500/20 group"
          >
            <Trash2 size={14} className="group-hover:animate-bounce" />
            Delete Record
          </button>
        </div>
      </motion.div>

      {/* DETAILED CONTENT SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch mt-4">

        {/* LEFT COLUMN: SIDEBAR CARD */}
        <motion.div
          initial={{ opacity: 0, x: -25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          className="bg-gradient-to-br from-[#0B1D51]/95 to-[#080f2e]/90 border border-white/10 rounded-3xl p-6 md:p-7 relative overflow-hidden backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col h-full min-h-[520px] gap-8 animate-slideInLeft"
        >
          {/* Ambient Glows */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-[100px] pointer-events-none animate-pulseGlow" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-sky-500/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="flex-1 flex flex-col gap-6 relative z-10">
            {/* Profile Header */}
            <div className="flex items-center gap-4 bg-gradient-to-br from-white/[0.05] to-white/[0.01] border border-white/[0.08] hover:border-orange/20 p-5 rounded-2xl relative z-10 group transition-all duration-300 shadow-md">
              <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-black text-2xl text-white shadow-lg relative overflow-hidden flex-shrink-0 border border-white/10 group-hover:scale-105 transition-transform duration-300"
                style={{
                  background: 'linear-gradient(135deg,#FF7A00,#FFB800)',
                  boxShadow: '0 8px 24px rgba(255, 122, 0, 0.25)'
                }}>
                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:8px_8px]" />
                <span className="relative z-10 font-orbitron tracking-tighter drop-shadow-[0_2px_4px_rgba(0,0,0,0.2)]">{data.name?.[0] ?? '?'}</span>
              </div>
              <div className="space-y-1.5 text-left min-w-0 flex-1">
                <h3 className="font-orbitron font-extrabold text-base text-white tracking-wider truncate w-full" title={data.name}>
                  {data.name || 'Anonymous'}
                </h3>
                <div className="flex items-center gap-2 flex-wrap">
                  {renderStatusBadge(data.status)}
                </div>
              </div>
            </div>

            {/* Quick Info list */}
            <div className="space-y-4 border-t border-white/10 pt-5 text-left relative z-10">
              <span className="text-[10px] font-orbitron font-extrabold uppercase tracking-widest text-white/40 block">Record Information</span>

              <div className="flex justify-between items-center text-xs bg-gradient-to-r from-white/[0.04] to-white/[0.01] border border-white/[0.06] p-4 rounded-xl font-space hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300 shadow-sm">
                <span className="text-white/50 font-medium">Record Type:</span>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-orange animate-pulse" />
                  <span className="font-bold text-orange capitalize tracking-wide text-xs">{handlers.label}</span>
                </div>
              </div>

              <div className="flex justify-between items-center text-xs bg-gradient-to-r from-white/[0.04] to-white/[0.01] border border-white/[0.06] p-4 rounded-xl font-space hover:bg-white/[0.06] hover:border-white/10 transition-all duration-300 shadow-sm">
                <span className="text-white/50 font-medium">Created At:</span>
                <div className="flex items-center gap-1.5">
                  <Calendar size={12} className="text-white/30" />
                  <span className="font-bold text-white/90 text-xs">{new Date(data.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                </div>
              </div>
            </div>

            {/* Commission panel (For referrals only) */}
            {type === 'referral' && (
              <div className="bg-green-500/5 border border-green-500/15 rounded-2xl p-5 space-y-3 text-left relative z-10">
                <div className="flex justify-between items-center text-[10px] text-green-400 font-bold uppercase tracking-widest font-space">
                  <span>Commission Payout</span>
                  {!editingComm && (
                    <button onClick={startEditCommission} className="text-xs text-sky font-bold hover:underline cursor-pointer border-none bg-transparent">
                      Edit
                    </button>
                  )}
                </div>
                {editingComm ? (
                  <div className="flex gap-2 items-center mt-1 animate-fadeIn">
                    <div className="relative flex-1">
                      <IndianRupee size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
                      <input
                        type="number"
                        value={commInput}
                        onChange={e => setCommInput(e.target.value)}
                        className="input"
                        style={{ paddingLeft: 24, height: 34, fontSize: 13, paddingTop: 0, paddingBottom: 0 }}
                        autoFocus
                      />
                    </div>
                    <button onClick={saveCommission} className="btn btn-orange" style={{ padding: '6px 12px', fontSize: 11 }}>Save</button>
                    <button onClick={() => setEditingComm(false)} className="btn btn-ghost" style={{ padding: '6px 12px', fontSize: 11 }}>Cancel</button>
                  </div>
                ) : (
                  <div className="text-2xl font-black text-green-400 flex items-center font-orbitron drop-shadow-[0_2px_8px_rgba(34,197,94,0.25)]">
                    <IndianRupee size={18} className="stroke-[2.5] text-green-400" />
                    {(data.commission ?? 0).toLocaleString('en-IN')}
                  </div>
                )}
              </div>
            )}

            {/* Action CV Download (Applications only) */}
            {type === 'application' && data.cv?.filename && (
              <button
                onClick={downloadCv}
                className="w-full flex items-center justify-center gap-2 py-3.5 bg-teal-500/10 hover:bg-teal-500/20 border border-teal-500/30 text-[#00C9A7] font-bold text-xs font-space rounded-xl transition-all cursor-pointer relative z-10 shadow-md hover:shadow-teal-500/10"
              >
                <FileText size={14} /> Download CV File
                <Download size={13} />
              </button>
            )}
          </div>

          {/* Dynamic Interactive Funnel Stepper */}
          <div className="space-y-4 border-t border-white/10 pt-5 text-left relative z-10 mt-auto">
            <span className="text-[10px] font-orbitron font-extrabold uppercase tracking-widest text-white/40 block">Set Quick Status</span>

            <div className="relative flex flex-col gap-4 pl-6 border-l border-white/10 mt-3 ml-2">
              {getStatusOptions().map((statusOption) => {
                const isActive = data.status === statusOption
                const activeStyles = getActiveStatusStyle(statusOption)
                const color = activeStyles.color

                return (
                  <div key={statusOption} className="relative group/step">
                    {/* Connecting line dot */}
                    <div
                      className="absolute -left-[31px] top-1/2 -translate-y-1/2 w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10"
                      style={{
                        borderColor: isActive ? color : 'rgba(255,255,255,0.12)',
                        backgroundColor: isActive ? color : '#07133a',
                        boxShadow: isActive ? `0 0 10px ${color}` : 'none'
                      }}
                    >
                      {isActive && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                    </div>

                    <button
                      onClick={() => setStatus(statusOption)}
                      className="text-left w-full p-3.5 rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 cursor-pointer bg-gradient-to-br flex justify-between items-center"
                      style={{
                        background: isActive ? activeStyles.background : 'rgba(255, 255, 255, 0.01)',
                        borderColor: isActive ? activeStyles.borderColor : 'rgba(255, 255, 255, 0.04)',
                        color: isActive ? color : 'rgba(255, 255, 255, 0.35)',
                        boxShadow: isActive ? activeStyles.boxShadow : 'none'
                      }}
                    >
                      <span className="font-orbitron font-extrabold text-[10px] tracking-widest uppercase">{capitalize(statusOption)}</span>
                      {isActive && (
                        <span
                          className="text-[8px] font-mono px-2 py-0.5 rounded-md border text-center font-bold tracking-widest uppercase"
                          style={{
                            color: color,
                            borderColor: activeStyles.borderColor,
                            backgroundColor: 'rgba(255,255,255,0.02)'
                          }}
                        >
                          Active
                        </span>
                      )}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </motion.div>

        {/* RIGHT COLUMN: DETAILED INFO CARDS GRID (Takes 2 spans out of 3) */}
        <motion.div
          initial={{ opacity: 0, x: 25 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4, delay: 0.15, ease: "easeOut" }}
          className="lg:col-span-2 bg-gradient-to-br from-[#0B1D51]/95 to-[#080f2e]/90 border border-white/10 rounded-3xl p-6 md:p-8 relative overflow-hidden backdrop-blur-3xl shadow-[0_20px_50px_rgba(0,0,0,0.6)] flex flex-col h-full gap-6 animate-slideInRight"
        >
          {/* Ambient Glows */}
          <div className="absolute top-1/2 right-1/4 w-80 h-80 bg-sky-500/10 rounded-full blur-[100px] pointer-events-none animate-pulseGlow" />
          <div className="absolute -bottom-10 -left-10 w-64 h-64 bg-orange-500/5 rounded-full blur-[90px] pointer-events-none" />

          <div className="flex-1 flex flex-col gap-6 relative z-10">
            <div className="pb-5 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange/20 to-orange/10 flex items-center justify-center shadow-inner border border-orange/10">
                  <Zap size={18} className="text-orange drop-shadow-[0_0_4px_rgba(255,122,0,0.5)]" />
                </div>
                <div>
                  <h2 className="font-orbitron font-extrabold text-[15px] uppercase tracking-widest text-white/90">
                    {handlers.label} Overview
                  </h2>
                  <p className="text-[10px] text-white/40 font-outfit mt-0.5">Live database record synchronizer</p>
                </div>
              </div>
              <span className="text-[9px] font-mono bg-white/5 border border-white/10 px-2.5 py-1 rounded-lg text-white/40">
                SECURE NODE
              </span>
            </div>

            <div className="text-white flex-1">
              {renderBody()}
            </div>
          </div>

          {/* Secure database badge */}
          <div className="text-[9px] text-white/20 font-mono mt-8 text-right border-t border-white/10 pt-4 tracking-wider relative z-10">
            URBAN ENERGY &bull; ADMINISTRATIVE SYSTEMS DIVISION &bull; ENCRYPTED DB NODE &bull; REF_ID: {data._id}
          </div>
        </motion.div>

      </div>

      {/* Interactive QR Code Lightbox / Zoom Modal */}
      {zoomedQrUrl && (
        <div
          onClick={() => setZoomedQrUrl(null)}
          className="fixed inset-0 z-[200] flex flex-col items-center justify-center bg-slate-950/90 backdrop-blur-xl p-4 cursor-pointer animate-fadeIn"
        >
          <button
            onClick={() => setZoomedQrUrl(null)}
            className="absolute top-6 right-6 w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all text-white cursor-pointer hover:rotate-90 duration-300"
          >
            <X size={20} />
          </button>
          <div
            onClick={e => e.stopPropagation()}
            className="bg-slate-900/90 border border-white/15 p-7 rounded-3xl max-w-sm w-full text-center space-y-5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] cursor-default backdrop-blur-2xl relative overflow-hidden"
          >
            {/* Glowing accent border top */}
            <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-orange to-orange-light" />

            <h3 className="font-orbitron font-black text-base text-white uppercase tracking-wider">
              Scan QR to Pay
            </h3>
            <p className="text-xs text-white/60 font-outfit leading-relaxed">
              Scan this QR code using any UPI app (GPay, PhonePe, Paytm) to transfer the referral commission of <span className="text-green-400 font-bold">₹{(data.commission ?? 0).toLocaleString('en-IN')}</span>.
            </p>
            <div className="bg-white rounded-2xl p-3 max-w-[220px] mx-auto shadow-inner flex items-center justify-center border border-white/10">
              <img
                src={zoomedQrUrl}
                alt="Referrer QR Zoomed"
                className="w-full h-auto max-h-[220px] object-contain rounded-xl shadow-md"
              />
            </div>

            <div className="space-y-2 border-t border-white/10 pt-4">
              <div className="flex justify-between items-center text-xs text-white/50 bg-white/[0.02] border border-white/5 p-3 rounded-xl font-space">
                <span>Referrer Name:</span>
                <span className="font-bold text-white/90">{data.referrerName}</span>
              </div>
              {data.referrerId?.upiId && (
                <div className="flex justify-between items-center text-xs text-white/50 bg-white/[0.02] border border-white/5 p-3 rounded-xl font-space">
                  <span>UPI ID:</span>
                  <span className="font-mono font-bold text-emerald-400 select-all">{data.referrerId.upiId}</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setZoomedQrUrl(null)}
              className="w-full py-3.5 bg-gradient-to-r from-[#FFB800] to-[#FF7A00] hover:shadow-[0_4px_20px_rgba(255,122,0,0.3)] text-white font-bold text-xs font-space rounded-xl transition-all cursor-pointer border-none mt-2"
            >
              Close View
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
