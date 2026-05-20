import { useNavigate } from 'react-router-dom';
import { useEffect, useRef, useState } from 'react';
import styles from './Home.module.css';

const heroSlides = [
  {
    url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1600&q=90',
    title: 'Drive Rwanda Forward',
    sub: 'Your official digital driving document hub — powered by Rwanda National Police.',
  },
  {
    url: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1600&q=90',
    title: 'Every Road, Every Journey',
    sub: 'Stay compliant on every kilometre of Rwanda\'s growing road network.',
  },
  {
    url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=1600&q=90',
    title: 'Documents. Digitalised.',
    sub: 'From Kigali to Musanze — access your verified documents anywhere, anytime.',
  },
  {
    url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=1600&q=90',
    title: 'Safety Is a National Priority',
    sub: 'Issued by Rwanda National Police. Trusted by every driver on the road.',
  },
];

const features = [
  {

    title: 'Digital Documents',
    desc: 'All your driving documents stored securely online, accessible anywhere, anytime.',
    img: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=600&q=80',
  },
  {
    icon: '',
    title: 'Expiry Alerts',
    desc: 'Never miss a renewal. Get clear countdowns for every document before it expires.',
    img: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600&q=80',
  },
  {
    icon: '',
    title: 'Easy Payments',
    desc: 'Unique payment codes for each document renewal. Pay quickly without confusion.',
    img: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=600&q=80',
  },
  {
    icon: '',
    title: 'Police Verified',
    desc: 'Documents are verified and added by Rwanda National Police administrators only.',
    img: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&q=80',
  },
  {
    icon: '',
    title: 'Photo Confirmation',
    desc: 'Each document includes your photo for identity confirmation and fraud prevention.',
    img: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80',
  },
  {
    icon: '',
    title: 'Secure Access',
    desc: 'Only you can view your portfolio. Accounts created by admin, no self-registration.',
    img: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&q=80',
  },
];

const docTypes = [
  { code: 'A / A1', label: 'Motorcycle & 3-Wheeler', desc: 'Motorcycles, 3-wheelers up to 350kg , for the motocyclists', img: 'https://images.unsplash.com/photo-1609630875171-b1321377ee65?w=500&q=80' },
  { code: 'B', label: 'Standard Passenger Vehicle', desc: 'Up to 8 seats, max 3,500kg — most common', img: 'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=500&q=80' },
  { code: 'B1', label: 'Passenger Bus', desc: 'Passenger vehicles with 8+ seats, up to 5,000kg', img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&q=80' },
  { code: 'B2', label: 'Light Goods Vehicle', desc: 'Goods-carrying vehicles up to 3,500kg', img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&q=80' },
  { code: 'C', label: 'Heavy Goods Vehicle', desc: 'Medium to large trucks and lorries', img: 'https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?w=500&q=80' },
  { code: 'D', label: 'Large Bus / Coach', desc: 'Large passenger transport vehicles', img: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=500&q=80' },
];

const rules = [
  { icon: '', text: 'Speed limit: 40 km/h in towns' },
  { icon: '', text: 'Legal blood alcohol limit: 0.08%' },
  { icon: '', text: 'No mobile phone use while driving' },
  { icon: '', text: 'Drive on the right side of the road' },
  { icon: '', text: 'passengers should wear seatbelts' },
  { icon: '', text: 'No overtaking on the left side' },
  { icon: '', text: 'Yield to pedestrians at crossings' },
  { icon: '', text: 'Carry all valid vehicle documents' },
];

const stats = [
  { num: '50K', label: 'RWF License Fee', sub: 'Standard application' },
  { num: '18+', label: 'Minimum Age', sub: 'Category B license' },
  { num: '1 Day', label: 'Processing Time', sub: 'Verified instantly' },
  { num: '100%', label: 'Digital & Secure', sub: 'Police-issued docs' },
];

function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll('[data-reveal]');
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add(styles.revealed);
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function RainReveal({ children, delay = 0, className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setVisible(true); obs.disconnect(); }
    }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={`${styles.rainDrop} ${visible ? styles.rainLanded : ''} ${className}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const [slideIndex, setSlideIndex] = useState(0);
  const [slideDir, setSlideDir] = useState('next');
  const timerRef = useRef(null);
  useScrollReveal();

  const goTo = (idx, dir = 'next') => {
    setSlideDir(dir);
    setSlideIndex((idx + heroSlides.length) % heroSlides.length);
  };

  useEffect(() => {
    timerRef.current = setInterval(() => goTo(slideIndex + 1, 'next'), 5500);
    return () => clearInterval(timerRef.current);
  }, [slideIndex]);

  return (
    <div className={styles.page}>

      {/* ═══ HERO ═══ */}
      <section className={styles.hero}>
        {heroSlides.map((s, i) => (
          <div
            key={i}
            className={`
                      ${styles.slide}
                      ${i === slideIndex ? styles.slideActive : ''}
                      ${slideDir === 'next' ? styles.slideNext : styles.slidePrev}
`}
          >
            <img src={s.url} alt="" className={styles.slideBg} />
            <div className={styles.slideGradient} />
          </div>
        ))}

        {/* Rwanda flag stripe accent */}
        <div className={styles.flagStripes}>
          <span className={styles.stripeBlue} />
          <span className={styles.stripeYellow} />
          <span className={styles.stripeGreen} />
        </div>

        <div className={styles.heroContent}>
          <div className={styles.heroBadge}>
            <span className={styles.badgeDot} />
            🇷🇼 Official Rwanda Transport Portal
          </div>
          <h1 className={styles.heroTitle}>
            {heroSlides[slideIndex].title}
          </h1>
          <p className={styles.heroSub}>{heroSlides[slideIndex].sub}</p>
          <div className={styles.heroBtns}>
            <button className={styles.btnPrimary} onClick={() => navigate('/login')}>
              Access My Documents
              <span className={styles.btnArrow}>→</span>
            </button>
            <button className={styles.btnGhost} onClick={() => navigate('/about')}>
              Learn More
            </button>
          </div>
        </div>

        {/* Slide controls */}
        <div className={styles.slideControls}>
          <button className={styles.slideArrow} onClick={() => goTo(slideIndex - 1, 'prev')}>‹</button>
          <div className={styles.slideDots}>
            {heroSlides.map((_, i) => (
              <button
                key={i}
                className={`${styles.dot} ${i === slideIndex ? styles.dotActive : ''}`}
                onClick={() => goTo(i)}
              />
            ))}
          </div>
          <button className={styles.slideArrow} onClick={() => goTo(slideIndex + 1, 'next')}>›</button>
        </div>

        {/* Stats bar */}
        <div className={styles.heroStats}>
          {stats.map((s, i) => (
            <div key={i} className={styles.statItem}>
              <span className={styles.statNum}>{s.num}</span>
              <span className={styles.statLabel}>{s.label}</span>
              <span className={styles.statSub}>{s.sub}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══ WHY DRIVEDOC ═══ */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead} data-reveal>
            <span className={styles.eyebrow}>Why DriveDoc?</span>
            <h2 className={styles.sectionTitle}>Rwanda's Smartest<br />Document Platform</h2>
            <p className={styles.sectionDesc}>Designed to make driving compliance effortless for every Rwandan on the road.</p>
          </div>

          <div className={styles.featuresGrid}>
            {features.map((f, i) => (
              <RainReveal key={i} delay={i * 90}>
                <div className={styles.featureCard}>
                  <div className={styles.featureImgWrap}>
                    <img src={f.img} alt={f.title} className={styles.featureImg} />
                    <div className={styles.featureImgOverlay} />

                  </div>
                  <div className={styles.featureBody}>
                    <h3 className={styles.featureTitle}>{f.title}</h3>
                    <p className={styles.featureDesc}>{f.desc}</p>
                  </div>
                </div>
              </RainReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ LICENSE CATEGORIES ═══ */}
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.sectionHead} data-reveal>
            <span className={styles.eyebrow}>License System</span>
            <h2 className={styles.sectionTitle}>What Can You Drive?</h2>
            <p className={styles.sectionDesc}>Rwanda uses a letter-code system to define which vehicles you are authorised to operate.</p>
          </div>

          <div className={styles.codeGrid}>
            {docTypes.map((d, i) => (
              <RainReveal key={i} delay={i * 80}>
                <div className={styles.codeCard}>
                  <div className={styles.codeImgWrap}>
                    <img src={d.img} alt={d.label} className={styles.codeImg} />
                    <div className={styles.codeImgGrad} />
                    <div className={styles.codeTagWrap}>
                      <span className={styles.codeTag}>{d.code}</span>
                    </div>
                  </div>
                  <div className={styles.codeBody}>
                    <h4 className={styles.codeLabel}>{d.label}</h4>
                    <p className={styles.codeDesc}>{d.desc}</p>
                  </div>
                </div>
              </RainReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ REQUIRED DOCUMENTS ═══ */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.docsRow}>
            <div className={styles.docsText} data-reveal>
              <span className={styles.eyebrow}>What You Need</span>
              <h2 className={styles.sectionTitle}>Documents Required<br />to Drive in Rwanda</h2>
              <p className={styles.sectionDesc}>Every driver on Rwandan roads must carry the following documents at all times. Rwanda DriveDoc keeps them all in one secure place.</p>
              <ul className={styles.docList}>
                {[
                  'Valid Rwandan Driving License',
                  'National ID (Rwandans) / Passport (Foreigners)',
                  'Vehicle Registration (Carte Jaune)',
                  'Valid Third-Party Vehicle Insurance',
                  'Motor Vehicle Inspection Certificate',
                  'International Driving Permit (if foreign license)',
                  'Rental Agreement (if using a hired vehicle)',
                ].map((item, i) => (
                  <li key={i} className={styles.docListItem}>
                    <span className={styles.docCheck}>✓</span>
                    {item}
                  </li>
                ))}
              </ul>
              <button className={styles.btnPrimary} onClick={() => navigate('/login')}>
                View My Documents <span className={styles.btnArrow}>→</span>
              </button>
            </div>

            <div className={styles.docsVisual}>
              {/* Floating document card stack */}
              <div className={styles.cardStack}>
                <div className={`${styles.docCard} ${styles.docCardBack2}`}>
                  <div className={styles.docCardInner}>
                    <span className={styles.docIcon}>🚗</span>
                    <span>Insurance Certificate</span>
                  </div>
                </div>
                <div className={`${styles.docCard} ${styles.docCardBack1}`}>
                  <div className={styles.docCardInner}>
                    <span className={styles.docIcon}>📋</span>
                    <span>Vehicle Registration</span>
                  </div>
                </div>
                <div className={`${styles.docCard} ${styles.docCardFront}`}>
                  <div className={styles.docCardHeader}>
                    <span className={styles.docCardFlag}>🇷🇼</span>
                    <div>
                      <p className={styles.docCardIssuer}>Rwanda National Police</p>
                      <p className={styles.docCardType}>Official Driving License</p>
                    </div>
                  </div>
                  <div className={styles.docCardDivider} />
                  <div className={styles.docCardRows}>
                    <div className={styles.docRow}>
                      <span>Category</span><strong>B — Standard</strong>
                    </div>
                    <div className={styles.docRow}>
                      <span>Valid Until</span><strong>December 2026</strong>
                    </div>
                    <div className={styles.docRow}>
                      <span>Issued By</span><strong>RNP Admin</strong>
                    </div>
                    <div className={styles.docRow}>
                      <span>Status</span>
                      <span className={styles.activeBadge}>● Active</span>
                    </div>
                  </div>
                  <div className={styles.docCardBarcode}>
                    {[...Array(28)].map((_, i) => (
                      <span key={i} className={styles.bar} style={{ height: `${8 + Math.sin(i) * 6}px` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ ROAD RULES ═══ */}
      <section className={styles.sectionDark}>
        {/* Decorative road lines */}
        <div className={styles.roadLines}>
          {[...Array(6)].map((_, i) => <div key={i} className={styles.roadLine} />)}
        </div>

        <div className={styles.container} style={{ position: 'relative', zIndex: 2 }}>
          <div className={styles.sectionHead} data-reveal>
            <span className={styles.eyebrowLight}>Road Safety</span>
            <h2 className={`${styles.sectionTitle} ${styles.titleLight}`}>Key Rules of the Road</h2>
            <p className={styles.sectionDescLight}>Violating these rules can result in fines, detention, or license suspension.</p>
          </div>

          <div className={styles.rulesGrid}>
            {rules.map((r, i) => (
              <RainReveal key={i} delay={i * 70}>
                <div className={styles.ruleCard}>
                  <span className={styles.ruleIcon}>{r.icon}</span>
                  <p className={styles.ruleText}>{r.text}</p>
                </div>
              </RainReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PROCESS ═══ */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.sectionHead} data-reveal>
            <span className={styles.eyebrow}>How It Works</span>
            <h2 className={styles.sectionTitle}>Get Started in<br />Three Simple Steps</h2>
          </div>
          <div className={styles.stepsRow}>
            {[
              { num: '01', title: 'License Issued', desc: 'You pass your test. The Rwanda National Police issues your official driving license.' },
              { num: '02', title: 'Account Created', desc: 'An RNP administrator creates your secure DriveDoc account and uploads your verified documents.' },
              { num: '03', title: 'Log In & Drive', desc: 'Access all your documents, track expiry dates, and manage renewals — all from one place.' },
            ].map((s, i) => (
              <RainReveal key={i} delay={i * 120}>
                <div className={styles.stepCard}>
                  <div className={styles.stepNum}>{s.num}</div>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p className={styles.stepDesc}>{s.desc}</p>
                  {i < 2 && <div className={styles.stepArrow}>→</div>}
                </div>
              </RainReveal>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section className={styles.cta}>
        <div className={styles.ctaGlow} />
        <div className={styles.container} style={{ position: 'relative', zIndex: 2 }}>
          <div className={styles.ctaContent} data-reveal>
            <span className={styles.eyebrow}>Get Started</span>
            <h2 className={styles.ctaTitle}>
              Ready to Drive<br />
              <span className={styles.ctaAccent}>Confidently?</span>
            </h2>
            <p className={styles.ctaDesc}>Your administrator will create your account after your license is issued. Log in and access everything in one place.</p>
            <div className={styles.heroBtns}>
              <button className={styles.btnPrimary} onClick={() => navigate('/login')}>
                Login to Portal <span className={styles.btnArrow}>→</span>
              </button>
              <button className={styles.btnGhost} onClick={() => navigate('/contact')}>
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FOOTER BAR ═══ */}
      <div className={styles.footerBar}>
        <span>🇷🇼 Rwanda DriveDoc</span>
        <span>Powered by Rwanda National Police</span>
        <span>© {new Date().getFullYear()}</span>
      </div>

    </div>
  );
}