
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css';

const features = [
  { icon: '📄', title: 'Digital Documents', desc: 'All your driving documents stored securely online, accessible anywhere, anytime.' },
  { icon: '⏰', title: 'Expiry Alerts', desc: 'Never miss a renewal. Get clear countdowns for every document before it expires.' },
  { icon: '💳', title: 'Easy Payments', desc: 'Unique payment codes for each document renewal. Pay quickly without confusion.' },
  { icon: '🛡️', title: 'Police Verified', desc: 'Documents are verified and added by Rwanda National Police administrators only.' },
  { icon: '📸', title: 'Photo Confirmation', desc: 'Each document includes your photo for identity confirmation and fraud prevention.' },
  { icon: '🔒', title: 'Secure Access', desc: 'Only you can view your portfolio. Accounts created by admin, no self-registration.' },
];

const docTypes = [
  { code: 'A / A1', label: 'Motorcycle & 3-Wheeler', desc: 'Motorcycles, 3-wheelers up to 350kg' },
  { code: 'B', label: 'Standard Passenger Vehicle', desc: 'Up to 8 seats, max 3,500kg — most common license' },
  { code: 'B1', label: 'Passenger Bus', desc: 'Passenger vehicles with 8+ seats, up to 5,000kg' },
  { code: 'B2', label: 'Light Goods Vehicle', desc: 'Goods-carrying vehicles up to 3,500kg' },
  { code: 'C', label: 'Heavy Goods Vehicle', desc: 'Medium to large trucks and lorries' },
  { code: 'D', label: 'Large Bus / Coach', desc: 'Large passenger transport vehicles' },
];

const rules = [
  '🚦 Speed limit: 40 km/h in towns, 60–80 km/h on highways',
  '🍺 Legal blood alcohol limit: 0.08%',
  '📱 No mobile phone use without hands-free device',
  '🚗 Drive on the right side of the road',
  '🪑 Seatbelts mandatory for all passengers',
  '🚷 No overtaking on the left side',
  '👟 Yield to pedestrians at crossings',
  '📋 Always carry all valid vehicle documents',
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
      {/* HERO */}
      <section className={styles.hero}>
        <div className={styles.heroOverlay} />
        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>🇷🇼 Official Rwanda Transport Portal</div>
          <h1 className={styles.heroTitle}>
            Your Driving Documents,<br />
            <span className={styles.heroAccent}>Always with You</span>
          </h1>
          <p className={styles.heroSub}>
            Rwanda DriveDoc is the official digital platform for managing driving licenses and vehicle documents in Rwanda. Issued by Rwanda National Police, verified, and always up to date.
          </p>
          <div className={styles.heroBtns}>
            <button className={styles.btnPrimary} onClick={() => navigate('/login')}>
              Access My Documents →
            </button>
            <button className={styles.btnSecondary} onClick={() => navigate('/about')}>
              Learn More
            </button>
          </div>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.stat}><span className={styles.statNum}>50,000</span><span className={styles.statLabel}>RWF License Fee</span></div>
          <div className={styles.statDiv} />
          <div className={styles.stat}><span className={styles.statNum}>18+</span><span className={styles.statLabel}>Minimum Driving Age</span></div>
          <div className={styles.statDiv} />
          <div className={styles.stat}><span className={styles.statNum}>1 Day</span><span className={styles.statLabel}>Processing Time</span></div>
        </div>
      </section>

      {/* FEATURES */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <h2>Why Use Rwanda DriveDoc?</h2>
            <p>Designed to make driving compliance easy for every Rwandan on the road.</p>
          </div>
          <div className={styles.featuresGrid}>
            {features.map((f, i) => (
              <div className={styles.featureCard} key={i}>
                <div className={styles.featureIcon}>{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* LICENSE CATEGORIES */}
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <h2>License Categories in Rwanda</h2>
            <p>Rwanda uses a letter-code system to define which vehicles you are authorised to drive.</p>
          </div>
          <div className={styles.codeGrid}>
            {docTypes.map((d, i) => (
              <div className={styles.codeCard} key={i}>
                <div className={styles.codeTag}>{d.code}</div>
                <h4>{d.label}</h4>
                <p>{d.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* REQUIRED DOCUMENTS */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.docsRow}>
            <div className={styles.docsText}>
              <h2>Documents Required to Drive in Rwanda</h2>
              <p>Every driver on Rwandan roads must carry the following documents at all times. Rwanda DriveDoc keeps them all in one place.</p>
              <ul className={styles.docList}>
                <li>✅ Valid Rwandan Driving License</li>
                <li>✅ National ID (Rwandans) / Passport (Foreigners)</li>
                <li>✅ Vehicle Registration (Carte Jaune)</li>
                <li>✅ Valid Third-Party Vehicle Insurance</li>
                <li>✅ Motor Vehicle Inspection Certificate</li>
                <li>✅ International Driving Permit (if foreign license)</li>
                <li>✅ Rental Agreement (if using a hired vehicle)</li>
              </ul>
              <button className={styles.btnPrimary} onClick={() => navigate('/login')}>
                View My Documents
              </button>
            </div>
            <div className={styles.docsVisual}>
              <div className={styles.docCard}>
                <div className={styles.docCardHeader}>
                  <span>🪪</span>
                  <span>Driving License</span>
                </div>
                <div className={styles.docCardBody}>
                  <div className={styles.docRow}><span>Category</span><strong>B</strong></div>
                  <div className={styles.docRow}><span>Valid Until</span><strong>Dec 2026</strong></div>
                  <div className={styles.docRow}><span>Status</span><span className={styles.badge}>Active ✓</span></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ROAD RULES */}
      <section className={styles.sectionDark}>
        <div className={styles.container}>
          <div className={styles.sectionHead} style={{ color: 'white' }}>
            <h2 style={{ color: 'white' }}>Key Road Safety Rules</h2>
            <p style={{ color: 'rgba(255,255,255,0.7)' }}>Violating these rules can result in fines, detention, or license suspension.</p>
          </div>
          <div className={styles.rulesGrid}>
            {rules.map((r, i) => (
              <div className={styles.ruleItem} key={i}>{r}</div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={styles.cta}>
        <div className={styles.container}>
          <h2>Ready to manage your driving documents?</h2>
          <p>Your administrator will create your account after your license is issued. Then simply log in and view everything in one place.</p>
          <div className={styles.heroBtns}>
            <button className={styles.btnPrimary} onClick={() => navigate('/login')}>Login to Portal</button>
            <button className={styles.btnSecondary} onClick={() => navigate('/contact')}>Contact Support</button>
          </div>
        </div>
      </section>
    </div>
  );
}
