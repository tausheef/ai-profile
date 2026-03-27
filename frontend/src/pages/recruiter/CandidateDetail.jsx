import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, MapPin, Phone, Mail, Star, Briefcase, Code, GraduationCap, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import styles from './CandidateDetail.module.css';

export default function CandidateDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [candidate, setCandidate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [shortlisted, setShortlisted] = useState(() => JSON.parse(localStorage.getItem('shortlisted') || '[]'));

  useEffect(() => { fetchCandidate(); }, [id]);

  const fetchCandidate = async () => {
    try {
      const res = await api.get(`/candidate/${id}`);
      setCandidate(res.data);
    } catch { toast.error('Failed to load candidate'); }
    finally { setLoading(false); }
  };

  const toggleShortlist = () => {
    setShortlisted(prev => {
      const next = prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id];
      localStorage.setItem('shortlisted', JSON.stringify(next));
      toast.success(next.includes(id) ? 'Added to shortlist' : 'Removed from shortlist');
      return next;
    });
  };

  const isShortlisted = shortlisted.includes(id);

  if (loading) return <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'var(--bg)' }}><span className="spinner" style={{ width:'32px', height:'32px' }} /></div>;
  if (!candidate) return <div style={{ padding:'40px', color:'var(--text-secondary)' }}>Candidate not found</div>;

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <button className="btn-ghost" style={{ fontSize:'14px', padding:'8px 14px' }} onClick={() => navigate('/recruiter')}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
        <button className={`btn-primary ${isShortlisted ? styles.shortlisted : ''}`} onClick={toggleShortlist}
          style={{ background: isShortlisted ? '#f0c040' : undefined, color: isShortlisted ? '#000' : undefined }}>
          <Star size={16} /> {isShortlisted ? 'Shortlisted' : 'Shortlist'}
        </button>
      </div>

      <div className={styles.container}>
        <div className={styles.heroCard}>
          <div className={styles.avatar}>{(candidate.fullName || 'U').charAt(0).toUpperCase()}</div>
          <div className={styles.heroInfo}>
            <h1 className={styles.name}>{candidate.fullName}</h1>
            {candidate.summary && <p className={styles.summary}>{candidate.summary}</p>}
            <div className={styles.metaRow}>
              {candidate.location && <span className={styles.meta}><MapPin size={14} />{candidate.location}</span>}
              {candidate.phone && <span className={styles.meta}><Phone size={14} />{candidate.phone}</span>}
              {candidate.email && <span className={styles.meta}><Mail size={14} />{candidate.email}</span>}
            </div>
          </div>
        </div>

        {/* Skills */}
        {candidate.skills?.length > 0 && (
          <div className="card">
            <h2 className={styles.sectionTitle}><Star size={18} color="var(--accent)" /> Skills ({candidate.skills.length})</h2>
            <div className={styles.skillCloud}>
              {candidate.skills.map((s, i) => <span key={i} className="tag">{s}</span>)}
            </div>
          </div>
        )}

        {/* Experience */}
        {candidate.experience?.length > 0 && (
          <div className="card">
            <h2 className={styles.sectionTitle}><Briefcase size={18} color="var(--accent)" /> Experience</h2>
            {candidate.experience.map((exp, i) => (
              <div key={i} className={styles.expItem}>
                <div className={styles.itemTitle}>{exp.title}</div>
                <div className={styles.itemSub}>{exp.company} · {exp.duration}</div>
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
        {candidate.projects?.length > 0 && (
          <div className="card">
            <h2 className={styles.sectionTitle}><Code size={18} color="var(--accent)" /> Projects</h2>
            {candidate.projects.map((proj, i) => (
              <div key={i} className={styles.expItem}>
                <div className={styles.projHeader}>
                  <div className={styles.itemTitle}>{proj.name}</div>
                  {proj.link && <a href={proj.link} target="_blank" rel="noreferrer" className={styles.projLink}><ExternalLink size={14} /></a>}
                </div>
                <p className={styles.itemSub}>{proj.description}</p>
                {proj.technologies?.length > 0 && (
                  <div className={styles.techRow}>{proj.technologies.map((t, j) => <span key={j} className="tag" style={{ fontSize:'12px', padding:'2px 10px' }}>{t}</span>)}</div>
                )}
                {proj.highlights?.length > 0 && (
                  <ul className={styles.highlights}>{proj.highlights.map((h, j) => <li key={j}>{h}</li>)}</ul>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {candidate.education?.length > 0 && (
          <div className="card">
            <h2 className={styles.sectionTitle}><GraduationCap size={18} color="var(--accent)" /> Education</h2>
            {candidate.education.map((edu, i) => (
              <div key={i} className={styles.expItem}>
                <div className={styles.itemTitle}>{edu.degree}</div>
                <div className={styles.itemSub}>{edu.institution}</div>
                <div className={styles.itemMeta}>{edu.year} {edu.grade && `· ${edu.grade}`}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}