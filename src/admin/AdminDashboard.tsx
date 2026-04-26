/**
 * BRUMERIE — DASHBOARD ADMIN v3
 * ─────────────────────────────
 * Onglets :
 *  1. Vue d'ensemble   (KPIs + graphiques)
 *  2. Contenu & Photo  (textes + upload photo PDG)
 *  3. Services         (CRUD services dynamiques)
 *  4. Portfolio        (CRUD projets)
 *  5. Blog             (CRUD articles)
 *  6. Avis Clients     (CRUD témoignages)
 *  7. Messages         (inbox formulaire contact)
 *  8. Analytique       (visites, sources, conversions)
 *  9. Paramètres       (compte, notifications, sécurité)
 */

import { useState, useCallback, useRef, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, FileText, Briefcase, MessageSquare, Star,
  BarChart3, Settings, LogOut, Eye, EyeOff, Trash2, Edit3,
  Plus, Save, X, CheckCircle, AlertCircle, TrendingUp, Users,
  MousePointerClick, Mail, Clock, Upload, Shield, Bell,
  ChevronRight, Search, RefreshCw, Code2, Newspaper,
  Wrench, ArrowUp, ArrowDown, Image, Link, Tag,
} from 'lucide-react';

/* ============================================================
   TYPES
   ============================================================ */
interface Service {
  id: string; icon: string; title: string; desc: string;
  gradient: string; visible: boolean; order: number;
}
interface Project {
  id: string; category: string; title: string; desc: string;
  result: string; tech: string; gradient: string;
  visible: boolean; order: number; link?: string;
}
interface BlogPost {
  id: string; title: string; excerpt: string; content: string;
  category: string; tags: string; date: string;
  published: boolean; coverEmoji: string;
}
interface Review {
  id: string; author: string; role: string; company: string;
  text: string; stars: number; visible: boolean; date: string;
}
interface Message {
  id: string; nom: string; email: string; service: string;
  message: string; date: string; read: boolean; replied: boolean;
}
interface SiteContent {
  heroTitle: string; heroBio: string;
  aboutText1: string; aboutText2: string;
  whatsapp: string; email: string; photoUrl: string;
  disponibilite: string; slogan: string;
}

/* ============================================================
   DONNÉES INITIALES
   ============================================================ */
const INIT_SERVICES: Service[] = [
  { id: '1', icon: '🖥️', title: 'Création de Sites Web', order: 1, visible: true,
    gradient: 'from-blue-600 to-blue-700',
    desc: "Sites vitrines, e-commerce, applications web sur mesure. Design moderne, responsive, SEO optimisé." },
  { id: '2', icon: '🤖', title: "Intégration de l'IA", order: 2, visible: true,
    gradient: 'from-teal-600 to-teal-700',
    desc: "Chatbots, automatisation, analyse prédictive. L'IA au service concret de votre business." },
  { id: '3', icon: '🎓', title: 'Formation & Accompagnement', order: 3, visible: true,
    gradient: 'from-cyan-600 to-cyan-700',
    desc: "Formations pratiques ChatGPT, Midjourney, automatisation. Adaptées au contexte africain." },
  { id: '4', icon: '🔧', title: 'Maintenance Web', order: 4, visible: true,
    gradient: 'from-blue-500 to-teal-500',
    desc: "Sécurisation, mises à jour, optimisation performance. Disponibilité 24/7." },
  { id: '5', icon: '💡', title: 'Conseil Digital', order: 5, visible: true,
    gradient: 'from-purple-600 to-blue-600',
    desc: "Audit, stratégie digitale, choix d'outils adaptés à votre budget et vos objectifs." },
];

const INIT_PROJECTS: Project[] = [
  { id: '1', category: 'Mode & Retail', title: 'E-commerce AfroChic CI',
    desc: 'Boutique en ligne avec paiement mobile money et chatbot IA.',
    result: '+300% de ventes en 6 mois', tech: 'React, Node.js, MongoDB',
    gradient: 'from-pink-500 to-purple-600', visible: true, order: 1 },
  { id: '2', category: 'Immobilier', title: 'Site Vitrine ImmoCocody',
    desc: 'Site premium avec carte interactive et fiches biens dynamiques.',
    result: '+150 leads/mois', tech: 'Next.js, Tailwind, Google Maps API',
    gradient: 'from-blue-500 to-cyan-600', visible: true, order: 2 },
  { id: '3', category: 'RH / SaaS', title: 'App RH GestPaie CI',
    desc: 'Gestion de paie et présences pour PME ivoiriennes.',
    result: '12 entreprises abonnées en 3 mois', tech: 'Laravel, Vue.js, MySQL',
    gradient: 'from-green-500 to-emerald-600', visible: true, order: 3 },
];

const INIT_BLOG: BlogPost[] = [
  { id: '1', title: "5 raisons d'intégrer l'IA dans votre PME dès 2026",
    excerpt: "L'intelligence artificielle n'est plus réservée aux grandes entreprises. Voici comment les PME africaines peuvent en tirer profit immédiatement.",
    content: "Contenu de l'article ici...", category: 'Intelligence Artificielle',
    tags: 'IA, PME, Afrique, automatisation', date: '2026-04-20',
    published: true, coverEmoji: '🤖' },
  { id: '2', title: "Pourquoi votre site web ivoirien doit être mobile-first",
    excerpt: "89% des ivoiriens naviguent sur mobile. Un site non optimisé perd 9 visiteurs sur 10. Découvrez comment corriger ça.",
    content: "Contenu de l'article ici...", category: 'Développement Web',
    tags: 'mobile, responsive, Côte d\'Ivoire', date: '2026-04-10',
    published: true, coverEmoji: '📱' },
  { id: '3', title: "Guide : Choisir le bon outil de paiement mobile en CI",
    excerpt: "Wave, Orange Money, MTN MoMo, Moov Money — lequel intégrer en priorité ? Comparatif complet 2026.",
    content: "Contenu de l'article ici...", category: 'Business',
    tags: 'paiement, mobile money, Wave, Orange Money', date: '2026-03-28',
    published: false, coverEmoji: '💳' },
];

const INIT_REVIEWS: Review[] = [
  { id: '1', author: 'Aïcha K.', role: 'Fondatrice', company: 'AfroChic CI',
    text: "Serge Alain a transformé notre présence en ligne. Notre site e-commerce génère des ventes tous les jours. Son approche est vraiment professionnelle.",
    stars: 5, visible: true, date: '2026-03-15' },
  { id: '2', author: 'Koffi B.', role: 'Directeur Commercial', company: 'LogistiQ CI',
    text: "La formation IA animée pour notre équipe a été un tournant. Nos commerciaux utilisent ChatGPT quotidiennement. Rentabilisée en 2 semaines.",
    stars: 5, visible: true, date: '2026-02-28' },
  { id: '3', author: 'Yao E.', role: 'Gérant', company: 'ImmoCocody',
    text: 'Toujours disponible sur WhatsApp. Ma maintenance web est entre de bonnes mains depuis 2 ans.',
    stars: 5, visible: true, date: '2026-01-10' },
];

const INIT_MESSAGES: Message[] = [
  { id: '1', nom: 'Aïcha Koné', email: 'aicha@afrochic.ci', service: 'site-web',
    message: 'Bonjour, je voudrais refondre mon site e-commerce. Pouvez-vous me donner un devis ?',
    date: '2026-04-24 10:32', read: false, replied: false },
  { id: '2', nom: 'Koffi Bamba', email: 'koffi.b@logistiq.ci', service: 'formation',
    message: 'Nous sommes intéressés par une formation IA pour 20 commerciaux.',
    date: '2026-04-23 14:15', read: true, replied: true },
  { id: '3', nom: 'Marie Dupont', email: 'marie@startup.ci', service: 'ia',
    message: "J'aimerais intégrer un chatbot IA dans notre application mobile.",
    date: '2026-04-22 09:00', read: true, replied: false },
];

const INIT_CONTENT: SiteContent = {
  heroTitle: 'Votre Vision. Mon Code. Votre Succès.',
  heroBio: "Entrepreneur digital et PDG de Brumerie, basé à Abidjan. Je conçois des sites web performants et intègre l'intelligence artificielle au cœur de votre business.",
  aboutText1: "Je suis Doukoua Tché Serge Alain, entrepreneur digital passionné et PDG de Brumerie, basé à Abidjan, Côte d'Ivoire.",
  aboutText2: "Convaincu que la technologie doit être accessible à toutes les entreprises africaines, j'accompagne PME, startups et grands comptes dans leur transformation digitale.",
  whatsapp: '+225 05 86 86 76 93',
  email: 'contact@brumerie.ci',
  photoUrl: '/images/pdg-photo.webp',
  disponibilite: 'Lun – Ven, 8h – 18h (GMT)',
  slogan: 'Digitaliser l\'Afrique, un projet à la fois.',
};

/* ============================================================
   COMPOSANTS UI RÉUTILISABLES
   ============================================================ */
function Badge({ children, color = 'blue' }: { children: React.ReactNode; color?: string }) {
  const map: Record<string, string> = {
    blue:   'bg-blue-500/15 text-blue-300 border-blue-500/30',
    teal:   'bg-teal-500/15 text-teal-300 border-teal-500/30',
    green:  'bg-green-500/15 text-green-300 border-green-500/30',
    red:    'bg-red-500/15 text-red-300 border-red-500/30',
    yellow: 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
    gray:   'bg-gray-500/15 text-gray-400 border-gray-500/30',
    purple: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  };
  return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[color] || map.blue}`}>{children}</span>;
}

function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border text-sm font-medium backdrop-blur-sm
        ${type === 'success' ? 'bg-green-900/90 border-green-500/30 text-green-200' : 'bg-red-900/90 border-red-500/30 text-red-200'}`}>
      {type === 'success' ? <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />}
      {msg}
      <button onClick={onClose} className="ml-1 opacity-50 hover:opacity-100 transition-opacity"><X className="w-4 h-4" /></button>
    </motion.div>
  );
}

function StatCard({ icon: Icon, label, value, sub, gradient }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; gradient: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/60 rounded-2xl border border-white/5 p-5 hover:border-teal-500/20 transition-all group">
      <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shadow-lg`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-sm text-gray-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </motion.div>
  );
}

/* Modal générique */
function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}>
      <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9 }}
        className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h3 className="font-black text-white text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  );
}

/* Champ texte admin */
function Field({ label, value, onChange, multiline = false, rows = 3, placeholder = '', hint = '' }: {
  label: string; value: string; onChange: (v: string) => void;
  multiline?: boolean; rows?: number; placeholder?: string; hint?: string;
}) {
  const cls = "w-full bg-slate-800/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all";
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
      {multiline
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} placeholder={placeholder} className={`${cls} resize-none`} />
        : <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />}
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

/* Bouton primaire */
function BtnPrimary({ onClick, children, disabled = false }: { onClick?: () => void; children: React.ReactNode; disabled?: boolean }) {
  return (
    <motion.button onClick={onClick} disabled={disabled} type={onClick ? 'button' : 'submit'}
      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl font-semibold text-sm shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all disabled:opacity-50"
      whileHover={!disabled ? { scale: 1.02 } : {}} whileTap={!disabled ? { scale: 0.97 } : {}}>
      {children}
    </motion.button>
  );
}

/* ============================================================
   ÉCRAN DE CONNEXION
   ============================================================ */
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr('');
    await new Promise((r) => setTimeout(r, 900));
    // En prod : remplacer par Firebase signInWithEmailAndPassword
    if (email === 'admin@brumerie.ci' && pwd === 'Brumerie2026!') {
      onLogin();
    } else {
      setErr('Email ou mot de passe incorrect.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4" style={{ fontFamily: 'Inter, sans-serif' }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/15 rounded-full blur-[100px]" />
      </div>
      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-white/10 p-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-teal-500/30">
            <Shield className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Dashboard Admin</h1>
          <p className="text-gray-500 text-sm mt-1">Brumerie — Espace sécurisé</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
              placeholder="admin@brumerie.ci"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Mot de passe</label>
            <div className="relative">
              <input type={showPwd ? 'text' : 'password'} value={pwd} onChange={(e) => setPwd(e.target.value)} required
                placeholder="••••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all" />
              <button type="button" onClick={() => setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                {showPwd ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>
          {err && <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />{err}
          </div>}
          <motion.button type="submit" disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl font-bold shadow-xl shadow-teal-500/20 transition-all disabled:opacity-60"
            whileHover={!loading ? { scale: 1.01, y: -1 } : {}} whileTap={!loading ? { scale: 0.98 } : {}}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <motion.div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }} />
                Connexion...
              </span>
            ) : 'Se connecter →'}
          </motion.button>
        </form>
        <p className="text-center text-xs text-gray-700 mt-6">Admin : admin@brumerie.ci / Brumerie2026!</p>
      </motion.div>
    </div>
  );
}

/* ============================================================
   TAB 1 — VUE D'ENSEMBLE
   ============================================================ */
function TabOverview({ services, projects, blog, reviews, messages }: {
  services: Service[]; projects: Project[]; blog: BlogPost[];
  reviews: Review[]; messages: Message[];
}) {
  const unread = messages.filter((m) => !m.read).length;
  const weekly = [38, 52, 45, 61, 71, 28, 17];
  const days   = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
  const max    = Math.max(...weekly);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Wrench}      label="Services actifs"  value={services.filter(s=>s.visible).length}  gradient="from-blue-600 to-blue-700" />
        <StatCard icon={Briefcase}   label="Projets portfolio" value={projects.filter(p=>p.visible).length} gradient="from-teal-600 to-teal-700" />
        <StatCard icon={Newspaper}   label="Articles publiés" value={blog.filter(b=>b.published).length}    gradient="from-purple-600 to-purple-700" />
        <StatCard icon={MessageSquare} label="Messages non lus" value={unread} sub={`${messages.length} total`} gradient="from-orange-500 to-red-500" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Star}           label="Avis clients"    value={reviews.filter(r=>r.visible).length}  gradient="from-yellow-500 to-orange-500" />
        <StatCard icon={Eye}            label="Visites/semaine" value="312"                                    gradient="from-cyan-600 to-cyan-700" />
        <StatCard icon={MousePointerClick} label="Clics WhatsApp" value="89"                                  gradient="from-green-600 to-green-700" />
        <StatCard icon={TrendingUp}     label="Taux conversion" value="6.9%"                                  gradient="from-indigo-600 to-blue-600" />
      </div>

      {/* Graphique */}
      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/60 rounded-2xl border border-white/5 p-6">
          <h3 className="font-bold text-white mb-5 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-400" /> Visites — 7 derniers jours
          </h3>
          <div className="flex items-end gap-3 h-36">
            {weekly.map((v, i) => (
              <div key={days[i]} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500">{v}</span>
                <motion.div initial={{ height: 0 }} animate={{ height: `${(v / max) * 100}%` }}
                  transition={{ duration: 0.8, delay: i * 0.06 }}
                  className="w-full bg-gradient-to-t from-blue-600 to-teal-400 rounded-t-lg min-h-[4px]" />
                <span className="text-xs text-gray-600">{days[i]}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activité récente */}
        <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Clock className="w-5 h-5 text-teal-400" /> Activité récente
          </h3>
          <div className="space-y-3">
            {[
              { icon: '💬', text: 'Nouveau message reçu', time: 'il y a 2h', color: 'text-blue-400' },
              { icon: '👁️', text: '47 visites aujourd\'hui', time: 'aujourd\'hui', color: 'text-teal-400' },
              { icon: '📱', text: '12 clics WhatsApp', time: 'aujourd\'hui', color: 'text-green-400' },
              { icon: '⭐', text: 'Nouvel avis client', time: 'hier', color: 'text-yellow-400' },
              { icon: '📝', text: 'Article publié', time: 'il y a 4j', color: 'text-purple-400' },
            ].map((a, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                <span className="text-lg">{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-300 truncate">{a.text}</p>
                  <p className="text-xs text-gray-600">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Messages récents */}
      <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <Mail className="w-5 h-5 text-teal-400" /> Derniers messages
        </h3>
        <div className="space-y-3">
          {messages.slice(0, 3).map((m) => (
            <div key={m.id} className="flex items-center gap-4 p-3 bg-slate-700/30 rounded-xl">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-teal-500 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">
                {m.nom.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-white">{m.nom}</span>
                  {!m.read && <Badge color="blue">Nouveau</Badge>}
                  {m.replied && <Badge color="green">Répondu</Badge>}
                </div>
                <p className="text-xs text-gray-500 truncate">{m.message}</p>
              </div>
              <span className="text-xs text-gray-600 flex-shrink-0">{m.date.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TAB 2 — CONTENU & PHOTO
   ============================================================ */
function TabContent({ content, onSave }: { content: SiteContent; onSave: (c: SiteContent) => void }) {
  const [form, setForm] = useState(content);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const set = (k: keyof SiteContent) => (v: string) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = () => {
    onSave(form); setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* PHOTO PDG */}
      <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6">
        <h3 className="font-bold text-white mb-5 flex items-center gap-2">
          <Image className="w-5 h-5 text-teal-400" /> Photo PDG
        </h3>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Prévisualisation */}
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-700 border-2 border-dashed border-teal-500/40 flex items-center justify-center">
              {form.photoUrl ? (
                <img src={form.photoUrl} alt="PDG" className="w-full h-full object-cover"
                  onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              ) : (
                <span className="text-4xl">👨🏾‍💻</span>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">Prévisualisation</p>
          </div>

          <div className="flex-1 space-y-4">
            <Field label="URL de votre photo" value={form.photoUrl} onChange={set('photoUrl')}
              placeholder="/images/pdg-photo.webp"
              hint="Placez votre photo dans public/images/ puis saisissez le chemin ici." />

            {/* Instructions claires */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 space-y-2">
              <p className="text-sm font-semibold text-blue-300 flex items-center gap-2">
                <Upload className="w-4 h-4" /> Comment ajouter votre photo ?
              </p>
              <ol className="text-xs text-gray-400 space-y-1 list-decimal list-inside">
                <li>Préparez votre photo au format <code className="text-teal-400">WebP</code> ou <code className="text-teal-400">JPG</code> (carré, min 600×600px)</li>
                <li>Nommez-la <code className="text-teal-400">pdg-photo.webp</code></li>
                <li>Déposez-la dans le dossier <code className="text-teal-400">public/images/</code> de votre projet</li>
                <li>Redéployez sur Vercel (push Git ou <code className="text-teal-400">vercel --prod</code>)</li>
                <li>L'URL à saisir ci-dessus : <code className="text-teal-400">/images/pdg-photo.webp</code></li>
              </ol>
            </div>

            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const url = URL.createObjectURL(file);
                  setForm((p) => ({ ...p, photoUrl: url }));
                }
              }} />
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-slate-600 transition-all">
              <Upload className="w-4 h-4" /> Tester avec un fichier local
            </button>
          </div>
        </div>
      </div>

      {/* Textes Hero */}
      <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6 space-y-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal-400" /> Section Hero
        </h3>
        <Field label="Titre principal" value={form.heroTitle} onChange={set('heroTitle')}
          placeholder="Votre Vision. Mon Code. Votre Succès." />
        <Field label="Description / Bio hero" value={form.heroBio} onChange={set('heroBio')} multiline rows={3} />
      </div>

      {/* Textes À propos */}
      <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6 space-y-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-400" /> Section À propos
        </h3>
        <Field label="Paragraphe 1" value={form.aboutText1} onChange={set('aboutText1')} multiline rows={3} />
        <Field label="Paragraphe 2" value={form.aboutText2} onChange={set('aboutText2')} multiline rows={3} />
        <Field label="Slogan footer" value={form.slogan} onChange={set('slogan')} />
      </div>

      {/* Coordonnées */}
      <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6 space-y-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Mail className="w-5 h-5 text-teal-400" /> Coordonnées
        </h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="WhatsApp" value={form.whatsapp} onChange={set('whatsapp')} placeholder="+225 05 86 86 76 93" />
          <Field label="Email" value={form.email} onChange={set('email')} placeholder="contact@brumerie.ci" />
          <Field label="Disponibilité" value={form.disponibilite} onChange={set('disponibilite')} placeholder="Lun – Ven, 8h – 18h" />
        </div>
      </div>

      <BtnPrimary onClick={handleSave}>
        {saved ? <><CheckCircle className="w-4 h-4" /> Sauvegardé !</> : <><Save className="w-4 h-4" /> Sauvegarder les modifications</>}
      </BtnPrimary>
    </div>
  );
}

/* ============================================================
   TAB 3 — SERVICES
   ============================================================ */
const GRADIENTS = [
  'from-blue-600 to-blue-700', 'from-teal-600 to-teal-700',
  'from-cyan-600 to-cyan-700', 'from-purple-600 to-blue-600',
  'from-orange-500 to-red-500', 'from-green-600 to-teal-600',
  'from-pink-600 to-purple-600', 'from-blue-500 to-teal-500',
];
const ICONS_LIST = ['🖥️','🤖','🎓','🔧','💡','📱','🚀','🎯','⚡','🔒','📊','🌍','💼','✨','🛠️'];

function TabServices({ services, onUpdate, showToast }: {
  services: Service[]; onUpdate: (s: Service[]) => void; showToast: (m: string) => void;
}) {
  const [list, setList] = useState(services);
  const [editing, setEditing] = useState<Service | null>(null);
  const [isNew, setIsNew] = useState(false);

  const save = (updated: Service[]) => { setList(updated); onUpdate(updated); };

  const toggle = (id: string) => {
    const u = list.map((s) => s.id === id ? { ...s, visible: !s.visible } : s);
    save(u); showToast('Visibilité mise à jour');
  };

  const del = (id: string) => {
    if (!confirm('Supprimer ce service ?')) return;
    const u = list.filter((s) => s.id !== id);
    save(u); showToast('Service supprimé');
  };

  const move = (id: string, dir: 'up' | 'down') => {
    const idx = list.findIndex((s) => s.id === id);
    if (dir === 'up' && idx === 0) return;
    if (dir === 'down' && idx === list.length - 1) return;
    const u = [...list];
    const swap = dir === 'up' ? idx - 1 : idx + 1;
    [u[idx], u[swap]] = [u[swap], u[idx]];
    u.forEach((s, i) => s.order = i + 1);
    save(u);
  };

  const openNew = () => {
    setEditing({ id: Date.now().toString(), icon: '🚀', title: '', desc: '', gradient: GRADIENTS[0], visible: true, order: list.length + 1 });
    setIsNew(true);
  };

  const saveEdit = () => {
    if (!editing || !editing.title.trim()) return;
    const u = isNew ? [...list, editing] : list.map((s) => s.id === editing.id ? editing : s);
    save(u); setEditing(null); setIsNew(false);
    showToast(isNew ? 'Service ajouté !' : 'Service mis à jour !');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-gray-400 text-sm">{list.length} services • {list.filter(s=>s.visible).length} visibles sur le site</p>
        </div>
        <BtnPrimary onClick={openNew}><Plus className="w-4 h-4" /> Nouveau service</BtnPrimary>
      </div>

      <div className="space-y-3">
        {list.map((s, idx) => (
          <motion.div key={s.id} layout
            className={`bg-slate-800/60 rounded-2xl border p-4 transition-all ${s.visible ? 'border-white/5' : 'border-white/5 opacity-60'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${s.gradient} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>
                {s.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-white text-sm">{s.title || 'Sans titre'}</h4>
                  <Badge color={s.visible ? 'teal' : 'gray'}>{s.visible ? 'Visible' : 'Masqué'}</Badge>
                </div>
                <p className="text-xs text-gray-500 truncate">{s.desc}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={() => move(s.id, 'up')} disabled={idx === 0}
                  className="p-1.5 text-gray-500 hover:text-white disabled:opacity-20 transition-all">
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button onClick={() => move(s.id, 'down')} disabled={idx === list.length - 1}
                  className="p-1.5 text-gray-500 hover:text-white disabled:opacity-20 transition-all">
                  <ArrowDown className="w-4 h-4" />
                </button>
                <button onClick={() => toggle(s.id)}
                  className={`p-1.5 rounded-lg transition-all ${s.visible ? 'text-teal-400 hover:bg-teal-500/10' : 'text-gray-500 hover:bg-white/5'}`}>
                  {s.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <button onClick={() => { setEditing({...s}); setIsNew(false); }}
                  className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-all">
                  <Edit3 className="w-4 h-4" />
                </button>
                <button onClick={() => del(s.id)}
                  className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {editing && (
          <Modal title={isNew ? 'Nouveau service' : 'Modifier le service'} onClose={() => setEditing(null)}>
            <div className="space-y-4">
              {/* Choix icône */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Icône</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS_LIST.map((ic) => (
                    <button key={ic} onClick={() => setEditing((p) => p ? { ...p, icon: ic } : p)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all
                        ${editing.icon === ic ? 'bg-teal-500/30 border-2 border-teal-400' : 'bg-slate-700 border border-white/10 hover:bg-slate-600'}`}>
                      {ic}
                    </button>
                  ))}
                </div>
              </div>
              {/* Choix couleur */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Couleur</label>
                <div className="flex flex-wrap gap-2">
                  {GRADIENTS.map((g) => (
                    <button key={g} onClick={() => setEditing((p) => p ? { ...p, gradient: g } : p)}
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${g} transition-all
                        ${editing.gradient === g ? 'ring-2 ring-white scale-110' : 'hover:scale-105'}`} />
                  ))}
                </div>
              </div>
              <Field label="Titre du service *" value={editing.title} onChange={(v) => setEditing((p) => p ? { ...p, title: v } : p)}
                placeholder="Ex : Création de Sites Web" />
              <Field label="Description" value={editing.desc} onChange={(v) => setEditing((p) => p ? { ...p, desc: v } : p)}
                multiline rows={3} placeholder="Décrivez ce service en 2-3 phrases..." />
              <div className="flex items-center gap-3 pt-4">
                <BtnPrimary onClick={saveEdit}><Save className="w-4 h-4" /> {isNew ? 'Ajouter' : 'Sauvegarder'}</BtnPrimary>
                <button onClick={() => setEditing(null)}
                  className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-all">
                  Annuler
                </button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   TAB 4 — PORTFOLIO
   ============================================================ */
function TabPortfolio({ projects, onUpdate, showToast }: {
  projects: Project[]; onUpdate: (p: Project[]) => void; showToast: (m: string) => void;
}) {
  const [list, setList] = useState(projects);
  const [editing, setEditing] = useState<Project | null>(null);
  const [isNew, setIsNew] = useState(false);

  const save = (u: Project[]) => { setList(u); onUpdate(u); };
  const toggle = (id: string) => { const u = list.map((p) => p.id===id?{...p,visible:!p.visible}:p); save(u); showToast('Visibilité mise à jour'); };
  const del = (id: string) => { if(!confirm('Supprimer ce projet ?'))return; save(list.filter(p=>p.id!==id)); showToast('Projet supprimé'); };
  const openNew = () => { setEditing({id:Date.now().toString(),category:'',title:'',desc:'',result:'',tech:'',gradient:GRADIENTS[0],visible:true,order:list.length+1}); setIsNew(true); };
  const saveEdit = () => {
    if(!editing||!editing.title.trim())return;
    const u = isNew?[...list,editing]:list.map(p=>p.id===editing.id?editing:p);
    save(u); setEditing(null); setIsNew(false);
    showToast(isNew?'Projet ajouté !':'Projet mis à jour !');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400 text-sm">{list.length} projets • {list.filter(p=>p.visible).length} visibles</p>
        <BtnPrimary onClick={openNew}><Plus className="w-4 h-4" /> Nouveau projet</BtnPrimary>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {list.map((p) => (
          <motion.div key={p.id} layout className={`bg-slate-800/60 rounded-2xl border p-5 transition-all ${p.visible?'border-white/5':'border-white/5 opacity-60'}`}>
            <div className={`h-2 w-full bg-gradient-to-r ${p.gradient} rounded-full mb-4`} />
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <Badge color="gray">{p.category||'Non classé'}</Badge>
                <h4 className="font-bold text-white text-sm mt-1">{p.title||'Sans titre'}</h4>
              </div>
              <Badge color={p.visible?'teal':'gray'}>{p.visible?'Visible':'Masqué'}</Badge>
            </div>
            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{p.desc}</p>
            {p.result && <div className="text-xs text-green-300 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5 mb-3">✓ {p.result}</div>}
            <div className="flex gap-2">
              <button onClick={()=>toggle(p.id)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${p.visible?'bg-teal-500/20 text-teal-400':'bg-gray-700/50 text-gray-500'}`}>
                {p.visible?'Masquer':'Afficher'}
              </button>
              <button onClick={()=>{setEditing({...p});setIsNew(false);}} className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg"><Edit3 className="w-4 h-4"/></button>
              <button onClick={()=>del(p.id)} className="p-1.5 bg-red-500/20 text-red-400 rounded-lg"><Trash2 className="w-4 h-4"/></button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {editing && (
          <Modal title={isNew?'Nouveau projet':'Modifier le projet'} onClose={()=>setEditing(null)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Couleur</label>
                <div className="flex flex-wrap gap-2">
                  {GRADIENTS.map(g=>(
                    <button key={g} onClick={()=>setEditing(p=>p?{...p,gradient:g}:p)}
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${g} transition-all ${editing.gradient===g?'ring-2 ring-white scale-110':'hover:scale-105'}`}/>
                  ))}
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Catégorie" value={editing.category} onChange={v=>setEditing(p=>p?{...p,category:v}:p)} placeholder="Ex: Immobilier"/>
                <Field label="Lien (optionnel)" value={editing.link||''} onChange={v=>setEditing(p=>p?{...p,link:v}:p)} placeholder="https://..."/>
              </div>
              <Field label="Titre *" value={editing.title} onChange={v=>setEditing(p=>p?{...p,title:v}:p)}/>
              <Field label="Description" value={editing.desc} onChange={v=>setEditing(p=>p?{...p,desc:v}:p)} multiline rows={3}/>
              <Field label="Résultat obtenu" value={editing.result} onChange={v=>setEditing(p=>p?{...p,result:v}:p)} placeholder="Ex: +300% de ventes en 6 mois"/>
              <Field label="Technologies" value={editing.tech} onChange={v=>setEditing(p=>p?{...p,tech:v}:p)} placeholder="Ex: React, Firebase, Tailwind"/>
              <div className="flex gap-3 pt-2">
                <BtnPrimary onClick={saveEdit}><Save className="w-4 h-4"/>{isNew?'Ajouter':'Sauvegarder'}</BtnPrimary>
                <button onClick={()=>setEditing(null)} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-all">Annuler</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   TAB 5 — BLOG
   ============================================================ */
const BLOG_CATS = ['Intelligence Artificielle','Développement Web','Business','Formation','Actualités','Tutoriel'];

function TabBlog({ posts, onUpdate, showToast }: {
  posts: BlogPost[]; onUpdate: (p: BlogPost[]) => void; showToast: (m: string) => void;
}) {
  const [list, setList] = useState(posts);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [search, setSearch] = useState('');

  const save = (u: BlogPost[]) => { setList(u); onUpdate(u); };
  const toggle = (id: string) => { const u=list.map(p=>p.id===id?{...p,published:!p.published}:p); save(u); showToast('Statut mis à jour'); };
  const del = (id: string) => { if(!confirm('Supprimer cet article ?'))return; save(list.filter(p=>p.id!==id)); showToast('Article supprimé'); };
  const openNew = () => {
    setEditing({id:Date.now().toString(),title:'',excerpt:'',content:'',category:BLOG_CATS[0],
      tags:'',date:new Date().toISOString().split('T')[0],published:false,coverEmoji:'📝'});
    setIsNew(true);
  };
  const saveEdit = () => {
    if(!editing||!editing.title.trim())return;
    const u=isNew?[...list,editing]:list.map(p=>p.id===editing.id?editing:p);
    save(u); setEditing(null); setIsNew(false);
    showToast(isNew?'Article ajouté !':'Article mis à jour !');
  };

  const filtered = list.filter(p =>
    p.title.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <p className="text-gray-400 text-sm">{list.length} articles • {list.filter(p=>p.published).length} publiés</p>
        </div>
        <BtnPrimary onClick={openNew}><Plus className="w-4 h-4"/> Nouvel article</BtnPrimary>
      </div>

      {/* Recherche */}
      <div className="relative mb-5">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher un article..."
          className="w-full bg-slate-800/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"/>
      </div>

      <div className="space-y-3">
        {filtered.map(p => (
          <motion.div key={p.id} layout className={`bg-slate-800/60 rounded-2xl border p-5 transition-all ${p.published?'border-white/5':'border-white/5 opacity-70'}`}>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-slate-700 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">{p.coverEmoji}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h4 className="font-bold text-white text-sm">{p.title||'Sans titre'}</h4>
                  <Badge color={p.published?'teal':'yellow'}>{p.published?'Publié':'Brouillon'}</Badge>
                  <Badge color="purple">{p.category}</Badge>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-2">{p.excerpt}</p>
                <div className="flex items-center gap-3 text-xs text-gray-600">
                  <span>📅 {p.date}</span>
                  {p.tags && <span><Tag className="w-3 h-3 inline mr-1"/>{p.tags.split(',')[0].trim()}{p.tags.split(',').length>1?'...':''}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={()=>toggle(p.id)} className={`p-1.5 rounded-lg transition-all text-xs ${p.published?'text-teal-400 bg-teal-500/10':'text-yellow-400 bg-yellow-500/10'}`}>
                  {p.published?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                </button>
                <button onClick={()=>{setEditing({...p});setIsNew(false);}} className="p-1.5 text-blue-400 bg-blue-500/10 rounded-lg"><Edit3 className="w-4 h-4"/></button>
                <button onClick={()=>del(p.id)} className="p-1.5 text-red-400 bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4"/></button>
              </div>
            </div>
          </motion.div>
        ))}
        {filtered.length===0 && (
          <div className="text-center py-12 text-gray-500">
            <Newspaper className="w-12 h-12 mx-auto mb-3 opacity-20"/>
            <p>Aucun article trouvé</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {editing && (
          <Modal title={isNew?'Nouvel article':'Modifier l\'article'} onClose={()=>setEditing(null)}>
            <div className="space-y-4">
              {/* Emojis cover */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Icône de couverture</label>
                <div className="flex flex-wrap gap-2">
                  {['📝','🤖','💻','📱','🌍','💡','🚀','📊','🎓','💳','🔧','✨','🎯','📰','💼'].map(e=>(
                    <button key={e} onClick={()=>setEditing(p=>p?{...p,coverEmoji:e}:p)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all
                        ${editing.coverEmoji===e?'bg-teal-500/30 border-2 border-teal-400':'bg-slate-700 border border-white/10 hover:bg-slate-600'}`}>{e}</button>
                  ))}
                </div>
              </div>
              <Field label="Titre de l'article *" value={editing.title} onChange={v=>setEditing(p=>p?{...p,title:v}:p)} placeholder="Titre accrocheur..."/>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Catégorie</label>
                  <select value={editing.category} onChange={e=>setEditing(p=>p?{...p,category:e.target.value}:p)}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50">
                    {BLOG_CATS.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <Field label="Date" value={editing.date} onChange={v=>setEditing(p=>p?{...p,date:v}:p)} placeholder="2026-04-25"/>
              </div>
              <Field label="Extrait (résumé)" value={editing.excerpt} onChange={v=>setEditing(p=>p?{...p,excerpt:v}:p)} multiline rows={2} placeholder="Résumé affiché dans la liste..."/>
              <Field label="Contenu complet" value={editing.content} onChange={v=>setEditing(p=>p?{...p,content:v}:p)} multiline rows={6} placeholder="Rédigez votre article ici..."/>
              <Field label="Tags (séparés par virgule)" value={editing.tags} onChange={v=>setEditing(p=>p?{...p,tags:v}:p)} placeholder="IA, mobile, Côte d'Ivoire"/>
              <div className="flex items-center gap-3">
                <button onClick={()=>setEditing(p=>p?{...p,published:!p.published}:p)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all
                    ${editing.published?'bg-teal-500/20 border-teal-500/40 text-teal-300':'bg-slate-700 border-white/10 text-gray-400'}`}>
                  {editing.published?<><Eye className="w-4 h-4"/> Publié</>:<><EyeOff className="w-4 h-4"/> Brouillon</>}
                </button>
              </div>
              <div className="flex gap-3 pt-2">
                <BtnPrimary onClick={saveEdit}><Save className="w-4 h-4"/>{isNew?'Publier':'Sauvegarder'}</BtnPrimary>
                <button onClick={()=>setEditing(null)} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-all">Annuler</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   TAB 6 — AVIS CLIENTS
   ============================================================ */
function TabReviews({ reviews, onUpdate, showToast }: {
  reviews: Review[]; onUpdate: (r: Review[]) => void; showToast: (m: string) => void;
}) {
  const [list, setList] = useState(reviews);
  const [editing, setEditing] = useState<Review | null>(null);
  const [isNew, setIsNew] = useState(false);

  const save = (u: Review[]) => { setList(u); onUpdate(u); };
  const toggle = (id: string) => { const u=list.map(r=>r.id===id?{...r,visible:!r.visible}:r); save(u); showToast('Visibilité mise à jour'); };
  const del = (id: string) => { if(!confirm('Supprimer cet avis ?'))return; save(list.filter(r=>r.id!==id)); showToast('Avis supprimé'); };
  const openNew = () => { setEditing({id:Date.now().toString(),author:'',role:'',company:'',text:'',stars:5,visible:true,date:new Date().toISOString().split('T')[0]}); setIsNew(true); };
  const saveEdit = () => {
    if(!editing||!editing.author.trim())return;
    const u=isNew?[...list,editing]:list.map(r=>r.id===editing.id?editing:r);
    save(u); setEditing(null); setIsNew(false);
    showToast(isNew?'Avis ajouté !':'Avis mis à jour !');
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400 text-sm">{list.length} avis • {list.filter(r=>r.visible).length} visibles</p>
        <BtnPrimary onClick={openNew}><Plus className="w-4 h-4"/> Nouvel avis</BtnPrimary>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map(r => (
          <motion.div key={r.id} layout className={`bg-slate-800/60 rounded-2xl border p-5 flex flex-col transition-all ${r.visible?'border-white/5':'border-white/5 opacity-60'}`}>
            <div className="flex gap-1 mb-3">
              {[1,2,3,4,5].map(n=><Star key={n} className={`w-4 h-4 ${n<=r.stars?'fill-yellow-400 text-yellow-400':'text-gray-700'}`}/>)}
            </div>
            <p className="text-gray-300 text-xs italic flex-1 mb-3 line-clamp-4">« {r.text} »</p>
            <div className="mb-3">
              <p className="font-bold text-white text-sm">{r.author}</p>
              <p className="text-gray-500 text-xs">{r.role}{r.company?` — ${r.company}`:''}</p>
              <p className="text-gray-600 text-xs">{r.date}</p>
            </div>
            <div className="flex gap-2 mt-auto">
              <button onClick={()=>toggle(r.id)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${r.visible?'bg-teal-500/20 text-teal-400':'bg-gray-700/50 text-gray-500'}`}>
                {r.visible?'Visible':'Masqué'}
              </button>
              <button onClick={()=>{setEditing({...r});setIsNew(false);}} className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg"><Edit3 className="w-3.5 h-3.5"/></button>
              <button onClick={()=>del(r.id)} className="p-1.5 bg-red-500/20 text-red-400 rounded-lg"><Trash2 className="w-3.5 h-3.5"/></button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {editing && (
          <Modal title={isNew?'Nouvel avis client':'Modifier l\'avis'} onClose={()=>setEditing(null)}>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Nom du client *" value={editing.author} onChange={v=>setEditing(p=>p?{...p,author:v}:p)} placeholder="Ex: Aïcha Koné"/>
                <Field label="Poste / Rôle" value={editing.role} onChange={v=>setEditing(p=>p?{...p,role:v}:p)} placeholder="Ex: Directrice Marketing"/>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Entreprise" value={editing.company} onChange={v=>setEditing(p=>p?{...p,company:v}:p)} placeholder="Ex: AfroChic CI"/>
                <Field label="Date" value={editing.date} onChange={v=>setEditing(p=>p?{...p,date:v}:p)} placeholder="2026-04-25"/>
              </div>
              <Field label="Témoignage *" value={editing.text} onChange={v=>setEditing(p=>p?{...p,text:v}:p)} multiline rows={4} placeholder="Le témoignage du client..."/>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Note</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(n=>(
                    <button key={n} onClick={()=>setEditing(p=>p?{...p,stars:n}:p)}>
                      <Star className={`w-8 h-8 transition-all ${n<=editing.stars?'fill-yellow-400 text-yellow-400 scale-110':'text-gray-600 hover:text-yellow-300'}`}/>
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <BtnPrimary onClick={saveEdit}><Save className="w-4 h-4"/>{isNew?'Ajouter':'Sauvegarder'}</BtnPrimary>
                <button onClick={()=>setEditing(null)} className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-white/10 transition-all">Annuler</button>
              </div>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ============================================================
   TAB 7 — MESSAGES
   ============================================================ */
function TabMessages({ messages, onUpdate }: { messages: Message[]; onUpdate: (m: Message[]) => void }) {
  const [list, setList] = useState(messages);
  const [selected, setSelected] = useState<Message | null>(null);
  const [search, setSearch] = useState('');
  const WA = 'https://wa.me/2250586867693';

  const markRead = (id: string) => {
    const u = list.map(m=>m.id===id?{...m,read:true}:m);
    setList(u); onUpdate(u);
    setSelected(prev => prev?.id===id?{...prev,read:true}:prev);
  };
  const markReplied = (id: string) => { const u=list.map(m=>m.id===id?{...m,replied:true,read:true}:m); setList(u); onUpdate(u); };
  const del = (id: string) => { const u=list.filter(m=>m.id!==id); setList(u); onUpdate(u); if(selected?.id===id)setSelected(null); };
  const filtered = list.filter(m=>m.nom.toLowerCase().includes(search.toLowerCase())||m.message.toLowerCase().includes(search.toLowerCase()));
  const unread = list.filter(m=>!m.read).length;

  return (
    <div>
      <div className="flex items-center gap-4 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..."
            className="w-full bg-slate-800/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"/>
        </div>
        {unread>0 && <Badge color="blue">{unread} non lu{unread>1?'s':''}</Badge>}
      </div>
      <div className="grid lg:grid-cols-5 gap-4">
        {/* Liste */}
        <div className="lg:col-span-2 space-y-2">
          {filtered.map(m=>(
            <button key={m.id} onClick={()=>{setSelected(m);markRead(m.id);}}
              className={`w-full text-left p-4 rounded-xl border transition-all ${selected?.id===m.id?'bg-teal-500/10 border-teal-500/30':'bg-slate-800/60 border-white/5 hover:border-white/10'}`}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-teal-500 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">{m.nom.charAt(0)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-semibold ${m.read?'text-gray-300':'text-white'}`}>{m.nom}</span>
                    {!m.read && <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"/>}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{m.message}</p>
                  <p className="text-xs text-gray-700 mt-1">{m.date}</p>
                </div>
              </div>
            </button>
          ))}
          {filtered.length===0 && <p className="text-center text-gray-500 text-sm py-8">Aucun message</p>}
        </div>
        {/* Détail */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white text-lg">{selected.nom}</h3>
                  <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-1"><Mail className="w-3.5 h-3.5"/>{selected.email}</p>
                </div>
                <button onClick={()=>del(selected.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"><Trash2 className="w-4 h-4"/></button>
              </div>
              <div className="flex gap-2 mb-4 flex-wrap">
                {selected.service && <Badge color="blue">🎯 {selected.service}</Badge>}
                <Badge color={selected.read?'gray':'blue'}>{selected.read?'Lu':'Non lu'}</Badge>
                <Badge color={selected.replied?'green':'yellow'}>{selected.replied?'✓ Répondu':'En attente'}</Badge>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-5 mb-5 border border-white/5">
                <p className="text-gray-200 text-sm leading-relaxed">{selected.message}</p>
              </div>
              <p className="text-xs text-gray-600 mb-5">{selected.date}</p>
              <div className="flex gap-3 flex-wrap">
                <a href={`mailto:${selected.email}?subject=Re: Votre demande — Brumerie`}
                  onClick={()=>markReplied(selected.id)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl font-semibold text-sm hover:shadow-lg transition-all">
                  <Mail className="w-4 h-4"/> Répondre par email
                </a>
                <a href={`${WA}?text=Bonjour ${selected.nom}, suite à votre message...`}
                  target="_blank" rel="noopener noreferrer"
                  onClick={()=>markReplied(selected.id)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-600/20 border border-green-500/30 text-green-400 rounded-xl text-sm font-semibold hover:bg-green-600/30 transition-all">
                  💬 WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/60 rounded-2xl border border-white/5 h-64 flex items-center justify-center text-center text-gray-500">
              <div><MessageSquare className="w-10 h-10 mx-auto mb-3 opacity-20"/><p className="text-sm">Sélectionnez un message</p></div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TAB 8 — ANALYTIQUE
   ============================================================ */
function TabAnalytics() {
  const sources = [
    {name:'Direct',count:485,color:'#3b82f6'},{name:'Google',count:392,color:'#0d9488'},
    {name:'WhatsApp',count:218,color:'#22c55e'},{name:'LinkedIn',count:134,color:'#6366f1'},{name:'Autres',count:55,color:'#94a3b8'},
  ];
  const total = sources.reduce((a,b)=>a+b.count,0);
  const weeks = [38,52,45,61,71,28,17];
  const days  = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
  const maxW  = Math.max(...weeks);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Eye}              label="Visites aujourd'hui" value="47"    gradient="from-blue-600 to-blue-700"/>
        <StatCard icon={TrendingUp}       label="Ce mois"            value="1 284"  gradient="from-teal-600 to-teal-700"/>
        <StatCard icon={Users}            label="Visiteurs uniques"  value="896"    gradient="from-cyan-600 to-cyan-700"/>
        <StatCard icon={MousePointerClick} label="Clics WhatsApp"    value="89"     gradient="from-green-600 to-green-700" sub="Taux : 6.9%"/>
        <StatCard icon={Mail}             label="Formulaires"        value="23"     gradient="from-purple-600 to-purple-700"/>
        <StatCard icon={Star}             label="Section la + vue"   value="Services" gradient="from-orange-600 to-orange-700"/>
      </div>
      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6">
          <h3 className="font-bold text-white mb-5 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-teal-400"/> Visites 7 jours</h3>
          <div className="flex items-end gap-3 h-40">
            {weeks.map((v,i)=>(
              <div key={days[i]} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500">{v}</span>
                <motion.div initial={{height:0}} animate={{height:`${(v/maxW)*100}%`}} transition={{duration:0.8,delay:i*0.07}}
                  className="w-full bg-gradient-to-t from-blue-600 to-teal-400 rounded-t-lg min-h-[4px]"/>
                <span className="text-xs text-gray-600">{days[i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6">
          <h3 className="font-bold text-white mb-5 flex items-center gap-2"><Users className="w-5 h-5 text-teal-400"/> Sources de trafic</h3>
          <div className="space-y-3">
            {sources.map(s=>{
              const pct=Math.round((s.count/total)*100);
              return (
                <div key={s.name}>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300">{s.name}</span>
                    <span className="text-gray-500">{s.count} — {pct}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div initial={{width:0}} animate={{width:`${pct}%`}} transition={{duration:1}}
                      className="h-full rounded-full" style={{backgroundColor:s.color}}/>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
      <div className="bg-blue-500/10 border border-blue-500/20 rounded-2xl p-5 flex items-start gap-3">
        <Link className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5"/>
        <div>
          <p className="text-sm font-semibold text-blue-300">Analytics avancés</p>
          <p className="text-xs text-gray-400 mt-1">Pour des stats temps réel, connectez <strong className="text-white">Vercel Analytics</strong> (gratuit) ou <strong className="text-white">Google Analytics 4</strong> dans les paramètres Vercel de votre projet.</p>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   TAB 9 — PARAMÈTRES
   ============================================================ */
function TabSettings({ onLogout }: { onLogout: () => void }) {
  const [saved, setSaved] = useState(false);
  const [notifs, setNotifs] = useState({email:true,wa:false,weekly:true});
  const toggle = (k: keyof typeof notifs) => setNotifs(p=>({...p,[k]:!p[k]}));

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6 space-y-4">
        <h3 className="font-bold text-white flex items-center gap-2"><Shield className="w-5 h-5 text-teal-400"/> Compte</h3>
        <div className="flex items-center gap-4 p-4 bg-slate-700/40 rounded-xl">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-teal-500 rounded-full flex items-center justify-center text-xl font-black flex-shrink-0">S</div>
          <div>
            <p className="font-bold text-white">Doukoua Tché Serge Alain</p>
            <p className="text-gray-400 text-sm">admin@brumerie.ci</p>
            <Badge color="teal">Super Admin</Badge>
          </div>
        </div>
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <p className="text-sm font-semibold text-yellow-300 mb-1">⚠️ Changer le mot de passe</p>
          <p className="text-xs text-gray-400">En production, connectez Firebase Auth et utilisez la console Firebase pour gérer les mots de passe de façon sécurisée.</p>
        </div>
      </div>

      <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6 space-y-4">
        <h3 className="font-bold text-white flex items-center gap-2"><Bell className="w-5 h-5 text-teal-400"/> Notifications</h3>
        {([
          {k:'email',label:'Email à chaque nouveau message',icon:Mail},
          {k:'wa',label:'Alerte WhatsApp (nouveau contact)',icon:Code2},
          {k:'weekly',label:'Rapport hebdomadaire par email',icon:BarChart3},
        ] as {k:keyof typeof notifs;label:string;icon:React.ElementType}[]).map(({k,label,icon:Icon})=>(
          <div key={k} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Icon className="w-4 h-4 text-gray-400"/>
              <span className="text-sm text-gray-300">{label}</span>
            </div>
            <button onClick={()=>toggle(k)} className={`w-12 h-6 rounded-full transition-all relative ${notifs[k]?'bg-teal-500':'bg-slate-600'}`}>
              <motion.div animate={{x:notifs[k]?24:2}} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"/>
            </button>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6 space-y-3">
        <h3 className="font-bold text-white flex items-center gap-2"><Link className="w-5 h-5 text-teal-400"/> Infos déploiement</h3>
        {[
          {label:'URL du site',value:'https://d-veloppeur-brumerie.vercel.app'},
          {label:'Dashboard',value:'https://d-veloppeur-brumerie.vercel.app/admin'},
          {label:'Hébergement',value:'Vercel'},
          {label:'Version dashboard',value:'v3.0.0'},
        ].map(info=>(
          <div key={info.label} className="bg-slate-700/40 rounded-xl p-3 flex items-center justify-between gap-2">
            <p className="text-gray-500 text-xs flex-shrink-0">{info.label}</p>
            <p className="text-gray-200 font-mono text-xs truncate text-right">{info.value}</p>
          </div>
        ))}
      </div>

      <div className="flex gap-3">
        <BtnPrimary onClick={()=>{setSaved(true);setTimeout(()=>setSaved(false),2000);}}>
          {saved?<><CheckCircle className="w-4 h-4"/>Sauvegardé !</>:<><Save className="w-4 h-4"/>Sauvegarder</>}
        </BtnPrimary>
        <motion.button onClick={onLogout}
          className="flex items-center gap-2 px-5 py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-semibold text-sm hover:bg-red-500/30 transition-all"
          whileHover={{scale:1.02}} whileTap={{scale:0.97}}>
          <LogOut className="w-4 h-4"/> Déconnexion
        </motion.button>
      </div>
    </div>
  );
}

/* ============================================================
   DASHBOARD PRINCIPAL
   ============================================================ */
export default function AdminDashboard() {
  const [loggedIn, setLoggedIn] = useState(false);
  const [tab, setTab] = useState('overview');
  const [sideOpen, setSideOpen] = useState(true);
  const [toast, setToast] = useState<{msg:string;type:'success'|'error'}|null>(null);

  const [content, setContent]       = useState<SiteContent>(INIT_CONTENT);
  const [services, setServices]     = useState<Service[]>(INIT_SERVICES);
  const [projects, setProjects]     = useState<Project[]>(INIT_PROJECTS);
  const [blog, setBlog]             = useState<BlogPost[]>(INIT_BLOG);
  const [reviews, setReviews]       = useState<Review[]>(INIT_REVIEWS);
  const [messages, setMessages]     = useState<Message[]>(INIT_MESSAGES);

  const showToast = useCallback((msg: string, type: 'success'|'error' = 'success') => {
    setToast({msg,type});
    setTimeout(()=>setToast(null),3500);
  }, []);

  const tabs = [
    {id:'overview',    label:"Vue d'ensemble", icon:LayoutDashboard, badge:0},
    {id:'content',     label:'Contenu & Photo', icon:FileText,        badge:0},
    {id:'services',    label:'Services',        icon:Wrench,          badge:0},
    {id:'portfolio',   label:'Portfolio',       icon:Briefcase,       badge:0},
    {id:'blog',        label:'Blog',            icon:Newspaper,       badge:0},
    {id:'reviews',     label:'Avis Clients',    icon:Star,            badge:0},
    {id:'messages',    label:'Messages',        icon:MessageSquare,   badge:messages.filter(m=>!m.read).length},
    {id:'analytics',   label:'Analytique',      icon:BarChart3,       badge:0},
    {id:'settings',    label:'Paramètres',      icon:Settings,        badge:0},
  ];

  if (!loggedIn) return <LoginScreen onLogin={()=>setLoggedIn(true)}/>;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex" style={{fontFamily:'Inter, sans-serif'}}>
      {/* ── SIDEBAR ── */}
      <motion.aside animate={{width:sideOpen?256:68}} transition={{duration:0.3,ease:'easeInOut'}}
        className="flex-shrink-0 bg-slate-900/90 backdrop-blur-xl border-r border-white/5 flex flex-col overflow-hidden">

        {/* Logo */}
        <div className="p-4 border-b border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/20">
            <Shield className="w-5 h-5"/>
          </div>
          {sideOpen && (
            <motion.div initial={{opacity:0}} animate={{opacity:1}}>
              <p className="font-black text-white text-sm leading-none" style={{fontFamily:'Space Grotesk, sans-serif'}}>Brumerie</p>
              <p className="text-xs text-gray-600 mt-0.5">Admin v3</p>
            </motion.div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {tabs.map(t=>{
            const active = tab===t.id;
            return (
              <button key={t.id} onClick={()=>setTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative
                  ${active?'bg-gradient-to-r from-blue-600/20 to-teal-600/20 text-white border border-teal-500/20':'text-gray-500 hover:text-gray-200 hover:bg-white/5'}`}>
                <t.icon className={`w-4 h-4 flex-shrink-0 ${active?'text-teal-400':''}`}/>
                {sideOpen && <span className="text-sm font-medium flex-1 text-left truncate">{t.label}</span>}
                {t.badge>0 && (
                  <span className="w-5 h-5 bg-blue-500 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0">{t.badge}</span>
                )}
                {active && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-teal-400 rounded-r"/>}
              </button>
            );
          })}
        </nav>

        {/* Footer sidebar */}
        <div className="p-2 border-t border-white/5">
          <button onClick={()=>setSideOpen(!sideOpen)}
            className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-gray-300 hover:bg-white/5 rounded-xl transition-all">
            <ChevronRight className={`w-4 h-4 transition-transform flex-shrink-0 ${sideOpen?'rotate-180':''}`}/>
            {sideOpen && <span className="text-xs">Réduire</span>}
          </button>
          {sideOpen && (
            <div className="px-3 py-2 mt-1">
              <p className="text-xs font-semibold text-white truncate">Serge Alain</p>
              <p className="text-xs text-gray-600 truncate">admin@brumerie.ci</p>
            </div>
          )}
        </div>
      </motion.aside>

      {/* ── CONTENU ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-slate-900/50 backdrop-blur-xl border-b border-white/5 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-lg font-black text-white" style={{fontFamily:'Space Grotesk, sans-serif'}}>
              {tabs.find(t=>t.id===tab)?.label}
            </h1>
            <p className="text-xs text-gray-600 flex items-center gap-1">
              <Clock className="w-3 h-3"/>
              {new Date().toLocaleDateString('fr-CI',{weekday:'long',day:'numeric',month:'long',year:'numeric'})}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={()=>showToast('Données actualisées !')} className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all">
              <RefreshCw className="w-4 h-4"/>
            </button>
            <a href="/" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-white/10 transition-all">
              <Eye className="w-3.5 h-3.5"/> Voir le site
            </a>
          </div>
        </header>

        {/* Contenu de l'onglet */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.2}}>
              {tab==='overview'  && <TabOverview services={services} projects={projects} blog={blog} reviews={reviews} messages={messages}/>}
              {tab==='content'   && <TabContent content={content} onSave={(c)=>{setContent(c);showToast('Contenu sauvegardé !');}}/>}
              {tab==='services'  && <TabServices services={services} onUpdate={(s)=>{setServices(s);}} showToast={showToast}/>}
              {tab==='portfolio' && <TabPortfolio projects={projects} onUpdate={(p)=>{setProjects(p);}} showToast={showToast}/>}
              {tab==='blog'      && <TabBlog posts={blog} onUpdate={(b)=>{setBlog(b);}} showToast={showToast}/>}
              {tab==='reviews'   && <TabReviews reviews={reviews} onUpdate={(r)=>{setReviews(r);}} showToast={showToast}/>}
              {tab==='messages'  && <TabMessages messages={messages} onUpdate={setMessages}/>}
              {tab==='analytics' && <TabAnalytics/>}
              {tab==='settings'  && <TabSettings onLogout={()=>setLoggedIn(false)}/>}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
      </AnimatePresence>
    </div>
  );
}
