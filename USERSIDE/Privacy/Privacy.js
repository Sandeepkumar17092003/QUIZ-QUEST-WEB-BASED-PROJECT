import React, { useEffect, useRef } from 'react'
import "./Privacy.css";
const PrivacyPolicy = () => {
  const sectionRefs = useRef([])

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible')
          }
        })
      },
      { threshold: 0.1 }
    )

    sectionRefs.current.forEach((ref) => observer.observe(ref))

    return () => observer.disconnect()
  }, [])

  return (
    <div className="privacy-policy-20">
      <header className="header-21">
        <div className="container-22">
          <h1>Privacy Policy</h1>
          <p>Your privacy is important to us. This policy outlines how we collect, use, and protect your information.</p>
        </div>
      </header>
      <main className="main-23">
        <div className="container-22">
          <section ref={el => sectionRefs.current[0] = el} className="policy-section-24">
            <h2>1. Information We Collect</h2>
            <p>We collect information you provide directly to us, including:</p>
            <ul>
              <li>Personal identifiers (e.g., name, email address)</li>
              <li>Account information</li>
              <li>Payment details</li>
              <li>Communication preferences</li>
            </ul>
          </section>
          <section ref={el => sectionRefs.current[1] = el} className="policy-section-25">
            <h2>2. How We Use Your Information</h2>
            <p>We use your information to:</p>
            <ul>
              <li>Provide and improve our services</li>
              <li>Process transactions</li>
              <li>Send important notifications</li>
              <li>Respond to your inquiries</li>
              <li>Prevent fraudulent activities</li>
            </ul>
          </section>
          <section ref={el => sectionRefs.current[2] = el} className="policy-section-26">
            <h2>3. Information Sharing</h2>
            <p>We may share your information with:</p>
            <ul>
              <li>Service providers and partners</li>
              <li>Legal authorities when required by law</li>
              <li>Other parties with your consent</li>
            </ul>
          </section>
          <section ref={el => sectionRefs.current[3] = el} className="policy-section-27">
            <h2>4. Data Security</h2>
            <p>We implement various security measures to protect your data, including:</p>
            <ul>
              <li>Encryption of sensitive information</li>
              <li>Regular security audits</li>
              <li>Strict access controls</li>
              <li>Employee training on data protection</li>
            </ul>
          </section>
          <section ref={el => sectionRefs.current[4] = el} className="policy-section-28">
            <h2>5. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access your personal data</li>
              <li>Correct inaccuracies in your data</li>
              <li>Request deletion of your data</li>
              <li>Opt-out of certain data uses</li>
            </ul>
          </section>
          <section ref={el => sectionRefs.current[5] = el} className="policy-section-29">
            <h2>6. Policy Updates</h2>
            <p>We may update this policy periodically. We will notify you of any significant changes via email or through our services.</p>
          </section>
        </div>
      </main>
     
      
    </div>
  )
}

export default PrivacyPolicy
