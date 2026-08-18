/**
 * WhatsAppDemo — conversación de ejemplo que se escribe sola al entrar en pantalla.
 *
 * Muestra cómo el agente cualifica y cierra una cita un sábado por la noche.
 * Respeta prefers-reduced-motion: en ese caso pinta la conversación entera de golpe.
 */

import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, AnimatePresence } from "framer-motion";
import { Check, CheckCheck } from "lucide-react";

const BUSINESS = "Clima Norte";

/* de = quién escribe: "cliente" | "agente" */
const CONVERSACION = [
  { de: "cliente", hora: "21:47", texto: "Buenas, se me ha estropeado el aire acondicionado y no enfría" },
  { de: "agente", hora: "21:47", texto: `Buenas noches 👋 Soy el asistente de ${BUSINESS}. Lo miramos ahora mismo. ¿El equipo enciende o no da señal?` },
  { de: "cliente", hora: "21:48", texto: "Enciende pero echa aire caliente" },
  { de: "agente", hora: "21:48", texto: "Entendido, suele ser gas o la sonda. ¿Es para vivienda o local? ¿Y en qué zona estás?" },
  { de: "cliente", hora: "21:49", texto: "Vivienda, en Alcobendas" },
  { de: "agente", hora: "21:49", texto: "Perfecto, Alcobendas entra en nuestra zona. Tengo hueco mañana de 9:30 a 11:00 o el jueves de 16:00 a 18:00. ¿Cuál te viene mejor?" },
  { de: "cliente", hora: "21:50", texto: "Mañana por la mañana mejor" },
  { de: "agente", hora: "21:50", texto: "Hecho ✅ Cita mañana 9:30–11:00. ¿Me pasas la dirección y un teléfono y te lo confirmo por aquí?" },
];

/* El agente "piensa" en proporción a lo que va a escribir, con techo para no aburrir.
   La conversación entera dura ~9 s: más lenta se pierde la atención del visitante. */
const pausaAntesDe = (mensaje) =>
  mensaje.de === "agente" ? Math.min(500 + mensaje.texto.length * 10, 1300) : 450;

const PAUSA_ENTRE_MENSAJES = 200;

function Burbuja({ mensaje }) {
  const esAgente = mensaje.de === "agente";
  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
      className={`flex ${esAgente ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`relative max-w-[80%] px-3 py-2 text-[13px] leading-snug rounded-lg ${
          esAgente
            ? "bg-[#005c4b] text-[#e9edef] rounded-tr-sm"
            : "bg-[#202c33] text-[#e9edef] rounded-tl-sm"
        }`}
      >
        <p className="whitespace-pre-wrap">{mensaje.texto}</p>
        <span className="flex items-center justify-end gap-1 mt-1 text-[10px] text-[#e9edef]/50">
          {mensaje.hora}
          {esAgente && <CheckCheck className="w-3 h-3 text-[#53bdeb]" />}
        </span>
      </div>
    </motion.div>
  );
}

function Escribiendo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      transition={{ duration: 0.2 }}
      className="flex justify-end"
      aria-label="El agente está escribiendo"
    >
      <div className="bg-[#005c4b] rounded-lg rounded-tr-sm px-3 py-3 flex items-center gap-1">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-[#e9edef]/60"
            animate={{ opacity: [0.3, 1, 0.3] }}
            transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.18 }}
          />
        ))}
      </div>
    </motion.div>
  );
}

export default function WhatsAppDemo() {
  const ref = useRef(null);
  const enPantalla = useInView(ref, { once: true, margin: "-120px" });
  const sinMovimiento = useReducedMotion();

  const [visibles, setVisibles] = useState(0);
  const [escribiendo, setEscribiendo] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    // Sin animación: la conversación entera, de golpe.
    if (sinMovimiento) {
      setVisibles(CONVERSACION.length);
      return;
    }
    if (!enPantalla) return;

    const timers = [];
    let acumulado = 400;

    CONVERSACION.forEach((mensaje, i) => {
      const pausa = pausaAntesDe(mensaje);

      if (mensaje.de === "agente") {
        timers.push(setTimeout(() => setEscribiendo(true), acumulado));
        acumulado += pausa;
        timers.push(
          setTimeout(() => {
            setEscribiendo(false);
            setVisibles(i + 1);
          }, acumulado)
        );
      } else {
        acumulado += pausa;
        timers.push(setTimeout(() => setVisibles(i + 1), acumulado));
      }
      acumulado += PAUSA_ENTRE_MENSAJES;
    });

    return () => timers.forEach(clearTimeout);
  }, [enPantalla, sinMovimiento]);

  // Mantener el último mensaje a la vista dentro del móvil.
  useEffect(() => {
    const caja = scrollRef.current;
    if (caja) caja.scrollTop = caja.scrollHeight;
  }, [visibles, escribiendo]);

  return (
    <div ref={ref} className="flex justify-center">
      <div className="w-full max-w-[380px] border border-border/60 bg-[#0b141a] overflow-hidden">
        {/* Cabecera tipo WhatsApp */}
        <div className="flex items-center gap-3 bg-[#202c33] px-4 py-3 border-b border-black/30">
          <span className="w-9 h-9 shrink-0 bg-primary flex items-center justify-center font-display font-black text-primary-foreground text-sm">
            CN
          </span>
          <div className="min-w-0">
            <p className="text-[#e9edef] text-sm font-medium truncate">{BUSINESS}</p>
            <p className="text-[#8696a0] text-[11px]">en línea</p>
          </div>
        </div>

        {/* Hilo */}
        <div ref={scrollRef} className="h-[420px] overflow-y-auto px-3 py-4 space-y-2">
          <p className="text-center">
            <span className="inline-block bg-[#182229] text-[#8696a0] text-[10px] uppercase tracking-widest px-3 py-1 rounded">
              Sábado 21:47
            </span>
          </p>
          {CONVERSACION.slice(0, visibles).map((mensaje, i) => (
            <Burbuja key={i} mensaje={mensaje} />
          ))}
          <AnimatePresence>{escribiendo && <Escribiendo key="escribiendo" />}</AnimatePresence>
        </div>

        {/* Barra inferior, decorativa */}
        <div className="flex items-center gap-2 bg-[#202c33] px-4 py-3 border-t border-black/30">
          <span className="flex-1 text-[#8696a0] text-[13px]">Escribe un mensaje</span>
          <Check className="w-4 h-4 text-[#8696a0]" />
        </div>
      </div>
    </div>
  );
}
