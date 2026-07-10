import { ArrowRight, Code2, Gauge, Globe2, Layers3, ShieldCheck, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

const services = [
  { icon: Globe2, title: 'Business websites', text: 'Fast, polished sites that help customers trust your business and take action.' },
  { icon: Code2, title: 'Custom software', text: 'Purpose-built applications, APIs, integrations, and internal tools.' },
  { icon: Sparkles, title: 'Automation & AI', text: 'Practical systems that remove repetitive work and improve delivery.' },
]

const principles = [
  { icon: Gauge, title: 'Built for momentum', text: 'Clear scope, focused execution, and frequent releases.' },
  { icon: ShieldCheck, title: 'Reliable by design', text: 'Accessible, maintainable, secure foundations from day one.' },
  { icon: Layers3, title: 'Designed to grow', text: 'Every release should make the next one faster and stronger.' },
]

function App() {
  return (
    <div className="site-shell">
      <header className="site-header">
        <a className="brand" href="#top" aria-label="LunarWolf home">
          <span className="brand-mark">LW</span>
          <span>LunarWolf</span>
        </a>
        <nav aria-label="Primary navigation">
          <a href="#work">Work</a>
          <a href="#services">Services</a>
          <a href="#about">About</a>
          <a href="#contact">Contact</a>
        </nav>
        <a className="button button-small" href="#contact">Start a project</a>
      </header>

      <main id="top">
        <section className="hero section-pad">
          <motion.div
            className="hero-copy"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
          >
            <p className="eyebrow">Software studio · Johannesburg</p>
            <h1>Software that helps businesses <span>move forward.</span></h1>
            <p className="hero-lead">LunarWolf builds modern websites, custom software, and intelligent automation with a clear focus on trust, speed, and long-term value.</p>
            <div className="hero-actions">
              <a className="button" href="#contact">Start your project <ArrowRight size={18} /></a>
              <a className="text-link" href="#work">See our work <ArrowRight size={16} /></a>
            </div>
          </motion.div>

          <motion.div
            className="orbit-card"
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.15 }}
            aria-hidden="true"
          >
            <div className="moon" />
            <div className="orbit orbit-one" />
            <div className="orbit orbit-two" />
            <span className="signal signal-one" />
            <span className="signal signal-two" />
            <div className="orbit-label">Discover · Design · Develop · Deploy</div>
          </motion.div>
        </section>

        <section className="proof-strip" aria-label="LunarWolf capabilities">
          <span>Strategy</span><i />
          <span>Design</span><i />
          <span>Engineering</span><i />
          <span>Automation</span><i />
          <span>Support</span>
        </section>

        <section className="section-pad" id="work">
          <div className="section-heading">
            <div><p className="eyebrow">Featured work</p><h2>Real work. Live in the world.</h2></div>
            <p>We build practical digital experiences that help small businesses look credible, communicate clearly, and grow.</p>
          </div>
          <a className="case-study" href="https://exclusive-pets-grooming.netlify.app/" target="_blank" rel="noreferrer">
            <div className="case-visual">
              <span className="live-pill">Live project</span>
              <div className="browser-frame">
                <div className="browser-bar"><span /><span /><span /></div>
                <div className="browser-content">
                  <small>EXCLUSIVE PETS</small>
                  <strong>Grooming with as much care as love.</strong>
                  <div className="browser-button">Book a groom</div>
                </div>
              </div>
            </div>
            <div className="case-copy">
              <p className="eyebrow">Business website · 2026</p>
              <h3>Exclusive Pets Grooming Parlour</h3>
              <p>A warm, responsive local-business website designed to turn public information and customer trust into a clear booking journey.</p>
              <span className="text-link">View live website <ArrowRight size={16} /></span>
            </div>
          </a>
        </section>

        <section className="section-pad section-muted" id="services">
          <div className="section-heading compact"><div><p className="eyebrow">What we build</p><h2>Useful technology, thoughtfully delivered.</h2></div></div>
          <div className="card-grid">
            {services.map(({ icon: Icon, title, text }) => (
              <article className="service-card" key={title}><Icon size={24} /><h3>{title}</h3><p>{text}</p></article>
            ))}
          </div>
        </section>

        <section className="section-pad" id="about">
          <div className="about-grid">
            <div><p className="eyebrow">Why LunarWolf</p><h2>Calm thinking. Strong engineering. Honest delivery.</h2></div>
            <div className="principle-list">
              {principles.map(({ icon: Icon, title, text }) => (
                <article key={title}><Icon size={22} /><div><h3>{title}</h3><p>{text}</p></div></article>
              ))}
            </div>
          </div>
        </section>

        <section className="contact-section section-pad" id="contact">
          <p className="eyebrow">Start something useful</p>
          <h2>Have a business, product, or process that needs a better digital solution?</h2>
          <p>Let’s turn the idea into something clear, useful, and ready for the real world.</p>
          <a className="button button-light" href="mailto:mikeywestman@gmail.com">Start your project <ArrowRight size={18} /></a>
        </section>
      </main>

      <footer>
        <a className="brand" href="#top"><span className="brand-mark">LW</span><span>LunarWolf</span></a>
        <p>Building software, systems, and momentum.</p>
        <span>© {new Date().getFullYear()} LunarWolf</span>
      </footer>
    </div>
  )
}

export default App
