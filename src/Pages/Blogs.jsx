import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Save, Image, Upload } from 'lucide-react'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { blogsApi } from '../api'

const CATEGORIES = ['Education', 'Government', 'Comparison', 'Products', 'News']
const S = {
  Published: { bg: 'rgba(0,201,167,0.12)', color: '#00C9A7', border: 'rgba(0,201,167,0.25)' },
  Draft:     { bg: 'rgba(255,193,7,0.12)', color: '#FFC107', border: 'rgba(255,193,7,0.25)' },
}
const EMPTY = { title: '', category: 'Education', status: 'Draft', content: '', thumb: null, thumbPreview: null }

export default function Blogs() {
  const [data, setData]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]           = useState(EMPTY)
  const [editId, setEditId]       = useState(null)
  const [saving, setSaving]       = useState(false)
  const [dragOver, setDragOver]   = useState(false)
  const fileRef = useRef()

  useEffect(() => {
    blogsApi.getAll()
      .then(setData)
      .catch(e => toast.error(e.message))
      .finally(() => setLoading(false))
  }, [])

  const openNew  = () => { setForm(EMPTY); setEditId(null); setShowModal(true) }
  const openEdit = (b) => {
    setForm({ title: b.title, category: b.category, status: b.status, content: b.content || '', thumb: b.thumb, thumbPreview: b.thumb })
    setEditId(b._id)
    setShowModal(true)
  }
  const closeModal = () => { setShowModal(false); setDragOver(false) }

  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (e) => setForm(f => ({ ...f, thumb: e.target.result, thumbPreview: e.target.result }))
    reader.readAsDataURL(file)
  }

  const save = async () => {
    if (!form.title.trim()) { toast.error('Title is required.'); return }
    setSaving(true)
    try {
      const payload = { title: form.title, category: form.category, status: form.status, content: form.content, thumb: form.thumb }
      if (editId) {
        const updated = await blogsApi.update(editId, payload)
        setData(d => d.map(b => b._id === editId ? updated : b))
        toast.success('Post updated!')
      } else {
        const created = await blogsApi.create(payload)
        setData(d => [created, ...d])
        toast.success('New post created!')
      }
      closeModal()
    } catch (e) { toast.error(e.message) }
    finally { setSaving(false) }
  }

  const del = async (id) => {
    const result = await Swal.fire({
      title: 'Delete Post?', text: 'This blog post will be permanently deleted.', icon: 'warning',
      showCancelButton: true, confirmButtonText: 'Delete', cancelButtonText: 'Cancel',
      background: '#0B1D51', color: '#ffffff', confirmButtonColor: '#ef4444', cancelButtonColor: 'rgba(255,255,255,0.08)',
    })
    if (result.isConfirmed) {
      try {
        await blogsApi.delete(id)
        setData(d => d.filter(b => b._id !== id))
        toast.success('Post deleted.')
      } catch (e) { toast.error(e.message) }
    }
  }

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Blog <span className="glow-text">Management</span></h1>
          <p className="page-subtitle">{data.length} posts total</p>
        </div>
        <button className="btn btn-orange" onClick={openNew}><Plus size={15} /> New Post</button>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div key="bg"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(6px)' }}
            onClick={e => e.target === e.currentTarget && closeModal()}>
            <motion.div key="modal"
              initial={{ scale: 0.94, y: 16 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.94, y: 16 }}
              transition={{ type: 'spring', damping: 26, stiffness: 320 }}
              style={{ background: '#0B1D51', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 18, padding: 24, width: '100%', maxWidth: 560, maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="flex items-center justify-between mb-6">
                <span className="font-orbitron font-bold text-white" style={{ fontSize: 15 }}>
                  {editId ? 'Edit Post' : 'New Blog Post'}
                </span>
                <button onClick={closeModal} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                  <X size={18} color="rgba(255,255,255,0.4)" />
                </button>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>
                    Featured Image / Thumbnail
                  </label>
                  {form.thumbPreview ? (
                    <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden', height: 180 }}>
                      <img src={form.thumbPreview} alt="thumb" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, opacity: 0, transition: 'opacity 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.opacity = 1}
                        onMouseLeave={e => e.currentTarget.style.opacity = 0}>
                        <button onClick={() => fileRef.current.click()}
                          style={{ background: 'rgba(255,255,255,0.15)', border: '1px solid rgba(255,255,255,0.3)', borderRadius: 8, padding: '7px 14px', color: 'white', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Upload size={13} /> Change
                        </button>
                        <button onClick={() => setForm(f => ({ ...f, thumb: null, thumbPreview: null }))}
                          style={{ background: 'rgba(220,38,38,0.2)', border: '1px solid rgba(220,38,38,0.4)', borderRadius: 8, padding: '7px 14px', color: '#f87171', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Trash2 size={13} /> Remove
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div onClick={() => fileRef.current.click()}
                      onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                      onDragLeave={() => setDragOver(false)}
                      onDrop={e => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files[0]) }}
                      style={{ border: `2px dashed ${dragOver ? '#FF7A00' : 'rgba(255,255,255,0.12)'}`, borderRadius: 12, padding: '32px 20px', textAlign: 'center', cursor: 'pointer', background: dragOver ? 'rgba(255,122,0,0.06)' : 'rgba(255,255,255,0.02)', transition: 'all 0.18s' }}>
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3"
                        style={{ background: 'rgba(255,122,0,0.1)', border: '1px solid rgba(255,122,0,0.2)' }}>
                        <Image size={18} color="#FF7A00" />
                      </div>
                      <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Click to upload or drag & drop</div>
                      <div style={{ color: 'rgba(255,255,255,0.25)', fontSize: 11.5 }}>PNG, JPG, WEBP · Max 5MB</div>
                    </div>
                  )}
                  <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 }}>Title *</label>
                  <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Blog post title..." />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 }}>Category</label>
                    <select className="input" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 }}>Status</label>
                    <select className="input" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                      <option>Draft</option><option>Published</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 }}>Content</label>
                  <textarea className="input" value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                    placeholder="Write blog content here..." rows={6} style={{ resize: 'vertical', lineHeight: 1.6 }} />
                </div>

                <div className="flex gap-3 justify-end pt-1">
                  <button className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                  <button className="btn btn-orange" onClick={save} disabled={saving}>
                    <Save size={14} /> {saving ? 'Saving...' : 'Save Post'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="glass" style={{ overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="tbl">
            <thead>
              <tr><th>Thumbnail</th><th>Title</th><th>Category</th><th>Status</th><th>Views</th><th>Date</th><th></th></tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: 'rgba(255,255,255,0.2)' }}>Loading...</td></tr>
                : data.map((b, i) => (
                  <motion.tr key={b._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}>
                    <td>
                      {b.thumb
                        ? <img src={b.thumb} alt="" style={{ width: 52, height: 36, objectFit: 'cover', borderRadius: 7, display: 'block' }} />
                        : <div style={{ width: 52, height: 36, borderRadius: 7, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Image size={14} color="rgba(255,255,255,0.2)" />
                          </div>
                      }
                    </td>
                    <td style={{ maxWidth: 240 }}>
                      <span style={{ fontWeight: 600, color: 'white', display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.title}</span>
                    </td>
                    <td>
                      <span className="badge" style={{ background: 'rgba(0,163,224,0.1)', color: '#00A3E0', border: '1px solid rgba(0,163,224,0.2)' }}>{b.category}</span>
                    </td>
                    <td>
                      <span className="badge" style={{ background: S[b.status].bg, color: S[b.status].color, border: `1px solid ${S[b.status].border}` }}>{b.status}</span>
                    </td>
                    <td style={{ color: '#FFB800', fontWeight: 700 }}>{b.views?.toLocaleString()}</td>
                    <td style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11.5 }}>{new Date(b.createdAt).toLocaleDateString('en-IN')}</td>
                    <td>
                      <div className="flex gap-1.5">
                        <button onClick={() => openEdit(b)}
                          style={{ background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.2)', borderRadius: 7, padding: '5px 7px', cursor: 'pointer' }}>
                          <Pencil size={12} color="#FFB800" />
                        </button>
                        <button onClick={() => del(b._id)}
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
    </div>
  )
}
