import { Link } from 'react-router-dom';
import { Sparkles, Zap, Users, ArrowRight, CheckCircle } from 'lucide-react';
import styles from './LandingPage.module.css';

export default function LandingPage() {
  return (
    <div className={styles.page}>
      {/* Nav */}
      <nav className={styles.nav}>
        <div className={styles.logo}>
          <Sparkles size={20} />
          TalentForge
        </div>
        <div className={styles.navLinks}>
          <Link to="/login" className="btn-ghost" style={{ padding: '8px 20px', fontSize: '14px' }}>Sign in</Link>
          <Link to="/register" className="btn-primary" style={{ padding: '8px 20px', fontSize: '14px' }}>Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section className={styles.hero}>
        <div className={styles.heroBadge}>
          <Zap size={14} />
          AI-Powered Recruitment
        </div>
        <h1 className={styles.heroTitle}>
          Your career story,<br />
          <span className={styles.gradient}>told by AI</span>
        </h1>
        <p className={styles.heroSub}>
          Stop wrestling with resume formats. Just talk — our AI structures your experience, 
          suggests skills, and builds a stunning profile that gets you hired.
        </p>
        <div className={styles.heroCtas}>
          <Link to="/register" className="btn-primary" style={{ fontSize: '16px', padding: '14px 32px' }}>
            Build your profile free
            <ArrowRight size={18} />
          </Link>
          <Link to="/login" className="btn-ghost" style={{ fontSize: '16px', padding: '14px 32px' }}>
            I'm a recruiter
          </Link>
        </div>

        {/* Feature pills */}
        <div className={styles.pills}>
          {['No resume upload', 'AI structures your experience', 'Instant skill suggestions', 'Shareable profile link'].map(f => (
            <div key={f} className={styles.pill}>
              <CheckCircle size={14} color="var(--accent3)" />
              {f}
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className={styles.features}>
        <div className="container">
          <h2 className={styles.sectionTitle}>How it works</h2>
          <div className={styles.featureGrid}>
            {[
              { icon: '💬', title: 'Just talk', desc: 'Tell the AI about your experience in plain English. No formatting, no templates.' },
              { icon: '🧠', title: 'AI structures it', desc: 'Groq AI extracts your role, company, achievements and organizes them perfectly.' },
              { icon: '✨', title: 'Skills suggested', desc: 'Based on your experience, AI suggests relevant skills you might have missed.' },
              { icon: '📄', title: 'Profile ready', desc: 'Get a shareable link and exportable PDF resume in seconds.' },
            ].map((f, i) => (
              <div key={i} className={styles.featureCard} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.ctaSection}>
        <div className={styles.ctaCard}>
          <Users size={32} color="var(--accent)" />
          <h2>Ready to stand out?</h2>
          <p>Join candidates who let AI tell their story</p>
          <Link to="/register" className="btn-primary" style={{ marginTop: '8px' }}>
            Start building now <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </div>
  );
}