import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Eye, EyeOff, UserCheck, Briefcase } from 'lucide-react';
import toast from 'react-hot-toast';
import useAuthStore from '../store/authStore';
import styles from './AuthPage.module.css';

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', password: '', role: 'candidate' });
  const [showPass, setShowPass] = useState(false);
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    const result = await register(form.email, form.password, form.role);
    if (result.success) {
      toast.success('Account created!');
      navigate(result.user.role === 'recruiter' ? '/recruiter' : '/build');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <Link to="/" className={styles.logo}>
          <Sparkles size={18} /> TalentForge
        </Link>
        <h1 className={styles.title}>Create account</h1>
        <p className={styles.sub}>Join TalentForge today</p>

        {/* Role selector */}
        <div className={styles.roleSelector}>
          <button
            type="button"
            className={`${styles.roleBtn} ${form.role === 'candidate' ? styles.roleActive : ''}`}
            onClick={() => setForm(p => ({ ...p, role: 'candidate' }))}
          >
            <UserCheck size={18} />
            I'm a Candidate
          </button>
          <button
            type="button"
            className={`${styles.roleBtn} ${form.role === 'recruiter' ? styles.roleActive : ''}`}
            onClick={() => setForm(p => ({ ...p, role: 'recruiter' }))}
          >
            <Briefcase size={18} />
            I'm a Recruiter
          </button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div>
            <label className="label">Email</label>
            <input
              className="input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
              required
            />
          </div>
          <div style={{ position: 'relative' }}>
            <label className="label">Password</label>
            <input
              className="input"
              type={showPass ? 'text' : 'password'}
              placeholder="Min 6 characters"
              value={form.password}
              onChange={e => setForm(p => ({ ...p, password: e.target.value }))}
              required
              style={{ paddingRight: '44px' }}
            />
            <button type="button" className={styles.eyeBtn} onClick={() => setShowPass(p => !p)}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? <span className="spinner" /> : `Create ${form.role} account`}
          </button>
        </form>

        <p className={styles.footer}>
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}