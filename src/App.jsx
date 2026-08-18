/**
 * ============================================================
 * LATTZY — Agente de WhatsApp para instaladores (src/App.jsx)
 * ============================================================
 *
 * Configura VITE_CALENDLY_URL en .env con tu enlace de Calendly/Cal.com.
 * Sin esa variable, la sección de reserva cae a un botón de email.
 * ============================================================
 */

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform, AnimatePresence } from "framer-motion";
import Lenis from "lenis";
import RFMImport from "react-fast-marquee";
const MarqueeRibbon = RFMImport?.default ?? RFMImport;
import {
  Zap, ArrowUpRight, ArrowDownRight, ArrowUp, Menu, X,
  MessageCircle, ListFilter, CalendarClock, ClipboardList, Plus,
} from "lucide-react";
import WhatsAppDemo from "./components/WhatsAppDemo.jsx";

const CALENDLY_URL = import.meta.env.VITE_CALENDLY_URL || "";
const EMAIL = "hola@lattzy.com"; // TODO: confirmar que esta dirección existe

/* ---------- Estilos globales (fuentes, colores, texturas) ---------- */
const GlobalStyles = () => (
  <style>{`
    @import url('https://api.fontshare.com/v2/css?f[]=cabinet-grotesk@500,700,800,900&f[]=satoshi@400,500,700&display=swap');
    @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');

    :root {
      --background: 0 0% 2%;
      --foreground: 0 0% 98%;
      --primary: 48 96% 48%;
      --primary-foreground: 0 0% 2%;
      --secondary: 240 4% 10%;
      --secondary-foreground: 0 0% 98%;
      --muted: 217 33% 17%;
      --muted-foreground: 240 5% 65%;
      --accent: 240 4% 16%;
      --border: 240 4% 16%;
    }
    * { border-color: hsl(var(--border)); }
    html { scroll-behavior: auto; }
    body {
      background: hsl(var(--background));
      color: hsl(var(--foreground));
      font-family: Satoshi, sans-serif;
      -webkit-font-smoothing: antialiased;
      margin: 0;
    }
    ::selection { background: #EAB308; color: #050505; }
    ::-webkit-scrollbar { width: 10px; }
    ::-webkit-scrollbar-track { background: #050505; }
    ::-webkit-scrollbar-thumb { background: #27272A; border: 2px solid #050505; }
    ::-webkit-scrollbar-thumb:hover { background: #EAB308; }

    .noise-overlay {
      position: fixed; inset: 0; z-index: 90; pointer-events: none; opacity: 0.05;
      background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
    }
    .blueprint-grid {
      background-image:
        linear-gradient(to right, rgba(234,179,8,0.05) 1px, transparent 1px),
        linear-gradient(to bottom, rgba(234,179,8,0.05) 1px, transparent 1px);
      background-size: 72px 72px;
    }
    .text-stroke { -webkit-text-stroke: 1px rgba(250,250,250,0.25); color: transparent; }
  `}</style>
);

/* ---------- Utilidad scroll suave ---------- */
const scrollTo = (href) => {
  if (window.__lenis) window.__lenis.scrollTo(href, { offset: -80, duration: 1.4 });
  else document.querySelector(href)?.scrollIntoView({ behavior: "smooth" });
};

/* ---------- Navbar ---------- */
function Navbar() {
  const links = [
    { label: "El problema", href: "#problema" },
    { label: "Qué hace", href: "#agente" },
    { label: "Demo", href: "#demo" },
    { label: "FAQ", href: "#faq" },
  ];
  const [mobileOpen, setMobileOpen] = useState(false);

  const go = (href) => {
    setMobileOpen(false);
    scrollTo(href);
  };

  useEffect(() => {
    if (!mobileOpen) return;
    const onKeyDown = (e) => { if (e.key === "Escape") setMobileOpen(false); };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [mobileOpen]);

  return (
    <motion.header
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.8, delay: 1, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-border/60 bg-background/80 backdrop-blur-md"
    >
      <div className="px-6 md:px-12 h-16 flex items-center justify-between">
        <a href="#hero" onClick={(e) => { e.preventDefault(); go("#hero"); }} className="flex items-center gap-2 group">
          <span className="w-7 h-7 bg-primary flex items-center justify-center transition-transform duration-300 group-hover:rotate-90">
            <Zap className="w-4 h-4 text-primary-foreground" strokeWidth={2.5} />
          </span>
          <span className="font-display font-black text-lg tracking-tight">LATTZY</span>
        </a>
        <nav className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              onClick={(e) => { e.preventDefault(); go(l.href); }}
              className="font-mono text-xs uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => go("#agendar")}
            className="group flex items-center gap-2 shrink-0 whitespace-nowrap bg-primary text-primary-foreground font-mono text-xs uppercase tracking-widest px-4 py-2.5 hover:bg-foreground transition-colors duration-200"
          >
            {/* En móvil no cabe el texto largo sin partirse en dos líneas. */}
            <span className="hidden sm:inline">Agendar diagnóstico</span>
            <span className="sm:hidden">Agendar</span>
            <ArrowUpRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </motion.button>
          <button
            onClick={() => setMobileOpen((o) => !o)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? "Cerrar menú" : "Abrir menú"}
            className="md:hidden p-2 -mr-2 text-foreground hover:text-primary transition-colors duration-200"
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>
      <AnimatePresence>
        {mobileOpen && (
          <motion.nav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="md:hidden overflow-hidden border-t border-border/60 bg-background/95 backdrop-blur-md"
          >
            <div className="px-6 py-2 flex flex-col">
              {links.map((l) => (
                <a
                  key={l.href}
                  href={l.href}
                  onClick={(e) => { e.preventDefault(); go(l.href); }}
                  className="font-mono text-sm uppercase tracking-widest text-muted-foreground hover:text-primary py-4 border-b border-border/40 last:border-b-0 transition-colors duration-200"
                >
                  {l.label}
                </a>
              ))}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

/* ---------- Hero ---------- */
function Hero() {
  const HERO_IMG = "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=2400&auto=format&fit=crop";
  const lines = [
    { text: "MIENTRAS", accent: false },
    { text: "TÚ INSTALAS,", accent: false },
    { text: "ÉL AGENDA.", accent: true },
  ];
  const { scrollY } = useScroll();
  const imgY = useTransform(scrollY, [0, 800], [0, 160]);
  const textY = useTransform(scrollY, [0, 800], [0, -60]);

  return (
    <section id="hero" className="relative min-h-screen flex flex-col justify-end overflow-hidden">
      <motion.div
        initial={{ scaleY: 1 }}
        animate={{ scaleY: 0 }}
        transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
        className="fixed inset-0 z-[80] origin-top bg-background"
        aria-hidden="true"
      />
      <motion.div style={{ y: imgY }} className="absolute inset-0">
        <img src={HERO_IMG} alt="Técnico trabajando" className="w-full h-full object-cover opacity-55 saturate-[0.65]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/45 to-background/15" />
        <div className="absolute inset-0 blueprint-grid opacity-60" />
      </motion.div>

      <motion.div style={{ y: textY }} className="relative z-10 px-6 md:px-12 pb-16 md:pb-24 pt-40 w-full">
        <h1 className="font-display font-black uppercase leading-[0.9] tracking-tighter text-[clamp(3.2rem,11vw,9.5rem)]">
          {/* pt/-mt en TODAS las líneas: sin ese aire, overflow-hidden recorta las
              tildes de las mayúsculas (Ú de "TÚ INSTALAS", É de "ÉL AGENDA"). */}
          {lines.map((line, i) => (
            <span key={i} className="block overflow-hidden pb-1 pt-[0.18em] -mt-[0.18em]">
              <motion.span
                initial={{ y: "110%" }}
                animate={{ y: 0 }}
                transition={{ duration: 1, delay: 0.9 + i * 0.14, ease: [0.16, 1, 0.3, 1] }}
                className={`block ${line.accent ? "text-primary" : ""}`}
              >
                {line.text}
              </motion.span>
            </span>
          ))}
        </h1>

        <div className="mt-10 flex flex-col md:flex-row md:items-end md:justify-between gap-10">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.5, duration: 0.8 }}
            className="max-w-md text-base md:text-lg text-muted-foreground"
          >
            Agente de IA en tu WhatsApp que contesta, cualifica y te llena la agenda.
            También a las 11 de la noche y en agosto.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.65, duration: 0.8 }}
            className="flex flex-wrap gap-4"
          >
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollTo("#agendar")}
              className="group flex items-center gap-3 bg-primary text-primary-foreground font-mono text-sm uppercase tracking-widest px-7 py-4 hover:bg-foreground transition-colors duration-200"
            >
              Agendar diagnóstico
              <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => scrollTo("#demo")}
              className="group flex items-center gap-3 border border-border font-mono text-sm uppercase tracking-widest px-7 py-4 hover:border-primary hover:text-primary transition-colors duration-200"
            >
              Ver la demo
              <ArrowDownRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 group-hover:translate-y-1" />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
}

/* ---------- Marquee ---------- */
function Marquee() {
  const items = ["Climatización", "Electricidad", "Fontanería", "Seguridad", "Domótica", "Energía solar", "Telecom"];
  return (
    <div className="border-y border-border/60 py-6 bg-background">
      <MarqueeRibbon speed={28} gradient={false} pauseOnHover>
        {items.map((item) => (
          <span key={item} className="flex items-center gap-8 mx-8">
            <span className="font-display font-bold uppercase tracking-tight text-2xl md:text-4xl text-foreground/80">{item}</span>
            <Zap className="w-5 h-5 text-primary" strokeWidth={2.5} />
          </span>
        ))}
      </MarqueeRibbon>
    </div>
  );
}

/* ---------- El problema ---------- */
function Problema() {
  const chapters = [
    { num: "01", title: "Suena el WhatsApp mientras estás en la escalera", body: "Para atenderlo tienes que bajar, quitarte los guantes y desbloquear el móvil. Casi nunca compensa. Y quien no recibe respuesta en diez minutos ya le está escribiendo al siguiente instalador." },
    { num: "02", title: "Los mensajes se acumulan hasta la noche", body: "Contestas a las diez, cansado y con prisa. La mitad de las conversaciones se quedan a medias, sin cita cerrada, y a la semana siguiente ya nadie se acuerda de qué se habló." },
    { num: "03", title: "Contestas a todo el mundo, cobres o no", body: "Consultas fuera de tu zona, curiosos preguntando precios, gente que quiere una chapuza de veinte euros. Todo te consume el mismo tiempo que un cliente bueno." },
  ];
  return (
    <section id="problema" className="px-6 md:px-12 py-24 md:py-32">
      <motion.p
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.7 }}
        className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-16 flex items-center gap-3"
      >
        <span className="w-8 h-px bg-primary inline-block" />
        El problema
      </motion.p>
      <div>
        {chapters.map((c) => (
          <motion.article
            key={c.num}
            initial={{ opacity: 0, y: 48 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className="grid md:grid-cols-12 gap-6 md:gap-12 py-14 md:py-20 border-t border-border/60 group"
          >
            <div className="md:col-span-3">
              <span className="font-mono text-sm text-primary">/{c.num}</span>
            </div>
            <h2 className="md:col-span-5 font-display font-extrabold uppercase tracking-tight leading-[1.05] text-2xl md:text-4xl group-hover:text-primary transition-colors duration-300">
              {c.title}
            </h2>
            <p className="md:col-span-4 text-sm md:text-base text-muted-foreground leading-relaxed self-end">{c.body}</p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

/* ---------- Demo ---------- */
function Demo() {
  return (
    <section id="demo" className="px-6 md:px-12 py-24 md:py-32 border-t border-border/60">
      <div className="grid md:grid-cols-12 gap-12 md:gap-16 items-start">
        <div className="md:col-span-5">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-6 flex items-center gap-3">
            <span className="w-8 h-px bg-primary inline-block" />
            Demo
          </p>
          <h2 className="font-display font-black uppercase tracking-tighter leading-[0.95] text-4xl md:text-6xl mb-8">
            Así contesta<br />un sábado<br />a las 21:47
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-sm leading-relaxed mb-6">
            El agente cualifica la avería, comprueba que la zona entra en tu cobertura
            y cierra la cita sin que tú toques el móvil.
          </p>
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground/70 max-w-sm leading-relaxed">
            Ejemplo ilustrativo. El agente se configura con tus servicios,
            tus zonas y tu agenda real.
          </p>
        </div>
        <div className="md:col-span-7">
          <WhatsAppDemo />
        </div>
      </div>
    </section>
  );
}

/* ---------- Qué hace el agente ---------- */
function Agente() {
  const trabajos = [
    { icon: MessageCircle, title: "Contesta en segundos", body: "A cualquier hora, todos los días. Fines de semana, festivos y agosto incluidos. Tu cliente recibe respuesta antes de escribirle al siguiente." },
    { icon: ListFilter, title: "Cualifica antes de molestarte", body: "Pregunta qué falla, si es vivienda o local, la urgencia y la zona. Tú recibes el caso ya entendido, no un «hola» suelto." },
    { icon: CalendarClock, title: "Agenda en tus huecos", body: "Ofrece solo los huecos que tienes libres y cierra la cita. Sin dobles reservas ni diez mensajes de ida y vuelta." },
    { icon: ClipboardList, title: "Te pasa el trabajo listo", body: "Resumen del caso, dirección y teléfono para el técnico que va. Nadie tiene que releer el hilo entero antes de salir." },
  ];
  return (
    <section id="agente" className="px-6 md:px-12 py-24 md:py-32 border-t border-border/60">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-6 flex items-center gap-3">
            <span className="w-8 h-px bg-primary inline-block" />
            Qué hace
          </p>
          <h2 className="font-display font-black uppercase tracking-tighter leading-[0.95] text-4xl md:text-6xl">
            Un agente.<br />Cuatro trabajos
          </h2>
        </div>
        <p className="max-w-sm text-sm md:text-base text-muted-foreground">
          No es un menú de opciones ni un «pulse 1 para averías». Conversa, entiende
          lo que le cuentan y termina con una cita en tu calendario.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-px bg-border/60 border border-border/60">
        {trabajos.map((t, i) => (
          <motion.div
            key={t.title}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
            className="group relative bg-background p-8 md:p-10 hover:bg-secondary transition-colors duration-300"
          >
            <div className="flex items-start justify-between mb-8">
              <t.icon className="w-7 h-7 text-primary" strokeWidth={1.75} />
              <ArrowUpRight className="w-5 h-5 text-muted-foreground opacity-0 -translate-x-1 translate-y-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:translate-y-0 transition-all duration-300" />
            </div>
            <h3 className="font-display font-extrabold uppercase tracking-tight text-xl md:text-2xl mb-4">{t.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{t.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ---------- En obra (fotos) ---------- */
function Showcase() {
  const shots = [
    { src: "https://images.unsplash.com/photo-1621905251918-48416bd8575a?q=80&w=1600&auto=format&fit=crop", alt: "Electricista con casco trabajando en un cuadro", tag: "ELEC_01", caption: "Cuadros y cableado · Electricidad", span: "md:col-span-5", aspect: "aspect-[4/5]" },
    { src: "https://images.unsplash.com/photo-1676210134188-4c05dd172f89?q=80&w=1600&auto=format&fit=crop", alt: "Fontanero trabajando en una tubería", tag: "FONT_02", caption: "Tubería y presión · Fontanería", span: "md:col-span-4", aspect: "aspect-[3/4]", offset: "md:mt-24" },
    { src: "https://images.unsplash.com/photo-1676210134190-3f2c0d5cf58d?q=80&w=1600&auto=format&fit=crop", alt: "Técnico reparando un calentador", tag: "CLIMA_03", caption: "Caldera y climatización · HVAC", span: "md:col-span-3", aspect: "aspect-[3/4]", offset: "md:mt-48" },
  ];
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], [60, -60]);

  return (
    <section ref={ref} className="px-6 md:px-12 py-24 md:py-32 border-t border-border/60 overflow-hidden">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-16">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-6 flex items-center gap-3">
            <span className="w-8 h-px bg-primary inline-block" />
            En obra
          </p>
          <h2 className="font-display font-black uppercase tracking-tighter leading-[0.95] text-4xl md:text-6xl">
            El trabajo no para.<br />Tu WhatsApp tampoco
          </h2>
        </div>
        <p className="max-w-sm text-sm md:text-base text-muted-foreground">
          Cada foto empezó con un mensaje que alguien contestó a tiempo. El agente se
          encarga de que ninguno se quede sin respuesta mientras estás en obra.
        </p>
      </div>
      <div className="grid md:grid-cols-12 gap-6 md:gap-8 items-start">
        {shots.map((s, i) => (
          <motion.figure
            key={s.tag}
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.9, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
            style={i === 1 ? { y } : undefined}
            className={`group ${s.span} ${s.offset || ""}`}
          >
            <div className={`relative overflow-hidden border border-border/60 ${s.aspect}`}>
              <img
                src={s.src}
                alt={s.alt}
                loading="lazy"
                className="w-full h-full object-cover saturate-[0.55] transition-transform duration-700 ease-out group-hover:scale-105 group-hover:saturate-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-background/70 via-transparent to-transparent" />
              <span className="absolute top-4 left-4 font-mono text-[10px] uppercase tracking-widest bg-background/80 backdrop-blur-sm border border-border/60 px-2 py-1 text-primary">
                {s.tag}
              </span>
            </div>
            <figcaption className="mt-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">{s.caption}</figcaption>
          </motion.figure>
        ))}
      </div>
    </section>
  );
}

/* ---------- Lo que no hace ---------- */
function LoQueNoHace() {
  const limites = [
    { title: "No inventa precios", body: "Si no le has cargado una tarifa, no se la saca de la manga: recoge los datos y cierras tú en la visita." },
    { title: "No suplanta a nadie", body: "Se presenta como asistente desde el primer mensaje. Si la conversación se complica, te pasa el caso y avisa al cliente." },
    { title: "No te cambia el número", body: "Trabaja sobre tu WhatsApp Business actual. Tus clientes escriben al mismo sitio de siempre." },
    { title: "No cierra tratos por ti", body: "Su trabajo termina cuando la visita está agendada. Vender sigue siendo cosa tuya." },
  ];
  return (
    <section className="border-t border-border/60">
      <div className="px-6 md:px-12 pt-24 md:pt-32 pb-12">
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-6 flex items-center gap-3">
          <span className="w-8 h-px bg-primary inline-block" />
          Honestidad
        </p>
        <h2 className="font-display font-black uppercase tracking-tighter leading-[0.95] text-4xl md:text-6xl">
          Lo que no hace
        </h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-border/60 border-t border-border/60">
        {limites.map((l, i) => (
          <motion.div
            key={l.title}
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: i * 0.08 }}
            className="bg-background px-8 md:px-10 py-12 md:py-16"
          >
            <h3 className="font-display font-extrabold uppercase tracking-tight text-lg md:text-xl text-primary mb-4">{l.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{l.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ---------- Proceso ---------- */
function Process() {
  const steps = [
    { num: "01", title: "Diagnóstico", time: "30 minutos", body: "Vemos tu WhatsApp actual, cuántos mensajes se te quedan sin contestar y qué preguntas se repiten cada semana." },
    { num: "02", title: "Configuración", time: "3–5 días", body: "Entrenamos al agente con tus servicios, tus zonas, tus horarios y tu agenda. Lo pruebas tú antes de que hable con nadie." },
    { num: "03", title: "En marcha", time: "Desde el primer día", body: "Activo en tu número. Revisamos contigo las conversaciones reales y lo afinamos cada semana." },
  ];
  return (
    <section id="proceso" className="px-6 md:px-12 py-24 md:py-32 border-t border-border/60">
      <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-6 flex items-center gap-3">
        <span className="w-8 h-px bg-primary inline-block" />
        Proceso
      </p>
      <h2 className="font-display font-black uppercase tracking-tighter leading-[0.95] text-4xl md:text-6xl mb-20">
        De la primera<br />charla a tu número
      </h2>
      <div className="grid md:grid-cols-3 gap-px bg-border/60 border border-border/60">
        {steps.map((s, i) => (
          <motion.div
            key={s.num}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.7, delay: i * 0.1 }}
            className="bg-background p-8 md:p-10 group hover:bg-secondary transition-colors duration-300"
          >
            <div className="flex items-center justify-between mb-10">
              <span className="font-mono text-3xl text-stroke group-hover:text-primary group-hover:[-webkit-text-stroke:0px] transition-all duration-300">{s.num}</span>
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground border border-border px-2 py-1">{s.time}</span>
            </div>
            <h3 className="font-display font-extrabold uppercase tracking-tight text-xl mb-3">{s.title}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">{s.body}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ---------- FAQ (acordeón propio, sin librerías) ---------- */
function Faq() {
  const faqs = [
    { q: "¿Tengo que cambiar mi número de WhatsApp?", a: "No. El agente se conecta a tu cuenta de WhatsApp Business actual. Tus clientes siguen escribiendo al número de siempre y tú conservas todo el histórico." },
    { q: "¿Mis clientes se van a dar cuenta de que no soy yo?", a: "Se presenta como asistente desde el primer mensaje; no engañamos a nadie. En la práctica la gente valora que le contesten a las once de la noche, aunque sea un asistente." },
    { q: "¿Y si le preguntan algo que no sabe?", a: "Lo reconoce, recoge los datos y te pasa el caso avisando al cliente de que sigues tú. Nunca improvisa precios ni promete plazos que no le has dado." },
    { q: "¿Cuánto tarda en estar funcionando?", a: "Entre tres y cinco días desde el diagnóstico. Lo pruebas tú antes de que hable con un cliente real." },
    { q: "¿Qué pasa si quiero quitarlo?", a: "Sin permanencia. Se desconecta y tu WhatsApp sigue funcionando exactamente igual que antes, con todas las conversaciones intactas." },
    { q: "¿Cuánto cuesta?", a: "Depende del volumen de mensajes y de tu operativa. Lo vemos en el diagnóstico y te damos una cifra cerrada para tu caso, sin compromiso." },
  ];
  const [open, setOpen] = useState(null);
  return (
    <section id="faq" className="px-6 md:px-12 py-24 md:py-32 border-t border-border/60">
      <div className="grid md:grid-cols-12 gap-12">
        <div className="md:col-span-4">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-6 flex items-center gap-3">
            <span className="w-8 h-px bg-primary inline-block" />
            FAQ
          </p>
          <h2 className="font-display font-black uppercase tracking-tighter leading-[0.95] text-4xl md:text-5xl">
            Preguntas<br />de oficio
          </h2>
        </div>
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8 }}
          className="md:col-span-8 border-t border-border/60"
        >
          {faqs.map((f, i) => (
            <div key={i} className="border-b border-border/60">
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full flex items-center justify-between gap-6 text-left font-display font-bold text-base md:text-lg uppercase tracking-tight hover:text-primary py-6 transition-colors duration-200"
              >
                {f.q}
                <Plus className={`w-5 h-5 shrink-0 text-primary transition-transform duration-300 ${open === i ? "rotate-45" : ""}`} />
              </button>
              <div className={`overflow-hidden transition-all duration-300 ${open === i ? "max-h-96 pb-6" : "max-h-0"}`}>
                <p className="text-sm md:text-base text-muted-foreground leading-relaxed max-w-2xl">{f.a}</p>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Agendar ---------- */

/* Calendly pintado con la paleta oscura del sitio. */
const conTemaOscuro = (url) => {
  try {
    const u = new URL(url);
    u.searchParams.set("background_color", "0a0a0a");
    u.searchParams.set("text_color", "fafafa");
    u.searchParams.set("primary_color", "eab308");
    u.searchParams.set("hide_gdpr_banner", "1");
    return u.toString();
  } catch {
    return url; // URL mal formada: la usamos tal cual y que decida Calendly
  }
};

function CalendlyEmbed({ url }) {
  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://assets.calendly.com/assets/external/widget.js";
    script.async = true;
    document.body.appendChild(script);
    return () => {
      script.remove();
    };
  }, []);

  return (
    <div
      className="calendly-inline-widget border border-border/60"
      data-url={conTemaOscuro(url)}
      style={{ minWidth: "280px", height: "700px" }}
    />
  );
}

/* Sin VITE_CALENDLY_URL la página no se rompe: cae a email. */
function ReservaPorEmail() {
  return (
    <div className="border border-border/60 p-8 md:p-10">
      <p className="font-mono text-xs uppercase tracking-widest text-primary mb-4">
        Reserva por email
      </p>
      <p className="text-sm text-muted-foreground leading-relaxed mb-8">
        Escríbenos con tu nombre, tu empresa y el sector en el que trabajas,
        y te devolvemos un par de huecos para la videollamada.
      </p>
      <a
        href={`mailto:${EMAIL}?subject=${encodeURIComponent("Diagnóstico de 30 minutos")}`}
        className="group inline-flex items-center gap-3 bg-primary text-primary-foreground font-mono text-sm uppercase tracking-widest px-7 py-4 hover:bg-foreground transition-colors duration-200"
      >
        Escribir a {EMAIL}
        <ArrowUpRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1" />
      </a>
      {import.meta.env.DEV && (
        <p className="mt-8 font-mono text-[11px] uppercase tracking-widest text-amber-400/80 border border-amber-400/30 px-4 py-3">
          Falta configurar VITE_CALENDLY_URL para mostrar el calendario aquí.
        </p>
      )}
    </div>
  );
}

function Agendar() {
  return (
    <section id="agendar" className="px-6 md:px-12 py-24 md:py-32 border-t border-border/60">
      <div className="grid md:grid-cols-12 gap-12">
        <div className="md:col-span-5">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-primary mb-6 flex items-center gap-3">
            <span className="w-8 h-px bg-primary inline-block" />
            Diagnóstico
          </p>
          <h2 className="font-display font-black uppercase tracking-tighter leading-[0.95] text-4xl md:text-6xl mb-8">
            Media hora<br />y lo ves claro
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-sm leading-relaxed mb-10">
            Treinta minutos por videollamada. Miramos tu WhatsApp, contamos cuántas
            oportunidades se te están escapando y te decimos si esto te compensa.
            Si no lo vemos claro, te lo decimos.
          </p>
          <div className="font-mono text-xs uppercase tracking-widest text-muted-foreground space-y-2 mb-12">
            <p>{EMAIL}</p>
            {/* TODO: confirmar zonas reales */}
            <p>Madrid · Barcelona · Remoto</p>
          </div>
          <div className="relative overflow-hidden border border-border/60 aspect-[16/10] max-w-sm group">
            <img
              src="https://images.unsplash.com/photo-1621905252507-b35492cc74b4?q=80&w=1200&auto=format&fit=crop"
              alt="Electricista con casco amarillo en instalación"
              loading="lazy"
              className="w-full h-full object-cover saturate-[0.55] transition-transform duration-700 ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
            <span className="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-widest text-primary">Diagnóstico gratuito · 30 min</span>
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.8 }}
          className="md:col-span-7"
        >
          {CALENDLY_URL ? <CalendlyEmbed url={CALENDLY_URL} /> : <ReservaPorEmail />}
        </motion.div>
      </div>
    </section>
  );
}

/* ---------- Footer ---------- */
function Footer() {
  const toTop = () => {
    if (window.__lenis) window.__lenis.scrollTo(0, { duration: 1.4 });
    else window.scrollTo({ top: 0, behavior: "smooth" });
  };
  return (
    <footer className="border-t border-border/60 px-6 md:px-12 pt-20 pb-10">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10 mb-16">
        <div>
          <div className="flex items-center gap-2 mb-6">
            <span className="w-8 h-8 bg-primary flex items-center justify-center">
              <Zap className="w-5 h-5 text-primary-foreground" strokeWidth={2.5} />
            </span>
            <span className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">Agentes de WhatsApp · Instalaciones</span>
          </div>
          <p className="font-display font-black uppercase tracking-tighter leading-[0.85] text-[clamp(3rem,12vw,10rem)] text-stroke select-none">
            LATTZY
          </p>
        </div>
        <button
          onClick={toTop}
          className="group self-start md:self-end flex items-center gap-2 border border-border px-5 py-3 font-mono text-xs uppercase tracking-widest hover:border-primary hover:text-primary transition-colors duration-200"
        >
          Volver arriba
          <ArrowUp className="w-4 h-4 transition-transform duration-200 group-hover:-translate-y-1" />
        </button>
      </div>
      <div className="flex flex-col md:flex-row justify-between gap-4 pt-8 border-t border-border/60 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
        <p>© 2026 LATTZY. Todos los derechos reservados.</p>
        <p>{EMAIL}</p>
      </div>
    </footer>
  );
}

/* ---------- App principal ---------- */
export default function App() {
  useEffect(() => {
    const lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 1 });
    window.__lenis = lenis;
    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  return (
    <div className="bg-background text-foreground min-h-screen">
      <GlobalStyles />
      <div className="noise-overlay" aria-hidden="true" />
      <Navbar />
      <main>
        <Hero />
        <Marquee />
        <Problema />
        <Demo />
        <Agente />
        <Showcase />
        <LoQueNoHace />
        <Process />
        <Faq />
        <Agendar />
      </main>
      <Footer />
    </div>
  );
}
