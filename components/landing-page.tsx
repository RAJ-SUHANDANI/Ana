"use client";

import Link from "next/link";
import { useState, type CSSProperties } from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import {
  ArrowDown, ArrowUpRight, Compass, Fingerprint, Menu,
  MessageCircle, Mic, Orbit, ShieldCheck, Sparkles, X,
} from "lucide-react";
import { NeuralOrb } from "@/components/neural-orb";

const moods = {
  warm: "Of course. Let's take a look together. Tell me what's on your mind, and we'll work through it one step at a time.",
  focused: "Let's get to the point. Share the challenge, and I'll help you identify the clearest next move.",
  playful: "Oh, now we're getting somewhere. Tell me what you're thinking — let's see what we can make of it.",
  calm: "Take your time. There's no need to rush. We can look at it together, one thought at a time.",
};

const rise: Variants = {
  hidden: { opacity: 0, y: 34, filter: "blur(8px)" },
  visible: {
    opacity: 1, y: 0, filter: "blur(0px)",
    transition: { duration: 0.9, ease: [0.22, 0.8, 0.24, 1] },
  },
};

export function LandingPage() {
  const [activeMood, setActiveMood] = useState<keyof typeof moods>("warm");
  const [menuOpen, setMenuOpen] = useState(false);
  const reduceMotion = useReducedMotion();
  const closeMenu = () => setMenuOpen(false);

  return (
    <main className="landing luxury-landing">
      <div className="cosmic-backdrop" aria-hidden="true">
        <div className="cosmic-grid" /><div className="cosmic-grain" />
        <div className="aura-cloud aura-cloud-one" /><div className="aura-cloud aura-cloud-two" /><div className="aura-cloud aura-cloud-three" />
      </div>

      <header className="lux-header">
        <Link className="lux-brand" href="/" aria-label="ANA home">
          <span className="lux-brand-symbol"><span>A</span><i /></span>
          <span className="lux-brand-name">ANA<span>®</span></span>
        </Link>
        <nav className={menuOpen ? "lux-nav is-open" : "lux-nav"} aria-label="Main navigation">
          <a href="#experience" onClick={closeMenu}>Experience</a>
          <a href="#capabilities" onClick={closeMenu}>Capabilities</a>
          <a href="#presence" onClick={closeMenu}>The presence</a>
          <a href="#principles" onClick={closeMenu}>Principles</a>
        </nav>
        <div className="lux-header-right">
          <span className="lux-availability"><i /> SYSTEM ONLINE</span>
          <Link className="lux-enter" href="/app">Enter ANA <ArrowUpRight size={15} /></Link>
        </div>
        <button className="lux-menu-toggle" onClick={() => setMenuOpen((open) => !open)} aria-label={menuOpen ? "Close navigation" : "Open navigation"} aria-expanded={menuOpen}>
          {menuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      <section className="lux-hero" id="top">
        <div className="hero-coordinate coordinate-left">A / 001<br />PERSONAL INTELLIGENCE</div>
        <div className="hero-coordinate coordinate-right">EST. FOR THE<br />NEXT WAY OF THINKING</div>
        <motion.div className="lux-hero-copy" initial="hidden" animate="visible" variants={rise}>
          <div className="lux-eyebrow"><span className="eyebrow-pulse" /> THE PERSONAL INTELLIGENCE SYSTEM <b>01—∞</b></div>
          <h1>Intelligence,<br />with a <em>presence.</em></h1>
          <p className="lux-hero-intro">Not another tool demanding your attention. A thoughtful companion that gives your ideas room to become something more.</p>
          <div className="lux-hero-actions">
            <Link href="/app" className="lux-primary-button"><span>Enter the experience</span><ArrowUpRight size={17} /></Link>
            <a className="lux-secondary-link" href="#experience">Discover ANA <ArrowDown size={14} /></a>
          </div>
          <div className="lux-hero-proof">
            <div className="proof-item"><span>01</span><b>Human in focus</b></div><div className="proof-divider" />
            <div className="proof-item"><span>02</span><b>Quietly capable</b></div><div className="proof-divider" />
            <div className="proof-item"><span>03</span><b>Made for the web</b></div>
          </div>
        </motion.div>

        <motion.div className="lux-hero-visual"
          initial={{ opacity: 0, scale: 0.88, filter: "blur(18px)" }}
          animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
          transition={{ duration: reduceMotion ? 0 : 1.55, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}>
          <div className="visual-halo halo-outer" /><div className="visual-halo halo-inner" />
          <div className="orbital-map">
            <div className="orbit-track orbit-track-one"><i /></div><div className="orbit-track orbit-track-two"><i /></div><div className="orbit-track orbit-track-three"><i /></div>
            <div className="orbit-axis axis-horizontal" /><div className="orbit-axis axis-vertical" />
            <div className="orbit-node node-one" /><div className="orbit-node node-two" /><div className="orbit-node node-three" />
          </div>
          <div className="visual-index visual-index-top"><span>CORE / 001</span><i /> NEURAL PRESENCE</div>
          <NeuralOrb className="hero-orb" label="ANA's luminous neural presence, a glowing violet and blue energy sphere surrounded by orbital light" />
          <motion.div className="visual-float float-core" animate={reduceMotion ? undefined : { y: [0, -12, 0], rotate: [0, 1.2, 0] }} transition={{ duration: 7.5, repeat: Infinity, ease: "easeInOut" }}>
            <span className="float-icon"><Orbit size={15} /></span><span><b>NEURAL CORE</b><small>ADAPTIVE · RESPONSIVE</small></span>
          </motion.div>
          <motion.div className="visual-float float-signal" animate={reduceMotion ? undefined : { y: [0, 9, 0] }} transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}>
            <span className="signal-bars"><i /><i /><i /><i /><i /></span><span><b>VOICE SIGNAL</b><small>READY WHEN YOU ARE</small></span>
          </motion.div>
          <div className="visual-index visual-index-bottom"><span>FIELD NOTE 001</span><b>FORM FOLLOWS THOUGHT</b></div>
        </motion.div>
        <a className="lux-scroll-cue" href="#experience"><span>SCROLL TO ENTER</span><i><b /></i></a>
        <div className="hero-side-code">ANA / INTERFACE STUDY <span>© 2026</span></div>
      </section>

      <div className="lux-signal-rail" aria-label="ANA product characteristics">
        <div className="signal-rail-label">THE ANA STANDARD</div>
        <div className="signal-rail-items">
          <span><i /> BROWSER NATIVE</span><span><i /> NO LOCAL MODEL</span><span><i /> YOUR CONVERSATION STYLE</span><span><i /> VOICE OPTIONAL</span><span><i /> BUILT AROUND YOU</span>
        </div>
      </div>

      <motion.section className="lux-manifesto section-shell" id="experience" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.18 }} variants={rise}>
        <div className="lux-section-meta"><span>01 / THE EXPERIENCE</span><span>THOUGHT, WITHOUT FRICTION</span></div>
        <div className="manifesto-layout">
          <h2>Less interface.<br /><em>More intelligence.</em></h2>
          <div className="manifesto-aside">
            <span className="manifesto-mark">“</span>
            <p>The best conversations don&apos;t feel like using software. They feel like finding the missing piece — the question, the perspective, the next step you couldn&apos;t quite reach alone.</p>
            <Link href="/app" className="lux-text-link">Step inside ANA <ArrowUpRight size={15} /></Link>
          </div>
        </div>
        <div className="manifesto-bottom"><span>DESIGNED TO DISAPPEAR INTO THE MOMENT</span><span className="manifesto-line" /><span>BUILT TO BRING YOUR THINKING FORWARD</span></div>
      </motion.section>

      <section className="lux-capabilities section-shell" id="capabilities">
        <motion.div className="lux-section-heading" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={rise}>
          <div><div className="lux-section-meta"><span>02 / WHAT IT CAN DO</span><span>ONE SYSTEM. MANY DIRECTIONS.</span></div><h2>Ideas don&apos;t move<br />in <em>straight lines.</em></h2></div>
          <p>Follow a thought, change direction, find a sharper angle — ANA is built to move with you.</p>
        </motion.div>
        <div className="lux-bento-grid">
          <motion.article className="lux-bento-card bento-conversation" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={rise} whileHover={reduceMotion ? undefined : { y: -7 }}>
            <div className="bento-topline"><span>01 / CONVERSATION</span><MessageCircle size={16} /></div>
            <div className="bento-conversation-copy"><h3>Think beyond<br /><em>the first answer.</em></h3><p>Explore a question from every angle. Keep going until it clicks.</p></div>
            <div className="conversation-visual" aria-hidden="true">
              <div className="conversation-visual-line"><span className="mini-avatar">A</span><span>What if we looked at it differently?</span><i>NOW</i></div>
              <div className="conversation-visual-line response-line"><span className="mini-avatar">A</span><span>Let&apos;s turn the problem around. Start with what you already know...</span></div>
              <div className="conversation-spark"><Sparkles size={16} /></div><div className="conversation-orbit-mark"><i /><i /><i /></div>
            </div>
            <Link href="/app" className="bento-link" aria-label="Start a conversation with ANA"><ArrowUpRight size={17} /></Link>
          </motion.article>

          <motion.article className="lux-bento-card bento-voice" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={rise} whileHover={reduceMotion ? undefined : { y: -7 }}>
            <div className="bento-topline"><span>02 / VOICE</span><Mic size={16} /></div>
            <div className="voice-visual" aria-hidden="true">
              {Array.from({ length: 31 }, (_, index) => <i key={index} style={{ "--bar": (16 + ((index * 17) % 58)) + "%", "--delay": (index * -0.043) + "s" } as CSSProperties} />)}
            </div>
            <div className="bento-card-copy"><h3>Let the words<br /><em>flow naturally.</em></h3><p>Switch between text and voice, without breaking your train of thought.</p></div>
            <Link href="/app" className="bento-link" aria-label="Try voice with ANA"><ArrowUpRight size={17} /></Link>
          </motion.article>

          <motion.article className="lux-bento-card bento-personality" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={rise} whileHover={reduceMotion ? undefined : { y: -7 }}>
            <div className="bento-topline"><span>03 / PERSONALITY</span><Fingerprint size={16} /></div>
            <div className="personality-visual" aria-hidden="true">
              <div className="personality-orbit p-orbit-one" /><div className="personality-orbit p-orbit-two" />
              <span className="personality-center">A</span><span className="personality-chip chip-warm">warm</span><span className="personality-chip chip-calm">calm</span><span className="personality-chip chip-focus">focused</span>
            </div>
            <div className="bento-card-copy"><h3>Your tone.<br /><em>Your terms.</em></h3><p>Choose the energy that fits the moment. The conversation follows your lead.</p></div>
            <Link href="/app" className="bento-link" aria-label="Choose a conversation style"><ArrowUpRight size={17} /></Link>
          </motion.article>

          <motion.article className="lux-bento-card bento-create" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.15 }} variants={rise} whileHover={reduceMotion ? undefined : { y: -7 }}>
            <div className="bento-topline"><span>04 / MOMENTUM</span><Compass size={16} /></div>
            <div className="create-visual" aria-hidden="true">
              <div className="create-step"><span>01</span><b>Untangle an idea</b><i>✓</i></div>
              <div className="create-step"><span>02</span><b>Shape a direction</b><i>↗</i></div>
              <div className="create-step"><span>03</span><b>Make the next move</b><i>○</i></div>
            </div>
            <div className="bento-card-copy"><h3>From thought<br /><em>to momentum.</em></h3><p>Draft, calculate, organize and turn the conversation into something useful.</p></div>
            <Link href="/app" className="bento-link" aria-label="Make a plan with ANA"><ArrowUpRight size={17} /></Link>
          </motion.article>
        </div>
      </section>

      <section className="lux-presence section-shell" id="presence">
        <div className="presence-copy">
          <div className="lux-section-meta"><span>03 / THE NEURAL PRESENCE</span><span>ANA CORE : 001</span></div>
          <h2>A signal<br />you can <em>feel.</em></h2>
          <p>At the centre of ANA is a living field of light. It breathes at rest, gathers energy when you speak, and moves with the rhythm of a response. Not decoration. A visual language for the conversation.</p>
          <div className="presence-states"><span><i className="state-rest" /> AT REST</span><span><i className="state-listen" /> LISTENING</span><span><i className="state-think" /> THINKING</span><span><i className="state-speak" /> SPEAKING</span></div>
          <div className="presence-spec"><span>FIELD TYPE</span><b>RESPONSIVE / LUMINOUS</b><span>INPUT</span><b>VOICE + CONVERSATION</b></div>
        </div>
        <motion.div className="presence-visual" initial={{ opacity: 0, scale: 0.9, filter: "blur(14px)" }} whileInView={{ opacity: 1, scale: 1, filter: "blur(0px)" }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 1.15 }}>
          <div className="presence-grid" /><div className="presence-orbit presence-orbit-a" /><div className="presence-orbit presence-orbit-b" />
          <NeuralOrb className="presence-orb" label="ANA's animated light field, moving with conversation states" />
          <div className="presence-coordinate coord-a">CORE / ACTIVE</div><div className="presence-coordinate coord-b">SYNCHRONIZED</div><div className="presence-coordinate coord-c">001 : 001</div><div className="presence-crosshair" />
        </motion.div>
      </section>

      <section className="lux-personality section-shell" id="personality">
        <div className="lux-section-meta"><span>04 / A PERSONAL RHYTHM</span><span>SAME INTELLIGENCE. DIFFERENT ENERGY.</span></div>
        <div className="lux-personality-layout">
          <motion.div className="personality-copy" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={rise}>
            <h2>Meet the moment<br />with <em>your own energy.</em></h2>
            <p>Some days call for focus. Others for curiosity, warmth or a little room to breathe. Set the tone and let the conversation find its rhythm.</p>
            <div className="personality-foot"><span>01—04</span><i /> LIVE STYLE PREVIEW</div>
          </motion.div>
          <motion.div className="lux-personality-demo" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={rise}>
            <div className="demo-console-head"><span><i /> LIVE PREVIEW</span><b>ANA / PERSONALITY ENGINE</b></div>
            <div className="lux-mood-tabs" role="group" aria-label="Choose a conversation style">
              {Object.keys(moods).map((mood) => <button key={mood} className={activeMood === mood ? "active" : ""} onClick={() => setActiveMood(mood as keyof typeof moods)} aria-pressed={activeMood === mood}>{mood}</button>)}
            </div>
            <div className="lux-demo-message">
              <div className="lux-demo-avatar"><span>A</span><i /></div>
              <div className="lux-demo-content"><div className="lux-demo-meta">ANA <span>· A MOMENT WITH YOU</span></div>
                <motion.p key={activeMood} initial={{ opacity: 0, y: 10, filter: "blur(5px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: 0.4 }}>{moods[activeMood]}</motion.p>
              </div>
            </div>
            <div className="demo-console-foot"><span>STYLE ACTIVE</span><b>{activeMood.toUpperCase()}</b><i /></div>
          </motion.div>
        </div>
      </section>

      <section className="lux-principles section-shell" id="principles">
        <div className="lux-section-meta"><span>05 / QUIETLY CONSIDERED</span><span>CAPABILITY WITH CLARITY</span></div>
        <div className="principles-layout">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={rise}>
            <h2>Power, without<br /><em>the performance.</em></h2>
            <p>Useful intelligence should be clear about what it is, what it can do, and where your control begins.</p>
          </motion.div>
          <div className="lux-principle-list">
            <motion.div className="lux-principle" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={rise}><span>01</span><div><h3>Clarity over claims.</h3><p>ANA helps you think, create and plan — without pretending to control your world.</p></div><ShieldCheck size={18} /></motion.div>
            <motion.div className="lux-principle" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={rise}><span>02</span><div><h3>Designed around you.</h3><p>Your tone, your pace and your way of exploring an idea remain yours to shape.</p></div><Fingerprint size={18} /></motion.div>
            <motion.div className="lux-principle" initial="hidden" whileInView="visible" viewport={{ once: true }} variants={rise}><span>03</span><div><h3>Nothing to install.</h3><p>Open the experience in a browser. No local model downloads or complex setup.</p></div><Orbit size={18} /></motion.div>
          </div>
        </div>
      </section>

      <section className="lux-closing">
        <div className="closing-star star-one" /><div className="closing-star star-two" /><div className="closing-star star-three" />
        <motion.div className="lux-closing-content" initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={rise}>
          <div className="lux-eyebrow"><span className="eyebrow-pulse" /> THE NEXT THOUGHT IS YOURS</div>
          <h2>Make space<br />for <em>possibility.</em></h2>
          <p>Bring the question. Follow where it leads.</p>
          <Link href="/app" className="lux-primary-button closing-button">Begin with ANA <ArrowUpRight size={17} /></Link>
        </motion.div>
        <div className="closing-orbit-art"><div /><div /><div /><span>A</span></div>
      </section>

      <footer className="lux-footer">
        <Link className="lux-brand" href="/"><span className="lux-brand-symbol"><span>A</span><i /></span><span className="lux-brand-name">ANA<span>®</span></span></Link>
        <span className="lux-footer-tagline">A DIFFERENT KIND OF INTELLIGENCE.</span>
        <div className="lux-footer-right"><span>MADE FOR THE WEB</span><span>© {new Date().getFullYear()} ANA</span></div>
      </footer>
    </main>
  );
}
