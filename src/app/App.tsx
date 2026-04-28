/**
 * dev.brumerie.com — Machine à convertir
 * Copywriting orienté résultats · CTA WhatsApp partout · 0 friction
 */

import { useState, useEffect, useRef, type FormEvent } from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'motion/react';
import {
  sendMessage,
  getContent, getProjects, getReviews, getBlogPosts,
  type SiteContent, type Project, type Review, type BlogPost,
} from '../admin/firestore.service';
import {
  MessageCircle, ArrowRight, Zap, CheckCircle,
  X, Menu, Star, ChevronDown, AlertCircle,
  Shield, Timer,
} from 'lucide-react';

/* ──────────────────────────────────────────────
   CONSTANTES
   ────────────────────────────────────────────── */
const WA_NUMBER = '2250586867693';
const WA_MSG_DEFAULT = encodeURIComponent("Bonjour Tché 👋 je veux lancer mon projet. Peux-tu m'aider ?");
const WA_MSG_MVP     = encodeURIComponent("Bonjour Tché 👋 je suis intéressé par le pack MVP Express. On peut en parler ?");
const WA_MSG_AUTO    = encodeURIComponent("Bonjour Tché 👋 je veux automatiser mon business. On peut en parler ?");
const WA_MSG_SCALE   = encodeURIComponent("Bonjour Tché 👋 j'ai déjà une app et je veux la faire évoluer. On peut en parler ?");

const WA = (msg = WA_MSG_DEFAULT) => `https://wa.me/${WA_NUMBER}?text=${msg}`;

/* ──────────────────────────────────────────────
   COMPOSANTS UTILITAIRES
   ────────────────────────────────────────────── */

/** Bouton WhatsApp principal — CTA #1 */
function BtnWA({
  children, msg = WA_MSG_DEFAULT, size = 'md', className = '',
}: {
  children: React.ReactNode;
  msg?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const sizes = {
    sm: 'px-5 py-2.5 text-sm gap-2',
    md: 'px-7 py-4 text-base gap-2.5',
    lg: 'px-9 py-5 text-lg gap-3',
  };
  return (
    <motion.a
      href={WA(msg)}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center font-bold rounded-2xl bg-[#25D366] text-white
        shadow-[0_0_32px_rgba(37,211,102,0.4)] hover:shadow-[0_0_48px_rgba(37,211,102,0.6)]
        transition-shadow ${sizes[size]} ${className}`}
      whileHover={{ scale: 1.04, y: -2 }}
      whileTap={{ scale: 0.97 }}
    >
      <MessageCircle className={size === 'lg' ? 'w-6 h-6' : 'w-5 h-5'} />
      {children}
    </motion.a>
  );
}

/** Chip / badge accent */
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0ff]/10 border border-[#0ff]/30 text-[#0ff] text-xs font-bold uppercase tracking-widest">
      {children}
    </span>
  );
}

/** Section wrapper avec animation au scroll */
function Section({
  id, children, className = '',
}: {
  id?: string;
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  return (
    <motion.section
      id={id}
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={className}
    >
      {children}
    </motion.section>
  );
}

/* ──────────────────────────────────────────────
   PHOTO PDG — WebP + JPG fallback
   ────────────────────────────────────────────── */
function PhotoPDG({ className = '' }: { className?: string }) {
  const [useWebp, setUseWebp] = useState(true);
  return (
    <picture className={className}>
      <source srcSet="/images/pdg-photo.webp" type="image/webp" />
      <img
        src={useWebp ? '/images/pdg-photo.webp' : '/images/pdg-photo.jpg'}
        alt="Doukoua Tché Serge Alain — Développeur Full-Stack & IA"
        loading="eager"
        decoding="async"
        onError={() => setUseWebp(false)}
        className="w-full h-full object-cover object-top"
      />
    </picture>
  );
}

/* ──────────────────────────────────────────────
   COMPTEUR ANIMÉ
   ────────────────────────────────────────────── */
function Counter({ to, suffix = '' }: { to: number; suffix?: string }) {
  const [v, setV] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  useEffect(() => {
    if (!inView) return;
    let start = 0;
    const step = to / 60;
    const id = setInterval(() => {
      start += step;
      if (start >= to) { setV(to); clearInterval(id); }
      else setV(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [inView, to]);
  return <span ref={ref}>{v}{suffix}</span>;
}

/* ──────────────────────────────────────────────
   NAVIGATION
   ────────────────────────────────────────────── */
function Nav() {
  const [open, setOpen] = useState(false);
  const { scrollY } = useScroll();
  const bg = useTransform(scrollY, [0, 80], ['rgba(4,4,15,0)', 'rgba(4,4,15,0.95)']);

  const links = [
    { label: 'Offres',       href: '#offres'   },
    { label: 'Projets',      href: '#projets'  },
    { label: 'Process',      href: '#process'  },
    { label: 'Témoignages',  href: '#avis'     },
    { label: 'Blog',         href: '#blog'     },
    { label: 'FAQ',          href: '#faq'      },
  ];

  const scroll = (href: string) => {
    setOpen(false);
    // Délai court pour laisser le menu se fermer avant le scroll (mobile)
    setTimeout(() => {
      const el = document.querySelector(href);
      if (!el) return;
      // Compenser la hauteur de la nav fixe (64px) + marge
      const top = el.getBoundingClientRect().top + window.scrollY - 72;
      window.scrollTo({ top: Math.max(0, top), behavior: 'smooth' });
    }, 100);
  };

  return (
    <motion.nav style={{ backgroundColor: bg }}
      className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-5 h-16 flex items-center justify-between">
        {/* Logo */}
        <a href="#" className="font-black text-xl tracking-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          tché<span className="text-[#0ff]">.</span>dev
        </a>

        {/* Desktop */}
        <div className="hidden md:flex items-center gap-8">
          {links.map(l => (
            <button key={l.href} onClick={() => scroll(l.href)}
              className="text-sm text-white/60 hover:text-white transition-colors font-medium">
              {l.label}
            </button>
          ))}
          <BtnWA size="sm">Discutons</BtnWA>
        </div>

        {/* Hamburger */}
        <button onClick={() => setOpen(!open)} className="md:hidden p-2 text-white/70 hover:text-white"
          aria-label={open ? 'Fermer' : 'Menu'}>
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden bg-[#04040f]/95 border-t border-white/5">
            <div className="px-5 py-4 space-y-1">
              {links.map(l => (
                <button key={l.href} onClick={() => scroll(l.href)}
                  className="w-full text-left py-4 px-5 text-white/80 hover:text-white active:bg-white/10 hover:bg-white/5 rounded-2xl text-base font-semibold transition-all border border-transparent hover:border-white/10">
                  {l.label}
                </button>
              ))}
              <div className="pt-2">
                <BtnWA className="w-full justify-center">Discutons sur WhatsApp</BtnWA>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}

/* ──────────────────────────────────────────────
   HERO — frapper · qualifier · convertir
   ────────────────────────────────────────────── */
function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 600], [0, 120]);

  return (
    <section className="relative min-h-screen flex items-center overflow-hidden pt-16">
      {/* Fond atmosphérique */}
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#0ff]/8 rounded-full blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[100px]" />
        {/* Grille */}
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(rgba(0,255,255,1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,255,255,1) 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
      </div>

      <div className="max-w-6xl mx-auto px-5 w-full">
        <div className="grid lg:grid-cols-2 gap-12 items-center">

          {/* Colonne texte */}
          <div className="space-y-8 order-2 lg:order-1">

            {/* Badge */}
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
              <Chip>🟢 Disponible · Abidjan, Côte d'Ivoire</Chip>
            </motion.div>

            {/* Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2, duration: 0.8 }}
              className="text-5xl sm:text-6xl lg:text-[64px] font-black leading-[1.05] tracking-tight"
              style={{ fontFamily: 'Space Grotesk, sans-serif' }}
            >
              Je transforme{' '}
              <span className="relative">
                <span className="text-[#0ff]">votre idée</span>
                <motion.span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#0ff]"
                  initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ delay: 1, duration: 0.6 }} />
              </span>
              {' '}en app{' '}
              <span className="text-[#0ff]">rentable</span>{' '}
              en 7 jours.
            </motion.h1>

            {/* Sous-titre */}
            <motion.p
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
              className="text-lg text-white/60 leading-relaxed max-w-lg"
            >
              Développeur Full-Stack & IA basé à Abidjan. Fondateur de{' '}
              <span className="text-white font-semibold">Brumerie</span>.
              Je construis des applications web et mobile qui génèrent de vrais résultats —
              pas juste du code beau.
            </motion.p>

            {/* Preuves rapides */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
              className="flex flex-wrap gap-4"
            >
              {[
                '✅ Livraison en 7 jours garantie',
                '✅ Paiement mobile money intégré',
                '✅ Support WhatsApp inclus',
              ].map(t => (
                <span key={t} className="text-sm text-white/70 font-medium">{t}</span>
              ))}
            </motion.div>

            {/* CTA — UN SEUL OBJECTIF */}
            <motion.div
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4"
            >
              <BtnWA size="lg">
                Lancer mon projet
                <ArrowRight className="w-5 h-5" />
              </BtnWA>
              <button
                onClick={() => (() => { const el = document.getElementById('offres'); if(el){ window.scrollTo({top: el.getBoundingClientRect().top + window.scrollY - 72, behavior:'smooth'}); } })()}
                className="flex items-center gap-2 text-white/50 hover:text-white text-sm font-medium transition-colors"
              >
                Voir les offres <ChevronDown className="w-4 h-4" />
              </button>
            </motion.div>

            {/* Social proof mini */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
              className="flex items-center gap-4 pt-2"
            >
              <div className="flex -space-x-2">
                {['K', 'D', 'T', 'A'].map((l, i) => (
                  <div key={i} className="w-8 h-8 rounded-full border-2 border-[#04040f] bg-gradient-to-br from-[#0ff]/40 to-violet-500/40 flex items-center justify-center text-xs font-bold">
                    {l}
                  </div>
                ))}
              </div>
              <div>
                <div className="flex gap-0.5">{[...Array(5)].map((_, i) => <Star key={i} className="w-3.5 h-3.5 fill-yellow-400 text-yellow-400" />)}</div>
                <p className="text-xs text-white/40 mt-0.5">30+ entrepreneurs satisfaits</p>
              </div>
            </motion.div>
          </div>

          {/* Photo PDG */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            style={{ y }}
            className="relative order-1 lg:order-2 flex justify-center"
          >
            <div className="relative w-72 sm:w-80 lg:w-full lg:max-w-sm">
              {/* Halo */}
              <div className="absolute -inset-8 bg-[#0ff]/10 rounded-full blur-3xl" />
              {/* Cadre dégradé */}
              <div className="relative rounded-3xl p-[2px] bg-gradient-to-br from-[#0ff] via-violet-500 to-[#0ff] shadow-[0_0_80px_rgba(0,255,255,0.2)]">
                <div className="rounded-[22px] overflow-hidden aspect-square bg-[#0a0a1a]">
                  <PhotoPDG className="w-full h-full" />
                </div>
              </div>

              {/* Badge flottant bas */}
              <motion.div
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.2 }}
                className="absolute -bottom-5 left-1/2 -translate-x-1/2 whitespace-nowrap
                  px-4 py-2 bg-[#0a0a1a]/95 backdrop-blur-sm border border-[#0ff]/30
                  rounded-full text-xs font-bold shadow-xl"
              >
                <span className="text-[#0ff]">⚡</span>{' '}
                <span className="text-white">Full-Stack & IA · Fondateur Brumerie</span>
              </motion.div>

              {/* Badge stats haut droit */}
              <motion.div
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.4 }}
                className="absolute -top-4 -right-4 bg-[#0a0a1a]/95 backdrop-blur-sm border border-white/10
                  rounded-2xl px-4 py-3 shadow-xl"
              >
                <p className="text-2xl font-black text-[#0ff]">50+</p>
                <p className="text-xs text-white/50 mt-0.5">Apps livrées</p>
              </motion.div>

              {/* Badge haut gauche */}
              <motion.div
                initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 1.5 }}
                className="absolute -top-4 -left-4 bg-[#0a0a1a]/95 backdrop-blur-sm border border-[#25D366]/30
                  rounded-2xl px-4 py-3 shadow-xl"
              >
                <p className="text-2xl font-black text-[#25D366]">7j</p>
                <p className="text-xs text-white/50 mt-0.5">Délai garanti</p>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Scroll indicator */}
      <motion.div className="absolute bottom-8 left-1/2 -translate-x-1/2" aria-hidden
        animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
        <div className="w-5 h-8 border border-white/20 rounded-full flex justify-center pt-1.5">
          <div className="w-0.5 h-2 bg-white/30 rounded-full" />
        </div>
      </motion.div>
    </section>
  );
}

/* ──────────────────────────────────────────────
   PROBLÈME — ils doivent se reconnaître
   ────────────────────────────────────────────── */
function SectionProbleme() {
  const problems = [
    { icon: '😤', text: 'Vous avez une idée mais aucun développeur fiable à Abidjan ?' },
    { icon: '⏳', text: 'Vous perdez des clients à cause de processus 100% manuels ?' },
    { icon: '💸', text: 'Vous avez payé cher une app qui n\'a jamais été livrée ?' },
    { icon: '🔒', text: 'Vous voulez automatiser mais vous êtes bloqué par la technique ?' },
  ];

  return (
    <Section className="py-24 bg-gradient-to-b from-transparent to-[#06060f]">
      <div className="max-w-4xl mx-auto px-5 text-center">
        <Chip>Le problème</Chip>
        <h2 className="mt-6 text-4xl sm:text-5xl font-black leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Vous reconnaissez-vous{' '}
          <span className="text-[#0ff]">ici ?</span>
        </h2>
        <p className="mt-4 text-white/50 text-lg">Si oui, vous êtes exactement là où je peux vous aider.</p>

        <div className="mt-14 grid sm:grid-cols-2 gap-5">
          {problems.map((p, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="flex items-start gap-4 p-6 bg-white/3 border border-white/8 rounded-2xl text-left
                hover:border-[#0ff]/20 hover:bg-white/5 transition-all group">
              <span className="text-3xl flex-shrink-0">{p.icon}</span>
              <p className="text-white/70 font-medium leading-snug group-hover:text-white transition-colors">{p.text}</p>
            </motion.div>
          ))}
        </div>

        <motion.div className="mt-12" whileInView={{ opacity: 1, y: 0 }} initial={{ opacity: 0, y: 20 }} viewport={{ once: true }}>
          <BtnWA size="lg">
            Oui, j'ai ce problème — parlons-en
            <ArrowRight className="w-5 h-5" />
          </BtnWA>
        </motion.div>
      </div>
    </Section>
  );
}

/* ──────────────────────────────────────────────
   OFFRES PACKAGÉES — 3 max, prix clairs
   ────────────────────────────────────────────── */
/* ──────────────────────────────────────────────
   HOOK — Chargement données Firestore
   Le site lit en temps réel ce que tu postes
   depuis le Dashboard Admin /admin
   ────────────────────────────────────────────── */

/** Données par défaut si Firestore vide ou hors ligne */
const DEFAULT_PROJECTS_SITE: Project[] = [
  {
    id: '1', category: 'Marketplace Mobile',
    title: 'Brumerie — Commerce social Abidjan',
    desc: "Marketplace mobile-first pour l'économie informelle d'Abidjan. Paiement Wave/Orange Money, chat intégré, stories vendeurs. Incubé par FasterCapital.",
    result: 'MVP validé · 10+ commandes réelles · Live sur Vercel',
    tech: 'React · Firebase · Capacitor · Wave API',
    gradient: 'from-green-500 to-teal-600', visible: true, order: 1,
  },
  {
    id: '2', category: 'Agent IA',
    title: 'Agent Ultra — IA autonome sur Android',
    desc: "Agent IA contrôlé via Telegram sur Android via Termux. Pipeline Claude Sonnet + Gemini Flash. Mémoire persistante, sécurité 5 couches.",
    result: 'Opérationnel · auto-amélioration autonome · 0 serveur cloud',
    tech: 'Python · Claude API · Gemini · SQLite · Termux',
    gradient: 'from-purple-600 to-blue-600', visible: true, order: 2,
  },
  {
    id: '3', category: 'SaaS Documents',
    title: 'Docubuild — Documents pro en CI',
    desc: "Plateforme de CVs, lettres et contrats OHADA pour étudiants et professionnels ivoiriens. Interface Gen Z, paiement mobile money natif.",
    result: 'En développement · marché : 500K+ utilisateurs potentiels',
    tech: 'React · TypeScript · Firebase · Wave/OM',
    gradient: 'from-orange-500 to-red-500', visible: true, order: 3,
  },
];

const DEFAULT_REVIEWS_SITE: Review[] = [
  {
    id: '1', author: 'Kouamé A.', role: 'CEO', company: 'Startup Fintech · Abidjan', stars: 5, visible: true,
    date: '2026-03-15',
    text: "Tché a livré notre app en 6 jours. Exactement ce qu'on avait décrit, sans aucune surprise. Le code est propre, l'app est rapide. On a signé nos 3 premiers clients dans la semaine.",
  },
  {
    id: '2', author: 'Diallo M.', role: 'Fondateur', company: 'AgriTech · Dakar', stars: 5, visible: true,
    date: '2026-02-28',
    text: "J'avais peur de me faire arnaquer encore. Tché m'a envoyé un prototype en 48h avant que je paie quoi que ce soit. Le résultat final dépasse mes attentes.",
  },
  {
    id: '3', author: 'Traoré S.', role: 'Directrice', company: 'E-commerce · Abidjan', stars: 5, visible: true,
    date: '2026-01-10',
    text: "Notre bot WhatsApp répond maintenant automatiquement à 80% des questions clients. On économise 3h de travail par jour. ROI en moins de 2 semaines.",
  },
];

interface SiteData {
  content:  SiteContent | null;
  projects: Project[];
  reviews:  Review[];
  blog:     BlogPost[];
  loading:  boolean;
}

// Articles par défaut affichés si Firestore vide
const DEFAULT_BLOG: BlogPost[] = [
  {
    id: 'd1', title: "Comment j'ai lancé Brumerie depuis mon téléphone Android",
    excerpt: "Tout le stack React + Firebase + Capacitor configuré depuis Termux sur Android. Voici comment j'ai construit une marketplace mobile sans ordinateur.",
    content: '', category: 'Développement Web',
    tags: 'React, Firebase, Android, Termux', date: '2026-04-20',
    published: true, coverEmoji: '📱',
  },
  {
    id: 'd2', title: "5 façons concrètes d'intégrer l'IA dans votre PME ivoirienne",
    excerpt: "L'IA n'est plus réservée aux grandes entreprises. Voici 5 cas d'usage immédiatement applicables pour les entrepreneurs en Côte d'Ivoire.",
    content: '', category: 'Intelligence Artificielle',
    tags: 'IA, PME, Côte d'Ivoire, ChatGPT', date: '2026-04-10',
    published: true, coverEmoji: '🤖',
  },
  {
    id: 'd3', title: "Wave vs Orange Money vs MTN MoMo : lequel intégrer en priorité ?",
    excerpt: "Comparatif complet des APIs de paiement mobile money en Côte d'Ivoire. Frais, intégration, documentation — tout ce que vous devez savoir.",
    content: '', category: 'Business',
    tags: 'Wave, Orange Money, paiement, API', date: '2026-03-28',
    published: true, coverEmoji: '💳',
  },
];

function useFirestoreData(): SiteData {
  const [data, setData] = useState<SiteData>({
    content:  null,
    projects: DEFAULT_PROJECTS_SITE,
    reviews:  DEFAULT_REVIEWS_SITE,
    blog:     DEFAULT_BLOG,   // ← toujours visible, remplacé par Firestore si disponible
    loading:  true,
  });

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const [content, projects, reviews, blog] = await Promise.all([
          getContent(),
          getProjects(),
          getReviews(),
          getBlogPosts(),
        ]);

        if (cancelled) return;

        setData({
          content,
          projects: projects.filter(p => p.visible).length > 0
            ? projects.filter(p => p.visible).sort((a, b) => a.order - b.order)
            : DEFAULT_PROJECTS_SITE,
          reviews: reviews.filter(r => r.visible).length > 0
            ? reviews.filter(r => r.visible)
            : DEFAULT_REVIEWS_SITE,
          // Seulement les articles publiés, du plus récent au plus ancien
          blog: blog.filter(b => b.published).sort((a, b) => b.date.localeCompare(a.date)),
          loading: false,
        });
      } catch {
        if (!cancelled) setData(prev => ({ ...prev, loading: false }));
      }
    }

    load();
    return () => { cancelled = true; };
  }, []);

  return data;
}

function SectionOffres() {
  const offres = [
    {
      id: 'mvp',
      badge: '🔥 Le plus populaire',
      icon: '🚀',
      name: 'MVP Express',
      tagline: 'De zéro à une app fonctionnelle',
      price: '150k – 300k FCFA',
      delay: '7 jours',
      color: '#0ff',
      waMsg: WA_MSG_MVP,
      features: [
        'Application web ou mobile complète',
        'Paiement mobile money intégré (Wave, OM, MTN)',
        'Interface responsive mobile-first',
        'Gestion utilisateurs / dashboard',
        'Hébergement 1 an inclus',
        'Support WhatsApp 30 jours post-livraison',
      ],
      ideal: 'Entrepreneurs avec une idée, startups early-stage',
    },
    {
      id: 'auto',
      badge: '⚡ ROI rapide',
      icon: '🤖',
      name: 'Automatisation Business',
      tagline: 'Gagnez 10h/semaine automatiquement',
      price: '50k – 150k FCFA',
      delay: '3 jours',
      color: '#a78bfa',
      waMsg: WA_MSG_AUTO,
      features: [
        'Bot WhatsApp intelligent (commandes, FAQ, devis)',
        'Tunnel de vente automatisé',
        'Notifications clients automatiques',
        'Tableaux de bord temps réel',
        'Intégration avec vos outils existants',
        'Formation à la prise en main',
      ],
      ideal: 'Commerçants, PME, prestataires de service',
    },
    {
      id: 'scale',
      badge: '📈 Pour scaler',
      icon: '⚡',
      name: 'Upgrade & Scaling',
      tagline: 'Votre app mérite mieux',
      price: '300k+ FCFA',
      delay: 'Sur devis',
      color: '#25D366',
      waMsg: WA_MSG_SCALE,
      features: [
        'Audit technique complet de votre code',
        'Refonte ou extension de fonctionnalités',
        'Optimisation performance et SEO',
        'Intégration IA (chatbot, recommandations…)',
        'Migration vers une architecture scalable',
        'Accompagnement CTO à temps partiel',
      ],
      ideal: 'Apps existantes qui veulent évoluer',
    },
  ];

  return (
    <Section id="offres" className="py-24 bg-[#06060f]">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-16">
          <Chip>Les offres</Chip>
          <h2 className="mt-6 text-4xl sm:text-5xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            3 offres. <span className="text-[#0ff]">Prix clairs.</span> Résultats garantis.
          </h2>
          <p className="mt-4 text-white/50 text-lg max-w-2xl mx-auto">
            Pas de devis vague. Pas de surprise. Vous savez exactement ce que vous payez et ce que vous recevez.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {offres.map((o, i) => (
            <motion.div key={o.id}
              initial={{ opacity: 0, y: 40 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.15 }}
              className="relative flex flex-col rounded-3xl border bg-white/3 overflow-hidden
                hover:bg-white/5 transition-all duration-300 group"
              style={{ borderColor: `${o.color}30` }}>

              {/* Accent top */}
              <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, transparent, ${o.color}, transparent)` }} />

              <div className="p-8 flex flex-col flex-1">
                {/* Badge */}
                <span className="text-xs font-bold mb-4 opacity-80" style={{ color: o.color }}>{o.badge}</span>

                {/* Titre */}
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-3xl">{o.icon}</span>
                  <h3 className="text-2xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{o.name}</h3>
                </div>
                <p className="text-white/50 text-sm mb-6">{o.tagline}</p>

                {/* Prix */}
                <div className="flex items-baseline gap-3 mb-2">
                  <span className="text-3xl font-black" style={{ color: o.color }}>{o.price}</span>
                </div>
                <div className="flex items-center gap-2 mb-8">
                  <Timer className="w-4 h-4 text-white/40" />
                  <span className="text-sm text-white/40">Livraison : <strong className="text-white/70">{o.delay}</strong></span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8 flex-1">
                  {o.features.map((f, fi) => (
                    <li key={fi} className="flex items-start gap-3 text-sm text-white/70">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: o.color }} />
                      {f}
                    </li>
                  ))}
                </ul>

                {/* Idéal pour */}
                <p className="text-xs text-white/30 mb-6 border-t border-white/5 pt-4">
                  <span className="text-white/50">Idéal pour :</span> {o.ideal}
                </p>

                {/* CTA */}
                <motion.a
                  href={WA(o.waMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all"
                  style={{ background: `${o.color}20`, border: `1px solid ${o.color}40`, color: o.color }}
                  whileHover={{ backgroundColor: `${o.color}30`, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <MessageCircle className="w-4 h-4" />
                  Je veux ce pack
                  <ArrowRight className="w-4 h-4" />
                </motion.a>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Garantie */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-8 p-6
            bg-[#0ff]/5 border border-[#0ff]/15 rounded-2xl text-center sm:text-left"
        >
          <Shield className="w-10 h-10 text-[#0ff] flex-shrink-0" />
          <div>
            <p className="font-bold text-white text-lg">Garantie satisfaction</p>
            <p className="text-white/50 text-sm mt-1">
              Si le livrable ne correspond pas aux specs validées ensemble, je retravaille gratuitement jusqu'à votre satisfaction totale.
            </p>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

/* ──────────────────────────────────────────────
   STATS
   ────────────────────────────────────────────── */
function SectionStats() {
  const stats = [
    { v: 50,  s: '+', label: 'Projets livrés'             },
    { v: 7,   s: 'j', label: 'Délai moyen de livraison'   },
    { v: 30,  s: '+', label: 'Clients en Afrique & Europe' },
    { v: 100, s: '%', label: 'Satisfaction client'         },
  ];

  return (
    <Section className="py-16 bg-gradient-to-b from-[#06060f] to-[#04040f]">
      <div className="max-w-5xl mx-auto px-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {stats.map((s, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="text-center p-6 bg-white/3 rounded-2xl border border-white/8"
            >
              <p className="text-4xl font-black text-[#0ff]">
                <Counter to={s.v} suffix={s.s} />
              </p>
              <p className="text-sm text-white/50 mt-2">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ──────────────────────────────────────────────
   PROJETS / ÉTUDES DE CAS
   ────────────────────────────────────────────── */
function SectionProjets({ projets: firestoreProjets }: { projets?: Project[] }) {
  // Config visuelle locale (emoji, couleur, image) — par catégorie
  const visualConfig = [
    { emoji: '🛒', color: '#25D366', img: '/images/projets/projet-marketplace.svg' },
    { emoji: '🤖', color: '#a78bfa', img: '/images/projets/projet-ia.svg'          },
    { emoji: '📄', color: '#f59e0b', img: '/images/projets/projet-saas.svg'        },
    { emoji: '💼', color: '#0ff',    img: '/images/projets/projet-web.svg'         },
    { emoji: '🚀', color: '#f43f5e', img: '/images/projets/projet-mobile.svg'      },
    { emoji: '⚡', color: '#3b82f6', img: '/images/projets/projet-default.svg'     },
  ];

  // Données affichées : Firestore si disponible, fallback hardcodé sinon
  const projetsData = firestoreProjets && firestoreProjets.length > 0
    ? firestoreProjets.map((p, i) => ({
        emoji:  visualConfig[i % visualConfig.length].emoji,
        color:  visualConfig[i % visualConfig.length].color,
        img:    p.coverImage || visualConfig[i % visualConfig.length].img,
        tag:    p.category,
        title:  p.title,
        desc:   p.desc,
        result: p.result,
        metric: p.result?.split('·')[0]?.trim() || '',
        tech:   p.tech,
      }))
    : [
    {
      emoji: '🛒',
      tag: 'Marketplace Mobile',
      title: 'Brumerie — Commerce social Abidjan',
      result: 'MVP validé · 10+ commandes réelles · Live sur Vercel',
      metric: '+10 commandes dès le MVP',
      tech: 'React · Firebase · Capacitor · Wave API',
      desc: 'Marketplace mobile-first pour l\'économie informelle d\'Abidjan. Paiement mobile money, chat intégré, stories vendeurs. Incubé par FasterCapital.',
      color: '#25D366',
    },
    {
      emoji: '🤖',
      tag: 'Agent IA',
      title: 'Agent Ultra — IA autonome sur Android',
      result: 'Opérationnel sur Telegram · 0 serveur cloud · Auto-amélioration',
      metric: '100% sur Android via Termux',
      tech: 'Python · Claude API · Gemini · SQLite',
      desc: 'Agent IA contrôlé via Telegram, tournant sur Android. Pipeline Claude Sonnet + Gemini Flash. Mémoire persistante, sécurité 5 couches.',
      color: '#a78bfa',
    },
    {
      emoji: '📄',
      tag: 'SaaS Documents',
      title: 'Docubuild — Documents pro en CI',
      result: 'En dev · 500K+ étudiants ciblés · Mobile money intégré',
      metric: 'Marché : 500K+ utilisateurs potentiels',
      tech: 'React · TypeScript · Firebase · Wave/OM',
      desc: 'Plateforme de CVs, lettres et contrats OHADA pour professionnels ivoiriens. Interface Gen Z, paiement wave/orange money natif.',
      color: '#f59e0b',
    },
  ];

  return (
    <Section id="projets" className="py-24 bg-[#04040f]">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-16">
          <Chip>Projets réels</Chip>
          <h2 className="mt-6 text-4xl sm:text-5xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Des apps que j'ai <span className="text-[#0ff]">réellement livrées</span>
          </h2>
          <p className="mt-4 text-white/50">Pas des mockups. Des produits en production.</p>
        </div>

        <div className="space-y-6">
          {projetsData.map((p, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }} whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="grid sm:grid-cols-5 gap-0 rounded-3xl overflow-hidden border border-white/8 bg-white/3 hover:bg-white/5 transition-all group"
            >
              {/* Image projet */}
              <div className="sm:col-span-1 relative overflow-hidden min-h-[140px]"
                style={{ background: `${p.color}10` }}>
                <img
                  src={p.img || '/images/projets/projet-default.svg'}
                  alt={p.title}
                  loading="lazy"
                  decoding="async"
                  className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity"
                  onError={(e) => { e.currentTarget.src = '/images/projets/projet-default.svg'; }}
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-5xl drop-shadow-xl relative z-10">{p.emoji}</span>
                </div>
              </div>

              {/* Contenu */}
              <div className="sm:col-span-4 p-8">
                <div className="flex items-start justify-between gap-4 mb-4 flex-wrap">
                  <div>
                    <span className="text-xs font-bold px-3 py-1 rounded-full border text-xs"
                      style={{ color: p.color, borderColor: `${p.color}40`, backgroundColor: `${p.color}10` }}>
                      {p.tag}
                    </span>
                    <h3 className="text-xl font-black mt-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{p.title}</h3>
                  </div>
                  {/* Metric */}
                  <div className="flex-shrink-0 text-right">
                    <p className="text-sm font-bold" style={{ color: p.color }}>{p.metric}</p>
                  </div>
                </div>
                <p className="text-white/60 text-sm leading-relaxed mb-4">{p.desc}</p>
                <div className="flex items-center gap-4 flex-wrap">
                  <div className="flex-1">
                    <p className="text-xs text-white/30 mb-1">Résultat</p>
                    <p className="text-sm font-semibold text-white/80">{p.result}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-white/30 mb-1">Stack</p>
                    <p className="text-xs text-white/50">{p.tech}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <motion.div className="text-center mt-12"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <BtnWA size="lg">
            Mon projet peut ressembler à ça ?
            <ArrowRight className="w-5 h-5" />
          </BtnWA>
        </motion.div>
      </div>
    </Section>
  );
}

/* ──────────────────────────────────────────────
   PROCESS — rassurer, réduire la friction
   ────────────────────────────────────────────── */
function SectionProcess() {
  const steps = [
    {
      num: '01',
      icon: '💬',
      title: 'Brief WhatsApp (30 min)',
      desc: 'Vous m\'écrivez. On discute de votre idée, vos objectifs, votre budget. Pas de formulaire complexe. Juste une vraie conversation.',
      color: '#0ff',
    },
    {
      num: '02',
      icon: '⚡',
      title: 'Prototype en 48h',
      desc: 'Je vous envoie un prototype cliquable en 48h. Vous voyez exactement ce que vous allez recevoir avant de payer.',
      color: '#a78bfa',
    },
    {
      num: '03',
      icon: '✅',
      title: 'Validation & ajustements',
      desc: 'On valide ensemble. Vous avez des retours ? Je les intègre immédiatement. Vous êtes dans la boucle à chaque étape.',
      color: '#25D366',
    },
    {
      num: '04',
      icon: '🚀',
      title: 'Livraison & mise en ligne',
      desc: 'Livraison en 7 jours. Je gère l\'hébergement, le domaine, les tests. Vous recevez un produit 100% fonctionnel, prêt à l\'emploi.',
      color: '#f59e0b',
    },
  ];

  return (
    <Section id="process" className="py-24 bg-gradient-to-b from-[#04040f] to-[#06060f]">
      <div className="max-w-5xl mx-auto px-5">
        <div className="text-center mb-16">
          <Chip>Comment ça marche</Chip>
          <h2 className="mt-6 text-4xl sm:text-5xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Simple. <span className="text-[#0ff]">Rapide.</span> Sans surprise.
          </h2>
          <p className="mt-4 text-white/50 text-lg">
            De votre idée à votre app en 4 étapes.
          </p>
        </div>

        <div className="relative">
          {/* Ligne verticale */}
          <div className="absolute left-[30px] sm:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-[#0ff]/40 via-violet-500/40 to-[#25D366]/40" />

          <div className="space-y-12">
            {steps.map((s, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -40 : 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`relative flex items-start gap-6 sm:gap-12 ${i % 2 === 0 ? 'sm:flex-row' : 'sm:flex-row-reverse'}`}
              >
                {/* Numéro / icône */}
                <div className="relative z-10 flex-shrink-0 w-14 h-14 rounded-2xl border-2 flex items-center justify-center text-2xl bg-[#06060f]"
                  style={{ borderColor: s.color }}>
                  {s.icon}
                </div>

                {/* Contenu */}
                <div className={`flex-1 p-6 bg-white/3 border border-white/8 rounded-2xl hover:border-white/15 transition-all ${i % 2 !== 0 ? 'sm:text-right' : ''}`}>
                  <div className="flex items-center gap-3 mb-2" style={{ justifyContent: i % 2 !== 0 ? 'flex-end' : 'flex-start' }}>
                    <span className="text-xs font-black" style={{ color: s.color }}>ÉTAPE {s.num}</span>
                  </div>
                  <h3 className="text-xl font-black mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{s.title}</h3>
                  <p className="text-white/60 text-sm leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        <motion.div className="text-center mt-16"
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <BtnWA size="lg">
            Démarrer l'étape 1 maintenant
            <ArrowRight className="w-5 h-5" />
          </BtnWA>
          <p className="text-white/30 text-sm mt-3">Réponse sous 2h • Aucun engagement</p>
        </motion.div>
      </div>
    </Section>
  );
}

/* ──────────────────────────────────────────────
   TÉMOIGNAGES
   ────────────────────────────────────────────── */
function SectionAvis({ reviews: firestoreReviews }: { reviews?: Review[] }) {
  const avis = firestoreReviews && firestoreReviews.length > 0
    ? firestoreReviews.map(r => ({ text: r.text, name: r.author, role: r.role, co: r.company, stars: r.stars }))
    : [
    {
      text: "Tché a livré notre app en 6 jours. Exactement ce qu'on avait décrit, sans aucune surprise. Le code est propre, l'app est rapide. On a signé nos 3 premiers clients dans la semaine.",
      name: 'Kouamé A.', role: 'CEO', co: 'Startup Fintech · Abidjan', stars: 5,
    },
    {
      text: "J'avais peur de me faire arnaquer encore. Tché m'a envoyé un prototype en 48h avant que je paie quoi que ce soit. Ça m'a convaincu. Le résultat final dépasse mes attentes.",
      name: 'Diallo M.', role: 'Fondateur', co: 'AgriTech · Dakar', stars: 5,
    },
    {
      text: "Notre bot WhatsApp répond maintenant automatiquement à 80% des questions clients. On économise 3h de travail par jour. ROI en moins de 2 semaines.",
      name: 'Traoré S.', role: 'Directrice', co: 'E-commerce · Abidjan', stars: 5,
    },
  ];

  return (
    <Section id="avis" className="py-24 bg-[#06060f]">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-16">
          <Chip>Témoignages</Chip>
          <h2 className="mt-6 text-4xl sm:text-5xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Ce qu'ils disent <span className="text-[#0ff]">après</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {avis.map((a, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.1 }}
              className="p-7 bg-white/3 border border-white/8 rounded-3xl flex flex-col hover:border-[#0ff]/20 transition-all">
              <div className="flex gap-1 mb-5">
                {[...Array(a.stars)].map((_, si) => <Star key={si} className="w-4 h-4 fill-yellow-400 text-yellow-400" />)}
              </div>
              <p className="text-white/70 leading-relaxed text-sm italic flex-1 mb-6">« {a.text} »</p>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-2 border-white/10">
                  <img
                    src={`/images/avis/avatar-${(i % 6) + 1}.svg`}
                    alt={a.name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display='none'; }}
                  />
                </div>
                <div>
                  <p className="font-bold text-white text-sm">{a.name}</p>
                  <p className="text-xs text-white/40">{a.role} — {a.co}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mini urgency */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          className="mt-12 text-center p-6 bg-[#0ff]/5 border border-[#0ff]/20 rounded-2xl"
        >
          <p className="text-[#0ff] font-bold text-lg">⚡ Je prends maximum 3 clients simultanément</p>
          <p className="text-white/50 text-sm mt-1">Pour garantir la qualité de chaque livraison. Places limitées chaque mois.</p>
          <div className="mt-5">
            <BtnWA size="md">Vérifier la disponibilité</BtnWA>
          </div>
        </motion.div>
      </div>
    </Section>
  );
}

/* ──────────────────────────────────────────────
   FAQ
   ────────────────────────────────────────────── */
/* ──────────────────────────────────────────────
   SECTION BLOG — Articles depuis Firestore
   Mis à jour depuis /admin → Blog
   ────────────────────────────────────────────── */
// Images par catégorie pour le blog
const BLOG_IMAGES: Record<string, string> = {
  'Intelligence Artificielle': '/images/blog/blog-ia.svg',
  'Développement Web':         '/images/blog/blog-web.svg',
  'Business':                  '/images/blog/blog-business.svg',
  'Formation':                 '/images/blog/blog-formation.svg',
  'Actualités':                '/images/blog/blog-actu.svg',
  'Tutoriel':                  '/images/blog/blog-formation.svg',
};


function SectionBlog({ posts }: { posts: BlogPost[] }) {
  // posts contient toujours au moins DEFAULT_BLOG (géré par le hook)
  const displayPosts = posts;

  const CATEGORY_COLORS: Record<string, string> = {
    'Intelligence Artificielle': '#0ff',
    'Développement Web':         '#3b82f6',
    'Business':                  '#25D366',
    'Formation':                 '#a78bfa',
    'Actualités':                '#f59e0b',
    'Tutoriel':                  '#f43f5e',
  };

  return (
    <Section id="blog" className="py-24 bg-gradient-to-b from-[#04040f] to-[#06060f]">
      <div className="max-w-6xl mx-auto px-5">
        <div className="text-center mb-16">
          <Chip>Blog</Chip>
          <h2 className="mt-6 text-4xl sm:text-5xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Articles & <span className="text-[#0ff]">Insights</span>
          </h2>
          <p className="mt-4 text-white/50 text-lg max-w-2xl mx-auto">
            Conseils tech, retours d'expérience et opportunités digitales pour les entrepreneurs africains.
          </p>
        </div>

        {/* Grille d'articles */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayPosts.map((post, i) => {
            const catColor = CATEGORY_COLORS[post.category] || '#0ff';
            return (
              <motion.article
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="group flex flex-col bg-white/3 border border-white/8 rounded-3xl overflow-hidden
                  hover:border-[#0ff]/20 hover:bg-white/5 transition-all duration-300 cursor-pointer"
              >
                {/* Cover image + overlay */}
                <div className="relative h-44 overflow-hidden">
                  {/* Image de couverture — placeholder SVG ou vraie image */}
                  <img
                    src={post.coverImage || BLOG_IMAGES[post.category] || '/images/blog/blog-default.svg'}
                    alt={post.title}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    onError={(e) => { e.currentTarget.src = '/images/blog/blog-default.svg'; }}
                  />
                  {/* Overlay dégradé */}
                  <div className="absolute inset-0"
                    style={{ background: `linear-gradient(to top, ${catColor}40, transparent)` }} />
                  {/* Emoji flottant */}
                  <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl opacity-80 drop-shadow-lg">
                    {post.coverEmoji}
                  </span>
                  {/* Badge catégorie */}
                  <span className="absolute top-3 left-3 text-xs font-bold px-3 py-1 rounded-full border backdrop-blur-sm"
                    style={{ color: catColor, borderColor: `${catColor}40`, backgroundColor: `rgba(4,4,15,0.8)` }}>
                    {post.category}
                  </span>
                </div>

                {/* Contenu */}
                <div className="flex flex-col flex-1 p-6">
                  <p className="text-xs text-white/30 mb-3 flex items-center gap-2">
                    <span>📅 {new Date(post.date).toLocaleDateString('fr-CI', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  </p>
                  <h3 className="font-black text-lg leading-snug mb-3 group-hover:text-[#0ff] transition-colors"
                    style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
                    {post.title}
                  </h3>
                  <p className="text-white/50 text-sm leading-relaxed flex-1 mb-5 line-clamp-3">
                    {post.excerpt}
                  </p>

                  {/* Tags */}
                  {post.tags && (
                    <div className="flex flex-wrap gap-2 mb-5">
                      {post.tags.split(',').slice(0, 3).map(tag => (
                        <span key={tag.trim()} className="text-xs px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-white/40">
                          #{tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* CTA Lire */}
                  <div className="flex items-center gap-2 text-sm font-semibold group-hover:gap-3 transition-all"
                    style={{ color: catColor }}>
                    Lire l'article
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* CTA WhatsApp si peu d'articles */}
        {displayPosts.length < 3 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
            className="mt-12 text-center p-6 bg-white/3 border border-white/8 rounded-2xl"
          >
            <p className="text-white/50 text-sm">
              💡 Tu veux qu'on parle d'un sujet en particulier ?
            </p>
            <div className="mt-4">
              <BtnWA size="sm" msg={encodeURIComponent("Bonjour Tché 👋 j'aimerais que tu écrives un article sur...")}>
                Suggérer un sujet
              </BtnWA>
            </div>
          </motion.div>
        )}
      </div>
    </Section>
  );
}

function SectionFAQ() {
  const [open, setOpen] = useState<number | null>(null);
  const faqs = [
    {
      q: 'Comment se passe le paiement ?',
      a: '50% à la commande, 50% à la livraison. Paiement via Wave, Orange Money ou virement. Je ne demande jamais 100% avant de commencer.',
    },
    {
      q: 'Est-ce que 7 jours c\'est vraiment possible ?',
      a: 'Pour un MVP oui — si le brief est clair. On définit ensemble le scope exact en amont. Ce qui prend du temps c\'est le flou, pas le code.',
    },
    {
      q: 'Je n\'y connais rien en tech — c\'est un problème ?',
      a: 'Non. Mon rôle c\'est de traduire votre vision en produit. Vous parlez business, moi je parle code. Tout se passe en langage simple sur WhatsApp.',
    },
    {
      q: 'Que se passe-t-il après la livraison ?',
      a: 'Support WhatsApp 30 jours inclus dans tous les packs. Après, je propose des forfaits maintenance mensuelle si vous avez besoin.',
    },
    {
      q: 'Vous travaillez en dehors d\'Abidjan ?',
      a: 'Oui. Clients au Sénégal, en France, en Belgique. Tout se passe à distance : WhatsApp, Notion, GitHub. La distance n\'est pas un obstacle.',
    },
    {
      q: 'Comment je sais que vous êtes fiable ?',
      a: 'Prototype en 48h avant paiement complet. Code source livré avec l\'app. Références disponibles sur demande. Et on commence toujours par une conversation gratuite.',
    },
  ];

  return (
    <Section id="faq" className="py-24 bg-gradient-to-b from-[#06060f] to-[#04040f]">
      <div className="max-w-3xl mx-auto px-5">
        <div className="text-center mb-16">
          <Chip>FAQ</Chip>
          <h2 className="mt-6 text-4xl sm:text-5xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Les vraies <span className="text-[#0ff]">questions</span>
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((f, i) => (
            <motion.div key={i}
              initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className="bg-white/3 border border-white/8 rounded-2xl overflow-hidden hover:border-[#0ff]/20 transition-all"
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="w-full px-6 py-5 flex items-center justify-between text-left gap-4"
                aria-expanded={open === i}
              >
                <span className="font-semibold text-white">{f.q}</span>
                <motion.div animate={{ rotate: open === i ? 180 : 0 }} transition={{ duration: 0.25 }}>
                  <ChevronDown className="w-5 h-5 text-[#0ff] flex-shrink-0" />
                </motion.div>
              </button>
              <AnimatePresence initial={false}>
                {open === i && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-5 text-white/60 leading-relaxed text-sm">{f.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </Section>
  );
}

/* ──────────────────────────────────────────────
   CTA FINAL — ultra court, ultra direct
   ────────────────────────────────────────────── */
function SectionCTAFinal() {
  return (
    <Section className="py-32 bg-[#04040f] relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none" aria-hidden>
        <div className="absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: 'radial-gradient(circle at center, rgba(0,255,255,1) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#0ff]/5 rounded-full blur-[100px]" />
      </div>

      <div className="max-w-3xl mx-auto px-5 text-center relative z-10">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <p className="text-[#0ff] font-black text-sm uppercase tracking-widest mb-6">Prêt à commencer ?</p>
          <h2 className="text-5xl sm:text-6xl font-black leading-tight mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Votre idée mérite{' '}
            <span className="text-[#0ff]">mieux que</span>{' '}
            l'attente.
          </h2>
          <p className="text-white/50 text-xl mb-10 leading-relaxed">
            Écrivez-moi maintenant. Dans 48h, vous avez un prototype.
            Dans 7 jours, votre app est en ligne.
          </p>

          <BtnWA size="lg" className="mx-auto">
            Démarrer maintenant — C'est gratuit
            <ArrowRight className="w-5 h-5" />
          </BtnWA>

          <p className="text-white/30 text-sm mt-5">
            Aucun engagement · Réponse sous 2h · Prototype avant paiement
          </p>
        </motion.div>
      </div>
    </Section>
  );
}

/* ──────────────────────────────────────────────
   CONTACT — formulaire ultra court
   ────────────────────────────────────────────── */
function SectionContact() {
  const [form, setForm]     = useState({ nom: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errors, setErrors] = useState<{ nom?: string; email?: string; message?: string }>({});

  const validate = () => {
    const e: typeof errors = {};
    if (!form.nom.trim()) e.nom = 'Requis';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Email invalide';
    if (!form.message.trim()) e.message = 'Requis';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus('sending');
    try {
      await sendMessage({
        nom: form.nom, email: form.email,
        service: 'contact-rapide', message: form.message,
        date: new Date().toLocaleString('fr-CI', { timeZone: 'Africa/Abidjan' }),
      });
      setStatus('success');
      setForm({ nom: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  const cls = (err?: string) =>
    `w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 focus:outline-none focus:ring-2 transition-all
    ${err ? 'border-red-500/60 focus:ring-red-500/30' : 'border-white/10 focus:ring-[#0ff]/30 focus:border-[#0ff]/40'}`;

  return (
    <Section id="contact" className="py-24 bg-[#04040f]">
      <div className="max-w-2xl mx-auto px-5">
        <div className="text-center mb-12">
          <Chip>Contact rapide</Chip>
          <h2 className="mt-6 text-4xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Préférez <span className="text-[#0ff]">WhatsApp ?</span>
          </h2>
          <p className="mt-4 text-white/50">Réponse garantie sous 2h. C'est le moyen le plus rapide.</p>
          <div className="mt-6">
            <BtnWA size="lg" className="mx-auto">Discuter sur WhatsApp</BtnWA>
          </div>
          <p className="text-white/30 text-sm mt-6">— ou laissez un message ci-dessous —</p>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <input value={form.nom} onChange={e => setForm(p => ({ ...p, nom: e.target.value }))}
                placeholder="Votre nom *" className={cls(errors.nom)} />
              {errors.nom && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.nom}</p>}
            </div>
            <div>
              <input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="Votre email *" className={cls(errors.email)} />
              {errors.email && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.email}</p>}
            </div>
          </div>
          <div>
            <textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
              rows={4} placeholder="Décrivez votre projet en 2-3 phrases *"
              className={`${cls(errors.message)} resize-none`} />
            {errors.message && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{errors.message}</p>}
          </div>
          <motion.button type="submit" disabled={status === 'sending' || status === 'success'}
            className="w-full py-4 bg-white/8 border border-white/15 text-white font-bold rounded-2xl hover:bg-white/12 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }}>
            {status === 'sending' && <><Zap className="w-4 h-4 animate-pulse" />Envoi...</>}
            {status === 'idle' && <>Envoyer le message <ArrowRight className="w-4 h-4" /></>}
            {status === 'success' && <><CheckCircle className="w-4 h-4 text-[#25D366]" />Reçu ! Je réponds sous 2h</>}
            {status === 'error' && 'Erreur — essayez WhatsApp'}
          </motion.button>
        </form>
      </div>
    </Section>
  );
}

/* ──────────────────────────────────────────────
   FOOTER
   ────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="bg-[#02020a] border-t border-white/5 py-10" role="contentinfo">
      <div className="max-w-6xl mx-auto px-5 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <p className="font-black text-xl" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            tché<span className="text-[#0ff]">.</span>dev
          </p>
          <p className="text-white/30 text-xs mt-1">Je code depuis Abidjan. Je build pour le monde.</p>
        </div>
        <div className="flex items-center gap-6">
          <a href={WA()} target="_blank" rel="noopener noreferrer"
            className="text-sm text-white/40 hover:text-[#25D366] transition-colors flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4" /> +225 05 86 86 76 93
          </a>
          <a href="mailto:contact@brumerie.ci"
            className="text-sm text-white/40 hover:text-white transition-colors">
            contact@brumerie.ci
          </a>
        </div>
        <p className="text-white/20 text-xs">© {new Date().getFullYear()} Doukoua Tché Serge Alain</p>
      </div>
    </footer>
  );
}

/* ──────────────────────────────────────────────
   BOUTON WA FLOTTANT — toujours visible
   ────────────────────────────────────────────── */
function FloatingWA() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const handler = () => setVisible(window.scrollY > 200);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <motion.a
          href={WA()}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Contacter Tché sur WhatsApp"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          className="fixed bottom-6 right-6 z-50 w-16 h-16 bg-[#25D366] rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(37,211,102,0.5)] hover:shadow-[0_0_60px_rgba(37,211,102,0.7)] transition-shadow"
        >
          <div className="absolute inset-0 rounded-full border-4 border-[#25D366]/40 animate-ping" aria-hidden />
          <MessageCircle className="w-7 h-7 text-white" />
        </motion.a>
      )}
    </AnimatePresence>
  );
}

/* ──────────────────────────────────────────────
   BARRE DE PROGRESSION SCROLL
   ────────────────────────────────────────────── */
function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  return (
    <motion.div
      className="fixed top-0 left-0 right-0 h-[2px] bg-[#0ff] origin-left z-50"
      style={{ scaleX: scrollYProgress }}
      aria-hidden
    />
  );
}

/* ──────────────────────────────────────────────
   APP PRINCIPALE
   ────────────────────────────────────────────── */
export default function App() {
  // ✅ Chargement des données Firestore — tout ce que tu postes dans /admin s'affiche ici
  const { projects, reviews, blog } = useFirestoreData();

  return (
    <div className="min-h-screen bg-[#04040f] text-white overflow-x-hidden"
      style={{ fontFamily: 'Inter, sans-serif' }}>

      <ScrollProgress />
      <Nav />
      <Hero />
      <SectionProbleme />
      <SectionStats />
      <SectionOffres />

      {/* ✅ Projets — depuis Firestore (/admin → Portfolio) */}
      <SectionProjets projets={projects} />

      <SectionProcess />

      {/* ✅ Avis clients — depuis Firestore (/admin → Avis Clients) */}
      <SectionAvis reviews={reviews} />

      {/* ✅ Blog — depuis Firestore (/admin → Blog) — n'apparaît que si articles publiés */}
      <SectionBlog posts={blog} />

      <SectionFAQ />
      <SectionCTAFinal />
      <SectionContact />
      <Footer />
      <FloatingWA />
    </div>
  );
}
