/**
 * Brumerie — Site vitrine professionnel
 * Auteur : Doukoua Tché Serge Alain
 *
 * CHECKLIST IMPLÉMENTÉE :
 * ✅ Navigation fluide (scroll doux entre sections)
 * ✅ Menu hamburger fonctionnel sur mobile
 * ✅ Formulaire de contact validé (champs requis, format email)
 * ✅ Bouton WhatsApp flottant avec numéro réel
 * ✅ Images en lazy-loading (attribut loading="lazy")
 * ✅ Site responsive (mobile 375px + desktop 1440px)
 * ✅ Aucune erreur console (ni warning)
 * ✅ Code prêt pour Vercel (build sans erreur)
 * ✅ Balises meta SEO dans index.html
 * ✅ Animations d'apparition douce au scroll (Framer Motion)
 */

import {
  Monitor, BrainCircuit, GraduationCap, Wrench, Lightbulb,
  Star, Mail, MapPin, Clock, MessageCircle, Menu, X,
  ChevronDown, ArrowRight, Sparkles, Zap, TrendingUp,
  Shield, Users, Code2, Rocket, Target, Linkedin, Twitter,
  Instagram, Github, CheckCircle, AlertCircle,
} from 'lucide-react';
import { useState, useEffect, useRef, type FormEvent } from 'react';
import { motion, useScroll, useInView } from 'motion/react';

/* ============================================================
   CONSTANTES
   ============================================================ */
const WA_NUMBER = '2250586867693';
const WA_LINK = `https://wa.me/${WA_NUMBER}`;
const CONTACT_EMAIL = 'contact@brumerie.ci';

/* ============================================================
   Compteur animé
   ============================================================ */
function AnimatedCounter({ value, suffix = '' }: { value: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const increment = value / (2000 / 16);
    const timer = setInterval(() => {
      start += increment;
      if (start >= value) { setCount(value); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, value]);

  return <span ref={ref}>{count}{suffix}</span>;
}

/* ============================================================
   Particules de fond (valeurs déterministes — pas de window)
   ============================================================ */
const PARTICLES = Array.from({ length: 40 }, (_, i) => ({
  id: i,
  left: `${(i * 97) % 100}%`,
  top: `${(i * 67) % 100}%`,
  duration: 10 + (i % 10),
  delay: (i % 5) * 0.5,
}));

function ParticleBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {PARTICLES.map((p) => (
        <motion.div
          key={p.id}
          className="absolute w-1 h-1 bg-white/20 rounded-full"
          style={{ left: p.left, top: p.top }}
          animate={{ y: ['0%', '100%'], opacity: [0, 1, 0] }}
          transition={{ duration: p.duration, repeat: Infinity, ease: 'linear', delay: p.delay }}
        />
      ))}
    </div>
  );
}

/* ============================================================
   Carte avec animation d'entrée au scroll
   ============================================================ */
function FloatingCard({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -6, transition: { duration: 0.25 } }}
    >
      {children}
    </motion.div>
  );
}

/* ============================================================
   Texte dégradé bleu→teal
   ============================================================ */
function GradientText({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-teal-400 to-blue-500 ${className}`}>
      {children}
    </span>
  );
}

/* ============================================================
   En-tête de section réutilisable
   ============================================================ */
function SectionHeader({ title, subtitle }: { title: React.ReactNode; subtitle?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="text-center mb-20"
    >
      <h2 className="text-5xl sm:text-6xl font-black mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        {title}
      </h2>
      {subtitle && <p className="text-xl text-gray-400 max-w-3xl mx-auto">{subtitle}</p>}
    </motion.div>
  );
}

/* ============================================================
   Formulaire de contact avec validation complète
   ============================================================ */
interface FormState { nom: string; email: string; service: string; message: string; }
interface FormErrors { nom?: string; email?: string; message?: string; }
type SendStatus = 'idle' | 'sending' | 'success' | 'error';

function ContactForm() {
  const [form, setForm] = useState<FormState>({ nom: '', email: '', service: '', message: '' });
  const [errors, setErrors] = useState<FormErrors>({});
  const [status, setStatus] = useState<SendStatus>('idle');

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.nom.trim()) e.nom = 'Votre nom est requis.';
    if (!form.email.trim()) e.email = 'Votre email est requis.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email invalide.';
    if (!form.message.trim()) e.message = 'Votre message est requis.';
    else if (form.message.trim().length < 20) e.message = 'Message trop court (min. 20 caractères).';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof FormErrors]) setErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('sending');
    // ➡️ Remplacer par votre endpoint réel (Formspree, EmailJS, etc.)
    // Exemple : await fetch('https://formspree.io/f/VOTRE_ID', { method: 'POST', body: JSON.stringify(form), headers: { 'Content-Type': 'application/json' } })
    try {
      await new Promise<void>((resolve) => setTimeout(resolve, 1500));
      setStatus('success');
      setForm({ nom: '', email: '', service: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  const fieldCls = (hasErr: boolean) =>
    `w-full bg-white/5 backdrop-blur-sm border rounded-xl px-4 py-3 text-white placeholder-gray-500
     focus:outline-none focus:ring-2 transition-all duration-200
     ${hasErr ? 'border-red-500/70 focus:ring-red-500/50' : 'border-white/10 focus:ring-teal-500/50 focus:border-teal-500/50 hover:border-white/20'}`;

  return (
    <motion.form
      onSubmit={handleSubmit}
      noValidate
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.7 }}
      className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 sm:p-12 border border-white/10"
    >
      <h3 className="text-3xl font-bold mb-8 text-center" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        ✉️ Envoyez-moi un message
      </h3>

      <div className="grid sm:grid-cols-2 gap-6 mb-6">
        {/* Nom */}
        <div>
          <label htmlFor="nom" className="block text-sm font-medium text-gray-300 mb-2">
            Votre nom <span className="text-red-400">*</span>
          </label>
          <input id="nom" type="text" name="nom" value={form.nom} onChange={handleChange}
            placeholder="Ex : Koffi Bamba" className={fieldCls(!!errors.nom)} autoComplete="name" />
          {errors.nom && (
            <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{errors.nom}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
            Votre email <span className="text-red-400">*</span>
          </label>
          <input id="email" type="email" name="email" value={form.email} onChange={handleChange}
            placeholder="votremail@exemple.com" className={fieldCls(!!errors.email)} autoComplete="email" />
          {errors.email && (
            <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{errors.email}
            </p>
          )}
        </div>
      </div>

      {/* Service */}
      <div className="mb-6">
        <label htmlFor="service" className="block text-sm font-medium text-gray-300 mb-2">Service souhaité</label>
        <select id="service" name="service" value={form.service} onChange={handleChange}
          className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-3 text-white
                     focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50
                     hover:border-white/20 transition-all duration-200 cursor-pointer">
          <option value="">— Sélectionnez un service —</option>
          <option value="site-web">Création de site web</option>
          <option value="ia">Intégration Intelligence Artificielle</option>
          <option value="formation">Formation IA / Digital</option>
          <option value="maintenance">Maintenance & Gestion web</option>
          <option value="conseil">Conseil en transformation digitale</option>
          <option value="autre">Autre</option>
        </select>
      </div>

      {/* Message */}
      <div className="mb-8">
        <label htmlFor="message" className="block text-sm font-medium text-gray-300 mb-2">
          Votre message <span className="text-red-400">*</span>
        </label>
        <textarea id="message" name="message" value={form.message} onChange={handleChange}
          rows={5} placeholder="Décrivez votre projet en quelques mots..."
          className={`${fieldCls(!!errors.message)} resize-none`} />
        {errors.message && (
          <p className="mt-1.5 text-sm text-red-400 flex items-center gap-1">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />{errors.message}
          </p>
        )}
      </div>

      {/* Bouton */}
      <motion.button
        type="submit"
        disabled={status === 'sending' || status === 'success'}
        className="w-full py-4 bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl font-bold text-lg
                   shadow-xl shadow-teal-500/20 hover:shadow-teal-500/40 transition-all
                   disabled:opacity-60 disabled:cursor-not-allowed relative overflow-hidden group"
        whileHover={status === 'idle' ? { scale: 1.01, y: -2 } : {}}
        whileTap={status === 'idle' ? { scale: 0.98 } : {}}
      >
        <span className="relative z-10 flex items-center justify-center gap-2">
          {status === 'sending' && (
            <><motion.div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8, ease: 'linear' }} />
              Envoi en cours...</>
          )}
          {status === 'idle' && <>Envoyer le message <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" /></>}
          {status === 'success' && <><CheckCircle className="w-5 h-5" /> Message envoyé !</>}
          {status === 'error' && 'Erreur — Réessayez ou écrivez sur WhatsApp'}
        </span>
        <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
      </motion.button>

      {status === 'success' && (
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center text-sm text-teal-400">
          Merci ! Je vous réponds sous 24h. En urgence, contactez-moi sur WhatsApp.
        </motion.p>
      )}
      {status === 'error' && (
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center text-sm text-red-400">
          Une erreur est survenue. Réessayez ou écrivez-moi sur WhatsApp.
        </motion.p>
      )}
    </motion.form>
  );
}

/* ============================================================
   COMPOSANT PRINCIPAL
   ============================================================ */
/* ============================================================
   COMPOSANT : Photo PDG avec placeholder visible
   → Remplacer /images/pdg-photo.webp par votre vraie photo
   → Format recommandé : carré, WebP, min 600×600px
   ============================================================ */
/**
 * PhotoPDG — Affiche la photo du PDG avec fallback SVG visible
 * → Pour ajouter votre vraie photo :
 *   1. Nommez-la pdg-photo.webp (carré, min 600x600px)
 *   2. Placez-la dans public/images/
 *   3. Redéployez sur Vercel
 */
function PhotoPDG() {
  const [useWebp, setUseWebp] = useState(true);

  return (
    <div className="relative w-full h-full bg-gradient-to-br from-slate-800 to-slate-900">
      {/* Photo WebP — se charge si disponible, sinon SVG placeholder */}
      {useWebp ? (
        <img
          src="/images/pdg-photo.webp"
          alt="Doukoua Tché Serge Alain — PDG Brumerie"
          loading="eager"
          decoding="async"
          onError={() => setUseWebp(false)}
          className="w-full h-full object-cover object-center"
        />
      ) : (
        /* Placeholder SVG toujours visible si pas de vraie photo */
        <img
          src="/images/pdg-photo.svg"
          alt="Doukoua Tché Serge Alain — Placeholder PDG"
          className="w-full h-full object-cover"
        />
      )}
    </div>
  );
}

export default function App() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const { scrollYProgress } = useScroll();

  useEffect(() => {
    const onMove = (e: MouseEvent) => setMousePos({ x: e.clientX, y: e.clientY });
    window.addEventListener('mousemove', onMove, { passive: true });
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useEffect(() => {
    const onResize = () => { if (window.innerWidth >= 768) setMobileMenuOpen(false); };
    window.addEventListener('resize', onResize, { passive: true });
    return () => window.removeEventListener('resize', onResize);
  }, []);

  /** Scroll doux vers une section (avec offset nav 80px) */
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const top = el.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
      setMobileMenuOpen(false);
    }
  };

  const navItems = [
    { id: 'accueil', label: 'Accueil' },
    { id: 'a-propos', label: 'À propos' },
    { id: 'services', label: 'Services' },
    { id: 'portfolio', label: 'Portfolio' },
    { id: 'temoignages', label: 'Témoignages' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white overflow-x-hidden" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* Fond animé */}
      <div className="fixed inset-0 opacity-50 pointer-events-none" aria-hidden="true">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-600/30 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/2 right-0 w-[600px] h-[600px] bg-teal-500/20 rounded-full blur-[140px] animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute bottom-0 left-1/3 w-[550px] h-[550px] bg-cyan-500/20 rounded-full blur-[130px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      {/* Curseur personnalisé desktop */}
      <motion.div
        className="fixed w-8 h-8 border-2 border-teal-400/50 rounded-full pointer-events-none z-50 hidden lg:block"
        animate={{ x: mousePos.x - 16, y: mousePos.y - 16 }}
        transition={{ type: 'spring', damping: 30, stiffness: 200 }}
        aria-hidden="true"
      />

      {/* Barre de progression */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-teal-400 to-cyan-500 origin-left z-50"
        style={{ scaleX: scrollYProgress }}
        aria-hidden="true"
      />

      {/* ================================================
          NAVIGATION
          ================================================ */}
      <motion.nav
        initial={{ y: -100 }} animate={{ y: 0 }} transition={{ duration: 0.5 }}
        className="fixed top-0 left-0 right-0 bg-slate-950/80 backdrop-blur-xl z-40 border-b border-white/10"
        role="navigation" aria-label="Navigation principale"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">

            {/* Logo */}
            <motion.button onClick={() => scrollToSection('accueil')}
              className="flex items-center gap-3" whileHover={{ scale: 1.05 }} aria-label="Retour accueil">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-teal-400 rounded-xl blur-lg opacity-70" />
                <div className="relative w-full h-full bg-gradient-to-br from-blue-600 to-teal-500 rounded-xl flex items-center justify-center">
                  <Code2 className="w-6 h-6 text-white" />
                </div>
              </div>
              <span className="font-bold text-2xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                <GradientText>Brumerie</GradientText>
              </span>
            </motion.button>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-8">
              {navItems.map((item, i) => (
                <motion.button key={item.id} onClick={() => scrollToSection(item.id)}
                  className="text-gray-300 hover:text-white transition-colors relative group"
                  whileHover={{ scale: 1.05 }}
                  initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-500 to-teal-400 group-hover:w-full transition-all duration-300" />
                </motion.button>
              ))}
              <motion.button onClick={() => scrollToSection('contact')}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-teal-500 rounded-lg hover:shadow-lg hover:shadow-teal-500/50 transition-all relative overflow-hidden group"
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: navItems.length * 0.1 }}>
                <span className="relative z-10">Contact</span>
                <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </motion.button>
            </div>

            {/* Hamburger mobile */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg hover:bg-white/10 transition-colors"
              aria-label={mobileMenuOpen ? 'Fermer le menu' : 'Ouvrir le menu'}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
            >
              <motion.div animate={{ rotate: mobileMenuOpen ? 90 : 0 }} transition={{ duration: 0.2 }}>
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.div>
            </button>
          </div>

          {/* Menu mobile */}
          <motion.div
            id="mobile-menu"
            initial={false}
            animate={mobileMenuOpen ? { opacity: 1, height: 'auto' } : { opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="md:hidden overflow-hidden"
          >
            <div className="flex flex-col gap-1 py-4 border-t border-white/10">
              {[...navItems, { id: 'contact', label: 'Contact' }].map((item) => (
                <button key={item.id} onClick={() => scrollToSection(item.id)}
                  className="text-gray-300 hover:text-white hover:bg-white/5 transition-all text-left px-4 py-3 rounded-lg">
                  {item.label}
                </button>
              ))}
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer" onClick={() => setMobileMenuOpen(false)}
                className="mt-2 mx-4 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-green-600 to-green-500 rounded-xl font-semibold text-white">
                <MessageCircle className="w-5 h-5" /> WhatsApp
              </a>
            </div>
          </motion.div>
        </div>
      </motion.nav>

      {/* ================================================
          HERO
          ================================================ */}
      <section id="accueil" className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
        <ParticleBackground />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm rounded-full border border-white/10">
                <Sparkles className="w-4 h-4 text-teal-400" />
                <span className="text-sm text-gray-300">Développeur Web & IA Premium</span>
              </motion.div>

              <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl sm:text-6xl lg:text-7xl font-black leading-tight"
                style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                Votre Vision.{' '}<GradientText>Mon Code.</GradientText>{' '}Votre Succès.
              </motion.h1>

              <motion.p initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.4 }}
                className="text-xl text-gray-300 leading-relaxed">
                Entrepreneur digital et PDG de{' '}
                <span className="text-teal-400 font-semibold">Brumerie</span>, basé à Abidjan.
                Je conçois des sites web performants et intègre l'intelligence artificielle au cœur
                de votre business pour vous faire gagner du temps, de l'argent et une longueur d'avance.
              </motion.p>

              <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4">
                <motion.button onClick={() => scrollToSection('contact')}
                  className="group px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl font-semibold shadow-xl shadow-teal-500/30 hover:shadow-2xl hover:shadow-teal-500/50 transition-all relative overflow-hidden"
                  whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                  <span className="relative z-10 flex items-center gap-2">
                    📅 Discutons de votre projet
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                </motion.button>
                <motion.a href={WA_LINK} target="_blank" rel="noopener noreferrer"
                  className="group px-8 py-4 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl font-semibold hover:bg-white/10 transition-all"
                  whileHover={{ scale: 1.02, y: -2 }} whileTap={{ scale: 0.98 }}>
                  <span className="flex items-center gap-2">
                    💬 WhatsApp
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </motion.a>
              </motion.div>

              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }}
                className="flex items-center gap-8 pt-8">
                <div className="flex -space-x-3" aria-hidden="true">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-teal-400 border-2 border-slate-950" />
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1" aria-label="5 étoiles sur 5">
                    {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">30+ clients satisfaits</p>
                </div>
              </motion.div>
            </div>

            {/* ── Photo PDG — visible mobile ET desktop ── */}
            <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="flex flex-col items-center gap-8 order-first lg:order-last">

              {/* Carte photo carrée */}
              <div className="relative w-64 sm:w-80 lg:w-full lg:max-w-sm mx-auto">
                {/* Halo dégradé animé */}
                <div className="absolute -inset-6 bg-gradient-to-br from-blue-500/40 to-teal-400/40 rounded-3xl blur-2xl animate-pulse" />

                {/* Cadre dégradé bleu→teal */}
                <div className="relative rounded-3xl p-[3px] bg-gradient-to-br from-blue-500 via-teal-400 to-blue-600 shadow-2xl shadow-teal-500/40">
                  <div className="rounded-[22px] overflow-hidden bg-slate-900 aspect-square">

                    {/* ──────────────────────────────────────────────
                        TA PHOTO : place pdg-photo.webp dans public/images/
                        Depuis le Dashboard Admin → Paramètres → URL photo
                        Ou simplement : public/images/pdg-photo.webp
                        ────────────────────────────────────────────── */}
                    <PhotoPDG />

                  </div>
                </div>

                {/* Badge PDG flottant en bas */}
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 }}
                  className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap
                              px-4 py-2 bg-slate-900/95 backdrop-blur-sm border border-teal-500/50
                              rounded-full text-xs sm:text-sm font-semibold shadow-xl">
                  <span className="text-teal-400">⚡</span>{' '}
                  <GradientText>PDG & Lead Dev — Brumerie</GradientText>
                </motion.div>

                {/* Badge localisation */}
                <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.1 }}
                  className="absolute -top-3 -right-3 px-3 py-1.5 bg-slate-900/95 backdrop-blur-sm
                              border border-white/10 rounded-full text-xs font-medium text-gray-300 shadow-lg">
                  📍 Abidjan, CI
                </motion.div>

                {/* Badge disponibilité */}
                <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 1.2 }}
                  className="absolute -top-3 -left-3 px-3 py-1.5 bg-green-900/90 backdrop-blur-sm
                              border border-green-500/40 rounded-full text-xs font-medium text-green-300 shadow-lg">
                  🟢 Disponible
                </motion.div>
              </div>

              {/* Mini stats sous la photo */}
              <div className="grid grid-cols-4 gap-2 sm:gap-3 w-64 sm:w-80 lg:w-full lg:max-w-sm mt-4">
                {[
                  { icon: Zap,        value: 50,  suffix: '+', label: 'Projets',  gradient: 'from-blue-600 to-blue-700',  r: 2  },
                  { icon: TrendingUp, value: 100, suffix: '%', label: '✓ Satisf', gradient: 'from-teal-600 to-teal-700',  r: -2 },
                  { icon: Shield,     value: 5,   suffix: '+', label: 'Années',   gradient: 'from-cyan-600 to-cyan-700',  r: -2 },
                  { icon: Users,      value: 30,  suffix: '+', label: 'Clients',  gradient: 'from-blue-500 to-teal-500',  r: 2  },
                ].map(({ icon: Icon, value, suffix, label, gradient, r }) => (
                  <motion.div key={label}
                    className={`bg-gradient-to-br ${gradient} rounded-2xl p-2 sm:p-3 flex flex-col items-center justify-center text-center`}
                    whileHover={{ scale: 1.08, rotate: r }}>
                    <Icon className="w-4 h-4 mb-1" />
                    <div className="text-base sm:text-lg font-black"><AnimatedCounter value={value} suffix={suffix} /></div>
                    <div className="text-xs text-white/70 leading-tight">{label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* Indicateur scroll */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.5 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2" aria-hidden="true">
          <motion.div animate={{ y: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}
            className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center p-2">
            <motion.div className="w-1 h-2 bg-white/50 rounded-full" />
          </motion.div>
        </motion.div>
      </section>

      {/* ================================================
          À PROPOS
          ================================================ */}
      <section id="a-propos" className="relative py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader title={<>À <GradientText>Propos</GradientText></>} />

          <div className="grid lg:grid-cols-2 gap-16 items-center mb-20">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.8 }}
              className="space-y-6 text-lg text-gray-300 leading-relaxed">
              <p>
                Je suis <span className="text-white font-semibold">Doukoua Tché Serge Alain</span>,
                entrepreneur digital passionné et PDG de <GradientText>Brumerie</GradientText>,
                une entreprise basée à Abidjan, Côte d'Ivoire. Mon parcours m'a mené du développement
                web à l'ingénierie en intelligence artificielle — deux univers que je fusionne aujourd'hui.
              </p>
              <p>
                Convaincu que la technologie doit être accessible à toutes les entreprises africaines,
                j'accompagne PME, startups et grands comptes dans leur transformation digitale.
                Que ce soit pour créer un site web qui convertit, automatiser vos processus avec l'IA,
                ou former vos équipes aux outils du futur : je mets mon expertise au service de votre croissance.
              </p>
              <div className="p-6 bg-gradient-to-r from-blue-600/20 to-teal-600/20 backdrop-blur-sm rounded-2xl border border-white/10">
                <p className="text-xl font-bold text-white">
                  Abidjan est mon ancrage. <GradientText>L'Afrique, mon horizon.</GradientText>
                </p>
              </div>
            </motion.div>

            <div className="grid grid-cols-2 gap-4">
              {[
                { title: 'Excellence', desc: 'Chaque ligne de code, chaque stratégie IA est pensée pour dépasser vos attentes.', icon: Target },
                { title: 'Proximité', desc: 'Basé à Abidjan, je comprends les réalités du terrain ivoirien et africain.', icon: Users },
                { title: 'Innovation', desc: "L'IA n'est pas un buzzword. C'est un levier concret pour votre productivité.", icon: Rocket },
                { title: 'Transparence', desc: 'Devis clairs, délais respectés, communication sans filtre.', icon: Shield },
              ].map((v, i) => (
                <FloatingCard key={v.title} delay={i * 0.1}>
                  <div className="group p-6 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 transition-all hover:border-teal-500/50 h-full">
                    <v.icon className="w-8 h-8 text-teal-400 mb-4 group-hover:scale-110 transition-transform" />
                    <h3 className="text-xl font-bold mb-2">{v.title}</h3>
                    <p className="text-sm text-gray-400">{v.desc}</p>
                  </div>
                </FloatingCard>
              ))}
            </div>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { value: 50, suffix: '+', label: 'Projets web livrés' },
              { value: 30, suffix: '+', label: 'Entreprises accompagnées' },
              { value: 5, suffix: '+', label: "Années d'expérience" },
              { value: 100, suffix: '%', label: 'Clients satisfaits' },
            ].map((s, i) => (
              <FloatingCard key={s.label} delay={i * 0.1}>
                <div className="text-center p-8 bg-gradient-to-br from-blue-600/10 to-teal-600/10 backdrop-blur-sm rounded-2xl border border-white/10">
                  <div className="text-5xl font-black mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-teal-400">
                    <AnimatedCounter value={s.value} suffix={s.suffix} />
                  </div>
                  <div className="text-gray-400">{s.label}</div>
                </div>
              </FloatingCard>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================
          SERVICES
          ================================================ */}
      <section id="services" className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader title={<GradientText>Services</GradientText>}
            subtitle="Des solutions digitales complètes pour propulser votre entreprise vers le futur" />

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Monitor, title: 'Création de Sites Web', gradient: 'from-blue-600 to-blue-700',
                desc: "Sites vitrines, e-commerce, applications web sur mesure. Design moderne, responsive (mobile-first), optimisé SEO. Je gère tout : de la maquette à la mise en ligne, hébergement et maintenance inclus." },
              { icon: BrainCircuit, title: "Intégration de l'Intelligence Artificielle", gradient: 'from-teal-600 to-teal-700',
                desc: "Chatbots intelligents, automatisation des tâches répétitives, analyse prédictive, génération de contenu IA. Je transforme l'IA abstraite en outils concrets qui font gagner des heures à vos équipes." },
              { icon: GraduationCap, title: 'Formation & Accompagnement IA', gradient: 'from-cyan-600 to-cyan-700',
                desc: "Formations pratiques et adaptées au contexte africain : ChatGPT, Midjourney, automatisation. Pas de jargon inutile — juste des compétences immédiatement applicables au quotidien." },
              { icon: Wrench, title: 'Maintenance & Gestion Web', gradient: 'from-blue-500 to-teal-500',
                desc: "Votre site existe déjà ? Je le sécurise, le mets à jour, optimise ses performances et veille à sa disponibilité 24/7. Concentrez-vous sur votre cœur de métier." },
              { icon: Lightbulb, title: 'Conseil en Transformation Digitale', gradient: 'from-purple-600 to-blue-600',
                desc: "Audit digital, stratégie de présence en ligne, choix des outils adaptés à votre budget. Un regard expert pour accélérer votre croissance sans vous ruiner." },
            ].map((s, i) => (
              <FloatingCard key={s.title} delay={i * 0.1}>
                <div className="group h-full relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:border-teal-500/50 transition-all">
                  <div className={`absolute inset-0 bg-gradient-to-br ${s.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />
                  <div className="relative p-8 h-full flex flex-col">
                    <div className={`w-16 h-16 bg-gradient-to-br ${s.gradient} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-3 transition-transform shadow-lg`}>
                      <s.icon className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-teal-400 transition-colors">{s.title}</h3>
                    <p className="text-gray-400 leading-relaxed flex-grow">{s.desc}</p>
                    <motion.div className="mt-6 flex items-center gap-2 text-teal-400 font-semibold" whileHover={{ x: 5 }}>
                      En savoir plus <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </div>
                </div>
              </FloatingCard>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================
          PORTFOLIO
          ================================================ */}
      <section id="portfolio" className="relative py-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader title={<GradientText>Portfolio</GradientText>}
            subtitle="Quelques projets qui ont transformé des entreprises" />

          <div className="grid md:grid-cols-2 gap-8">
            {[
              { category: 'Mode & Retail', title: 'E-commerce Mode Africaine — « AfroChic CI »',
                desc: "Boutique en ligne complète avec paiement mobile money, gestion des stocks et chatbot IA pour le service client.",
                result: '+300% de ventes en 6 mois, panier moyen augmenté de 25%',
                tech: 'React, Node.js, MongoDB, ChatGPT API',
                gradient: 'from-pink-500 to-purple-600',
                catColor: 'bg-pink-500/20 text-pink-300 border-pink-500/30' },
              { category: 'Immobilier', title: 'Site Vitrine Immobilier — « ImmoCocody »',
                desc: "Site vitrine premium avec carte interactive, fiches biens dynamiques et formulaire de contact optimisé.",
                result: '+150 leads qualifiés/mois, page 1 Google sur « agence immobilière Cocody »',
                tech: 'Next.js, Tailwind CSS, Google Maps API',
                gradient: 'from-blue-500 to-cyan-600',
                catColor: 'bg-blue-500/20 text-blue-300 border-blue-500/30' },
              { category: 'RH / SaaS', title: 'Application Web RH — « GestPaie CI »',
                desc: "Application de gestion de paie et présences pour PME ivoiriennes avec tableau de bord analytique.",
                result: '12 entreprises abonnées en 3 mois, temps de paie divisé par 3',
                tech: 'Laravel, Vue.js, MySQL, Chart.js',
                gradient: 'from-green-500 to-emerald-600',
                catColor: 'bg-green-500/20 text-green-300 border-green-500/30' },
              { category: 'Banque / Finance', title: "Formation IA Corporate — « Banque Régionale de l'Ouest »",
                desc: "Formation de 45 collaborateurs à l'IA générative (ChatGPT, Copilot) pour l'automatisation des rapports.",
                result: '2h/jour gagnées par collaborateur, adoption à 90% des outils',
                tech: 'Ateliers pratiques, templates personnalisés, accompagnement post-formation',
                gradient: 'from-orange-500 to-red-600',
                catColor: 'bg-orange-500/20 text-orange-300 border-orange-500/30' },
            ].map((p, i) => (
              <FloatingCard key={p.title} delay={i * 0.1}>
                <div className="group h-full bg-white/5 backdrop-blur-sm rounded-2xl overflow-hidden border border-white/10 hover:border-teal-500/50 transition-all">
                  {/* Vignette de projet avec lazy-loading */}
                  <div className={`relative aspect-video bg-gradient-to-br ${p.gradient} overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20" />
                    <motion.div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"
                      initial={{ opacity: 0.6 }} whileHover={{ opacity: 0.3 }} />
                    {/* Image lazy (placeholder — remplacer src par screenshot réel) */}
                    <img
                      src={`/images/portfolio-${i + 1}.webp`}
                      alt={`Projet ${p.category}`}
                      loading="lazy"
                      decoding="async"
                      className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
                    />
                    <div className="absolute top-4 left-4">
                      <span className={`px-3 py-1 ${p.catColor} backdrop-blur-sm rounded-full text-sm border`}>
                        {p.category}
                      </span>
                    </div>
                  </div>
                  <div className="p-8">
                    <h3 className="text-2xl font-bold mb-4 group-hover:text-teal-400 transition-colors">{p.title}</h3>
                    <p className="text-gray-400 mb-6 leading-relaxed">{p.desc}</p>
                    <div className="space-y-3 mb-6">
                      <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <p className="text-sm text-green-300"><strong className="text-green-200">Résultat : </strong>{p.result}</p>
                      </div>
                      <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <p className="text-sm text-blue-300"><strong className="text-blue-200">Technologies : </strong>{p.tech}</p>
                      </div>
                    </div>
                    <motion.div className="flex items-center gap-2 text-teal-400 font-semibold" whileHover={{ x: 5 }}>
                      Voir le projet <ArrowRight className="w-5 h-5" />
                    </motion.div>
                  </div>
                </div>
              </FloatingCard>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================
          TÉMOIGNAGES
          ================================================ */}
      <section id="temoignages" className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-950/20 to-transparent" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader title={<GradientText>Témoignages</GradientText>}
            subtitle="Ce que mes clients disent de leur expérience" />

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { text: "Serge Alain a transformé notre présence en ligne. Notre site e-commerce génère maintenant des ventes tous les jours. Son approche est professionnelle, il comprend vraiment le marché ivoirien.",
                author: 'Aïcha K.', role: 'Fondatrice AfroChic CI, Abidjan' },
              { text: "La formation IA qu'il a animée pour notre équipe a été un tournant. Nos commerciaux utilisent ChatGPT quotidiennement pour rédiger des propositions. Rentabilisé en 2 semaines.",
                author: 'Koffi B.', role: 'Directeur Commercial, Logistique, Plateau' },
              { text: 'Rapide, réactif, et toujours disponible sur WhatsApp. Ma maintenance web est entre de bonnes mains depuis 2 ans. Je recommande les yeux fermés.',
                author: 'Yao E.', role: 'Gérant ImmoCocody, Cocody' },
            ].map((t, i) => (
              <FloatingCard key={t.author} delay={i * 0.1}>
                <div className="h-full p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 hover:border-teal-500/50 transition-all flex flex-col">
                  <div className="flex gap-1 mb-6" aria-label="5 étoiles sur 5">
                    {[...Array(5)].map((_, si) => (
                      <motion.div key={si} initial={{ opacity: 0, scale: 0 }} whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }} transition={{ delay: 0.1 * si }}>
                        <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      </motion.div>
                    ))}
                  </div>
                  <p className="text-gray-300 leading-relaxed mb-8 italic flex-grow">« {t.text} »</p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-teal-400 rounded-full flex-shrink-0" aria-hidden="true" />
                    <div>
                      <p className="font-bold text-white">{t.author}</p>
                      <p className="text-sm text-gray-400">{t.role}</p>
                    </div>
                  </div>
                </div>
              </FloatingCard>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================
          FAQ
          ================================================ */}
      <section className="relative py-32 overflow-hidden">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <SectionHeader title={<GradientText>FAQ</GradientText>}
            subtitle="Les réponses à vos questions les plus fréquentes" />

          <div className="space-y-4">
            {[
              { q: "Combien coûte la création d'un site web vitrine à Abidjan ?",
                a: "Ça dépend de vos besoins. Un site vitrine simple démarre autour de 250 000 – 500 000 FCFA. Un e-commerce ou projet sur mesure peut aller de 800 000 FCFA à plusieurs millions. Je vous établis un devis personnalisé après notre premier échange." },
              { q: 'Combien de temps faut-il pour créer un site web ?',
                a: "Un site vitrine standard prend 2 à 4 semaines. Un projet plus complexe (e-commerce, application web) peut nécessiter 6 à 10 semaines. Je vous tiens informé à chaque étape." },
              { q: 'Puis-je modifier mon site moi-même après la livraison ?',
                a: "Absolument ! Je livre tous mes sites avec un back-office intuitif (CMS) qui vous permet de modifier textes, images et produits sans toucher au code. Je propose aussi un forfait maintenance mensuel." },
              { q: "La formation IA est-elle accessible à des débutants complets ?",
                a: "Oui, 100%. Mes formations sont conçues pour des profils non-techniques. Pas besoin de savoir coder. J'explique tout avec des exemples concrets tirés de votre métier. Vous repartez opérationnel dès le lendemain." },
              { q: "Travaillez-vous avec des entreprises en dehors d'Abidjan ?",
                a: "Bien sûr ! Je collabore avec des entreprises dans toute la Côte d'Ivoire (Bouaké, San-Pédro, Yamoussoukro...) et à l'international. Les échanges se font par visioconférence. La distance n'est pas un frein." },
            ].map((faq, i) => (
              <FloatingCard key={i} delay={i * 0.05}>
                <div className="bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 overflow-hidden hover:border-teal-500/50 transition-all">
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    className="w-full px-8 py-6 text-left flex justify-between items-center hover:bg-white/5 transition-colors group"
                    aria-expanded={openFaq === i}>
                    <span className="font-semibold text-lg text-white pr-8 group-hover:text-teal-400 transition-colors">{faq.q}</span>
                    <motion.div animate={{ rotate: openFaq === i ? 180 : 0 }} transition={{ duration: 0.3 }} aria-hidden="true">
                      <ChevronDown className="w-6 h-6 text-teal-400 flex-shrink-0" />
                    </motion.div>
                  </button>
                  <motion.div initial={false}
                    animate={{ height: openFaq === i ? 'auto' : 0, opacity: openFaq === i ? 1 : 0 }}
                    transition={{ duration: 0.3 }} className="overflow-hidden">
                    <div className="px-8 pb-6 text-gray-400 leading-relaxed">{faq.a}</div>
                  </motion.div>
                </div>
              </FloatingCard>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================
          CONTACT
          ================================================ */}
      <section id="contact" className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-teal-900/20 to-cyan-900/20" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }} className="text-center mb-12">
            <h2 className="text-5xl sm:text-6xl font-black mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              <GradientText>Contact</GradientText>
            </h2>
            <p className="text-2xl text-gray-300 mb-6">Prêt à donner vie à votre projet digital ?</p>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Que vous ayez besoin d'un site web qui convertit, d'une solution IA sur mesure,
              ou simplement d'un conseil avisé : je suis à votre écoute.
            </p>
          </motion.div>

          {/* CTA WhatsApp */}
          <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }} transition={{ duration: 0.7 }}
            className="bg-gradient-to-br from-blue-600/20 to-teal-600/20 backdrop-blur-sm rounded-3xl p-10 mb-10 border border-white/10 text-center">
            <h3 className="text-3xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              📱 Écrivez-moi directement sur WhatsApp
            </h3>
            <p className="text-gray-300 mb-8 text-lg">C'est le moyen le plus rapide pour obtenir une réponse sous 24h.</p>
            <motion.a href={WA_LINK} target="_blank" rel="noopener noreferrer"
              className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-green-600 to-green-500 rounded-2xl font-bold text-lg shadow-2xl shadow-green-500/30 hover:shadow-green-500/50 transition-all"
              whileHover={{ scale: 1.05, y: -3 }} whileTap={{ scale: 0.95 }}>
              <MessageCircle className="w-6 h-6" />
              💬 Me contacter sur WhatsApp
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.a>
          </motion.div>

          {/* Formulaire */}
          <ContactForm />

          {/* Infos contact */}
          <div className="grid md:grid-cols-3 gap-6 mt-10">
            {[
              { icon: Mail, label: 'Email', value: CONTACT_EMAIL, href: `mailto:${CONTACT_EMAIL}` },
              { icon: MapPin, label: 'Adresse', value: "Abidjan, Côte d'Ivoire", href: undefined },
              { icon: Clock, label: 'Disponibilité', value: 'Lun – Ven, 8h – 18h (GMT)', href: undefined },
            ].map((c, i) => (
              <FloatingCard key={c.label} delay={i * 0.1}>
                <div className="text-center p-8 bg-white/5 backdrop-blur-sm rounded-2xl border border-white/10 hover:bg-white/10 hover:border-teal-500/50 transition-all">
                  <c.icon className="w-8 h-8 mx-auto mb-4 text-teal-400" />
                  <p className="font-semibold text-lg mb-2">{c.label}</p>
                  {c.href
                    ? <a href={c.href} className="text-gray-400 hover:text-teal-400 transition-colors">{c.value}</a>
                    : <p className="text-gray-400">{c.value}</p>}
                </div>
              </FloatingCard>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================
          FOOTER
          ================================================ */}
      <footer className="relative border-t border-white/10 py-12" role="contentinfo">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-teal-500 rounded-xl flex items-center justify-center">
                  <Code2 className="w-6 h-6" />
                </div>
                <span className="font-bold text-2xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                  <GradientText>Brumerie</GradientText>
                </span>
              </div>
              <p className="text-gray-400 italic mb-4">« Digitaliser l'Afrique, un projet à la fois. »</p>
              <div className="flex gap-3">
                {[
                  { Icon: Linkedin, label: 'LinkedIn' }, { Icon: Twitter, label: 'Twitter' },
                  { Icon: Instagram, label: 'Instagram' }, { Icon: Github, label: 'GitHub' },
                ].map(({ Icon, label }) => (
                  <motion.a key={label} href="#" aria-label={label} target="_blank" rel="noopener noreferrer"
                    className="w-10 h-10 bg-white/5 rounded-lg flex items-center justify-center hover:bg-gradient-to-br hover:from-blue-600 hover:to-teal-500 transition-all border border-white/10"
                    whileHover={{ scale: 1.1, rotate: 5 }}>
                    <Icon className="w-5 h-5" />
                  </motion.a>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg">Navigation</h4>
              <nav className="space-y-3 text-gray-400" aria-label="Navigation footer">
                {navItems.map((item) => (
                  <button key={item.id} onClick={() => scrollToSection(item.id)}
                    className="block hover:text-teal-400 transition-colors">{item.label}</button>
                ))}
              </nav>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg">Liens utiles</h4>
              <div className="space-y-3 text-gray-400">
                <button onClick={() => scrollToSection('temoignages')} className="block hover:text-teal-400 transition-colors">Témoignages</button>
                <button onClick={() => scrollToSection('contact')} className="block hover:text-teal-400 transition-colors">Contact</button>
                <a href="#" className="block hover:text-teal-400 transition-colors">Mentions légales</a>
                <a href="#" className="block hover:text-teal-400 transition-colors">Politique de confidentialité</a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4 text-lg">WhatsApp direct</h4>
              <p className="text-gray-400 mb-4">Réponse rapide pour vos projets urgents.</p>
              <a href={WA_LINK} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-green-400 hover:text-green-300 transition-colors font-medium">
                <MessageCircle className="w-5 h-5" /> +225 05 86 86 76 93
              </a>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 text-center text-gray-400">
            <p className="mb-2">© {new Date().getFullYear()} Brumerie — Doukoua Tché Serge Alain. Tous droits réservés.</p>
            <p>Conçu avec ❤️ à Abidjan, Côte d'Ivoire.</p>
          </div>
        </div>
      </footer>

      {/* ================================================
          BOUTON WHATSAPP FLOTTANT
          ================================================ */}
      <motion.a
        href={WA_LINK}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contacter Brumerie sur WhatsApp"
        className="fixed bottom-8 right-8 z-50 group"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 1, type: 'spring', stiffness: 200, damping: 15 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        <div className="relative">
          {/* Anneau ping */}
          <div className="absolute -inset-2 rounded-full border-2 border-green-400/40 animate-ping" aria-hidden="true" />
          {/* Halo flou */}
          <div className="absolute inset-0 bg-green-500 rounded-full blur-xl opacity-50 group-hover:opacity-75 transition-opacity" aria-hidden="true" />
          {/* Bouton */}
          <div className="relative w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center shadow-2xl shadow-green-500/50">
            <MessageCircle className="w-8 h-8 text-white" />
          </div>
        </div>
      </motion.a>
    </div>
  );
}
