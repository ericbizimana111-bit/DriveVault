
import { useNavigate } from 'react-router-dom';
import styles from './About.module.css';

const steps = [
  { num: '01', title: 'Pass Your Test', desc: 'Complete your provisional and definitive driving tests at the Rwanda National Police Driving License Testing Centre.' },
  { num: '02', title: 'Get Added by Admin', desc: 'The RNP administrator registers you on Rwanda DriveDoc. Your account is created with your photo and all granted documents.' },
  { num: '03', title: 'Login to Your Portal', desc: 'Use your email and password to log in and view all your driving documents, license details, and expiry countdowns.' },
  { num: '04', title: 'Pay Before Expiry', desc: 'Each document has a unique payment code. Use it to renew before expiry and stay compliant with the law.' },
];

const team = [
  { name: 'Rwanda National Police (RNP)', role: 'Document Authority', icon: '👮' },
  { name: 'Rwanda Transport Development Agency', role: 'Road Safety Oversight', icon: '🛣️' },
  { name: 'Rwanda Revenue Authority', role: 'Payment Processing', icon: '💰' },
];

export default function About() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <section className={styles.header}>
        <div className={styles.container}>
          <div className={styles.badge}>About Rwanda DriveDoc</div>
          <h1>Built for Rwanda's Drivers</h1>
          <p>Rwanda DriveDoc is the official digital document management platform for all licensed drivers in Rwanda. It bridges the gap between drivers and authorities, ensuring every person on the road is documented, verified, and compliant.</p>
        </div>
      </section>

      {/* MISSION */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.missionRow}>
            <div>
              <h2>Our Mission</h2>
              <p>To eliminate the risk of document loss, expired licenses going unnoticed, and fraud on Rwandan roads. By digitising the process, we help both drivers and Rwanda National Police work together smoothly.</p>
              <p>Every driver deserves to know exactly which documents they hold, when they expire, and how to renew them before facing penalties on the road.</p>
            </div>
            <div className={styles.missionStats}>
              <div className={styles.mStat}>
                <span className={styles.mStatNum}>50,000</span>
                <span className={styles.mStatLabel}>RWF — Definitive License Cost</span>
              </div>
              <div className={styles.mStat}>
                <span className={styles.mStatNum}>1 Day</span>
                <span className={styles.mStatLabel}>License Processing Time</span>
              </div>
              <div className={styles.mStat}>
                <span className={styles.mStatNum}>18 yrs</span>
                <span className={styles.mStatLabel}>Minimum Driving Age</span>
              </div>
              <div className={styles.mStat}>
                <span className={styles.mStatNum}>100%</span>
                <span className={styles.mStatLabel}>Score Required to Pass</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <h2>How It Works</h2>
            <p>A simple, secure 4-step journey from the testing centre to your digital document portfolio.</p>
          </div>
          <div className={styles.steps}>
            {steps.map((s, i) => (
              <div className={styles.step} key={i}>
                <div className={styles.stepNum}>{s.num}</div>
                <div className={styles.stepContent}>
                  <h3>{s.title}</h3>
                  <p>{s.desc}</p>
                </div>
                {i < steps.length - 1 && <div className={styles.stepArrow}>→</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* AUTHORITIES */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <h2>Partner Authorities</h2>
            <p>Rwanda DriveDoc works in partnership with Rwanda's official transport and law enforcement bodies.</p>
          </div>
          <div className={styles.teamGrid}>
            {team.map((t, i) => (
              <div className={styles.teamCard} key={i}>
                <div className={styles.teamIcon}>{t.icon}</div>
                <h3>{t.name}</h3>
                <p>{t.role}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT RWANDA */}
      <section className={styles.sectionDark}>
        <div className={styles.container}>
          <div className={styles.rwandaRow}>
            <div>
              <h2 style={{ color: 'white', marginBottom: 16 }}>Driving in Rwanda</h2>
              <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, marginBottom: 16 }}>
                Rwanda is one of Africa's fastest-growing and cleanest countries, with a modern road network connecting Kigali to all provinces. The country drives on the right side of the road and enforces strict road safety laws.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.8, marginBottom: 16 }}>
                Speed cameras are deployed widely across Kigali and on highways. The speed limit is <strong style={{ color: 'var(--accent)' }}>40 km/h</strong> in towns and <strong style={{ color: 'var(--accent)' }}>60–80 km/h</strong> on highways. Tourists from within the EAC region can drive using their home country license for up to 90 days.
              </p>
              <p style={{ color: 'rgba(255,255,255,0.75)', lineHeight: 1.8 }}>
                Rwanda's Vision 2020 and 2050 plans include world-class physical infrastructure as a key development pillar — making road safety and proper licensing central to national progress.
              </p>
            </div>
            <div className={styles.infoBox}>
              <h4>Key Driving Facts</h4>
              <ul>
                <li><span>Side of road</span><strong>Right</strong></li>
                <li><span>Speed in towns</span><strong>40 km/h</strong></li>
                <li><span>Highway speed</span><strong>60–80 km/h</strong></li>
                <li><span>Alcohol limit</span><strong>0.08%</strong></li>
                <li><span>Min driving age</span><strong>18 years</strong></li>
                <li><span>Rental min age</span><strong>23 years</strong></li>
                <li><span>Currency</span><strong>Rwandan Franc (RWF)</strong></li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <h2>Have Questions?</h2>
          <p>Our support team is here to help with account setup, document queries, and payment issues.</p>
          <button className={styles.btn} onClick={() => navigate('/contact')}>Contact Us →</button>
        </div>
      </section>
    </div>
  );
}
