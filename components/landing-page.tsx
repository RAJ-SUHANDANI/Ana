"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowDown, ArrowUpRight, AudioLines, Menu, X } from "lucide-react";
import { NeuralOrb } from "@/components/neural-orb";

const moods = {
  warm: "Of course. Let's take a look together. Tell me what's on your mind, and we'll work through it one step at a time.",
  focused: "Let's get to the point. Share the challenge, and I'll help you identify the clearest next move.",
  playful: "Oh, now we're getting somewhere. Tell me what you're thinking — let's see what we can make of it.",
  calm: "Take your time. There's no need to rush. We can look at it together, one thought at a time.",
};

const reveal = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.75, ease: "easeOut" } },
};

export function LandingPage() {
  const [activeMood, setActiveMood] = useState<keyof typeof moods>("warm");
  const [menuOpen, setMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="landing">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />
      <header className="site-header">
        <Link className="brand" href="/" aria-label="ANA home"><span className="brand-mark">A</span><span>ANA</span></Link>
        <nav className={menuOpen ? "desktop-nav open" : "desktop-nav"} aria-label="Main navigation">
          <a href="#experience" onClick={closeMenu}>Experience</a>
          <a href="#capabilities" onClick={closeMenu}>Capabilities</a>
          <a href="#personality" onClick={closeMenu}>Personality</a>
          <a href="#principles" onClick={closeMenu}>Principles</a>
        </nav>
        <div className="header-actions">
          <span className="availability"><i /> AVAILABLE IN YOUR BROWSER</span>
          <Link className="button button-small button-outline" href="/app">Enter ANA <ArrowUpRight size={14} /></Link>
        </div>
        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen}>
          {menuOpen ? <X size={19} /> : <Menu size={19} />}
        </button>
      </header>

      <section className="hero" id="top">
        <motion.div className="hero-copy" initial="hidden" animate="visible" variants={reveal}>
          <div className="eyebrow"><span className="eyebrow-line" /> PERSONAL INTELLIGENCE, REIMAGINED</div>
          <h1 className="hero-title">A different kind<br />of <em>intelligence.</em></h1>
          <p className="hero-description">Meet ANA. A thoughtful AI companion for the questions you carry, the ideas you explore and the things you want to make happen.</p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/app">Experience ANA <ArrowUpRight size={16} /></Link>
            <a className="text-link" href="#experience">Discover the experience <ArrowDown size={13} /></a>
          </div>
          <div className="hero-foot"><span className="tiny-orbit" /> MADE TO FEEL MORE HUMAN <span className="hero-foot-divider" /> WEB-BASED · NO INSTALLATION</div>
        </motion.div>
        <motion.div className="orb-stage" initial={{ opacity: 0, scale: 0.92 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: reduceMotion ? 0 : 1.2, delay: 0.18 }}>
          <div className="orb-label orb-label-top"><span className="label-dot" /> ANA / NEURAL PRESENCE <span>01—∞</span></div>
          <NeuralOrb className="hero-orb" label="ANA luminous neural sphere, slowly moving in an energy field" />
          <div className="orb-ring ring-a" /><div className="orb-ring ring-b" />
          <div className="orb-crosshair crosshair-one" /><div className="orb-crosshair crosshair-two" />
          <div className="orb-caption"><span>FIG. 01</span><span>AWARENESS IN MOTION</span></div>
          <div className="orb-coordinate">INTELLIGENCE FIELD<br />ANA / 001</div>
        </motion.div>
        <div className="hero-scroll"><span>SCROLL TO EXPLORE</span><i /></div>
      </section>

      <motion.section className="intro-section section-shell" id="experience" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={reveal}>
        <div className="section-kicker"><span>01</span> THE EXPERIENCE</div>
        <div className="intro-grid">
          <h2 className="display-heading">Not another window<br />to type into. <em>A space<br />to think.</em></h2>
          <div className="intro-aside"><p>Some conversations solve a problem. Others open a door. ANA is designed for both — clear when you need direction, curious when you want to explore, and present when you simply need to talk something through.</p><Link href="/app" className="underlined-link">Step inside ANA <ArrowUpRight size={14} /></Link></div>
        </div>
        <div className="statement-rule"><span>THOUGHTFUL BY DESIGN</span><span>ALWAYS YOURS TO SHAPE</span></div>
      </motion.section>

      <section className="capabilities-section section-shell" id="capabilities">
        <motion.div className="section-heading" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={reveal}>
          <div className="section-kicker"><span>02</span> WHAT ANA BRINGS</div>
          <h2 className="display-heading">Made for the way<br /><em>your mind moves.</em></h2>
          <p>One companion, many ways to move an idea forward.</p>
        </motion.div>
        <div className="capability-grid">
          {[
            { number: "01 / CONVERSATION", title: "Think out loud.", copy: "Ask freely, follow a thought, challenge an idea or find a clearer way to see something.", visual: "wave" },
            { number: "02 / VOICE", title: "Speak naturally.", copy: "Move between typing and voice, at your own pace.", visual: "voice" },
            { number: "03 / PERSONALITY", title: "Your kind of conversation.", copy: "Choose a tone that fits the moment — warm, focused, playful or precise.", visual: "mood" },
            { number: "04 / USEFUL BY NATURE", title: "From thought to action.", copy: "Draft, calculate, organize and turn a conversation into something useful.", visual: "task" },
          ].map((item) => (
            <motion.article className="capability-card" key={item.number} tabIndex={0} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={reveal} whileHover={{ y: -7, borderColor: "rgba(167,143,255,.48)" }} transition={{ duration: 0.35 }}>
              <div className="card-index">{item.number}</div>
              <div className={"card-visual " + item.visual} aria-hidden="true">
                {item.visual === "wave" && Array.from({ length: 16 }, (_, i) => <i key={i} style={{ height: (18 + (i % 5) * 11) + "px", animationDelay: "-" + (i * 0.09) + "s" } as CSSProperties} />)}
                {item.visual === "voice" && <AudioLines size={60} strokeWidth={1} />}
                {item.visual === "mood" && <><b>calm</b><b>curious</b><b>focused</b></>}
                {item.visual === "task" && <><span>✓ &nbsp; Untangle an idea</span><span>↗ &nbsp; Shape a plan</span><span>○ &nbsp; Take the next step</span></>}
              </div>
              <div><h3>{item.title}</h3><p>{item.copy}</p></div>
              <span className="card-arrow"><ArrowUpRight size={17} /></span>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="orb-feature section-shell">
        <motion.div className="orb-feature-copy" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={reveal}>
          <div className="section-kicker"><span>03</span> A LIVING PRESENCE</div>
          <h2 className="display-heading">An assistant<br />you can <em>feel.</em></h2>
          <p>At the centre of ANA is a single point of light — a sphere that breathes, listens and responds. Its movement follows the rhythm of a conversation, giving every exchange a quiet sense of presence.</p>
          <div className="orb-state-list"><span><i className="state-dot" /> AT REST</span><span><i className="state-dot listening" /> LISTENING</span><span><i className="state-dot speaking" /> SPEAKING</span></div>
        </motion.div>
        <motion.div className="feature-orb-wrap" initial={{ opacity: 0, scale: 0.92 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ duration: 1 }}>
          <NeuralOrb className="feature-orb" label="ANA neural sphere with layered light and internal plasma filaments" />
          <div className="feature-orb-glow" /><span className="feature-orb-note">ONE FORM. MANY STATES.</span>
        </motion.div>
      </section>

      <section className="personality-section section-shell" id="personality">
        <div className="section-kicker"><span>04</span> YOUR TONE, YOUR TERMS</div>
        <div className="personality-grid">
          <motion.div className="personality-intro" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}>
            <h2 className="display-heading">Same intelligence.<br /><em>Different energy.</em></h2>
            <p>Tell ANA how you would like the conversation to feel. The selected style shapes the way responses are written — without changing what you ask.</p>
          </motion.div>
          <motion.div className="personality-demo" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}>
            <div className="mood-tabs" role="group" aria-label="Choose a conversation style">
              {Object.keys(moods).map((mood) => <button key={mood} className={activeMood === mood ? "mood-tab active" : "mood-tab"} onClick={() => setActiveMood(mood as keyof typeof moods)} aria-pressed={activeMood === mood}>{mood}</button>)}
            </div>
            <div className="demo-message"><div className="demo-avatar">A</div><div><div className="demo-meta">ANA <span>· A MOMENT WITH YOU</span></div><motion.p key={activeMood} initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>{moods[activeMood]}</motion.p></div></div>
            <div className="demo-note"><span className="demo-note-dot" /> SELECT A STYLE TO FEEL THE DIFFERENCE</div>
          </motion.div>
        </div>
      </section>

      <section className="principles-section section-shell" id="principles">
        <div className="section-kicker"><span>05</span> QUIETLY CONSIDERED</div>
        <div className="principles-grid">
          <motion.h2 className="display-heading" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}>Good intelligence<br />starts with <em>trust.</em></motion.h2>
          <div className="principle-list">
            {[
              ["01", "Clear about its limits.", "ANA should be useful without pretending to know or do everything."],
              ["02", "Yours to shape.", "Choose the tone, voice and experience that work for you."],
              ["03", "No unnecessary complexity.", "Open ANA in a browser. No local model installation or paid subscription is required."],
            ].map(([number, title, copy]) => <motion.div className="principle-item" key={number} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}><span>{number}</span><div><h3>{title}</h3><p>{copy}</p></div><ArrowUpRight size={15} /></motion.div>)}
          </div>
        </div>
      </section>

      <section className="closing-section">
        <div className="closing-aura" />
        <motion.div className="closing-content" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={reveal}>
          <div className="eyebrow"><span className="eyebrow-line" /> YOUR SPACE IS READY</div>
          <h2>Make room for<br /><em>a better question.</em></h2>
          <p>Start a conversation. See where it takes you.</p>
          <Link className="button button-primary button-large" href="/app">Enter ANA <ArrowUpRight size={16} /></Link>
        </motion.div>
      </section>
      <footer className="site-footer"><Link className="brand" href="/"><span className="brand-mark">A</span><span>ANA</span></Link><span className="footer-note">A DIFFERENT KIND OF INTELLIGENCE.</span><span className="footer-copy">© {new Date().getFullYear()} ANA · MADE FOR THE WEB</span></footer>
    </main>
  );
}
