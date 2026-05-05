'use client'


export default function PrivacyPage() {
  return (
    <div style={{ minHeight: '100vh', background: 'var(--ink-50)' }}>
      {/* Main Content */}
      <div className="container" style={{ padding: '60px 24px', maxWidth: '900px', margin: '0 auto' }}>
        <h1 style={{
          fontSize: 48,
          fontWeight: 700,
          margin: '0 0 40px',
          color: '#000000',
        }}>
          Privacy Policy
        </h1>

        <div style={{ color: '#000000', lineHeight: 1.8, fontSize: 16 }}>
          <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 40, marginBottom: 16, color: '#000000' }}>
            1. Introduction
          </h2>
          <p>
            Welcome to TECHFRONT HUB ("we," "our," or "us"). We are committed to protecting your privacy and ensuring
            you have a positive experience on our platform. This Privacy Policy explains how we collect, use, disclose,
            and safeguard your information.
          </p>

          <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 40, marginBottom: 16, color: '#000000' }}>
            2. Information We Collect
          </h2>
          <p>
            We collect information you provide directly, such as when you create an account, enroll in courses, or contact
            our support team. This may include:
          </p>
          <ul style={{ paddingLeft: 20 }}>
            <li>Name and email address</li>
            <li>Password and authentication information</li>
            <li>Course enrollment and progress data</li>
            <li>Feedback and communication preferences</li>
          </ul>

          <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 40, marginBottom: 16, color: '#000000' }}>
            3. How We Use Your Information
          </h2>
          <p>
            We use the information we collect to:
          </p>
          <ul style={{ paddingLeft: 20 }}>
            <li>Provide and improve our educational services</li>
            <li>Personalize your learning experience</li>
            <li>Send course updates and communications</li>
            <li>Ensure platform security and prevent fraud</li>
          </ul>

          <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 40, marginBottom: 16, color: '#000000' }}>
            4. Data Security
          </h2>
          <p>
            We implement appropriate technical and organizational measures to protect your personal information against
            unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the
            internet is 100% secure.
          </p>

          <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 40, marginBottom: 16, color: '#000000' }}>
            5. Sharing Your Information
          </h2>
          <p>
            We do not sell, trade, or rent your personal information to third parties. We may share information with
            service providers who assist us in operating our website and conducting our business.
          </p>

          <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 40, marginBottom: 16, color: '#000000' }}>
            6. Your Rights
          </h2>
          <p>
            You have the right to access, correct, or delete your personal information. To exercise these rights, please
            contact us at hello@techfronthub.ng.
          </p>

          <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 40, marginBottom: 16, color: '#000000' }}>
            7. Changes to This Policy
          </h2>
          <p>
            We may update this Privacy Policy from time to time. We will notify you of any changes by posting the new
            policy on this page and updating the "Last Updated" date.
          </p>

          <h2 style={{ fontSize: 24, fontWeight: 700, marginTop: 40, marginBottom: 16, color: '#000000' }}>
            8. Contact Us
          </h2>
          <p>
            If you have questions about this Privacy Policy, please contact us at:
          </p>
          <ul style={{ paddingLeft: 20 }}>
            <li>Email: hello@techfronthub.ng</li>
            <li>Phone: +234 810 000 0000</li>
            <li>Address: Bodija, Ibadan · Lekki, Lagos</li>
          </ul>

          <p style={{ marginTop: 40, color: '#000000', fontSize: 14 }}>
            Last Updated: April 2026
          </p>
        </div>
      </div>
    </div>
  )
}
