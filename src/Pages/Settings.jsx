import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Save, Phone, Mail, MapPin, Globe, Lock, Eye, EyeOff, Camera, User, Briefcase, Pencil, IndianRupee, Zap, Home, Users } from 'lucide-react'
import { toast } from 'react-toastify'
import Swal from 'sweetalert2'
import { useAuth } from '../context/AuthContext'
import { authApi, referralsApi } from '../api'

const CONTACT_FIELDS = [
  { key: 'phone', label: 'Phone Number', Icon: Phone, placeholder: '+91 98000 12345', type: 'text' },
  { key: 'email', label: 'Email Address', Icon: Mail, placeholder: 'support@vaulixsolar.in', type: 'email' },
  { key: 'address', label: 'Office Address', Icon: MapPin, placeholder: 'City, State – PIN', type: 'text' },
  { key: 'whatsapp', label: 'WhatsApp Number', Icon: Phone, placeholder: '919800012345', type: 'text' },
  { key: 'apiUrl', label: 'Backend API URL', Icon: Globe, placeholder: 'https://api.example.com', type: 'url' },
]

const Label = ({ children }) => (
  <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.38)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 7 }}>
    {children}
  </label>
)

const FieldWrap = ({ Icon, children }) => (
  <div style={{ position: 'relative' }}>
    <Icon size={14} color="rgba(255,255,255,0.22)"
      style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
    {children}
  </div>
)

export default function Settings() {
  const { profile, updateProfile } = useAuth()
  const avatarRef = useRef()
  const [editing, setEditing] = useState(false)

  const [profileForm, setProfileForm] = useState({
    name: profile.name || '',
    mobile: profile.mobile || '',
    address: profile.address || '',
    role: profile.role || '',
    avatar: profile.avatar || null,
  })

  const [siteForm, setSiteForm] = useState({
    phone: '+91 98000 12345',
    email: 'support@vaulixsolar.in',
    address: 'Lucknow, Uttar Pradesh – 226001',
    whatsapp: '919800012345',
    apiUrl: 'https://api.vaulixsolar.in',
  })

  const [passForm, setPassForm] = useState({ current: '', newPass: '', confirm: '' })
  const [showPass, setShowPass] = useState({ current: false, newPass: false, confirm: false })

  const [commissionForm, setCommissionForm] = useState({
    residential: 1999,
    commercial: 4999,
    society: 4999,
    offGrid: 4999
  })
  const [savingCommission, setSavingCommission] = useState(false)

  useEffect(() => {
    referralsApi.getCommissionConfig()
      .then(setCommissionForm)
      .catch(() => {})
  }, [])

  /* ── Avatar upload ── */
  const handleAvatar = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { toast.error('Please select an image file.'); return }
    if (file.size > 3 * 1024 * 1024) { toast.error('Image must be under 3MB.'); return }
    const reader = new FileReader()
    reader.onload = (ev) => setProfileForm(f => ({ ...f, avatar: ev.target.result }))
    reader.readAsDataURL(file)
  }

  /* ── Save Profile ── */
  const saveProfile = async () => {
    if (!profileForm.name.trim()) { toast.error('Name is required.'); return }
    try {
      await updateProfile(profileForm)
      setEditing(false)
      toast.success('Profile updated successfully!')
    } catch (e) { toast.error(e.message) }
  }

  const cancelEdit = () => {
    setProfileForm({
      name: profile.name || '',
      mobile: profile.mobile || '',
      address: profile.address || '',
      role: profile.role || '',
      avatar: profile.avatar || null,
    })
    setEditing(false)
  }

  /* ── Save Site Info ── */
  const saveSite = () => {
    toast.success('Site settings saved!')
  }

  /* ── Save Commission Rates ── */
  const saveCommission = async () => {
    setSavingCommission(true)
    try {
      const updated = await referralsApi.updateCommissionConfig(commissionForm)
      setCommissionForm(updated)
      toast.success('Referral commission rates updated successfully!')
    } catch (e) {
      toast.error(e.message)
    } finally {
      setSavingCommission(false)
    }
  }

  /* ── Change Password ── */
  const changePassword = async () => {
    if (!passForm.current) { toast.error('Enter current password.'); return }
    if (passForm.newPass.length < 6) { toast.error('New password must be at least 6 characters.'); return }
    if (passForm.newPass !== passForm.confirm) { toast.error('Passwords do not match.'); return }

    const result = await Swal.fire({
      title: 'Change Password?',
      text: 'Are you sure you want to update your password?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, change it',
      cancelButtonText: 'Cancel',
      background: '#0B1D51',
      color: '#ffffff',
      confirmButtonColor: '#FF7A00',
      cancelButtonColor: 'rgba(255,255,255,0.1)',
    })

    if (result.isConfirmed) {
      try {
        await authApi.changePassword({ currentPassword: passForm.current, newPassword: passForm.newPass })
        setPassForm({ current: '', newPass: '', confirm: '' })
        toast.success('Password changed successfully!')
      } catch (e) { toast.error(e.message) }
    }
  }

  /* ── Remove Avatar ── */
  const removeAvatar = async () => {
    const result = await Swal.fire({
      title: 'Remove Profile Photo?',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Remove',
      cancelButtonText: 'Cancel',
      background: '#0B1D51',
      color: '#ffffff',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: 'rgba(255,255,255,0.08)',
    })
    if (result.isConfirmed) {
      setProfileForm(f => ({ ...f, avatar: null }))
      toast.info('Profile photo removed.')
    }
  }

  const togglePass = (key) => setShowPass(s => ({ ...s, [key]: !s[key] }))

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Panel <span className="glow-text">Settings</span></h1>
          <p className="page-subtitle">Manage your profile, site info & security</p>
        </div>
      </div>

      {/* ── Row 1: Profile + Password ── */}
      <div className="grid-2">

        {/* Profile Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass" style={{ padding: '24px' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 14.5, color: 'white' }}>My Profile</div>
            {!editing && (
              <button onClick={() => setEditing(true)} className="btn"
                style={{ background: 'rgba(255,122,0,0.12)', border: '1px solid rgba(255,122,0,0.25)', color: '#FF7A00', padding: '6px 14px', fontSize: 12 }}>
                <Pencil size={13} /> Edit
              </button>
            )}
          </div>

          {/* Avatar */}
          <div className="flex items-center gap-5 mb-6">
            <div style={{ position: 'relative', flexShrink: 0 }}>
              {profileForm.avatar
                ? <img src={profileForm.avatar} alt="avatar"
                  style={{ width: 72, height: 72, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,122,0,0.4)' }} />
                : <div style={{ width: 72, height: 72, borderRadius: '50%', background: 'linear-gradient(135deg,#FF7A00,#FFB800)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, fontWeight: 900, color: 'white', border: '2px solid rgba(255,122,0,0.4)' }}>
                  {profileForm.name?.[0]?.toUpperCase() || 'A'}
                </div>
              }
              {editing && (
                <button onClick={() => avatarRef.current.click()}
                  style={{ position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: '50%', background: '#FF7A00', border: '2px solid #080f2e', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <Camera size={11} color="white" />
                </button>
              )}
              <input ref={avatarRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatar} />
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: 'white' }}>{profileForm.name || 'Admin User'}</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginTop: 2 }}>{profileForm.role || 'Super Admin'}</div>
              {editing && profileForm.avatar && (
                <button onClick={removeAvatar}
                  style={{ marginTop: 6, fontSize: 11.5, color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontWeight: 600 }}>
                  Remove photo
                </button>
              )}
            </div>
          </div>

          {/* Profile Fields */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { key: 'name', label: 'Full Name', Icon: User, placeholder: 'Your full name', type: 'text' },
              { key: 'mobile', label: 'Mobile Number', Icon: Phone, placeholder: '+91 98000 00000', type: 'tel' },
              { key: 'address', label: 'Address', Icon: MapPin, placeholder: 'Your address', type: 'text' },
              { key: 'role', label: 'Role / Designation', Icon: Briefcase, placeholder: 'e.g. Super Admin', type: 'text' },
            ].map(({ key, label, Icon, placeholder, type }) => (
              <div key={key}>
                <Label>{label}</Label>
                {editing ? (
                  <FieldWrap Icon={Icon}>
                    <input className="input" style={{ paddingLeft: 36 }} placeholder={placeholder} type={type}
                      value={profileForm[key]} onChange={e => setProfileForm(f => ({ ...f, [key]: e.target.value }))} />
                  </FieldWrap>
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', background: 'rgba(255,255,255,0.03)', borderRadius: 10, border: '1px solid rgba(255,255,255,0.06)' }}>
                    <Icon size={14} color="rgba(255,255,255,0.22)" style={{ flexShrink: 0 }} />
                    <span style={{ fontSize: 13.5, color: profileForm[key] ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.2)' }}>
                      {profileForm[key] || `No ${label.toLowerCase()} set`}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>

          {editing && (
            <div className="flex gap-3" style={{ marginTop: 20 }}>
              <button className="btn btn-ghost" onClick={cancelEdit} style={{ flex: 1, justifyContent: 'center' }}>Cancel</button>
              <button className="btn btn-orange" onClick={saveProfile} style={{ flex: 1, justifyContent: 'center' }}>
                <Save size={14} /> Save Profile
              </button>
            </div>
          )}
        </motion.div>

        {/* Password Card */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="glass" style={{ padding: '24px' }}>
          <div style={{ fontWeight: 700, fontSize: 14.5, color: 'white', marginBottom: 20 }}>Change Password</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { key: 'current', label: 'Current Password', placeholder: 'Enter current password' },
              { key: 'newPass', label: 'New Password', placeholder: 'Enter new password' },
              { key: 'confirm', label: 'Confirm Password', placeholder: 'Confirm new password' },
            ].map(({ key, label, placeholder }) => (
              <div key={key}>
                <Label>{label}</Label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} color="rgba(255,255,255,0.22)"
                    style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                  <input className="input" style={{ paddingLeft: 36, paddingRight: 40 }}
                    type={showPass[key] ? 'text' : 'password'} placeholder={placeholder}
                    value={passForm[key]} onChange={e => setPassForm(f => ({ ...f, [key]: e.target.value }))} />
                  <button type="button" onClick={() => togglePass(key)}
                    style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                    {showPass[key] ? <EyeOff size={14} color="rgba(255,255,255,0.28)" /> : <Eye size={14} color="rgba(255,255,255,0.28)" />}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <button className="btn btn-orange" onClick={changePassword} style={{ marginTop: 20, width: '100%', justifyContent: 'center', padding: '11px' }}>
            <Lock size={14} /> Update Password
          </button>
        </motion.div>
      </div>

      {/* ── Row 2: Site Info ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.14 }} className="glass" style={{ padding: '24px' }}>
        <div style={{ fontWeight: 700, fontSize: 14.5, color: 'white', marginBottom: 20 }}>Website Contact Info</div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
          {CONTACT_FIELDS.map(({ key, label, Icon, placeholder, type }) => (
            <div key={key}>
              <Label>{label}</Label>
              <FieldWrap Icon={Icon}>
                <input className="input" style={{ paddingLeft: 36 }} type={type} placeholder={placeholder}
                  value={siteForm[key]} onChange={e => setSiteForm(f => ({ ...f, [key]: e.target.value }))} />
              </FieldWrap>
            </div>
          ))}
        </div>

        <div className="flex justify-end" style={{ marginTop: 20 }}>
          <button className="btn btn-orange" onClick={saveSite} style={{ padding: '11px 26px' }}>
            <Save size={14} /> Save Site Info
          </button>
        </div>
      </motion.div>

      {/* ── Row 3: Referral Payout Settings ── */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass" style={{ padding: '24px', marginTop: '24px' }}>
        <div style={{ fontWeight: 700, fontSize: 14.5, color: 'white', marginBottom: 6 }}>Referral Payout Settings</div>
        <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.38)', marginBottom: 20 }}>Configure the reward commission (₹) that the referrer earns when their friend's project is created.</p>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {[
            { key: 'residential', label: 'Residential Solar', Icon: Home },
            { key: 'commercial', label: 'Commercial Solar', Icon: Briefcase },
            { key: 'society', label: 'Housing Society Solar', Icon: Users },
            { key: 'offGrid', label: 'Off Grid Solar', Icon: Zap },
          ].map(({ key, label, Icon }) => (
            <div key={key}>
              <Label>{label} Commission</Label>
              <div style={{ position: 'relative' }}>
                <IndianRupee size={13} color="rgba(255,255,255,0.22)"
                  style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }} />
                <input className="input" style={{ paddingLeft: 32 }} type="number" placeholder="0"
                  value={commissionForm[key] || 0} onChange={e => setCommissionForm(f => ({ ...f, [key]: Number(e.target.value) || 0 }))} />
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end" style={{ marginTop: 20 }}>
          <button className="btn btn-orange" onClick={saveCommission} disabled={savingCommission} style={{ padding: '11px 26px' }}>
            <Save size={14} /> {savingCommission ? 'Saving...' : 'Save Commission Rates'}
          </button>
        </div>
      </motion.div>
    </div>
  )
}
