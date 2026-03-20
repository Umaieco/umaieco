import { useState, useEffect, useRef } from "react";
import { translations } from "./translations.js";

// --- Image paths (from /public) ---
const IMG = {
  bottles: "/bottles-hq.png",
  sachets: "/sachets-hq.png",
  sachet: "/sachet-hq.png",
  honey250: "/honey250-hq.jpg",
  honey120: "/honey120-hq.jpg",
  honey500: "/honey500-hq.jpg",
  valley1: "/valley1-hq.jpg",
  valley2: "/valley2-hq.jpg",
};

// --- Hooks ---
function useInView(threshold = 0.12) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
}

function useParallax() {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const h = () => setOffset(window.scrollY);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return offset;
}

function useCounter(target, duration = 2000, start = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!start) return;
    let startTime = null;
    const num = parseInt(target.toString().replace(/[^0-9]/g, "")) || 0;
    const step = (ts) => {
      if (!startTime) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(eased * num));
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [start, target, duration]);
  return count;
}

// --- Reusable Components ---
function FadeIn({ children, delay = 0, direction = "up", className = "" }) {
  const [ref, visible] = useInView();
  const transforms = { up: "translateY(40px)", down: "translateY(-40px)", left: "translateX(40px)", right: "translateX(-40px)", none: "none" };
  return (
    <div ref={ref} className={className} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "translate(0)" : transforms[direction],
      transition: `opacity 0.9s cubic-bezier(0.22,1,0.36,1) ${delay}s, transform 0.9s cubic-bezier(0.22,1,0.36,1) ${delay}s`
    }}>{children}</div>
  );
}

function ScaleIn({ children, delay = 0 }) {
  const [ref, visible] = useInView();
  return (
    <div ref={ref} style={{
      opacity: visible ? 1 : 0,
      transform: visible ? "scale(1)" : "scale(0.92)",
      transition: `opacity 0.8s ease ${delay}s, transform 0.8s cubic-bezier(0.22,1,0.36,1) ${delay}s`
    }}>{children}</div>
  );
}

function StatCounter({ value, label, delay = 0 }) {
  const [ref, visible] = useInView();
  const count = useCounter(value, 2000, visible);
  const suffix = value.toString().replace(/[0-9]/g, "");
  return (
    <div ref={ref} style={{ textAlign: "center", padding: "20px 0" }}>
      <div style={{
        fontFamily: "var(--font-display)", fontSize: "clamp(36px, 5vw, 56px)", fontWeight: 300, color: "var(--gold)",
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(20px)",
        transition: `all 0.8s ease ${delay}s`
      }}>{count.toLocaleString()}{suffix}</div>
      <div style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "rgba(255,255,255,0.6)", letterSpacing: "0.1em", textTransform: "uppercase", marginTop: 4 }}>{label}</div>
    </div>
  );
}

function SectionTag({ children, light = false }) {
  return <div style={{ letterSpacing: "0.3em", textTransform: "uppercase", fontSize: 11, color: light ? "rgba(255,255,255,0.5)" : "var(--gold)", marginBottom: 14, fontFamily: "var(--font-body)", fontWeight: 300 }}>{children}</div>;
}

function SectionTitle({ children, light = false }) {
  return <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(30px, 4.5vw, 54px)", fontWeight: 300, color: light ? "#fff" : "var(--dark)", lineHeight: 1.1, marginBottom: 20, letterSpacing: "-0.02em", whiteSpace: "pre-line" }}>{children}</h2>;
}

function ProductCard({ product, image, reverse = false }) {
  const [hover, setHover] = useState(false);
  return (
    <FadeIn delay={0.1}>
      <div style={{
        display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "clamp(24px, 4vw, 64px)",
        marginBottom: 80, alignItems: "center"
      }}>
        <div style={{ order: reverse ? 1 : 0 }}>
          <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} style={{
            background: "linear-gradient(145deg, #f8f5f0, #ede6d8)", borderRadius: 24, padding: "clamp(24px, 4vw, 48px)",
            display: "flex", alignItems: "center", justifyContent: "center", minHeight: 380,
            transition: "transform 0.5s cubic-bezier(0.22,1,0.36,1), box-shadow 0.5s ease",
            transform: hover ? "translateY(-8px)" : "translateY(0)",
            boxShadow: hover ? "0 24px 48px rgba(42,37,32,0.1)" : "0 4px 12px rgba(42,37,32,0.04)",
            overflow: "hidden"
          }}>
            <img src={image} alt={product.name} loading="lazy" style={{
              maxWidth: "100%", maxHeight: 340, objectFit: "contain",
              transition: "transform 0.6s cubic-bezier(0.22,1,0.36,1)",
              transform: hover ? "scale(1.05)" : "scale(1)"
            }} />
          </div>
        </div>
        <div>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 300, marginBottom: 8, color: "var(--dark)", lineHeight: 1.15 }}>{product.name}</h3>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--gold)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 20, fontWeight: 300 }}>{product.sub}</p>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--warm)", lineHeight: 1.8, fontWeight: 300, marginBottom: 28 }}>{product.desc}</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            {[product.b1, product.b2, product.b3, product.b4].map((b, j) => (
              <div key={j} style={{
                padding: "12px 16px", background: "rgba(248,245,240,0.8)", borderRadius: 10,
                fontFamily: "var(--font-body)", fontSize: 13, color: "var(--dark)", fontWeight: 300,
                border: "1px solid var(--border)"
              }}>
                <span style={{ color: "var(--gold)", marginRight: 8, fontSize: 8, verticalAlign: "middle" }}>◆</span>{b}
              </div>
            ))}
          </div>
        </div>
      </div>
    </FadeIn>
  );
}

// --- Styles ---
const bodyText = { fontFamily: "var(--font-body)", fontSize: 15, color: "var(--warm)", lineHeight: 1.8, fontWeight: 300 };
const btnPrimary = { fontFamily: "var(--font-body)", fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", padding: "15px 40px", background: "var(--dark)", color: "#fff", border: "none", borderRadius: 4, cursor: "pointer", transition: "all 0.4s cubic-bezier(0.22,1,0.36,1)", fontWeight: 400 };
const btnSecondary = { fontFamily: "var(--font-body)", fontSize: 12, letterSpacing: "0.18em", textTransform: "uppercase", padding: "15px 40px", background: "transparent", color: "var(--dark)", border: "1px solid var(--dark)", borderRadius: 4, cursor: "pointer", transition: "all 0.4s", fontWeight: 400 };
const btnGold = { ...btnPrimary, background: "var(--gold)" };
const inputStyle = { fontFamily: "var(--font-body)", fontSize: 14, padding: "15px 20px", border: "1px solid var(--border)", borderRadius: 6, outline: "none", background: "transparent", color: "var(--dark)", fontWeight: 300, transition: "border-color 0.3s" };

// ============================================================
// MAIN APP
// ============================================================
export default function App() {
  const [lang, setLang] = useState("en");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [emailSub, setEmailSub] = useState("");
  const [subDone, setSubDone] = useState(false);
  const [formData, setFormData] = useState({ name:"", email:"", company:"", type:"", msg:"" });
  const [formSent, setFormSent] = useState(false);
  const scrollY = useParallax();
  const t = translations[lang];

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  const goSection = (id) => {
    setMenuOpen(false);
    setTimeout(() => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" }), 50);
  };

  const navItems = [
    { key: "home", label: t.nav.home, action: () => window.scrollTo({ top: 0, behavior: "smooth" }) },
    { key: "about", label: t.nav.about, action: () => goSection("about") },
    { key: "products", label: t.nav.products, action: () => goSection("products") },
    { key: "farm", label: t.nav.farm, action: () => goSection("farm") },
    { key: "benefits", label: t.nav.benefits, action: () => goSection("benefits") },
    { key: "partners", label: t.nav.partners, action: () => goSection("partners") },
    { key: "contact", label: t.nav.contact, action: () => goSection("contact") },
  ];

  return (
    <>
      {/* ========== NAVIGATION ========== */}
      <nav style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: scrolled ? "rgba(255,255,255,0.96)" : "transparent",
        backdropFilter: scrolled ? "blur(24px)" : "none",
        WebkitBackdropFilter: scrolled ? "blur(24px)" : "none",
        borderBottom: scrolled ? "1px solid rgba(232,226,216,0.6)" : "none",
        transition: "all 0.5s cubic-bezier(0.22,1,0.36,1)", padding: "0 clamp(16px, 3vw, 32px)"
      }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: scrolled ? 64 : 76, transition: "height 0.4s ease" }}>
          <div onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{ cursor: "pointer", display: "flex", alignItems: "baseline", gap: 8 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: scrolled ? 24 : 28, fontWeight: 400, color: "var(--dark)", letterSpacing: "0.06em", transition: "font-size 0.4s" }}>UMAI</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 9, letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--gold)", fontWeight: 300 }}>ECO</span>
          </div>
          <div className="nav-links" style={{ display: "flex", alignItems: "center", gap: "clamp(20px, 2.5vw, 36px)" }}>
            {navItems.map(n => (
              <span key={n.key} onClick={n.action} style={{
                fontFamily: "var(--font-body)", fontSize: 11, letterSpacing: "0.14em", textTransform: "uppercase",
                color: "var(--warm)", cursor: "pointer", fontWeight: 300, transition: "color 0.3s", paddingBottom: 3
              }}
              onMouseEnter={e => e.target.style.color = "var(--dark)"}
              onMouseLeave={e => e.target.style.color = "var(--warm)"}
              >{n.label}</span>
            ))}
            <button onClick={() => setLang(lang === "en" ? "ru" : "en")} style={{
              fontFamily: "var(--font-body)", fontSize: 10, letterSpacing: "0.2em", padding: "5px 12px",
              border: "1px solid var(--border)", borderRadius: 3, background: "transparent", cursor: "pointer", color: "var(--warm)", fontWeight: 300
            }}>{lang === "en" ? "RU" : "EN"}</button>
          </div>
          <button className="mob-btn" onClick={() => setMenuOpen(!menuOpen)} style={{
            display: "none", flexDirection: "column", gap: 5, background: "none", border: "none", cursor: "pointer", padding: 10, zIndex: 1001, boxShadow: "none"
          }}>
            <span style={{ width: 22, height: 1.5, background: "var(--dark)", display: "block", transition: "all 0.4s", transform: menuOpen ? "rotate(45deg) translate(4.5px, 4.5px)" : "none" }}/>
            <span style={{ width: 22, height: 1.5, background: "var(--dark)", display: "block", transition: "all 0.3s", opacity: menuOpen ? 0 : 1 }}/>
            <span style={{ width: 22, height: 1.5, background: "var(--dark)", display: "block", transition: "all 0.4s", transform: menuOpen ? "rotate(-45deg) translate(4.5px, -4.5px)" : "none" }}/>
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="mobile-overlay" style={{
          position: "fixed", inset: 0, background: "rgba(255,255,255,0.98)", zIndex: 999,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 28
        }}>
          {navItems.map((n, i) => (
            <span key={n.key} onClick={() => { n.action(); setMenuOpen(false); }} style={{
              fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 300, color: "var(--dark)", cursor: "pointer",
              opacity: 0, animation: `fadeInUp 0.5s ease ${i * 0.08}s forwards`
            }}>{n.label}</span>
          ))}
          <button onClick={() => { setLang(lang === "en" ? "ru" : "en"); setMenuOpen(false); }} style={{
            fontFamily: "var(--font-body)", fontSize: 13, padding: "10px 28px", border: "1px solid var(--border)", borderRadius: 4, background: "transparent", cursor: "pointer", color: "var(--warm)", marginTop: 16
          }}>{lang === "en" ? "Русский" : "English"}</button>
        </div>
      )}

      {/* ========== HERO ========== */}
      <section style={{
        minHeight: "100vh", display: "flex", alignItems: "center", position: "relative", overflow: "hidden",
        background: "linear-gradient(175deg, #faf8f4 0%, #f5f0e8 35%, #ede6d8 70%, #e5ddd0 100%)"
      }}>
        <div style={{ position: "absolute", top: "5%", right: "8%", width: 400, height: 400, borderRadius: "50%", background: "radial-gradient(circle, rgba(184,151,90,0.06) 0%, transparent 70%)", transform: `translateY(${scrollY * 0.08}px)`, pointerEvents: "none" }}/>
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 160, opacity: 0.05 }}>
          <svg width="100%" height="160" preserveAspectRatio="none" viewBox="0 0 1440 160"><path d="M0 100 Q100 50 200 70 Q350 95 480 55 Q600 20 720 60 Q840 100 960 40 Q1100 -10 1250 50 Q1350 85 1440 35 L1440 160 L0 160Z" fill="var(--dark)"/></svg>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", maxWidth: 1200, width: "100%", padding: "140px clamp(20px, 4vw, 48px) 100px", gap: 48, alignItems: "center", margin: "0 auto", position: "relative", zIndex: 1 }}>
          <div>
            <FadeIn delay={0}><div style={{ width: 48, height: 1, background: "var(--gold)", marginBottom: 28, opacity: 0.6 }}/></FadeIn>
            <FadeIn delay={0.1}>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(38px, 6vw, 72px)", fontWeight: 300, lineHeight: 1.05, color: "var(--dark)", letterSpacing: "-0.03em", marginBottom: 24, whiteSpace: "pre-line" }}>{t.hero.headline}</h1>
            </FadeIn>
            <FadeIn delay={0.25}>
              <p style={{ fontFamily: "var(--font-body)", fontSize: "clamp(14px, 1.6vw, 17px)", color: "var(--warm)", lineHeight: 1.8, maxWidth: 480, marginBottom: 40, fontWeight: 300 }}>{t.hero.sub}</p>
            </FadeIn>
            <FadeIn delay={0.4}>
              <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                <button onClick={() => goSection("products")} style={btnPrimary}>{t.hero.cta1}</button>
                <button onClick={() => goSection("about")} style={btnSecondary}>{t.hero.cta2}</button>
              </div>
            </FadeIn>
          </div>
          <FadeIn delay={0.3} direction="left">
            <div className="hero-img" style={{ display: "flex", justifyContent: "center" }}>
              <img src={IMG.bottles} alt="Umai Eco Kumys" style={{ maxWidth: "100%", maxHeight: 520, objectFit: "contain", filter: "drop-shadow(0 20px 40px rgba(42,37,32,0.15))" }} />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ========== ABOUT ========== */}
      <section id="about" style={{ padding: "clamp(80px, 12vw, 140px) clamp(20px, 4vw, 48px)", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "clamp(32px, 5vw, 72px)", marginBottom: 72 }}>
            <FadeIn>
              <SectionTag>{t.about.tag}</SectionTag>
              <SectionTitle>{t.about.title}</SectionTitle>
              <div style={{ width: 48, height: 1, background: "var(--gold)", marginBottom: 28 }}/>
              <p style={{ ...bodyText, marginBottom: 20 }}>{t.about.p1}</p>
              <p style={bodyText}>{t.about.p2}</p>
            </FadeIn>
            <FadeIn delay={0.2} direction="left">
              <div style={{ position: "relative", borderRadius: 20, overflow: "hidden", minHeight: 360 }}>
                <img src={IMG.valley1} alt="Kyrgyzstan Valley" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", minHeight: 360 }} />
                <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, rgba(42,37,32,0.3), transparent 50%)" }}/>
                <div style={{ position: "absolute", bottom: 24, left: 24 }}>
                  <span style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "rgba(255,255,255,0.8)", letterSpacing: "0.15em", textTransform: "uppercase" }}>Kyrgyzstan · Tien Shan</span>
                </div>
              </div>
            </FadeIn>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 20 }}>
            {[
              { t: t.about.f1t, d: t.about.f1d, icon: "🏇" },
              { t: t.about.f2t, d: t.about.f2d, icon: "🌿" },
              { t: t.about.f3t, d: t.about.f3d, icon: "🫙" },
              { t: t.about.f4t, d: t.about.f4d, icon: "🔬" }
            ].map((f, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="product-hover" style={{ padding: 28, border: "1px solid var(--border)", borderRadius: 14, height: "100%", cursor: "default" }}>
                  <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
                  <h4 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 400, marginBottom: 8, color: "var(--dark)" }}>{f.t}</h4>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--warm)", lineHeight: 1.7, fontWeight: 300 }}>{f.d}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      <div className="shimmer-line" style={{ maxWidth: 200, margin: "0 auto" }}/>

      {/* ========== PRODUCTS ========== */}
      <section id="products" style={{ padding: "clamp(80px, 12vw, 140px) clamp(20px, 4vw, 48px)", background: "var(--cream)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 72 }}>
              <SectionTag>{t.products.tag}</SectionTag>
              <SectionTitle>{t.products.title}</SectionTitle>
              <p style={{ ...bodyText, maxWidth: 540, margin: "0 auto" }}>{t.products.sub}</p>
            </div>
          </FadeIn>
          <ProductCard product={t.products.k1} image={IMG.bottles} />
          <ProductCard product={t.products.k2} image={IMG.bottles} reverse />
          <ProductCard product={t.products.p1} image={IMG.sachets} />

          {/* Honey */}
          <FadeIn delay={0.1}>
            <div style={{ textAlign: "center", marginBottom: 40 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(26px, 3.5vw, 40px)", fontWeight: 300, color: "var(--dark)", marginBottom: 8 }}>{t.products.honey.name}</h3>
              <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--gold)", letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 300, marginBottom: 16 }}>{t.products.honey.sub}</p>
              <p style={{ ...bodyText, maxWidth: 540, margin: "0 auto 32px" }}>{t.products.honey.desc}</p>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 24, maxWidth: 720, margin: "0 auto 32px" }}>
              {[
                { img: IMG.honey120, label: "120g" },
                { img: IMG.honey250, label: "250g" },
                { img: IMG.honey500, label: "500g" }
              ].map((h, i) => (
                <ScaleIn key={i} delay={i * 0.1}>
                  <div className="product-hover" style={{
                    background: "linear-gradient(145deg, #fff, #f8f5f0)", borderRadius: 20, padding: 32,
                    display: "flex", flexDirection: "column", alignItems: "center", cursor: "default"
                  }}>
                    <img src={h.img} alt={`Honey ${h.label}`} loading="lazy" style={{ width: "100%", maxWidth: 180, objectFit: "contain", marginBottom: 16 }} />
                    <span style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--dark)" }}>{h.label}</span>
                  </div>
                </ScaleIn>
              ))}
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 10, maxWidth: 540, margin: "0 auto" }}>
              {[t.products.honey.b1, t.products.honey.b2, t.products.honey.b3, t.products.honey.b4].map((b, j) => (
                <div key={j} style={{ padding: "10px 12px", background: "rgba(255,255,255,0.8)", borderRadius: 8, fontFamily: "var(--font-body)", fontSize: 12, color: "var(--dark)", fontWeight: 300, textAlign: "center", border: "1px solid var(--border)" }}>{b}</div>
              ))}
            </div>
          </FadeIn>

          <FadeIn>
            <div className="shimmer-line" style={{ maxWidth: 120, margin: "48px auto 16px" }}/>
            <p style={{ textAlign: "center", fontFamily: "var(--font-body)", fontSize: 13, color: "var(--warm)", letterSpacing: "0.08em", fontWeight: 300 }}>{t.products.formats}</p>
          </FadeIn>
        </div>
      </section>

      {/* ========== FARM ========== */}
      <section id="farm">
        <div style={{ position: "relative", height: "clamp(300px, 50vw, 560px)", overflow: "hidden" }}>
          <img src={IMG.valley2} alt="Farm Valley" loading="lazy" style={{
            width: "100%", height: "100%", objectFit: "cover",
            transform: `translateY(${scrollY * 0.08}px) scale(1.1)`, transition: "transform 0.1s linear"
          }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(42,37,32,0.1), rgba(42,37,32,0.6))" }}/>
          <div style={{ position: "absolute", bottom: "clamp(24px, 5vw, 60px)", left: "clamp(20px, 5vw, 60px)", zIndex: 1 }}>
            <FadeIn>
              <SectionTag light>{t.farm.tag}</SectionTag>
              <h2 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(32px, 5vw, 60px)", fontWeight: 300, color: "#fff", lineHeight: 1.1, whiteSpace: "pre-line" }}>{t.farm.title}</h2>
            </FadeIn>
          </div>
        </div>
        <div style={{ background: "var(--dark)", padding: "clamp(28px, 4vw, 48px) 24px" }}>
          <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 8 }}>
            <StatCounter value={t.farm.s1t} label={t.farm.s1d} delay={0} />
            <StatCounter value={t.farm.s2t} label={t.farm.s2d} delay={0.1} />
            <StatCounter value={t.farm.s3t} label={t.farm.s3d} delay={0.2} />
            <StatCounter value={t.farm.s4t} label={t.farm.s4d} delay={0.3} />
          </div>
        </div>
        <div style={{ padding: "clamp(60px, 8vw, 100px) clamp(20px, 4vw, 48px)", background: "#fff" }}>
          <div style={{ maxWidth: 760, margin: "0 auto" }}>
            <FadeIn><p style={{ ...bodyText, fontSize: 17, marginBottom: 24, lineHeight: 1.9 }}>{t.farm.p1}</p></FadeIn>
            <FadeIn delay={0.1}><p style={{ ...bodyText, fontSize: 17, marginBottom: 24, lineHeight: 1.9 }}>{t.farm.p2}</p></FadeIn>
            <FadeIn delay={0.2}><p style={{ ...bodyText, fontSize: 17, fontStyle: "italic", lineHeight: 1.9 }}>{t.farm.p3}</p></FadeIn>
          </div>
        </div>
        <div style={{ height: "clamp(200px, 30vw, 360px)", overflow: "hidden" }}>
          <img src={IMG.valley1} alt="Alpine Meadow" loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      </section>

      {/* ========== HEALTH BENEFITS ========== */}
      <section id="benefits" style={{ padding: "clamp(80px, 12vw, 140px) clamp(20px, 4vw, 48px)", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeIn>
            <SectionTag>{t.benefits.tag}</SectionTag>
            <SectionTitle>{t.benefits.title}</SectionTitle>
            <p style={{ ...bodyText, maxWidth: 560, marginBottom: 56 }}>{t.benefits.sub}</p>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24, marginBottom: 72 }}>
            {[
              { t: t.benefits.b1t, d: t.benefits.b1d, color: "#7a9e7e", icon: "🦠" },
              { t: t.benefits.b2t, d: t.benefits.b2d, color: "#8baabe", icon: "💧" },
              { t: t.benefits.b3t, d: t.benefits.b3d, color: "#c6a87c", icon: "🛡️" },
              { t: t.benefits.b4t, d: t.benefits.b4d, color: "#d4a55a", icon: "☀️" }
            ].map((b, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="product-hover" style={{
                  padding: "clamp(24px, 3vw, 36px)", borderRadius: 18, background: "var(--cream)", height: "100%",
                  position: "relative", overflow: "hidden", cursor: "default"
                }}>
                  <div style={{ position: "absolute", top: -30, right: -30, width: 120, height: 120, borderRadius: "50%", background: b.color, opacity: 0.06 }}/>
                  <div style={{ fontSize: 32, marginBottom: 16 }}>{b.icon}</div>
                  <h4 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 400, marginBottom: 10, color: "var(--dark)" }}>{b.t}</h4>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--warm)", lineHeight: 1.75, fontWeight: 300 }}>{b.d}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          {/* Comparison */}
          <FadeIn>
            <div style={{ maxWidth: 800, margin: "0 auto", borderRadius: 18, overflow: "hidden", border: "1px solid var(--border)" }}>
              <div style={{ background: "var(--dark)", padding: "20px 28px" }}>
                <h4 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 400, color: "#fff" }}>{t.benefits.compare}</h4>
              </div>
              {[
                [t.benefits.ct1, t.benefits.cv1m, t.benefits.cv1c],
                [t.benefits.ct2, t.benefits.cv2m, t.benefits.cv2c],
                [t.benefits.ct3, t.benefits.cv3m, t.benefits.cv3c],
                [t.benefits.ct4, t.benefits.cv4m, t.benefits.cv4c],
                [t.benefits.ct5, t.benefits.cv5m, t.benefits.cv5c]
              ].map((row, i) => (
                <div key={i} className="compare-row" style={{ display: "grid", gridTemplateColumns: "1fr 1.5fr 1.5fr", borderBottom: i < 4 ? "1px solid var(--border)" : "none" }}>
                  <div style={{ padding: "14px 20px", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 400, color: "var(--dark)" }}>{row[0]}</div>
                  <div style={{ padding: "14px 20px", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 300, color: "var(--gold)", borderLeft: "1px solid var(--border)" }}>{row[1]}</div>
                  <div style={{ padding: "14px 20px", fontFamily: "var(--font-body)", fontSize: 13, fontWeight: 300, color: "var(--warm)", borderLeft: "1px solid var(--border)" }}>{row[2]}</div>
                </div>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ========== STORY ========== */}
      <section style={{ padding: "clamp(80px, 12vw, 140px) clamp(20px, 4vw, 48px)", background: "var(--dark)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: "50%", left: "50%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(184,151,90,0.05) 0%, transparent 70%)", transform: "translate(-50%, -50%)", pointerEvents: "none" }}/>
        <div style={{ maxWidth: 760, margin: "0 auto", position: "relative" }}>
          <FadeIn><SectionTag light>{t.story.tag}</SectionTag></FadeIn>
          <FadeIn delay={0.05}><SectionTitle light>{t.story.title}</SectionTitle></FadeIn>
          <FadeIn delay={0.1}><div style={{ width: 48, height: 1, background: "var(--gold)", marginBottom: 36, opacity: 0.5 }}/></FadeIn>
          <FadeIn delay={0.15}><p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "rgba(255,255,255,0.65)", lineHeight: 1.85, marginBottom: 24, fontWeight: 300 }}>{t.story.p1}</p></FadeIn>
          <FadeIn delay={0.2}><p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "rgba(255,255,255,0.65)", lineHeight: 1.85, marginBottom: 24, fontWeight: 300 }}>{t.story.p2}</p></FadeIn>
          <FadeIn delay={0.25}><p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "rgba(255,255,255,0.65)", lineHeight: 1.85, marginBottom: 48, fontWeight: 300 }}>{t.story.p3}</p></FadeIn>
          <FadeIn delay={0.3}>
            <blockquote style={{ fontFamily: "var(--font-display)", fontSize: "clamp(20px, 3vw, 28px)", fontWeight: 300, fontStyle: "italic", color: "var(--gold)", lineHeight: 1.5, borderLeft: "2px solid var(--gold)", paddingLeft: 28 }}>{t.story.q}</blockquote>
          </FadeIn>
        </div>
      </section>

      {/* ========== SUSTAINABILITY ========== */}
      <section style={{ padding: "clamp(60px, 8vw, 100px) clamp(20px, 4vw, 48px)", background: "#fff" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeIn><SectionTag>{t.sustainability.tag}</SectionTag><SectionTitle>{t.sustainability.title}</SectionTitle></FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 0, marginTop: 40 }}>
            {[
              { t: t.sustainability.s1t, d: t.sustainability.s1d, n: "01" },
              { t: t.sustainability.s2t, d: t.sustainability.s2d, n: "02" },
              { t: t.sustainability.s3t, d: t.sustainability.s3d, n: "03" },
              { t: t.sustainability.s4t, d: t.sustainability.s4d, n: "04" }
            ].map((s, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div style={{ padding: "28px 32px", borderLeft: i > 0 ? "1px solid var(--border)" : "none", height: "100%" }}>
                  <span style={{ fontFamily: "var(--font-display)", fontSize: 42, color: "var(--gold)", opacity: 0.2, fontWeight: 300 }}>{s.n}</span>
                  <h4 style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 400, margin: "8px 0 10px", color: "var(--dark)" }}>{s.t}</h4>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--warm)", lineHeight: 1.7, fontWeight: 300 }}>{s.d}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PARTNERS ========== */}
      <section id="partners" style={{ padding: "clamp(80px, 12vw, 140px) clamp(20px, 4vw, 48px)", background: "var(--cream)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeIn>
            <SectionTag>{t.partners.tag}</SectionTag>
            <SectionTitle>{t.partners.title}</SectionTitle>
            <p style={{ ...bodyText, maxWidth: 540, marginBottom: 48 }}>{t.partners.sub}</p>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 64 }}>
            {[
              { t: t.partners.t1, d: t.partners.d1 },
              { t: t.partners.t2, d: t.partners.d2 },
              { t: t.partners.t3, d: t.partners.d3 },
              { t: t.partners.t4, d: t.partners.d4 }
            ].map((p, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="product-hover" style={{ padding: 28, background: "#fff", borderRadius: 14, height: "100%", cursor: "default" }}>
                  <h4 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 400, marginBottom: 10, color: "var(--dark)" }}>{p.t}</h4>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--warm)", lineHeight: 1.7, fontWeight: 300 }}>{p.d}</p>
                </div>
              </FadeIn>
            ))}
          </div>
          <FadeIn>
            <div style={{ maxWidth: 540, margin: "0 auto", background: "#fff", borderRadius: 18, padding: "clamp(28px, 4vw, 48px)", boxShadow: "0 4px 20px rgba(42,37,32,0.04)" }}>
              {formSent ? (
                <div style={{ textAlign: "center", padding: 40 }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
                  <p style={{ fontFamily: "var(--font-display)", fontSize: 24, color: "var(--dark)", fontWeight: 300 }}>{t.partners.form.success}</p>
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  {["name","email","company","type"].map(k => (
                    <input key={k} type="text" placeholder={t.partners.form[k]} value={formData[k]} onChange={e => setFormData({...formData, [k]: e.target.value})} style={inputStyle} />
                  ))}
                  <textarea placeholder={t.partners.form.msg} value={formData.msg} onChange={e => setFormData({...formData, msg: e.target.value})} rows={4} style={{ ...inputStyle, resize: "vertical" }} />
                  <button onClick={() => setFormSent(true)} style={{ ...btnPrimary, width: "100%" }}>{t.partners.form.send}</button>
                </div>
              )}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ========== NEWSLETTER ========== */}
      <section style={{ padding: "clamp(60px, 8vw, 100px) 24px", background: "var(--dark)" }}>
        <div style={{ maxWidth: 540, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(24px, 3vw, 34px)", fontWeight: 300, color: "#fff", marginBottom: 12 }}>{t.newsletter.title}</h3>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "rgba(255,255,255,0.5)", marginBottom: 32, fontWeight: 300 }}>{t.newsletter.sub}</p>
            {subDone ? (
              <p style={{ fontFamily: "var(--font-body)", fontSize: 16, color: "var(--gold)" }}>{t.newsletter.success}</p>
            ) : (
              <div style={{ display: "flex", gap: 10, maxWidth: 420, margin: "0 auto" }}>
                <input type="email" placeholder={t.newsletter.placeholder} value={emailSub} onChange={e => setEmailSub(e.target.value)} style={{ ...inputStyle, flex: 1, background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.12)", color: "#fff" }} />
                <button onClick={() => setSubDone(true)} style={{ ...btnGold, whiteSpace: "nowrap" }}>{t.newsletter.btn}</button>
              </div>
            )}
          </FadeIn>
        </div>
      </section>

      {/* ========== CONTACT ========== */}
      <section id="contact" style={{ padding: "clamp(60px, 8vw, 100px) clamp(20px, 4vw, 48px)", background: "#fff" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <SectionTag>{t.contact.tag}</SectionTag>
            <SectionTitle>{t.contact.title}</SectionTitle>
            <p style={{ fontFamily: "var(--font-display)", fontSize: 22, color: "var(--dark)", marginBottom: 4 }}>{t.contact.company}</p>
            <p style={{ fontFamily: "var(--font-body)", fontSize: 15, color: "var(--warm)", marginBottom: 8, fontWeight: 300 }}>{t.contact.location}</p>
            <a href={"mailto:" + t.contact.email} style={{ fontFamily: "var(--font-body)", fontSize: 14, color: "var(--gold)", fontWeight: 300, textDecoration: "none" }}>{t.contact.email}</a>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", margin: "28px 0 40px" }}>
              <a href="https://www.instagram.com/umaieco_" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", border: "1px solid var(--border)", borderRadius: 8, textDecoration: "none" }}>
                <span style={{ fontSize: 16 }}>📸</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--dark)", fontWeight: 300 }}>{t.contact.instagram}</span>
              </a>
              <a href="https://wa.me/996505588188" target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", border: "1px solid var(--border)", borderRadius: 8, textDecoration: "none" }}>
                <span style={{ fontSize: 16 }}>💬</span>
                <span style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--dark)", fontWeight: 300 }}>{t.contact.whatsapp}</span>
              </a>
            </div>
          </FadeIn>
          <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap" }}>
            {[t.contact.t1, t.contact.t2, t.contact.t3].map((c, i) => (
              <FadeIn key={i} delay={i * 0.08}>
                <div className="product-hover" style={{ padding: "18px 32px", border: "1px solid var(--border)", borderRadius: 10, cursor: "pointer" }}>
                  <p style={{ fontFamily: "var(--font-body)", fontSize: 13, color: "var(--dark)", fontWeight: 300 }}>{c}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer style={{ padding: "40px clamp(20px, 4vw, 48px)", background: "var(--cream)", borderTop: "1px solid var(--border)" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 20, color: "var(--dark)" }}>UMAI</span>
            <span style={{ fontFamily: "var(--font-body)", fontSize: 8, letterSpacing: "0.25em", color: "var(--gold)" }}>ECO</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <a href="https://www.instagram.com/umaieco_" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--warm)", textDecoration: "none" }}>Instagram</a>
              <a href="https://wa.me/996505588188" target="_blank" rel="noopener noreferrer" style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--warm)", textDecoration: "none" }}>WhatsApp</a>
              <a href={"mailto:" + t.contact.email} style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--warm)", textDecoration: "none" }}>{t.contact.email}</a>
            </div>
          <p style={{ fontFamily: "var(--font-body)", fontSize: 11, color: "var(--warm)", fontWeight: 300 }}>{t.footer.rights}</p>
        </div>
      </footer>

      {/* Scroll-to-top */}
      {scrolled && (
        <button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} style={{
          position: "fixed", bottom: 28, right: 28, width: 44, height: 44, borderRadius: "50%",
          background: "var(--dark)", color: "#fff", border: "none", zIndex: 100,
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18,
          boxShadow: "0 4px 16px rgba(42,37,32,0.2)", opacity: 0.8
        }}>↑</button>
      )}
    </>
  );
}
