import React, { useState, useEffect, useRef } from 'react'
import './AboutPage.css'
import image1 from './image1.jpg';
const services = [
  { title: 'Web Development', icon: '💻', description: 'We create responsive, fast, and secure web applications tailored to your business needs.' },
  { title: 'Mobile Apps', icon: '📱', description: 'Our team develops intuitive and powerful mobile applications for iOS and Android platforms.' },
  { title: 'UI/UX Design', icon: '🎨', description: 'We design beautiful, user-friendly interfaces that enhance user experience and engagement.' }
  ]

const team = [
  { name: 'Sandeep Rai', role: 'Team Leader & Backend Developer', image: image1 },
  { name: 'Abhishek Kadlag', role: 'Fronted Designer', image: image1 },
  { name: 'Dinesh Vishawkarma', role: 'Fronted Designer', image: image1},
]

export default function AboutPage() {
  const [stats, setStats] = useState({ years: 0, clients: 0, projects: 0 })
  const [isVisible, setIsVisible] = useState({})
  const sectionRefs = useRef([])

  useEffect(() => {
    const interval = setInterval(() => {
      setStats(prev => ({
        years: prev.years < 10 ? prev.years + 1 : 10,
        clients: prev.clients < 200 ? prev.clients + 10 : 200,
        projects: prev.projects < 500 ? prev.projects + 25 : 500
      }))
    }, 100)

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(prev => ({ ...prev, [entry.target.id]: entry.isIntersecting }))
        })
      },
      { threshold: 0.1 }
    )

    sectionRefs.current.forEach((ref) => observer.observe(ref))

    return () => {
      clearInterval(interval)
      observer.disconnect()
    }
  }, [])

  return (
    <div className="class55">
      <header className="class56">
        <div className="class57">
          <h1>Innovate. Create. Elevate.</h1>
          <p>We're a team of passionate individuals dedicated to creating innovative solutions that make a difference.</p>
          <button className="class72">Learn More</button>
        </div>
      </header>

      <main className="class58">
        <section ref={el => sectionRefs.current[0] = el} id="stats" className={`class59 ${isVisible.stats ? 'class73' : ''}`}>
          <div className="class60">
            <h2>{stats.years}+</h2>
            <p>Years of Experience</p>
          </div>
          <div className="class60">
            <h2>{stats.clients}+</h2>
            <p>Happy Clients</p>
          </div>
          <div className="class60">
            <h2>{stats.projects}+</h2>
            <p>Projects Completed</p>
          </div>
        </section>

        <section ref={el => sectionRefs.current[1] = el} id="services" className={`class61 ${isVisible.services ? 'class73' : ''}`}>
          <h2>Our Services</h2>
          <div className="class62">
            {services.map((service, index) => (
              <div key={index} className="class63">
                <div className="class64">{service.icon}</div>
                <h3>{service.title}</h3>
                <p>{service.description}</p>
              </div>
            ))}
          </div>
        </section>

        <section ref={el => sectionRefs.current[2] = el} id="team" className={`class65 ${isVisible.team ? 'class73' : ''}`}>
          <h2>Meet Our Team</h2>
          <div className="class66">
            {team.map((member, index) => (
              <div key={index} className="class67">
                <div className="class68">
                  <img src={member.image} alt={member.name} />
                  {/* <div className="class69">
                    <span className="class70">View Profile</span>
                  </div> */}
                </div>
                <h5 className="center-Name">{member.name}</h5>
                <p>{member.role}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}