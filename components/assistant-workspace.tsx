"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowUp, Clipboard, History, Menu, MessageCircle, Mic, MicOff, Moon, Plus, Settings, Sun, Volume2, X } from "lucide-react";
import { NeuralOrb, type OrbState } from "@/components/neural-orb";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

type Mood = "warm" | "focused" | "playful" | "calm" | "professional" | "supportive";
type Message = { id: string; role: "user" | "assistant"; content: string; createdAt: number };
type Conversation = { id: string; title: string; createdAt: number; messages: Message[] };
type RecognitionAlternativeLike = { transcript: string };
type RecognitionResultLike = { isFinal: boolean; length: number; [index: number]: RecognitionAlternativeLike };
type RecognitionEventLike = { resultIndex: number; results: { length: number; [index: number]: RecognitionResultLike } };
type RecognitionErrorLike = { error: string };
type RecognitionLike = {
  lang: string;
  interimResults: boolean;
  continuous: boolean;
  onstart: (() => void) | null;
  onresult: ((event: RecognitionEventLike) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: RecognitionErrorLike) => void) | null;
  start: () => void;
  stop: () => void;
};
type SpeechWindow = Window & {
  SpeechRecognition?: new () => RecognitionLike;
  webkitSpeechRecognition?: new () => RecognitionLike;
};

const STORAGE_KEY = "ana-next-conversations-v1";
const MOODS: { value: Mood; label: string; hint: string }[] = [
  { value: "warm", label: "Warm & thoughtful", hint: "A little warmth, a lot of thought." },
  { value: "focused", label: "Focused & direct", hint: "Clear, direct and to the point." },
  { value: "playful", label: "Playful & light", hint: "Light-hearted, curious and creative." },
  { value: "calm", label: "Calm & gentle", hint: "A gentler pace, without pressure." },
  { value: "professional", label: "Professional", hint: "Polished, precise and considered." },
  { value: "supportive", label: "Supportive", hint: "Patient, encouraging and thoughtful." },
];

function makeId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : String(Date.now()) + Math.random().toString(16).slice(2);
}

function titleFromPrompt(text: string) {
  const trimmed = text.trim();
  return trimmed.length > 42 ? trimmed.slice(0, 42).trimEnd() + "…" : trimmed || "New conversation";
}

export function AssistantWorkspace() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);
  const [input, setInput] = useState("");
  const [mood, setMood] = useState<Mood>("warm");
  const [orbState, setOrbState] = useState<OrbState>("idle");
  const [audioLevel, setAudioLevel] = useState(0);
  const [busy, setBusy] = useState(false);
  const [modelStatus, setModelStatus] = useState("Connecting");
  const [composerStatus, setComposerStatus] = useState("ANA can make mistakes. Check important information.");
  const [historyOpen, setHistoryOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const [speakReplies, setSpeakReplies] = useState(false);
  const [voiceURI, setVoiceURI] = useState("");
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [listening, setListening] = useState(false);
  const [toast, setToast] = useState("");
  const recognitionRef = useRef<RecognitionLike | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const meterFrameRef = useRef<number | null>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation.id === activeId) ?? null,
    [conversations, activeId],
  );
  const currentMood = MOODS.find((item) => item.value === mood) ?? MOODS[0];

  const notify = useCallback((message: string) => {
    setToast(message);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => setToast(""), 2600);
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as Conversation[];
          if (Array.isArray(parsed)) {
            setConversations(parsed);
            if (parsed[0]?.id) setActiveId(parsed[0].id);
          }
        }
        setTheme(localStorage.getItem("ana-next-theme") === "light" ? "light" : "dark");
        setSpeakReplies(localStorage.getItem("ana-next-speak") === "true");
        setMood((localStorage.getItem("ana-next-mood") as Mood) || "warm");
      } catch (cause) {
        console.warn("ANA could not restore browser preferences:", cause);
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations.slice(0, 40)));
    } catch (cause) {
      console.warn("ANA could not persist this conversation in browser storage:", cause);
    }
  }, [conversations, ready]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("ana-next-theme", theme);
    document.documentElement.dataset.theme = theme;
  }, [theme, ready]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("ana-next-speak", String(speakReplies));
  }, [speakReplies, ready]);

  useEffect(() => {
    if (!ready) return;
    localStorage.setItem("ana-next-mood", mood);
  }, [mood, ready]);

  useEffect(() => {
    const loadVoices = () => {
      if ("speechSynthesis" in window) setVoices(window.speechSynthesis.getVoices());
    };
    loadVoices();
    if ("speechSynthesis" in window) window.speechSynthesis.addEventListener("voiceschanged", loadVoices);
    return () => {
      if ("speechSynthesis" in window) window.speechSynthesis.removeEventListener("voiceschanged", loadVoices);
    };
  }, []);

  useEffect(() => {
    fetch("/api/health")
      .then(async (response) => {
        const data = await response.json() as {
          available?: boolean;
          primaryProvider?: "openrouter" | "cloudflare" | null;
        };
        if (response.ok && data.available) {
          setModelStatus(data.primaryProvider === "openrouter" ? "OpenRouter ready" : "Cloudflare fallback ready");
        } else {
          setModelStatus("AI not configured");
          setComposerStatus("Add OPENROUTER_API_KEY as a Cloudflare Worker secret. Cloudflare Workers AI can remain enabled as an optional fallback.");
        }
      })
      .catch(() => {
        setModelStatus("Preview mode");
        setComposerStatus("The interface is ready. Deploy ANA with its OpenRouter secret to enable conversations; Cloudflare AI can remain as a fallback.");
      });
  }, []);

  useEffect(() => () => {
    if (meterFrameRef.current) cancelAnimationFrame(meterFrameRef.current);
    streamRef.current?.getTracks().forEach((track) => track.stop());
    void audioContextRef.current?.close();
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
  }, []);

  const newConversation = useCallback(() => {
    setActiveId(null);
    setHistoryOpen(false);
    setSidebarOpen(false);
    setInput("");
    setOrbState("idle");
    textareaRef.current?.focus();
  }, []);

  const stopMeter = useCallback(() => {
    if (meterFrameRef.current) cancelAnimationFrame(meterFrameRef.current);
    meterFrameRef.current = null;
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    void audioContextRef.current?.close();
    audioContextRef.current = null;
    setAudioLevel(0);
    setListening(false);
    setOrbState("idle");
  }, []);

  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window)) {
      notify("Speech playback is not available in this browser.");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const chosen = voices.find((voice) => voice.voiceURI === voiceURI);
    if (chosen) utterance.voice = chosen;
    utterance.rate = 1;
    utterance.pitch = 1.02;
    utterance.onstart = () => setOrbState("speaking");
    utterance.onend = () => setOrbState("idle");
    utterance.onerror = () => setOrbState("idle");
    window.speechSynthesis.speak(utterance);
  }, [notify, voiceURI, voices]);

  const startMeter = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      audioContext.createMediaStreamSource(stream).connect(analyser);
      const samples = new Uint8Array(analyser.fftSize);
      let lastUpdate = 0;
      const sample = (time: number) => {
        analyser.getByteTimeDomainData(samples);
        let square = 0;
        for (const value of samples) {
          const normalized = (value - 128) / 128;
          square += normalized * normalized;
        }
        const rms = Math.sqrt(square / samples.length);
        if (time - lastUpdate > 70) {
          setAudioLevel(Math.min(1, rms * 4.2));
          lastUpdate = time;
        }
        meterFrameRef.current = requestAnimationFrame(sample);
      };
      meterFrameRef.current = requestAnimationFrame(sample);
      return true;
    } catch {
      notify("Microphone permission is needed for voice input.");
      return false;
    }
  }, [notify]);

  const toggleVoice = useCallback(async () => {
    if (listening) {
      recognitionRef.current?.stop();
      stopMeter();
      return;
    }
    const speechWindow = window as SpeechWindow;
    const Recognition = speechWindow.SpeechRecognition ?? speechWindow.webkitSpeechRecognition;
    if (!Recognition) {
      notify("Voice recognition is not supported in this browser. You can still use text chat.");
      return;
    }
    const granted = await startMeter();
    if (!granted) return;
    const recognition = new Recognition();
    recognition.lang = navigator.language || "en-US";
    recognition.interimResults = true;
    recognition.continuous = false;
    recognition.onstart = () => {
      setListening(true);
      setOrbState("listening");
    };
    recognition.onresult = (event) => {
      let transcript = "";
      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        transcript += event.results[index][0].transcript;
      }
      setInput(transcript);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
        textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 170) + "px";
      }
    };
    recognition.onerror = (event) => {
      if (event.error === "not-allowed") notify("Microphone access was denied.");
      else if (event.error !== "no-speech" && event.error !== "aborted") notify("Voice recognition stopped. Please try again.");
    };
    recognition.onend = () => {
      stopMeter();
      recognitionRef.current = null;
    };
    recognitionRef.current = recognition;
    try {
      recognition.start();
    } catch {
      stopMeter();
      notify("Voice input could not start. Please try again.");
    }
  }, [listening, notify, startMeter, stopMeter]);

  const sendMessage = useCallback(async (override?: string) => {
    const prompt = (override ?? input).trim();
    if (!prompt || busy) return;

    let conversationId = activeId;
    let nextMessages: Message[];
    const now = Date.now();
    const userMessage: Message = { id: makeId(), role: "user", content: prompt, createdAt: now };
    const existing = conversations.find((conversation) => conversation.id === activeId);

    if (existing) {
      nextMessages = [...existing.messages, userMessage];
      setConversations((current) => current.map((conversation) =>
        conversation.id === activeId ? { ...conversation, messages: nextMessages } : conversation,
      ));
    } else {
      conversationId = makeId();
      nextMessages = [userMessage];
      const newItem: Conversation = {
        id: conversationId,
        title: titleFromPrompt(prompt),
        createdAt: now,
        messages: nextMessages,
      };
      setConversations((current) => [newItem, ...current]);
      setActiveId(conversationId);
    }

    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "";
    setBusy(true);
    setModelStatus("ANA is thinking");
    setOrbState("thinking");
    setHistoryOpen(false);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.slice(-16).map(({ role, content }) => ({ role, content })),
          mood,
        }),
      });
      const data = await response.json() as { response?: string; error?: string; provider?: "openrouter" | "cloudflare" };
      if (!response.ok) throw new Error(data.error || "The AI service is unavailable.");
      if (!data.response?.trim()) throw new Error("ANA returned an empty response.");
      const assistantMessage: Message = {
        id: makeId(),
        role: "assistant",
        content: data.response.trim(),
        createdAt: Date.now(),
      };
      setConversations((current) => current.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, messages: [...conversation.messages, assistantMessage] }
          : conversation,
      ));
      setModelStatus(data.provider === "openrouter" ? "OpenRouter · Free" : "Cloudflare fallback");
      setOrbState("idle");
      if (speakReplies) speak(assistantMessage.content);
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Something unexpected happened.";
      const assistantMessage: Message = {
        id: makeId(),
        role: "assistant",
        content: "I couldn't reach my thinking service just now. " + message + " Please try again shortly.",
        createdAt: Date.now(),
      };
      setConversations((current) => current.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, messages: [...conversation.messages, assistantMessage] }
          : conversation,
      ));
      setModelStatus("Connection unavailable");
      setOrbState("idle");
    } finally {
      setBusy(false);
      textareaRef.current?.focus();
    }
  }, [activeId, busy, conversations, input, mood, speak, speakReplies]);

  const copyMessage = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      notify("Copied to clipboard.");
    } catch {
      notify("Clipboard access is unavailable in this browser.");
    }
  }, [notify]);

  const clearHistory = () => {
    if (!window.confirm("Delete all conversations saved in this browser? This cannot be undone.")) return;
    setConversations([]);
    setActiveId(null);
    setSettingsOpen(false);
    notify("Conversation history cleared.");
  };

  const selectConversation = (id: string) => {
    setActiveId(id);
    setHistoryOpen(false);
    setSidebarOpen(false);
  };

  const suggestions = [
    { number: "01 / EXPLORE", title: "Think through an idea", prompt: "Help me think through an idea I've been exploring." },
    { number: "02 / LEARN", title: "Learn something new", prompt: "Teach me something interesting in a simple, engaging way." },
    { number: "03 / ORGANIZE", title: "Make a thoughtful plan", prompt: "Help me make a clear plan for something I need to do." },
    { number: "04 / CREATE", title: "Create something", prompt: "Let's create something together. Help me get started." },
  ];

  const messages = activeConversation?.messages ?? [];
  const workspaceTitle = historyOpen ? "Your conversations." : activeConversation?.title ?? "A moment to think.";

  return (
    <main className={theme === "light" ? "app-body light-theme" : "app-body"}>
      <div className="app-shell">
        <aside className={sidebarOpen ? "sidebar open" : "sidebar"} id="sidebar">
          <Link className="brand" href="/"><span className="brand-mark">A</span><span>ANA</span></Link>
          <button className="new-chat" onClick={newConversation}><Plus size={16} /> New conversation <kbd>Ctrl K</kbd></button>
          <div className="sidebar-label">YOUR SPACE</div>
          <button className={!historyOpen ? "side-link active" : "side-link"} onClick={() => { setHistoryOpen(false); setSidebarOpen(false); }}><MessageCircle size={15} /> Conversation</button>
          <button className={historyOpen ? "side-link active" : "side-link"} onClick={() => { setHistoryOpen(true); setSidebarOpen(false); }}><History size={15} /> Recent conversations</button>
          <div className="sidebar-bottom">
            <div className="sidebar-label">PREFERENCES</div>
            <button className="side-link" onClick={() => setSettingsOpen(true)}><Settings size={15} /> Settings</button>
            <Link className="side-link" href="/"><ArrowLeft size={15} /> Back to ANA</Link>
            <div className="sidebar-profile"><span className="profile-avatar">A</span><span><b>Guest space</b><small>Stored in this browser</small></span><span className="profile-dot" /></div>
          </div>
        </aside>

        <section className="workspace">
          <header className="workspace-header">
            <div className="workspace-heading"><span className="workspace-kicker">YOUR SPACE / <span>{historyOpen ? "HISTORY" : "CONVERSATION"}</span></span><h1>{workspaceTitle}</h1></div>
            <div className="workspace-tools">
              <span className="model-indicator"><i className={modelStatus.includes("unavailable") || modelStatus.includes("not configured") ? "status-dot status-off" : "status-dot"} />{modelStatus}</span>
              <button className="icon-button" onClick={() => setSettingsOpen(true)} aria-label="Open settings" title="Settings"><Settings size={16} /></button>
              <button className="icon-button mobile-sidebar-toggle" onClick={() => setSidebarOpen(!sidebarOpen)} aria-label="Toggle menu">{sidebarOpen ? <X size={17} /> : <Menu size={17} />}</button>
            </div>
          </header>

          <section className="chat-view" id="chat-view">
            {historyOpen ? (
              <div className="messages history-view">
                <div className="eyebrow">YOUR SPACE / HISTORY</div>
                <h2 className="history-title">Conversations.</h2>
                {!conversations.length ? <p className="empty-history">Your conversations will appear here after you begin.</p> : conversations.map((conversation) => (
                  <button className="history-row" key={conversation.id} onClick={() => selectConversation(conversation.id)}>
                    <span><b>{conversation.title}</b><small>{conversation.messages.length} messages</small></span>
                    <time>{new Date(conversation.createdAt).toLocaleDateString()}</time>
                  </button>
                ))}
              </div>
            ) : messages.length ? (
              <div className="messages" aria-live="polite">
                <div className="conversation-orb-strip"><NeuralOrb className="conversation-orb" state={orbState} audioLevel={audioLevel} label="ANA activity sphere" /><span>ANA / {orbState === "idle" ? "HERE WITH YOU" : orbState.toUpperCase()}</span></div>
                {messages.map((message) => (
                  <article className={"message " + message.role} key={message.id}>
                    <div className="message-avatar">{message.role === "assistant" ? "A" : "Y"}</div>
                    <div className="message-content">
                      {message.role === "assistant" && <div className="message-label">ANA <span>· RESPONSE</span></div>}
                      <div className="message-text"><ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown></div>
                      {message.role === "assistant" && <div className="message-actions">
                        <button onClick={() => void copyMessage(message.content)}><Clipboard size={12} /> Copy</button>
                        <button onClick={() => speak(message.content)}><Volume2 size={12} /> Read aloud</button>
                      </div>}
                    </div>
                  </article>
                ))}
                {busy && <article className="message"><div className="message-avatar">A</div><div className="message-content"><div className="message-label">ANA · THINKING</div><div className="typing-indicator"><i /><i /><i /></div></div></article>}
              </div>
            ) : (
              <div className="conversation-welcome">
                <div className="app-orb-wrap"><NeuralOrb className="app-orb" state={orbState} audioLevel={audioLevel} /><span className="orb-live-label"><i /> {orbState === "listening" ? "LISTENING" : orbState === "thinking" ? "THINKING" : orbState === "speaking" ? "SPEAKING" : "HERE WITH YOU"}</span></div>
                <div className="welcome-copy"><div className="eyebrow"><span className="eyebrow-line" /> HELLO, I&apos;M ANA</div><h2>Where shall we<br /><em>begin?</em></h2><p>Bring a question, a half-formed idea, or simply a thought you want to explore.</p></div>
                <div className="suggestion-grid">{suggestions.map((item) => <button className="suggestion-card" key={item.number} onClick={() => void sendMessage(item.prompt)} disabled={busy}><span>{item.number}</span><b>{item.title}</b><i>↗</i></button>)}</div>
              </div>
            )}
          </section>

          <footer className="composer-area">
            <div className="mood-control"><span>CONVERSATION STYLE</span><div className="mood-select-wrap"><select value={mood} onChange={(event) => setMood(event.target.value as Mood)} aria-label="Conversation style">{MOODS.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></div><span className="mood-hint">{currentMood.hint}</span></div>
            <div className="composer">
              <textarea ref={textareaRef} value={input} onChange={(event) => setInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); void sendMessage(); } }} rows={1} placeholder="Ask ANA anything. Start wherever you are..." aria-label="Message ANA" />
              <div className="composer-actions">
                <div className="composer-left"><button className={listening ? "composer-icon recording" : "composer-icon"} onClick={() => void toggleVoice()} aria-label={listening ? "Stop voice input" : "Start voice input"} title={listening ? "Stop listening" : "Voice input"}>{listening ? <MicOff size={16} /> : <Mic size={16} />}</button><span className="voice-caption">{listening ? "LISTENING" : "VOICE"}</span></div>
                <div className="composer-right"><span className="enter-hint">ENTER TO SEND · SHIFT + ENTER FOR NEW LINE</span><button className="send-button" onClick={() => void sendMessage()} disabled={!input.trim() || busy} aria-label="Send message"><ArrowUp size={18} /></button></div>
              </div>
            </div>
            <div className="composer-disclaimer">{composerStatus}</div>
          </footer>
        </section>
      </div>

      {settingsOpen && <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setSettingsOpen(false); }}>
        <section className="settings-modal" role="dialog" aria-modal="true" aria-labelledby="settings-title">
          <div className="modal-heading"><div><span className="workspace-kicker">MAKE IT YOURS</span><h2 id="settings-title">Your preferences.</h2></div><button className="icon-button" onClick={() => setSettingsOpen(false)} aria-label="Close settings"><X size={17} /></button></div>
          <div className="settings-group"><h3>APPEARANCE</h3><div className="setting-row"><div><b>Atmosphere</b><small>Choose the mood of your workspace.</small></div><div className="theme-switch"><button className={theme === "dark" ? "selected" : ""} onClick={() => setTheme("dark")}><Moon size={13} /> Obsidian</button><button className={theme === "light" ? "selected" : ""} onClick={() => setTheme("light")}><Sun size={13} /> Luminous</button></div></div></div>
          <div className="settings-group"><h3>VOICE</h3><div className="setting-row"><div><b>Read responses aloud</b><small>Use a voice available in your browser.</small></div><label className="switch"><input type="checkbox" checked={speakReplies} onChange={(event) => setSpeakReplies(event.target.checked)} /><span /></label></div><div className="setting-row"><div><b>Voice</b><small>Choose a voice supported by this browser.</small></div><select className="setting-select" value={voiceURI} onChange={(event) => setVoiceURI(event.target.value)}><option value="">System default</option>{voices.map((voice) => <option key={voice.voiceURI} value={voice.voiceURI}>{voice.name} ({voice.lang})</option>)}</select></div></div>
          <div className="settings-group"><h3>YOUR DATA</h3><div className="setting-row"><div><b>Conversation history</b><small>Saved only in this browser.</small></div><button className="button button-danger" onClick={clearHistory}>Clear history</button></div></div>
          <p className="modal-footnote">Conversation history stays in this browser. Messages are sent to ANA&apos;s hosted inference service to generate replies. Microphone use begins only when you choose voice input.</p>
        </section>
      </div>}
      {toast && <div className="toast" role="status">{toast}</div>}
    </main>
  );
}
