import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sparkles, User, Briefcase, Code, GraduationCap, Plus, Trash2, Wand2, LogOut, Eye, CheckCircle, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../lib/api';
import useAuthStore from '../../store/authStore';
import styles from './ProfileBuilder.module.css';

const STEPS = [
  { id: 'basics', label: 'Basics', icon: User },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'skills', label: 'Skills', icon: Sparkles },
  { id: 'projects', label: 'Projects', icon: Code },
  { id: 'education', label: 'Education', icon: GraduationCap },
];

export default function ProfileBuilder() {
  const { logout } = useAuthStore();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [profile, setProfile] = useState({ fullName:'', phone:'', location:'', summary:'', experience:[], skills:[], projects:[], education:[] });
  const [aiLoading, setAiLoading] = useState({});
  const [rawExperience, setRawExperience] = useState('');
  const [rawProject, setRawProject] = useState('');
  const [saving, setSaving] = useState(false);
  const [completion, setCompletion] = useState(0);
  const [newSkill, setNewSkill] = useState('');
  const autoSaveTimer = useRef(null);
  const isFirstLoad = useRef(true);

  useEffect(() => { fetchProfile(); }, []);

  // Completion score
  useEffect(() => {
    let score = 0;
    if (profile.fullName) score += 20;
    if (profile.summary) score += 15;
    if (profile.experience.length > 0) score += 20;
    if (profile.skills.length >= 3) score += 20;
    if (profile.projects.length > 0) score += 15;
    if (profile.education.length > 0) score += 10;
    setCompletion(score);
  }, [profile]);

  // Auto-save debounced on profile change
  useEffect(() => {
    if (isFirstLoad.current) return;
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(() => {
      if (profile.fullName && !saving) saveProfile(profile);
    }, 2000);
    return () => clearTimeout(autoSaveTimer.current);
  }, [profile]);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/profile');
      if (res.data) {
        setProfile(p => ({ ...p, ...res.data }));
        isFirstLoad.current = false;
      }
    } catch (err) { console.error(err); }
  };

  const saveProfile = async (data) => {
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    const payload = data || profile;
    setSaving(true);
    try { await api.put('/profile', payload); }
    catch (err) { /* silent fail on background saves */ }
    finally { setSaving(false); }
  };

  const handleAIExperience = async () => {
    if (!rawExperience.trim()) { toast.error('Describe your experience first'); return; }
    setAiLoading(p => ({ ...p, experience: true }));
    try {
      const res = await api.post('/ai/structure-experience', { rawText: rawExperience });
      const updated = { ...profile, experience: [...profile.experience, res.data.data] };
      setProfile(updated);
      await saveProfile(updated);
      setRawExperience('');
      toast.success('Experience structured by AI!');
    } catch { toast.error('AI failed, try again'); }
    finally { setAiLoading(p => ({ ...p, experience: false })); }
  };

  const handleAISuggestSkills = async () => {
    setAiLoading(p => ({ ...p, skills: true }));
    try {
      const res = await api.post('/ai/suggest-skills', { experience: profile.experience, projects: profile.projects });
      const suggested = res.data.skills.filter(s => !profile.skills.includes(s));
      const updated = { ...profile, skills: [...new Set([...profile.skills, ...suggested])] };
      setProfile(updated);
      await saveProfile(updated);
      toast.success(`Added ${suggested.length} AI-suggested skills!`);
    } catch { toast.error('AI failed, try again'); }
    finally { setAiLoading(p => ({ ...p, skills: false })); }
  };

  const handleAIGenerateSummary = async () => {
    setAiLoading(p => ({ ...p, summary: true }));
    try {
      const res = await api.post('/ai/generate-summary', {});
      const updated = { ...profile, summary: res.data.summary };
      setProfile(updated);
      await saveProfile(updated);
      toast.success('Summary generated!');
    } catch { toast.error('AI failed, try again'); }
    finally { setAiLoading(p => ({ ...p, summary: false })); }
  };

  const handleAIProject = async () => {
    if (!rawProject.trim()) { toast.error('Describe your project first'); return; }
    setAiLoading(p => ({ ...p, project: true }));
    try {
      const res = await api.post('/ai/structure-project', { rawText: rawProject });
      const updated = { ...profile, projects: [...profile.projects, res.data.data] };
      setProfile(updated);
      await saveProfile(updated);
      setRawProject('');
      toast.success('Project structured by AI!');
    } catch { toast.error('AI failed, try again'); }
    finally { setAiLoading(p => ({ ...p, project: false })); }
  };

  const addSkillManually = (skill) => {
    if (skill && !profile.skills.includes(skill)) {
      setProfile(p => ({ ...p, skills: [...p.skills, skill] }));
      setNewSkill('');
    }
  };

  const removeSkill = (skill) => setProfile(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }));
  const removeExperience = (i) => setProfile(p => ({ ...p, experience: p.experience.filter((_, idx) => idx !== i) }));
  const removeProject = (i) => setProfile(p => ({ ...p, projects: p.projects.filter((_, idx) => idx !== i) }));
  const addEducation = () => setProfile(p => ({ ...p, education: [...p.education, { degree:'', institution:'', year:'', grade:'' }] }));
  const updateEducation = (i, field, value) => setProfile(p => ({ ...p, education: p.education.map((e, idx) => idx === i ? { ...e, [field]: value } : e) }));
  const removeEducation = (i) => setProfile(p => ({ ...p, education: p.education.filter((_, idx) => idx !== i) }));

  const handleNext = async () => {
    await saveProfile(profile);
    if (step < STEPS.length - 1) setStep(s => s + 1);
  };

  const handleFinish = async () => {
    await saveProfile(profile);
    toast.success('Profile saved!');
    navigate('/my-profile');
  };

  const currentStep = STEPS[step];

  return (
    <div className={styles.page}>
      <aside className={styles.sidebar}>
        <div className={styles.sidebarLogo}><Sparkles size={18} /> TalentForge</div>
        <div className={styles.progressSection}>
          <div className={styles.progressRing}>
            <svg viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="var(--border)" strokeWidth="6" />
              <circle cx="40" cy="40" r="34" fill="none" stroke="var(--accent)" strokeWidth="6"
                strokeDasharray={`${2 * Math.PI * 34}`}
                strokeDashoffset={`${2 * Math.PI * 34 * (1 - completion / 100)}`}
                strokeLinecap="round" transform="rotate(-90 40 40)"
                style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
            </svg>
            <span className={styles.progressNum}>{completion}%</span>
          </div>
          <p className={styles.progressLabel}>Profile complete</p>
        </div>
        <nav className={styles.steps}>
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            return (
              <button key={s.id} className={`${styles.stepBtn} ${i === step ? styles.stepActive : ''} ${i < step ? styles.stepDone : ''}`} onClick={() => setStep(i)}>
                <span className={styles.stepIcon}>{i < step ? <CheckCircle size={16} /> : <Icon size={16} />}</span>
                {s.label}
                {i === step && <ChevronRight size={14} style={{ marginLeft: 'auto' }} />}
              </button>
            );
          })}
        </nav>
        <div className={styles.sidebarFooter}>
          <button className="btn-ghost" style={{ width:'100%', justifyContent:'center', fontSize:'14px', padding:'10px' }} onClick={() => { logout(); navigate('/'); }}>
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.stepTitle}>{currentStep.label}</h1>
            <p className={styles.stepSub}>Step {step + 1} of {STEPS.length}</p>
          </div>
          <div style={{ display:'flex', gap:'10px', alignItems:'center' }}>
            {saving && <span style={{ color:'var(--text-muted)', fontSize:'13px' }}>Saving...</span>}
            <button className="btn-ghost" style={{ fontSize:'14px', padding:'10px 16px' }} onClick={() => navigate('/my-profile')}>
              <Eye size={16} /> Preview
            </button>
            <button className={`btn-ghost ${styles.mobileLogout}`} style={{ fontSize:'14px', padding:'10px 16px' }} onClick={() => { logout(); navigate('/'); }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>

        <div className={styles.content}>
          {step === 0 && (
            <div className={styles.stepContent}>
              <div className={styles.formGrid}>
                <div className={styles.formFull}>
                  <label className="label">Full Name</label>
                  <input className="input" placeholder="Your full name" value={profile.fullName} onChange={e => setProfile(p => ({ ...p, fullName: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Phone</label>
                  <input className="input" placeholder="+91 98765 43210" value={profile.phone || ''} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} />
                </div>
                <div>
                  <label className="label">Location</label>
                  <input className="input" placeholder="Delhi, India" value={profile.location || ''} onChange={e => setProfile(p => ({ ...p, location: e.target.value }))} />
                </div>
              </div>
              <div className={styles.aiCard}>
                <div className={styles.aiCardHeader}><Wand2 size={16} color="var(--accent)" /><span>AI-Generated Summary</span></div>
                <textarea className="input" placeholder="Your professional summary will appear here..." value={profile.summary || ''} onChange={e => setProfile(p => ({ ...p, summary: e.target.value }))} style={{ minHeight:'120px' }} />
                <button className={styles.aiBtn} onClick={handleAIGenerateSummary} disabled={aiLoading.summary}>
                  {aiLoading.summary ? <><span className="spinner" /> Generating...</> : <><Wand2 size={14} /> Generate with AI</>}
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className={styles.stepContent}>
              <div className={styles.aiCard}>
                <div className={styles.aiCardHeader}><Wand2 size={16} color="var(--accent)" /><span>Describe your experience in plain English</span></div>
                <textarea className="input" placeholder="e.g. I worked at Google for 2 years as a software engineer, built React dashboards and Node.js APIs, reduced load time by 40%..." value={rawExperience} onChange={e => setRawExperience(e.target.value)} style={{ minHeight:'120px' }} />
                <button className={styles.aiBtn} onClick={handleAIExperience} disabled={aiLoading.experience}>
                  {aiLoading.experience ? <><span className="spinner" /> AI is structuring...</> : <><Wand2 size={14} /> Structure with AI</>}
                </button>
              </div>
              <div className={styles.itemList}>
                {profile.experience.map((exp, i) => (
                  <div key={i} className={styles.itemCard}>
                    <div className={styles.itemCardHeader}>
                      <div>
                        <div className={styles.itemTitle}>{exp.title || 'Untitled Role'}</div>
                        <div className={styles.itemSub}>{exp.company} · {exp.duration}</div>
                      </div>
                      <button className={styles.deleteBtn} onClick={() => removeExperience(i)}><Trash2 size={14} /></button>
                    </div>
                    {exp.highlights?.length > 0 && <ul className={styles.highlights}>{exp.highlights.map((h, j) => <li key={j}>{h}</li>)}</ul>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className={styles.stepContent}>
              <div className={styles.aiCard}>
                <div className={styles.aiCardHeader}><Wand2 size={16} color="var(--accent)" /><span>Let AI suggest skills based on your profile</span></div>
                <p style={{ color:'var(--text-secondary)', fontSize:'14px', marginBottom:'12px' }}>AI will analyze your experience and projects to suggest relevant skills.</p>
                <button className={styles.aiBtn} onClick={handleAISuggestSkills} disabled={aiLoading.skills}>
                  {aiLoading.skills ? <><span className="spinner" /> Analyzing...</> : <><Wand2 size={14} /> Suggest skills with AI</>}
                </button>
              </div>
              <div className={styles.skillInputRow}>
                <input className="input" placeholder="Add a skill manually and press Enter..." value={newSkill}
                  onChange={e => setNewSkill(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') addSkillManually(newSkill.trim()); }} />
                <button className="btn-ghost" style={{ whiteSpace:'nowrap', padding:'12px 16px' }} onClick={() => addSkillManually(newSkill.trim())}>
                  <Plus size={16} /> Add
                </button>
              </div>
              <div className={styles.skillCloud}>
                {profile.skills.map((skill, i) => (
                  <div key={i} className={styles.skillTag}>{skill}<button onClick={() => removeSkill(skill)} className={styles.skillRemove}>×</button></div>
                ))}
                {profile.skills.length === 0 && <p style={{ color:'var(--text-muted)', fontSize:'14px' }}>No skills yet — use AI or add manually</p>}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className={styles.stepContent}>
              <div className={styles.aiCard}>
                <div className={styles.aiCardHeader}><Wand2 size={16} color="var(--accent)" /><span>Describe a project in plain English</span></div>
                <textarea className="input" placeholder="e.g. I built an e-commerce platform using React and Node.js with Stripe payments, real-time inventory tracking..." value={rawProject} onChange={e => setRawProject(e.target.value)} style={{ minHeight:'120px' }} />
                <button className={styles.aiBtn} onClick={handleAIProject} disabled={aiLoading.project}>
                  {aiLoading.project ? <><span className="spinner" /> AI is structuring...</> : <><Wand2 size={14} /> Structure with AI</>}
                </button>
              </div>
              <div className={styles.itemList}>
                {profile.projects.map((proj, i) => (
                  <div key={i} className={styles.itemCard}>
                    <div className={styles.itemCardHeader}>
                      <div>
                        <div className={styles.itemTitle}>{proj.name}</div>
                        <div className={styles.itemSub}>{proj.description}</div>
                      </div>
                      <button className={styles.deleteBtn} onClick={() => removeProject(i)}><Trash2 size={14} /></button>
                    </div>
                    {proj.technologies && <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', marginTop:'10px' }}>{proj.technologies.map((t, j) => <span key={j} className="tag" style={{ fontSize:'12px', padding:'2px 10px' }}>{t}</span>)}</div>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className={styles.stepContent}>
              {profile.education.map((edu, i) => (
                <div key={i} className={styles.itemCard} style={{ marginBottom:'16px' }}>
                  <div style={{ display:'flex', justifyContent:'space-between', marginBottom:'12px' }}>
                    <span style={{ fontFamily:'var(--font-display)', fontWeight:600 }}>Education #{i + 1}</span>
                    <button className={styles.deleteBtn} onClick={() => removeEducation(i)}><Trash2 size={14} /></button>
                  </div>
                  <div className={styles.formGrid}>
                    <div className={styles.formFull}>
                      <label className="label">Degree</label>
                      <input className="input" placeholder="B.Tech Computer Science" value={edu.degree} onChange={e => updateEducation(i, 'degree', e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Institution</label>
                      <input className="input" placeholder="Delhi University" value={edu.institution} onChange={e => updateEducation(i, 'institution', e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Year</label>
                      <input className="input" placeholder="2021" value={edu.year} onChange={e => updateEducation(i, 'year', e.target.value)} />
                    </div>
                    <div>
                      <label className="label">Grade / CGPA</label>
                      <input className="input" placeholder="8.5 CGPA" value={edu.grade} onChange={e => updateEducation(i, 'grade', e.target.value)} />
                    </div>
                  </div>
                </div>
              ))}
              <button className="btn-ghost" onClick={addEducation}><Plus size={16} /> Add Education</button>
            </div>
          )}
        </div>

        <div className={styles.navButtons}>
          {step > 0 && <button className="btn-ghost" onClick={() => setStep(s => s - 1)}>Back</button>}
          {step < STEPS.length - 1
            ? <button className="btn-primary" onClick={handleNext} disabled={saving}>{saving ? <span className="spinner" /> : 'Save & Continue'}<ChevronRight size={16} /></button>
            : <button className="btn-primary" onClick={handleFinish} disabled={saving} style={{ background:'linear-gradient(135deg, var(--accent), var(--accent2))' }}>{saving ? <span className="spinner" /> : <><CheckCircle size={16} /> Finish & Preview</>}</button>
          }
        </div>
      </main>
    </div>
  );
}