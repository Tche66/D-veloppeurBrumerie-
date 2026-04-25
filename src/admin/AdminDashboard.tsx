/**
 * ╔══════════════════════════════════════════════════════════╗
 * ║   BRUMERIE — DASHBOARD ADMIN                            ║
 * ║   Accès : /admin   (protégé par mot de passe Firebase)  ║
 * ╠══════════════════════════════════════════════════════════╣
 * ║  ONGLETS :                                              ║
 * ║  1. 📊 Vue d'ensemble   (KPIs + activité récente)       ║
 * ║  2. 📝 Contenu          (textes, bio, services)         ║
 * ║  3. 💼 Portfolio        (projets CRUD)                  ║
 * ║  4. 💬 Messages         (formulaire contact)            ║
 * ║  5. 🌟 Témoignages      (avis clients CRUD)             ║
 * ║  6. 📈 Analytique       (visites, clics WA, sources)    ║
 * ║  7. ⚙️  Paramètres       (profil, photo, WA, email)     ║
 * ╚══════════════════════════════════════════════════════════╝
 */

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard, FileText, Briefcase, MessageSquare,
  Star, BarChart3, Settings, LogOut, Eye, Trash2,
  Edit3, Plus, Save, X, CheckCircle, AlertCircle,
  TrendingUp, Users, MousePointerClick, Mail,
  Phone, MapPin, Clock, Upload, Shield, Bell,
  ChevronRight, Search, Filter, RefreshCw, Download,
} from 'lucide-react';

/* ============================================================
   TYPES
   ============================================================ */
interface Project {
  id: string; category: string; title: string;
  desc: string; result: string; tech: string;
  gradient: string; visible: boolean; order: number;
}

interface Message {
  id: string; nom: string; email: string;
  service: string; message: string;
  date: string; read: boolean; replied: boolean;
}

interface Testimonial {
  id: string; author: string; role: string;
  text: string; stars: number; visible: boolean;
}

interface SiteContent {
  heroTitle: string; heroBio: string;
  aboutText1: string; aboutText2: string;
  whatsapp: string; email: string;
  photoUrl: string; disponibilite: string;
}

interface Analytics {
  visitsToday: number; visitsWeek: number; visitsMonth: number;
  waClicks: number; formSubmits: number; topSection: string;
  sources: { name: string; count: number; color: string }[];
  dailyVisits: { day: string; count: number }[];
}

/* ============================================================
   DONNÉES MOCK (remplacées par Firebase en prod)
   ============================================================ */
const MOCK_PROJECTS: Project[] = [
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
  { id: '4', category: 'Banque / Finance', title: "Formation IA — Banque Régionale",
    desc: "Formation de 45 collaborateurs à l'IA générative.",
    result: '2h/jour gagnées par collaborateur', tech: 'Ateliers pratiques',
    gradient: 'from-orange-500 to-red-600', visible: true, order: 4 },
];

const MOCK_MESSAGES: Message[] = [
  { id: '1', nom: 'Aïcha Koné', email: 'aicha@afrochic.ci', service: 'site-web',
    message: 'Bonjour, je voudrais refondre mon site e-commerce. Pouvez-vous me donner un devis ?',
    date: '2026-04-24 10:32', read: false, replied: false },
  { id: '2', nom: 'Koffi Bamba', email: 'koffi.b@logistiq.ci', service: 'formation',
    message: 'Nous sommes intéressés par une formation IA pour 20 commerciaux. Quelles sont vos disponibilités ?',
    date: '2026-04-23 14:15', read: true, replied: true },
  { id: '3', nom: 'Marie Dupont', email: 'marie@startup.ci', service: 'ia',
    message: "J'aimerais intégrer un chatbot IA dans notre application mobile. Est-ce faisable ?",
    date: '2026-04-22 09:00', read: true, replied: false },
];

const MOCK_TESTIMONIALS: Testimonial[] = [
  { id: '1', author: 'Aïcha K.', role: 'Fondatrice AfroChic CI',
    text: "Serge Alain a transformé notre présence en ligne. Notre site génère des ventes tous les jours.", stars: 5, visible: true },
  { id: '2', author: 'Koffi B.', role: 'Directeur Commercial, Logistique',
    text: "La formation IA a été un tournant. Rentabilisée en 2 semaines.", stars: 5, visible: true },
  { id: '3', author: 'Yao E.', role: 'Gérant ImmoCocody',
    text: 'Toujours disponible sur WhatsApp. Je recommande les yeux fermés.', stars: 5, visible: true },
];

const MOCK_ANALYTICS: Analytics = {
  visitsToday: 47, visitsWeek: 312, visitsMonth: 1284,
  waClicks: 89, formSubmits: 23, topSection: 'Services',
  sources: [
    { name: 'Direct', count: 485, color: '#3b82f6' },
    { name: 'Google', count: 392, color: '#0d9488' },
    { name: 'WhatsApp', count: 218, color: '#22c55e' },
    { name: 'LinkedIn', count: 134, color: '#6366f1' },
    { name: 'Autres', count: 55, color: '#94a3b8' },
  ],
  dailyVisits: [
    { day: 'Lun', count: 38 }, { day: 'Mar', count: 52 },
    { day: 'Mer', count: 45 }, { day: 'Jeu', count: 61 },
    { day: 'Ven', count: 71 }, { day: 'Sam', count: 28 },
    { day: 'Dim', count: 17 },
  ],
};

const INITIAL_CONTENT: SiteContent = {
  heroTitle: 'Votre Vision. Mon Code. Votre Succès.',
  heroBio: "Entrepreneur digital et PDG de Brumerie, basé à Abidjan. Je conçois des sites web performants et intègre l'intelligence artificielle au cœur de votre business.",
  aboutText1: "Je suis Doukoua Tché Serge Alain, entrepreneur digital passionné et PDG de Brumerie, une entreprise basée à Abidjan, Côte d'Ivoire.",
  aboutText2: "Convaincu que la technologie doit être accessible à toutes les entreprises africaines, j'accompagne PME, startups et grands comptes dans leur transformation digitale.",
  whatsapp: '+225 05 86 86 76 93',
  email: 'contact@brumerie.ci',
  photoUrl: '/images/pdg-photo.webp',
  disponibilite: 'Lun – Ven, 8h – 18h (GMT)',
};

/* ============================================================
   ÉCRAN DE CONNEXION
   ============================================================ */
function LoginScreen({ onLogin }: { onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Simulation auth (remplacer par Firebase Auth en prod)
    // import { signInWithEmailAndPassword } from 'firebase/auth';
    // await signInWithEmailAndPassword(auth, email, password);
    await new Promise((r) => setTimeout(r, 1000));

    if (email === 'admin@brumerie.ci' && password === 'Brumerie2026!') {
      onLogin();
    } else {
      setError('Email ou mot de passe incorrect.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/40 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/30 rounded-full blur-[100px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/10 p-10 shadow-2xl">

        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-teal-500/30">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Dashboard Admin
          </h1>
          <p className="text-gray-400 mt-1 text-sm">Brumerie — Espace sécurisé</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Email admin</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@brumerie.ci" required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Mot de passe</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••" required
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500
                         focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all" />
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />{error}
            </div>
          )}

          <motion.button type="submit" disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl font-bold text-white
                       shadow-xl shadow-teal-500/20 hover:shadow-teal-500/40 transition-all disabled:opacity-60"
            whileHover={!loading ? { scale: 1.01, y: -1 } : {}} whileTap={!loading ? { scale: 0.98 } : {}}>
            {loading ? (
              <span className="flex items-center justify-center gap-2">
                <motion.div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                  animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }} />
                Connexion...
              </span>
            ) : 'Se connecter'}
          </motion.button>
        </form>

        <p className="text-center text-xs text-gray-600 mt-6">
          Accès restreint — Brumerie © {new Date().getFullYear()}
        </p>
      </motion.div>
    </div>
  );
}

/* ============================================================
   COMPOSANTS UI ADMIN
   ============================================================ */
function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className="bg-slate-800/60 backdrop-blur-sm rounded-2xl border border-white/5 p-6 hover:border-teal-500/30 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 ${color} rounded-xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <TrendingUp className="w-4 h-4 text-teal-400 opacity-60" />
      </div>
      <p className="text-3xl font-black text-white mb-1">{value}</p>
      <p className="text-sm font-medium text-gray-300">{label}</p>
      {sub && <p className="text-xs text-gray-500 mt-1">{sub}</p>}
    </motion.div>
  );
}

function Badge({ children, color = 'blue' }: { children: React.ReactNode; color?: string }) {
  const colors: Record<string, string> = {
    blue:   'bg-blue-500/20 text-blue-300 border-blue-500/30',
    teal:   'bg-teal-500/20 text-teal-300 border-teal-500/30',
    green:  'bg-green-500/20 text-green-300 border-green-500/30',
    red:    'bg-red-500/20 text-red-300 border-red-500/30',
    yellow: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
    gray:   'bg-gray-500/20 text-gray-300 border-gray-500/30',
  };
  return (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${colors[color] || colors.blue}`}>
      {children}
    </span>
  );
}

function Toast({ msg, type, onClose }: { msg: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div initial={{ opacity: 0, y: 20, x: 20 }} animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-4 rounded-xl shadow-2xl border text-sm font-medium
        ${type === 'success'
          ? 'bg-green-900/90 border-green-500/30 text-green-200'
          : 'bg-red-900/90 border-red-500/30 text-red-200'}`}>
      {type === 'success' ? <CheckCircle className="w-5 h-5 text-green-400" /> : <AlertCircle className="w-5 h-5 text-red-400" />}
      {msg}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100"><X className="w-4 h-4" /></button>
    </motion.div>
  );
}

/* ============================================================
   ONGLETS DASHBOARD
   ============================================================ */

/* ─── 1. Vue d'ensemble ─── */
function TabOverview({ analytics, messages }: { analytics: Analytics; messages: Message[] }) {
  const unread = messages.filter((m) => !m.read).length;
  const maxVisit = Math.max(...analytics.dailyVisits.map((d) => d.count));

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Eye} label="Visites aujourd'hui" value={analytics.visitsToday} sub="↑ vs hier" color="bg-gradient-to-br from-blue-600 to-blue-700" />
        <StatCard icon={TrendingUp} label="Visites ce mois" value={analytics.visitsMonth.toLocaleString()} sub="30 derniers jours" color="bg-gradient-to-br from-teal-600 to-teal-700" />
        <StatCard icon={MousePointerClick} label="Clics WhatsApp" value={analytics.waClicks} sub="Ce mois" color="bg-gradient-to-br from-green-600 to-green-700" />
        <StatCard icon={Mail} label="Messages reçus" value={analytics.formSubmits} sub={`${unread} non lus`} color="bg-gradient-to-br from-purple-600 to-purple-700" />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Graphique visites semaine */}
        <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6">
          <h3 className="font-bold text-white mb-6 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-400" /> Visites cette semaine
          </h3>
          <div className="flex items-end gap-3 h-40">
            {analytics.dailyVisits.map((d) => (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-gray-400">{d.count}</span>
                <motion.div
                  initial={{ height: 0 }} animate={{ height: `${(d.count / maxVisit) * 100}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="w-full bg-gradient-to-t from-blue-600 to-teal-500 rounded-t-lg min-h-[4px]" />
                <span className="text-xs text-gray-500">{d.day}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sources de trafic */}
        <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6">
          <h3 className="font-bold text-white mb-6 flex items-center gap-2">
            <Users className="w-5 h-5 text-teal-400" /> Sources de trafic
          </h3>
          <div className="space-y-3">
            {analytics.sources.map((s) => {
              const total = analytics.sources.reduce((a, b) => a + b.count, 0);
              const pct = Math.round((s.count / total) * 100);
              return (
                <div key={s.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-300">{s.name}</span>
                    <span className="text-gray-400">{s.count} — {pct}%</span>
                  </div>
                  <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                    <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="h-full rounded-full" style={{ backgroundColor: s.color }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Messages récents */}
      <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6">
        <h3 className="font-bold text-white mb-4 flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-teal-400" /> Messages récents
        </h3>
        <div className="space-y-3">
          {messages.slice(0, 3).map((m) => (
            <div key={m.id} className="flex items-start gap-4 p-4 bg-slate-700/30 rounded-xl border border-white/5">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-500 rounded-full flex items-center justify-center flex-shrink-0 text-sm font-bold">
                {m.nom.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-white text-sm">{m.nom}</span>
                  {!m.read && <Badge color="blue">Nouveau</Badge>}
                  {m.replied && <Badge color="green">Répondu</Badge>}
                </div>
                <p className="text-gray-400 text-sm truncate">{m.message}</p>
              </div>
              <span className="text-xs text-gray-500 flex-shrink-0">{m.date.split(' ')[0]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── 2. Contenu ─── */
function TabContent({ content, onSave }: { content: SiteContent; onSave: (c: SiteContent) => void }) {
  const [form, setForm] = useState(content);
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    onSave(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const field = (label: string, key: keyof SiteContent, multiline = false) => (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>
      {multiline ? (
        <textarea value={form[key]} rows={4}
          onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
          className="w-full bg-slate-700/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm
                     focus:outline-none focus:ring-2 focus:ring-teal-500/50 resize-none transition-all" />
      ) : (
        <input type="text" value={form[key]}
          onChange={(e) => setForm((p) => ({ ...p, [key]: e.target.value }))}
          className="w-full bg-slate-700/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm
                     focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all" />
      )}
    </div>
  );

  return (
    <div className="space-y-8 max-w-3xl">
      <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6 space-y-5">
        <h3 className="font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal-400" /> Section Hero
        </h3>
        {field('Titre principal', 'heroTitle')}
        {field('Bio / Description', 'heroBio', true)}
      </div>

      <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6 space-y-5">
        <h3 className="font-bold text-white flex items-center gap-2">
          <FileText className="w-5 h-5 text-teal-400" /> Section À Propos
        </h3>
        {field('Paragraphe 1', 'aboutText1', true)}
        {field('Paragraphe 2', 'aboutText2', true)}
      </div>

      <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6 space-y-5">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Settings className="w-5 h-5 text-teal-400" /> Coordonnées & Photo
        </h3>
        <div className="grid sm:grid-cols-2 gap-5">
          {field('Numéro WhatsApp', 'whatsapp')}
          {field('Email de contact', 'email')}
          {field('Disponibilité affichée', 'disponibilite')}
          {field('URL photo PDG', 'photoUrl')}
        </div>
        <div className="flex items-center gap-3 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl">
          <Upload className="w-5 h-5 text-blue-400 flex-shrink-0" />
          <div>
            <p className="text-sm text-blue-300 font-medium">Uploader votre photo</p>
            <p className="text-xs text-gray-400">Placer l'image dans <code className="text-teal-400">public/images/pdg-photo.webp</code> puis mettre à jour l'URL ci-dessus.</p>
          </div>
        </div>
      </div>

      <motion.button onClick={handleSave}
        className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl font-bold
                   shadow-xl shadow-teal-500/20 hover:shadow-teal-500/40 transition-all"
        whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}>
        {saved ? <><CheckCircle className="w-5 h-5" /> Sauvegardé !</> : <><Save className="w-5 h-5" /> Sauvegarder les modifications</>}
      </motion.button>
    </div>
  );
}

/* ─── 3. Portfolio ─── */
function TabPortfolio({ projects, onUpdate }: { projects: Project[]; onUpdate: (p: Project[]) => void }) {
  const [editing, setEditing] = useState<Project | null>(null);
  const [list, setList] = useState(projects);

  const toggleVisible = (id: string) => {
    const updated = list.map((p) => p.id === id ? { ...p, visible: !p.visible } : p);
    setList(updated); onUpdate(updated);
  };

  const deleteProject = (id: string) => {
    const updated = list.filter((p) => p.id !== id);
    setList(updated); onUpdate(updated);
  };

  const saveEdit = () => {
    if (!editing) return;
    const updated = list.map((p) => p.id === editing.id ? editing : p);
    setList(updated); onUpdate(updated); setEditing(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400 text-sm">{list.length} projets au total</p>
        <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-500 rounded-lg text-sm font-semibold">
          <Plus className="w-4 h-4" /> Nouveau projet
        </motion.button>
      </div>

      {list.map((p) => (
        <motion.div key={p.id} layout
          className="bg-slate-800/60 rounded-2xl border border-white/5 p-5 hover:border-teal-500/20 transition-all">
          <div className="flex items-start gap-4">
            <div className={`w-14 h-14 bg-gradient-to-br ${p.gradient} rounded-xl flex-shrink-0 flex items-center justify-center text-2xl shadow-lg`}>
              💼
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <h4 className="font-bold text-white text-sm">{p.title}</h4>
                <Badge color={p.visible ? 'teal' : 'gray'}>{p.visible ? 'Visible' : 'Masqué'}</Badge>
              </div>
              <p className="text-gray-400 text-xs mb-2">{p.category} • {p.tech}</p>
              <p className="text-gray-500 text-xs truncate">{p.desc}</p>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => toggleVisible(p.id)}
                className={`p-2 rounded-lg transition-all ${p.visible ? 'bg-teal-500/20 text-teal-400 hover:bg-teal-500/30' : 'bg-gray-700/50 text-gray-400 hover:bg-gray-700'}`}>
                <Eye className="w-4 h-4" />
              </button>
              <button onClick={() => setEditing({ ...p })}
                className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all">
                <Edit3 className="w-4 h-4" />
              </button>
              <button onClick={() => deleteProject(p.id)}
                className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        </motion.div>
      ))}

      {/* Modal édition */}
      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setEditing(null)}>
            <motion.div initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 rounded-3xl border border-white/10 p-8 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-white text-xl">Modifier le projet</h3>
                <button onClick={() => setEditing(null)} className="p-2 hover:bg-white/10 rounded-lg transition-all">
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              <div className="space-y-4">
                {(['category', 'title', 'desc', 'result', 'tech'] as (keyof Project)[]).map((k) => (
                  <div key={k as string}>
                    <label className="block text-sm font-medium text-gray-300 mb-2 capitalize">{k as string}</label>
                    {k === 'desc' || k === 'result' ? (
                      <textarea value={editing[k] as string} rows={3}
                        onChange={(e) => setEditing((prev) => prev ? { ...prev, [k]: e.target.value } : prev)}
                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 resize-none" />
                    ) : (
                      <input type="text" value={editing[k] as string}
                        onChange={(e) => setEditing((prev) => prev ? { ...prev, [k]: e.target.value } : prev)}
                        className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
                    )}
                  </div>
                ))}
              </div>
              <div className="flex gap-3 mt-8">
                <motion.button onClick={saveEdit} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl font-bold text-sm">
                  <Save className="w-4 h-4 inline mr-2" /> Sauvegarder
                </motion.button>
                <button onClick={() => setEditing(null)}
                  className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl text-sm hover:bg-white/10 transition-all">
                  Annuler
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── 4. Messages ─── */
function TabMessages({ messages, onUpdate }: { messages: Message[]; onUpdate: (m: Message[]) => void }) {
  const [list, setList] = useState(messages);
  const [selected, setSelected] = useState<Message | null>(null);
  const [search, setSearch] = useState('');

  const markRead = (id: string) => {
    const updated = list.map((m) => m.id === id ? { ...m, read: true } : m);
    setList(updated); onUpdate(updated);
  };

  const markReplied = (id: string) => {
    const updated = list.map((m) => m.id === id ? { ...m, replied: true, read: true } : m);
    setList(updated); onUpdate(updated);
  };

  const deleteMsg = (id: string) => {
    const updated = list.filter((m) => m.id !== id);
    setList(updated); onUpdate(updated); if (selected?.id === id) setSelected(null);
  };

  const filtered = list.filter((m) =>
    m.nom.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.message.toLowerCase().includes(search.toLowerCase())
  );

  const unread = list.filter((m) => !m.read).length;

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Rechercher..."
            className="w-full bg-slate-800/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm
                       focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
        </div>
        {unread > 0 && <Badge color="blue">{unread} non lu{unread > 1 ? 's' : ''}</Badge>}
      </div>

      <div className="grid lg:grid-cols-5 gap-4">
        {/* Liste */}
        <div className="lg:col-span-2 space-y-2">
          {filtered.map((m) => (
            <button key={m.id} onClick={() => { setSelected(m); markRead(m.id); }}
              className={`w-full text-left p-4 rounded-xl border transition-all ${
                selected?.id === m.id
                  ? 'bg-teal-500/10 border-teal-500/40'
                  : 'bg-slate-800/60 border-white/5 hover:border-white/10'
              }`}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-teal-500 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {m.nom.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 mb-0.5">
                    <span className={`text-sm font-semibold ${m.read ? 'text-gray-300' : 'text-white'}`}>{m.nom}</span>
                    {!m.read && <div className="w-2 h-2 bg-blue-500 rounded-full" />}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{m.message}</p>
                  <p className="text-xs text-gray-600 mt-1">{m.date}</p>
                </div>
              </div>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="text-center text-gray-500 py-8 text-sm">Aucun message trouvé</p>
          )}
        </div>

        {/* Détail */}
        <div className="lg:col-span-3">
          {selected ? (
            <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6 h-full">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <h3 className="font-bold text-white text-lg">{selected.nom}</h3>
                  <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                    <Mail className="w-4 h-4" />{selected.email}
                  </div>
                </div>
                <button onClick={() => deleteMsg(selected.id)}
                  className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="flex gap-2 mb-4 flex-wrap">
                {selected.service && <Badge color="blue">🎯 {selected.service}</Badge>}
                <Badge color={selected.read ? 'gray' : 'blue'}>{selected.read ? 'Lu' : 'Non lu'}</Badge>
                <Badge color={selected.replied ? 'green' : 'yellow'}>{selected.replied ? '✓ Répondu' : 'En attente'}</Badge>
              </div>

              <div className="bg-slate-700/30 rounded-xl p-5 mb-6 border border-white/5">
                <p className="text-gray-200 leading-relaxed text-sm">{selected.message}</p>
              </div>

              <p className="text-xs text-gray-500 mb-6">{selected.date}</p>

              <div className="flex gap-3">
                <a href={`mailto:${selected.email}?subject=Re: Brumerie — Votre demande`}
                  onClick={() => markReplied(selected.id)}
                  className="flex-1 flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl font-semibold text-sm hover:shadow-lg transition-all">
                  <Mail className="w-4 h-4" /> Répondre par email
                </a>
                <a href={`https://wa.me/?text=Bonjour ${selected.nom}, suite à votre demande via Brumerie...`}
                  target="_blank" rel="noopener noreferrer"
                  onClick={() => markReplied(selected.id)}
                  className="px-5 py-3 bg-green-600/20 text-green-400 border border-green-500/30 rounded-xl font-semibold text-sm hover:bg-green-600/30 transition-all">
                  WhatsApp
                </a>
              </div>
            </div>
          ) : (
            <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6 h-full flex items-center justify-center">
              <div className="text-center text-gray-500">
                <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p className="text-sm">Sélectionnez un message</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── 5. Témoignages ─── */
function TabTestimonials({ testimonials, onUpdate }: { testimonials: Testimonial[]; onUpdate: (t: Testimonial[]) => void }) {
  const [list, setList] = useState(testimonials);
  const [editing, setEditing] = useState<Testimonial | null>(null);

  const toggle = (id: string) => {
    const u = list.map((t) => t.id === id ? { ...t, visible: !t.visible } : t);
    setList(u); onUpdate(u);
  };

  const del = (id: string) => {
    const u = list.filter((t) => t.id !== id);
    setList(u); onUpdate(u);
  };

  const save = () => {
    if (!editing) return;
    const u = list.map((t) => t.id === editing.id ? editing : t);
    setList(u); onUpdate(u); setEditing(null);
  };

  const addNew = () => {
    const newT: Testimonial = {
      id: Date.now().toString(), author: 'Nouveau client', role: 'Poste, Entreprise',
      text: 'Votre témoignage ici...', stars: 5, visible: false,
    };
    const u = [...list, newT];
    setList(u); onUpdate(u); setEditing(newT);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400 text-sm">{list.length} témoignages • {list.filter((t) => t.visible).length} visibles</p>
        <motion.button onClick={addNew} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-teal-500 rounded-lg text-sm font-semibold">
          <Plus className="w-4 h-4" /> Ajouter
        </motion.button>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((t) => (
          <motion.div key={t.id} layout
            className={`bg-slate-800/60 rounded-2xl border p-5 transition-all ${t.visible ? 'border-teal-500/20' : 'border-white/5 opacity-60'}`}>
            <div className="flex gap-1 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < t.stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600'}`} />
              ))}
            </div>
            <p className="text-gray-300 text-sm italic mb-4 line-clamp-3">« {t.text} »</p>
            <p className="font-semibold text-white text-sm">{t.author}</p>
            <p className="text-gray-500 text-xs mb-4">{t.role}</p>
            <div className="flex gap-2">
              <button onClick={() => toggle(t.id)}
                className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all ${t.visible ? 'bg-teal-500/20 text-teal-400' : 'bg-gray-700/50 text-gray-400'}`}>
                {t.visible ? 'Visible' : 'Masqué'}
              </button>
              <button onClick={() => setEditing({ ...t })} className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-all">
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => del(t.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all">
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </motion.div>
        ))}
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => e.target === e.currentTarget && setEditing(null)}>
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-slate-900 rounded-3xl border border-white/10 p-8 w-full max-w-lg">
              <h3 className="font-black text-white text-xl mb-6">Modifier le témoignage</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Auteur</label>
                  <input value={editing.author} onChange={(e) => setEditing((p) => p ? { ...p, author: e.target.value } : p)}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Rôle / Entreprise</label>
                  <input value={editing.role} onChange={(e) => setEditing((p) => p ? { ...p, role: e.target.value } : p)}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Témoignage</label>
                  <textarea value={editing.text} rows={4} onChange={(e) => setEditing((p) => p ? { ...p, text: e.target.value } : p)}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Note</label>
                  <div className="flex gap-2">
                    {[1,2,3,4,5].map((n) => (
                      <button key={n} onClick={() => setEditing((p) => p ? { ...p, stars: n } : p)}>
                        <Star className={`w-7 h-7 transition-all ${n <= editing.stars ? 'fill-yellow-400 text-yellow-400' : 'text-gray-600 hover:text-yellow-400'}`} />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <motion.button onClick={save} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl font-bold text-sm">
                  <Save className="w-4 h-4 inline mr-2" /> Sauvegarder
                </motion.button>
                <button onClick={() => setEditing(null)}
                  className="px-5 py-3 bg-white/5 border border-white/10 rounded-xl text-sm hover:bg-white/10 transition-all">Annuler</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ─── 6. Analytique ─── */
function TabAnalytics({ analytics }: { analytics: Analytics }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Eye} label="Visites aujourd'hui" value={analytics.visitsToday} color="bg-gradient-to-br from-blue-600 to-blue-700" />
        <StatCard icon={TrendingUp} label="Visites cette semaine" value={analytics.visitsWeek} color="bg-gradient-to-br from-teal-600 to-teal-700" />
        <StatCard icon={Users} label="Visites ce mois" value={analytics.visitsMonth.toLocaleString()} color="bg-gradient-to-br from-cyan-600 to-cyan-700" />
        <StatCard icon={MousePointerClick} label="Clics WhatsApp" value={analytics.waClicks} sub="Taux de conversion : 6.9%" color="bg-gradient-to-br from-green-600 to-green-700" />
        <StatCard icon={Mail} label="Formulaires envoyés" value={analytics.formSubmits} color="bg-gradient-to-br from-purple-600 to-purple-700" />
        <StatCard icon={Star} label="Section la + visitée" value={analytics.topSection} color="bg-gradient-to-br from-orange-600 to-orange-700" />
      </div>

      <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6">
        <h3 className="font-bold text-white mb-6 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-teal-400" /> Visites 7 derniers jours
        </h3>
        <div className="flex items-end gap-4 h-48">
          {analytics.dailyVisits.map((d, i) => {
            const max = Math.max(...analytics.dailyVisits.map((x) => x.count));
            return (
              <div key={d.day} className="flex-1 flex flex-col items-center gap-2">
                <span className="text-xs text-gray-400 font-mono">{d.count}</span>
                <motion.div
                  initial={{ height: 0 }} animate={{ height: `${(d.count / max) * 100}%` }}
                  transition={{ duration: 0.9, delay: i * 0.08, ease: 'easeOut' }}
                  className="w-full bg-gradient-to-t from-blue-600 to-teal-400 rounded-t-xl min-h-[6px] shadow-lg shadow-teal-500/20" />
                <span className="text-xs text-gray-500 font-medium">{d.day}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-bold text-white flex items-center gap-2">
            <Filter className="w-5 h-5 text-teal-400" /> Sources de trafic
          </h3>
          <button className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors">
            <Download className="w-4 h-4" /> Exporter CSV
          </button>
        </div>
        <div className="space-y-4">
          {analytics.sources.map((s) => {
            const total = analytics.sources.reduce((a, b) => a + b.count, 0);
            const pct = Math.round((s.count / total) * 100);
            return (
              <div key={s.name} className="flex items-center gap-4">
                <span className="text-sm text-gray-300 w-20 flex-shrink-0">{s.name}</span>
                <div className="flex-1 h-3 bg-slate-700 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }}
                    transition={{ duration: 1.2, ease: 'easeOut' }}
                    className="h-full rounded-full" style={{ backgroundColor: s.color }} />
                </div>
                <span className="text-sm text-gray-400 w-20 text-right flex-shrink-0">{s.count} ({pct}%)</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/* ─── 7. Paramètres ─── */
function TabSettings({ onLogout }: { onLogout: () => void }) {
  const [saved, setSaved] = useState(false);
  const [newPwd, setNewPwd] = useState('');
  const [notifications, setNotifications] = useState({ email: true, whatsapp: false, weekly: true });

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Infos compte */}
      <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6 space-y-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Shield className="w-5 h-5 text-teal-400" /> Compte administrateur
        </h3>
        <div className="flex items-center gap-4 p-4 bg-slate-700/40 rounded-xl">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-teal-500 rounded-full flex items-center justify-center text-2xl font-black">S</div>
          <div>
            <p className="font-bold text-white">Doukoua Tché Serge Alain</p>
            <p className="text-gray-400 text-sm">admin@brumerie.ci</p>
            <Badge color="teal">Super Admin</Badge>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">Changer le mot de passe</label>
          <input type="password" value={newPwd} onChange={(e) => setNewPwd(e.target.value)}
            placeholder="Nouveau mot de passe (min. 8 caractères)"
            className="w-full bg-slate-700/50 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all" />
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6 space-y-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <Bell className="w-5 h-5 text-teal-400" /> Notifications
        </h3>
        {([
          { key: 'email', label: 'Email à chaque nouveau message', icon: Mail },
          { key: 'whatsapp', label: 'Alerte WhatsApp (nouveau contact)', icon: Phone },
          { key: 'weekly', label: 'Rapport hebdomadaire par email', icon: BarChart3 },
        ] as { key: keyof typeof notifications; label: string; icon: React.ElementType }[]).map(({ key, label, icon: Icon }) => (
          <div key={key} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <Icon className="w-4 h-4 text-gray-400" />
              <span className="text-sm text-gray-300">{label}</span>
            </div>
            <button onClick={() => setNotifications((p) => ({ ...p, [key]: !p[key] }))}
              className={`w-12 h-6 rounded-full transition-all relative ${notifications[key] ? 'bg-teal-500' : 'bg-slate-600'}`}>
              <motion.div animate={{ x: notifications[key] ? 24 : 2 }}
                className="absolute top-1 w-4 h-4 bg-white rounded-full shadow" />
            </button>
          </div>
        ))}
      </div>

      {/* Infos site */}
      <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6 space-y-4">
        <h3 className="font-bold text-white flex items-center gap-2">
          <MapPin className="w-5 h-5 text-teal-400" /> Informations Firebase
        </h3>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          {[
            { label: 'Project ID', value: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'brumerie' },
            { label: 'Auth Domain', value: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'brumerie.firebaseapp.com' },
            { label: 'URL du site', value: 'www.brumerie.com' },
            { label: 'Version dashboard', value: 'v1.0.0' },
          ].map((info) => (
            <div key={info.label} className="bg-slate-700/40 rounded-xl p-3">
              <p className="text-gray-500 text-xs mb-1">{info.label}</p>
              <p className="text-gray-200 font-mono text-xs truncate">{info.value}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-3">
        <motion.button onClick={handleSave} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl font-bold shadow-xl shadow-teal-500/20 transition-all">
          {saved ? <><CheckCircle className="w-5 h-5" /> Sauvegardé !</> : <><Save className="w-5 h-5" /> Sauvegarder</>}
        </motion.button>
        <motion.button onClick={onLogout} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          className="flex items-center gap-2 px-6 py-4 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-semibold hover:bg-red-500/30 transition-all">
          <LogOut className="w-5 h-5" /> Déconnexion
        </motion.button>
      </div>
    </div>
  );
}

/* ============================================================
   DASHBOARD PRINCIPAL
   ============================================================ */
export default function AdminDashboard() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  // État global du contenu
  const [content, setContent] = useState<SiteContent>(INITIAL_CONTENT);
  const [projects, setProjects] = useState<Project[]>(MOCK_PROJECTS);
  const [messages, setMessages] = useState<Message[]>(MOCK_MESSAGES);
  const [testimonials, setTestimonials] = useState<Testimonial[]>(MOCK_TESTIMONIALS);

  const showToast = useCallback((msg: string, type: 'success' | 'error' = 'success') => {
    setToast({ msg, type });
  }, []);

  const tabs = [
    { id: 'overview',      label: 'Vue d\'ensemble', icon: LayoutDashboard },
    { id: 'content',       label: 'Contenu',         icon: FileText },
    { id: 'portfolio',     label: 'Portfolio',       icon: Briefcase },
    { id: 'messages',      label: 'Messages',        icon: MessageSquare,
      badge: messages.filter((m) => !m.read).length },
    { id: 'testimonials',  label: 'Témoignages',     icon: Star },
    { id: 'analytics',     label: 'Analytique',      icon: BarChart3 },
    { id: 'settings',      label: 'Paramètres',      icon: Settings },
  ];

  if (!isLoggedIn) return <LoginScreen onLogin={() => setIsLoggedIn(true)} />;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex" style={{ fontFamily: 'Inter, sans-serif' }}>

      {/* ── Sidebar ── */}
      <motion.aside
        animate={{ width: sidebarOpen ? 260 : 72 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className="flex-shrink-0 bg-slate-900/80 backdrop-blur-xl border-r border-white/5 flex flex-col overflow-hidden"
      >
        {/* Logo */}
        <div className="p-5 border-b border-white/5 flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/30">
            <Shield className="w-5 h-5 text-white" />
          </div>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <p className="font-black text-white text-sm" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Brumerie</p>
              <p className="text-xs text-gray-500">Admin Dashboard</p>
            </motion.div>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all relative group
                  ${isActive ? 'bg-gradient-to-r from-blue-600/20 to-teal-600/20 text-white border border-teal-500/20' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}>
                <tab.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-teal-400' : ''}`} />
                {sidebarOpen && (
                  <span className="text-sm font-medium flex-1 text-left">{tab.label}</span>
                )}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="w-5 h-5 bg-blue-500 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0 text-white">
                    {tab.badge}
                  </span>
                )}
                {isActive && <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-6 bg-teal-400 rounded-r" />}
              </button>
            );
          })}
        </nav>

        {/* Toggle sidebar + info utilisateur */}
        <div className="p-3 border-t border-white/5 space-y-2">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center gap-3 px-3 py-2.5 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-all">
            <ChevronRight className={`w-4 h-4 transition-transform ${sidebarOpen ? 'rotate-180' : ''}`} />
            {sidebarOpen && <span className="text-xs">Réduire</span>}
          </button>
          {sidebarOpen && (
            <div className="px-3 py-2 bg-white/5 rounded-xl">
              <p className="text-xs font-semibold text-white">Serge Alain</p>
              <p className="text-xs text-gray-500">admin@brumerie.ci</p>
            </div>
          )}
        </div>
      </motion.aside>

      {/* ── Contenu principal ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="bg-slate-900/50 backdrop-blur-xl border-b border-white/5 px-8 py-4 flex items-center justify-between flex-shrink-0">
          <div>
            <h1 className="text-xl font-black text-white" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
              {tabs.find((t) => t.id === activeTab)?.label}
            </h1>
            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {new Date().toLocaleDateString('fr-CI', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => showToast('Données actualisées !', 'success')}
              className="p-2 text-gray-400 hover:text-white hover:bg-white/10 rounded-lg transition-all">
              <RefreshCw className="w-4 h-4" />
            </button>
            <a href="/" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-300 hover:text-white hover:bg-white/10 transition-all">
              <Eye className="w-4 h-4" /> Voir le site
            </a>
          </div>
        </header>

        {/* Contenu de l'onglet */}
        <main className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div key={activeTab}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}>
              {activeTab === 'overview'     && <TabOverview analytics={MOCK_ANALYTICS} messages={messages} />}
              {activeTab === 'content'      && <TabContent content={content} onSave={(c) => { setContent(c); showToast('Contenu sauvegardé !'); }} />}
              {activeTab === 'portfolio'    && <TabPortfolio projects={projects} onUpdate={(p) => { setProjects(p); showToast('Portfolio mis à jour !'); }} />}
              {activeTab === 'messages'     && <TabMessages messages={messages} onUpdate={setMessages} />}
              {activeTab === 'testimonials' && <TabTestimonials testimonials={testimonials} onUpdate={(t) => { setTestimonials(t); showToast('Témoignages mis à jour !'); }} />}
              {activeTab === 'analytics'    && <TabAnalytics analytics={MOCK_ANALYTICS} />}
              {activeTab === 'settings'     && <TabSettings onLogout={() => setIsLoggedIn(false)} />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Toast notifications */}
      <AnimatePresence>
        {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
      </AnimatePresence>
    </div>
  );
}
