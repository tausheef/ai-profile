import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Search, Users, Star, LogOut, Filter, ChevronRight, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';
import styles from './RecruiterDashboard.module.css';

export default function RecruiterDashboard() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [shortlisted, setShortlisted] = useState(() => JSON.parse(localStorage.getItem('shortlisted') || '[]'));
  const [filterSkill, setFilterSkill] = useState('');
  const [showShortlistedOnly, setShowShortlistedOnly] = useState(false);

  useEffect(() => { fetchCandidates(); }, []);

  const fetchCandidates = async () => {
    try {
      const res = await api.get('/candidates');
      setCandidates(res.data);
    } catch { toast.error('Failed to load candidates'); }
    finally { setLoading(false); }
  };

  const toggleShortlist = (id) => {
    setShortlisted(prev => {
      const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      localStorage.setItem('shortlisted', JSON.stringify(next));
      return next;
    });
  };

  const filtered = candidates.filter(c => {
    const matchSearch = !search || c.fullName?.toLowerCase().includes(search.toLowerCase()) || c.skills?.some(s => s.toLowerCase().includes(search.toLowerCase()));
    const matchSkill = !filterSkill || c.skills?.some(s => s.toLowerCase().includes(filterSkill.toLowerCase()));
    const matchShortlist = !showShortlistedOnly || shortlisted.includes(c._id);
    return matchSearch && matchSkill && matchShortlist;
  });

  const allSkills = [...new Set(candidates.flatMap(c => c.skills || []))].slice(0, 20);

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.logo}><Sparkles size={18} /> TalentForge</div>
          <span className={styles.badge}>Recruiter</span>
        </div>
        <div className={styles.headerRight}>
          <button className="btn-ghost" style={{ fontSize:'14px', padding:'8px 16px' }} onClick={() => { logout(); navigate('/'); }}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </header>

      <div className={styles.container}>
        {/* Stats row */}
        <div className={styles.statsRow}>
          {[
            { label:'Total Candidates', value: candidates.length, icon:'👥' },
            { label:'Shortlisted', value: shortlisted.length, icon:'⭐' },
            { label:'Skills Found', value: allSkills.length, icon:'🧠' },
          ].map((s, i) => (
            <div key={i} className={styles.statCard}>
              <span className={styles.statIcon}>{s.icon}</span>
              <div>
                <div className={styles.statValue}>{s.value}</div>
                <div className={styles.statLabel}>{s.label}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className={styles.filters}>
          <div className={styles.searchBox}>
            <Search size={16} color="var(--text-muted)" />
            <input className={styles.searchInput} placeholder="Search candidates or skills..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
          <select className="input" style={{ width:'auto', minWidth:'160px' }} value={filterSkill} onChange={e => setFilterSkill(e.target.value)}>
            <option value="">All skills</option>
            {allSkills.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button className={`btn-ghost ${showShortlistedOnly ? styles.filterActive : ''}`} style={{ fontSize:'14px', padding:'10px 16px' }} onClick={() => setShowShortlistedOnly(p => !p)}>
            <Star size={16} /> Shortlisted {showShortlistedOnly && `(${shortlisted.length})`}
          </button>
        </div>

        {/* Candidates grid */}
        {loading ? (
          <div className={styles.loadingGrid}>
            {[1,2,3,4,5,6].map(i => <div key={i} className="skeleton" style={{ height:'200px', borderRadius:'var(--radius-lg)' }} />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className={styles.empty}>
            <Users size={40} color="var(--text-muted)" />
            <p>No candidates found</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filtered.map(c => (
              <div key={c._id} className={styles.candidateCard}>
                <div className={styles.cardTop}>
                  <div className={styles.avatar}>{(c.fullName || 'U').charAt(0).toUpperCase()}</div>
                  <button className={`${styles.starBtn} ${shortlisted.includes(c._id) ? styles.starred : ''}`} onClick={() => toggleShortlist(c._id)}>
                    <Star size={16} />
                  </button>
                </div>
                <div className={styles.cardName}>{c.fullName}</div>
                {c.location && <div className={styles.cardLocation}><MapPin size={12} />{c.location}</div>}
                {c.summary && <p className={styles.cardSummary}>{c.summary.slice(0, 100)}...</p>}
                <div className={styles.cardSkills}>
                  {c.skills?.slice(0, 4).map((s, i) => <span key={i} className="tag" style={{ fontSize:'11px', padding:'2px 8px' }}>{s}</span>)}
                  {c.skills?.length > 4 && <span style={{ fontSize:'11px', color:'var(--text-muted)' }}>+{c.skills.length - 4}</span>}
                </div>
                <div className={styles.cardFooter}>
                  <span className={styles.expCount}>{c.experience?.length || 0} roles</span>
                  <button className="btn-primary" style={{ fontSize:'13px', padding:'8px 14px' }} onClick={() => navigate(`/recruiter/candidate/${c._id}`)}>
                    View <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}