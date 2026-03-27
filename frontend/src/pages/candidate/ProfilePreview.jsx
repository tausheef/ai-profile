import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, MapPin, Phone, Mail, ExternalLink, Edit, Briefcase, Code, GraduationCap, Star, Copy, Check } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';
import styles from './ProfilePreview.module.css';

export default function ProfilePreview() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => { fetchProfile(); }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile');
      setProfile(res.data);
    } catch { toast.error('Failed to load profile'); }
    finally { setLoading(false); }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    toast.success('Link copied!');
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}>
      <span className="spinner" style={{ width:'32px', height:'32px' }} />
    </div>
  );

  if (!profile) return <div style={{ padding:'40px', color:'var(--text-secondary)' }}>Profile not found</div>;

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <div className={styles.logo}><Sparkles size={16} /> TalentForge</div>
        <div style={{ display:'flex', gap:'10px' }}>
          <button className="btn-ghost" style={{ fontSize:'14px', padding:'8px 16px' }} onClick={copyLink}>
            {copied ? <Check size={16} /> : <Copy size={16} />} Share
          </button>
          {user && <button className="btn-primary" style={{ fontSize:'14px', padding:'8px 16px' }} onClick={() => navigate('/build')}>
            <Edit size={16} /> Edit Profile
          </button>}
        </div>
      </div>

      <div className={styles.container}>
        {/* Hero card */}
        <div className={styles.heroCard}>
          <div className={styles.avatar}>{(profile.fullName || 'U').charAt(0).toUpperCase()}</div>
          <div className={styles.heroInfo}>
            <h1 className={styles.name}>{profile.fullName || 'Your Name'}</h1>
            {profile.summary && <p className={styles.summary}>{profile.summary}</p>}
            <div className={styles.metaRow}>
              {profile.location && <span className={styles.meta}><MapPin size={14} />{profile.location}</span>}
              {profile.phone && <span className={styles.meta}><Phone size={14} />{profile.phone}</span>}
              {profile.email && <span className={styles.meta}><Mail size={14} />{profile.email}</span>}
            </div>
          </div>
        </div>

        <div className={styles.grid}>
          {/* Left column */}
          <div className={styles.left}>
            {/* Skills */}
            {profile.skills?.length > 0 && (
              <div className="card">
                <h2 className={styles.sectionTitle}><Star size={18} color="var(--accent)" /> Skills</h2>
                <div className={styles.skillCloud}>
                  {profile.skills.map((s, i) => <span key={i} className="tag">{s}</span>)}
                </div>
              </div>
            )}

            {/* Education */}
            {profile.education?.length > 0 && (
              <div className="card">
                <h2 className={styles.sectionTitle}><GraduationCap size={18} color="var(--accent)" /> Education</h2>
                {profile.education.map((edu, i) => (
                  <div key={i} className={styles.eduItem}>
                    <div className={styles.itemTitle}>{edu.degree}</div>
                    <div className={styles.itemSub}>{edu.institution}</div>
                    <div className={styles.itemMeta}>{edu.year} {edu.grade && `· ${edu.grade}`}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right column */}
          <div className={styles.right}>
            {/* Experience */}
            {profile.experience?.length > 0 && (
              <div className="card">
                <h2 className={styles.sectionTitle}><Briefcase size={18} color="var(--accent)" /> Experience</h2>
                {profile.experience.map((exp, i) => (
                  <div key={i} className={styles.expItem}>
                    <div className={styles.expHeader}>
                      <div>
                        <div className={styles.itemTitle}>{exp.title}</div>
                        <div className={styles.itemSub}>{exp.company} · {exp.duration}</div>
                      </div>
                    </div>
                    {exp.description && <p className={styles.expDesc}>{exp.description}</p>}
                    {exp.highlights?.length > 0 && (
                      <ul className={styles.highlights}>
                        {exp.highlights.map((h, j) => <li key={j}>{h}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Projects */}
            {profile.projects?.length > 0 && (
              <div className="card">
                <h2 className={styles.sectionTitle}><Code size={18} color="var(--accent)" /> Projects</h2>
                {profile.projects.map((proj, i) => (
                  <div key={i} className={styles.projItem}>
                    <div className={styles.projHeader}>
                      <div className={styles.itemTitle}>{proj.name}</div>
                      {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className={styles.projLink}><ExternalLink size={14} /></a>}
                    </div>
                    <p className={styles.itemSub}>{proj.description}</p>
                    {proj.technologies?.length > 0 && (
                      <div className={styles.techRow}>
                        {proj.technologies.map((t, j) => <span key={j} className="tag" style={{ fontSize:'12px', padding:'2px 10px' }}>{t}</span>)}
                      </div>
                    )}
                    {proj.highlights?.length > 0 && (
                      <ul className={styles.highlights}>
                        {proj.highlights.map((h, j) => <li key={j}>{h}</li>)}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}