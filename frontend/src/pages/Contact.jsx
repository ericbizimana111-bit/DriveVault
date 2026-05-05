import  { useState } from 'react';
import styles from './Contact.module.css';

const contacts = [
  { icon: '📞', label: 'Phone', value: '+250 788 311 155', sub: 'Rwanda National Police (24/7)' },
  { icon: '📧', label: 'Email', value: 'support@rwandadrive.rw', sub: 'Response within 24 hours' },
  { icon: '📍', label: 'Office', value: 'KN 3 Ave, Kigali', sub: 'Rwanda National Police HQ' },
  { icon: '⏰', label: 'Office Hours', value: 'Mon–Fri: 7:30am–5:00pm', sub: 'Saturday: 8:00am–12:00pm' },
];

const faqs = [
  { q: 'How do I get an account?', a: 'Accounts are created exclusively by Rwanda National Police administrators after your driving license is issued. You cannot self-register.' },
  { q: 'I forgot my password. What do I do?', a: 'Contact your nearest RNP office or use the email listed here. The administrator can reset your password.' },
  { q: 'What is a payment code?', a: 'Each document has a unique payment code assigned by the administrator. Use this code to pay for document renewal at any authorised payment point.' },
  { q: 'Can I view documents on my phone?', a: 'Yes. Rwanda DriveDoc is fully responsive and works on all devices including mobile phones.' },
  { q: 'Who can see my documents?', a: 'Only you (after logging in) and the admin can view your documents. Police officers can verify through the admin panel.' },
  { q: 'What happens when a document expires?', a: 'You will see the expiry countdown on your dashboard. Once expired, driving with that document is illegal. Renew promptly using your payment code.' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sent, setSent] = useState(false);

  const handleChange = e => setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) return;
    // Simulate submission
    setSent(true);
  };

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <section className={styles.header}>
        <div className={styles.container}>
          <div className={styles.badge}>Contact & Support</div>
          <h1>We're Here to Help</h1>
          <p>Have questions about your account, documents, or payments? Reach out to us through any of the channels below.</p>
        </div>
      </section>

      {/* CONTACT CARDS */}
      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.contactGrid}>
            {contacts.map((c, i) => (
              <div className={styles.contactCard} key={i}>
                <div className={styles.contactIcon}>{c.icon}</div>
                <div className={styles.contactLabel}>{c.label}</div>
                <div className={styles.contactValue}>{c.value}</div>
                <div className={styles.contactSub}>{c.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORM + FAQ */}
      <section className={styles.sectionAlt}>
        <div className={styles.container}>
          <div className={styles.mainRow}>
            {/* FORM */}
            <div className={styles.formWrap}>
              <h2>Send a Message</h2>
              <p>Fill in the form and we'll get back to you as soon as possible.</p>
              {sent ? (
                <div className={styles.successBox}>
                  <div className={styles.successIcon}>✅</div>
                  <h3>Message Sent!</h3>
                  <p>Thank you for reaching out. We'll respond within 24 hours to <strong>{form.email}</strong>.</p>
                </div>
              ) : (
                <form className={styles.form} onSubmit={handleSubmit}>
                  <div className={styles.row}>
                    <div className={styles.field}>
                      <label>Full Name *</label>
                      <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" required />
                    </div>
                    <div className={styles.field}>
                      <label>Email Address *</label>
                      <input type="email" name="email" value={form.email} onChange={handleChange} placeholder="your@email.com" required />
                    </div>
                  </div>
                  <div className={styles.field}>
                    <label>Subject</label>
                    <select name="subject" value={form.subject} onChange={handleChange}>
                      <option value="">Select a subject</option>
                      <option>Account Access Issue</option>
                      <option>Document Query</option>
                      <option>Payment Problem</option>
                      <option>License Renewal</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label>Message *</label>
                    <textarea name="message" value={form.message} onChange={handleChange} placeholder="Describe your issue or question..." rows={5} required />
                  </div>
                  <button type="submit" className={styles.submitBtn}>Send Message →</button>
                </form>
              )}
            </div>

            {/* FAQ */}
            <div className={styles.faqWrap}>
              <h2>Frequently Asked Questions</h2>
              <div className={styles.faqs}>
                {faqs.map((f, i) => (
                  <details className={styles.faq} key={i}>
                    <summary>{f.q}</summary>
                    <p>{f.a}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
