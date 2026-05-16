import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Lock, User, Eye, EyeOff, ArrowRight } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import Logo from '/urbanlogo.png'

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [focused, setFocused] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await login(form.username, form.password)
      toast.success('Welcome back! 👋')
      navigate('/dashboard')
    } catch (err) {
      toast.error(err.message || 'Invalid username or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#060d24' }}>

      {/* bg glows */}
      <div className="absolute pointer-events-none" style={{ top: -100, right: -100, width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(255,122,0,0.06) 0%, transparent 65%)', filter: 'blur(60px)' }} />
      <div className="absolute pointer-events-none" style={{ bottom: -100, left: -100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,163,224,0.05) 0%, transparent 65%)', filter: 'blur(60px)' }} />

      <motion.div
        initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        style={{ width: '100%', maxWidth: 400, position: 'relative', zIndex: 1, display: 'flex', flexDirection: 'column', gap: 20 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3">
          <div style={{ width: 42, height: 42, borderRadius: 11, background: 'rgba(255,184,0,0.1)', border: '1px solid rgba(255,184,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <img src={Logo} alt="" style={{ width: 26, height: 26, objectFit: 'contain' }} />
          </div>
          <div>
            <div className="font-orbitron font-black text-white" style={{ fontSize: 16, lineHeight: 1 }}>
              Vaulix <span className="glow-text">Solar</span>
            </div>
            <div style={{ fontSize: 9, color: 'rgba(255,255,255,0.28)', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginTop: 3 }}>
              Admin Panel
            </div>
          </div>
        </div>

        {/* Heading */}
        <div>
          <h2 className="font-orbitron font-black text-white" style={{ fontSize: 22, marginBottom: 5 }}>Welcome Back</h2>
          <p style={{ color: 'rgba(255,255,255,0.32)', fontSize: 13.5 }}>Sign in to your admin account to continue</p>
        </div>

        {/* Form card */}
        <div style={{
          background: 'rgba(255,255,255,0.035)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 18, padding: '24px 22px',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          display: 'flex', flexDirection: 'column', gap: 18
        }}>
          {/* Username */}
          <div>
            <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 7 }}>Username</label>
            <div style={{ position: 'relative' }}>
              <User size={14} color={focused === 'user' ? '#FF7A00' : 'rgba(255,255,255,0.2)'}
                style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', transition: 'color 0.2s' }} />
              <input className="input"
                style={{ paddingLeft: 38, borderColor: focused === 'user' ? 'rgba(255,122,0,0.45)' : undefined, boxShadow: focused === 'user' ? '0 0 0 3px rgba(255,122,0,0.07)' : 'none' }}
                type="text" placeholder="Enter username"
                value={form.username}
                onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
                onFocus={() => setFocused('user')} onBlur={() => setFocused('')}
                required autoComplete="username"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label style={{ display: 'block', fontSize: 10.5, fontWeight: 700, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', letterSpacing: 1.2, marginBottom: 7 }}>Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={14} color={focused === 'pass' ? '#FF7A00' : 'rgba(255,255,255,0.2)'}
                style={{ position: 'absolute', left: 13, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', transition: 'color 0.2s' }} />
              <input className="input"
                style={{ paddingLeft: 38, paddingRight: 42, borderColor: focused === 'pass' ? 'rgba(255,122,0,0.45)' : undefined, boxShadow: focused === 'pass' ? '0 0 0 3px rgba(255,122,0,0.07)' : 'none' }}
                type={showPass ? 'text' : 'password'} placeholder="Enter password"
                value={form.password}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                onFocus={() => setFocused('pass')} onBlur={() => setFocused('')}
                required autoComplete="current-password"
              />
              <button type="button" onClick={() => setShowPass(v => !v)}
                style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
                {showPass ? <EyeOff size={14} color="rgba(255,255,255,0.28)" /> : <Eye size={14} color="rgba(255,255,255,0.28)" />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <motion.button
            type="button" onClick={handleSubmit} disabled={loading}
            whileHover={!loading ? { scale: 1.012 } : {}}
            whileTap={!loading ? { scale: 0.988 } : {}}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
              padding: '12px', borderRadius: 11, border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              background: loading ? 'rgba(255,122,0,0.45)' : 'linear-gradient(135deg, #FFB800, #FF7A00)',
              color: 'white', fontFamily: 'Space Grotesk, sans-serif', fontWeight: 700, fontSize: 14.5,
              boxShadow: loading ? 'none' : '0 6px 24px rgba(255,122,0,0.3)', transition: 'all 0.2s'
            }}
          >
            {loading ? (
              <>
                <span style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'loginSpin 0.7s linear infinite' }} />
                Signing in...
              </>
            ) : <>Sign In <ArrowRight size={16} /></>}
          </motion.button>
        </div>


      </motion.div>

      <style>{`@keyframes loginSpin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
