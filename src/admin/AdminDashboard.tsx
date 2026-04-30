/**
 * BRUMERIE DEV — DASHBOARD ADMIN v4
 * Connecté Firebase Firestore + Authentication
 * Toutes les données sont persistantes et temps réel
 */

import { useState, useEffect, useCallback, useRef, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  signInWithEmailAndPassword, signOut, onAuthStateChanged,
  type User,
} from 'firebase/auth';
import { auth } from './firebase';
import {
  getContent, saveContent,
  getServices, addService, updateService, deleteService,
  getProjects, addProject, updateProject, deleteProject,
  getBlogPosts, addBlogPost, updateBlogPost, deleteBlogPost,
  getReviews, addReview, updateReview, deleteReview,
  getMessages, updateMessage, deleteMessage,
  initFirestoreIfEmpty,
  type SiteContent, type Service, type Project,
  type BlogPost, type Review, type Message,
} from './firestore.service';
import {
  LayoutDashboard, FileText, Briefcase, MessageSquare, Star,
  BarChart3, Settings, LogOut, Eye, EyeOff, Trash2, Edit3,
  Plus, Save, X, CheckCircle, AlertCircle, TrendingUp, Users,
  MousePointerClick, Mail, Clock, Upload, Upload, Shield, Bell,
  ChevronRight, Search, RefreshCw, Wrench, Newspaper,
  ArrowUp, ArrowDown, Image, Link, Tag, Database, Loader2,
} from 'lucide-react';

/* ============================================================
   DONNÉES PAR DÉFAUT (pour initFirestoreIfEmpty)
   ============================================================ */
const DEFAULT_CONTENT: SiteContent = {
  heroTitle:     'Je construis des produits digitaux qui font la différence.',
  heroBio:       "Développeur Full-Stack & Ingénieur IA basé à Abidjan, Côte d'Ivoire. Fondateur de Brumerie.",
  aboutText1:    "Je suis Doukoua Tché Serge Alain, développeur Full-Stack & Ingénieur IA. Basé à Abidjan, je conçois des applications web et mobile de bout en bout.",
  aboutText2:    "Je suis le fondateur de Brumerie — une marketplace sociale mobile pour l'économie informelle d'Abidjan, incubée par FasterCapital.",
  whatsapp:      '+225 05 86 86 76 93',
  email:         'contact@brumerie.ci',
  photoUrl:      '/images/pdg-photo.webp',
  disponibilite: 'Lun – Ven, 8h – 18h (GMT)',
  slogan:        "Je code depuis Abidjan. Je build pour l'Afrique et au-delà.",
};

const DEFAULT_SERVICES = [
  { icon:'🖥️', title:'Développement Web Full-Stack', order:1, visible:true, gradient:'from-blue-600 to-blue-700',
    desc:'React, Next.js, TypeScript, Node.js, Firebase. Applications web de A à Z, mobile-first, SEO-ready.' },
  { icon:'🤖', title:"Intégration IA & Automatisation", order:2, visible:true, gradient:'from-teal-600 to-teal-700',
    desc:"APIs Claude / GPT-4, agents autonomes, pipelines d'automatisation, chatbots sur mesure." },
  { icon:'📱', title:'Apps Mobile (React Native)', order:3, visible:true, gradient:'from-cyan-600 to-cyan-700',
    desc:'Applications Android & iOS avec React Native + EAS Build. Paiement mobile money intégré.' },
  { icon:'🔧', title:'Architecture & DevOps', order:4, visible:true, gradient:'from-blue-500 to-teal-500',
    desc:'Firebase, Supabase, Vercel, GitHub Actions. Architectures scalables et pipelines CI/CD.' },
  { icon:'💡', title:'CTO Freelance & Conseil Produit', order:5, visible:true, gradient:'from-purple-600 to-blue-600',
    desc:'Audit technique, roadmap produit, code review. CTO à temps partiel pour startups.' },
];

const DEFAULT_PROJECTS = [
  { category:'Marketplace Mobile', title:'Brumerie — Marketplace Sociale Abidjan', order:1, visible:true,
    gradient:'from-green-500 to-teal-600',
    desc:"Application mobile-first pour l'économie informelle d'Abidjan. Paiement Wave/Orange Money, chat intégré, stories vendeurs.",
    result:'MVP validé · 10+ commandes réelles · brumerie.com live', tech:'React + TypeScript + Firebase + Capacitor' },
  { category:'Agent IA', title:'Agent Ultra v1 — Agent IA Autonome', order:2, visible:true,
    gradient:'from-purple-600 to-blue-600',
    desc:'Agent IA contrôlé via Telegram sur Android via Termux. Pipeline Claude Sonnet + Gemini Flash.',
    result:'Opérationnel · auto-amélioration autonome · 0 serveur cloud', tech:'Python · Claude API · Gemini · SQLite · Termux' },
];

const DEFAULT_REVIEWS = [
  { author:'Kouamé A.', role:'CEO', company:'Startup Fintech · Abidjan', stars:5, visible:true,
    date:'2026-03-15', text:"Tché a livré notre application en 3 semaines chrono. Le code est propre, documenté. Un vrai pro." },
  { author:'Diallo M.', role:'CTO', company:'AgriTech · Dakar', stars:5, visible:true,
    date:'2026-02-28', text:"Il a intégré un agent IA dans notre workflow en quelques jours. ROI immédiat." },
];

/* ============================================================
   COMPOSANTS UI
   ============================================================ */
function Badge({ children, color='blue' }: { children: React.ReactNode; color?: string }) {
  const map: Record<string,string> = {
    blue:'bg-blue-500/15 text-blue-300 border-blue-500/30', teal:'bg-teal-500/15 text-teal-300 border-teal-500/30',
    green:'bg-green-500/15 text-green-300 border-green-500/30', red:'bg-red-500/15 text-red-300 border-red-500/30',
    yellow:'bg-yellow-500/15 text-yellow-300 border-yellow-500/30', gray:'bg-gray-500/15 text-gray-400 border-gray-500/30',
    purple:'bg-purple-500/15 text-purple-300 border-purple-500/30',
  };
  return <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${map[color]||map.blue}`}>{children}</span>;
}

function Spinner({ size = 5 }: { size?: number }) {
  return <motion.div className={`w-${size} h-${size} border-2 border-white border-t-transparent rounded-full`}
    animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }} />;
}

function Toast({ msg, type, onClose }: { msg: string; type: 'success'|'error'; onClose: () => void }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  return (
    <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:20 }}
      className={`fixed bottom-6 right-6 z-[100] flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl border text-sm font-medium backdrop-blur-sm
        ${type==='success'?'bg-green-900/90 border-green-500/30 text-green-200':'bg-red-900/90 border-red-500/30 text-red-200'}`}>
      {type==='success'?<CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0"/>:<AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0"/>}
      {msg}
      <button onClick={onClose} className="ml-1 opacity-50 hover:opacity-100"><X className="w-4 h-4"/></button>
    </motion.div>
  );
}

function StatCard({ icon:Icon, label, value, gradient, sub }: { icon:React.ElementType; label:string; value:string|number; gradient:string; sub?:string }) {
  return (
    <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
      className="bg-slate-800/60 rounded-2xl border border-white/5 p-5 hover:border-teal-500/20 transition-all group">
      <div className={`w-10 h-10 bg-gradient-to-br ${gradient} rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
        <Icon className="w-5 h-5 text-white"/>
      </div>
      <p className="text-2xl font-black text-white">{value}</p>
      <p className="text-sm text-gray-400 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-600 mt-1">{sub}</p>}
    </motion.div>
  );
}

function Modal({ title, onClose, children }: { title:string; onClose:()=>void; children:React.ReactNode }) {
  return (
    <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} exit={{ opacity:0 }}
      className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={(e) => e.target===e.currentTarget && onClose()}>
      <motion.div initial={{ scale:0.9, y:20 }} animate={{ scale:1, y:0 }} exit={{ scale:0.9 }}
        className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-white/5">
          <h3 className="font-black text-white text-lg" style={{ fontFamily:'Space Grotesk, sans-serif' }}>{title}</h3>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-all text-gray-400 hover:text-white"><X className="w-5 h-5"/></button>
        </div>
        <div className="p-6">{children}</div>
      </motion.div>
    </motion.div>
  );
}

function Field({ label, value, onChange, multiline=false, rows=3, placeholder='', hint='' }: {
  label:string; value:string; onChange:(v:string)=>void;
  multiline?:boolean; rows?:number; placeholder?:string; hint?:string;
}) {
  const cls = "w-full bg-slate-800/80 border border-white/10 rounded-xl px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50 transition-all";
  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-1.5">{label}</label>
      {multiline
        ? <textarea value={value} onChange={e=>onChange(e.target.value)} rows={rows} placeholder={placeholder} className={`${cls} resize-none`}/>
        : <input type="text" value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} className={cls}/>}
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

function BtnPrimary({ onClick, children, disabled=false, loading=false, type='button' }: {
  onClick?:()=>void; children:React.ReactNode; disabled?:boolean; loading?:boolean; type?:'button'|'submit';
}) {
  return (
    <motion.button onClick={onClick} disabled={disabled||loading} type={type}
      className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl font-semibold text-sm shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40 transition-all disabled:opacity-50"
      whileHover={!disabled&&!loading?{ scale:1.02 }:{}} whileTap={!disabled&&!loading?{ scale:0.97 }:{}}>
      {loading ? <Spinner size={4}/> : children}
    </motion.button>
  );
}

const GRADIENTS = ['from-blue-600 to-blue-700','from-teal-600 to-teal-700','from-cyan-600 to-cyan-700',
  'from-purple-600 to-blue-600','from-orange-500 to-red-500','from-green-600 to-teal-600',
  'from-pink-600 to-purple-600','from-blue-500 to-teal-500'];
const ICONS_S = ['🖥️','🤖','🎓','🔧','💡','📱','🚀','🎯','⚡','🔒','📊','🌍','💼','✨','🛠️'];
const ICONS_B = ['📝','🤖','💻','📱','🌍','💡','🚀','📊','🎓','💳','🔧','✨','🎯','📰','💼'];
const BLOG_CATS = ['Intelligence Artificielle','Développement Web','Business','Formation','Actualités','Tutoriel'];

/* ============================================================
   ÉCRAN DE CONNEXION — Firebase Auth réel
   ============================================================ */
/* ============================================================
   COMPOSANT : Sélecteur d'image avec prévisualisation
   ============================================================ */
const BLOG_IMG_OPTIONS = [
  { label: 'IA & Automatisation',  value: '/images/blog/blog-ia.svg'       },
  { label: 'Développement Web',    value: '/images/blog/blog-web.svg'       },
  { label: 'Business',             value: '/images/blog/blog-business.svg'  },
  { label: 'Formation',            value: '/images/blog/blog-formation.svg' },
  { label: 'Actualités',           value: '/images/blog/blog-actu.svg'      },
  { label: 'Défaut Blog',          value: '/images/blog/blog-default.svg'   },
];

const PROJET_IMG_OPTIONS = [
  { label: 'Marketplace',    value: '/images/projets/projet-marketplace.svg' },
  { label: 'Agent IA',       value: '/images/projets/projet-ia.svg'          },
  { label: 'SaaS / Docs',   value: '/images/projets/projet-saas.svg'        },
  { label: 'App Web',        value: '/images/projets/projet-web.svg'         },
  { label: 'App Mobile',     value: '/images/projets/projet-mobile.svg'      },
  { label: 'Défaut',         value: '/images/projets/projet-default.svg'     },
];

const AVATAR_OPTIONS = [
  { label: 'Avatar 1 (cyan)',    value: '/images/avis/avatar-1.svg' },
  { label: 'Avatar 2 (violet)',  value: '/images/avis/avatar-2.svg' },
  { label: 'Avatar 3 (vert)',    value: '/images/avis/avatar-3.svg' },
  { label: 'Avatar 4 (orange)',  value: '/images/avis/avatar-4.svg' },
  { label: 'Avatar 5 (rouge)',   value: '/images/avis/avatar-5.svg' },
  { label: 'Avatar 6 (bleu)',    value: '/images/avis/avatar-6.svg' },
];

function ImagePicker({
  label, value, onChange, options, hint = '',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { label: string; value: string }[];
  hint?: string;
}) {
  const [custom, setCustom]     = useState('');
  const [tab, setTab]           = useState<'upload'|'url'|'placeholder'>('upload');
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => { onChange(ev.target?.result as string); setUploading(false); };
    reader.onerror = () => setUploading(false);
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-300 mb-2">{label}</label>

      {/* Prévisualisation */}
      {value && (
        <div className="mb-3 relative w-full h-36 rounded-xl overflow-hidden border border-white/10 bg-slate-800/50 group">
          <img src={value} alt="Aperçu" loading="lazy" className="w-full h-full object-cover"
            onError={(e) => { e.currentTarget.src = options[0]?.value || ''; }}/>
          <button type="button" onClick={() => onChange('')}
            className="absolute top-2 right-2 w-7 h-7 bg-black/70 rounded-full flex items-center justify-center
              opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/80">
            <X className="w-3.5 h-3.5 text-white"/>
          </button>
        </div>
      )}

      {/* Onglets */}
      <div className="flex gap-1 mb-3 p-1 bg-slate-800/60 rounded-xl">
        {([
          { id: 'upload' as const,      label: '📱 Galerie'   },
          { id: 'url' as const,         label: '🔗 URL'       },
          { id: 'placeholder' as const, label: '🎨 Prédéfini' },
        ]).map(t => (
          <button key={t.id} type="button" onClick={() => setTab(t.id)}
            className={`flex-1 py-2 rounded-lg text-xs font-medium transition-all
              ${tab === t.id ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' : 'text-gray-500 hover:text-gray-300'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Upload galerie */}
      {tab === 'upload' && (
        <div className="space-y-3">
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileUpload}/>
          <button type="button" onClick={() => fileRef.current?.click()}
            className="w-full py-6 border-2 border-dashed border-white/20 rounded-xl text-center
              hover:border-teal-500/50 hover:bg-teal-500/5 transition-all group">
            {uploading ? (
              <div className="flex items-center justify-center gap-2 text-sm text-gray-400">
                <motion.div className="w-4 h-4 border-2 border-teal-400 border-t-transparent rounded-full"
                  animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.7, ease: 'linear' }}/>
                Chargement...
              </div>
            ) : (
              <>
                <Upload className="w-8 h-8 mx-auto mb-2 text-gray-500 group-hover:text-teal-400 transition-colors"/>
                <p className="text-sm text-gray-300 font-medium">Appuyer pour choisir une photo</p>
                <p className="text-xs text-gray-500 mt-1">Depuis galerie ou caméra · JPG, PNG, WebP</p>
              </>
            )}
          </button>
          <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
            <p className="text-xs text-yellow-300 font-semibold">⚠️ Image temporaire</p>
            <p className="text-xs text-gray-400 mt-1">
              Pour une image permanente sur le site : copiez-la dans <code className="text-teal-400">public/images/blog/</code>
              puis collez le chemin dans l'onglet URL.
            </p>
          </div>
        </div>
      )}

      {/* URL externe */}
      {tab === 'url' && (
        <div className="space-y-3">
          <div className="flex gap-2">
            <input type="text" value={custom} onChange={e => setCustom(e.target.value)}
              placeholder="https://i.imgur.com/xxx.jpg  ou  /images/blog/article.webp"
              className="flex-1 bg-slate-800 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm
                placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50"/>
            <button type="button" onClick={() => { if(custom.trim()){ onChange(custom.trim()); setCustom(''); }}}
              className="px-4 py-2.5 bg-teal-500/20 text-teal-400 border border-teal-500/30 rounded-xl text-sm font-bold hover:bg-teal-500/30 transition-all">
              OK
            </button>
          </div>
          <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs space-y-1.5">
            <p className="text-blue-300 font-semibold">💡 Hébergement gratuit d'images :</p>
            <p className="text-gray-400">• <strong className="text-white">imgur.com</strong> → Uploader → clic droit → "Copier l'adresse de l'image"</p>
            <p className="text-gray-400">• <strong className="text-white">imgbb.com</strong> → Upload gratuit, lien direct</p>
            <p className="text-gray-400">• <strong className="text-white">Local</strong> → <code className="text-teal-400">/images/blog/article.webp</code></p>
          </div>
        </div>
      )}

      {/* Images prédéfinies */}
      {tab === 'placeholder' && (
        <div className="grid grid-cols-3 gap-2">
          {options.map(opt => (
            <button key={opt.value} type="button" onClick={() => onChange(opt.value)}
              className={`relative h-20 rounded-xl overflow-hidden border-2 transition-all
                ${value === opt.value ? 'border-teal-400 scale-105 shadow-lg shadow-teal-500/20' : 'border-white/10 hover:border-white/30'}`}>
              <img src={opt.value} alt={opt.label} className="w-full h-full object-cover"/>
              <div className="absolute inset-0 bg-black/50 flex items-end p-1.5">
                <span className="text-[10px] text-white font-semibold leading-tight">{opt.label}</span>
              </div>
              {value === opt.value && (
                <div className="absolute top-1 right-1 w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-3 h-3 text-white"/>
                </div>
              )}
            </button>
          ))}
        </div>
      )}

      {hint && <p className="text-xs text-gray-500 mt-2">{hint}</p>}
    </div>
  );
}


function LoginScreen() {
  const [email, setEmail]   = useState('');
  const [pwd, setPwd]       = useState('');
  const [err, setErr]       = useState('');
  const [loading, setLoading] = useState(false);
  const [showPwd, setShowPwd] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true); setErr('');
    try {
      await signInWithEmailAndPassword(auth, email, pwd);
      // onAuthStateChanged dans le parent détecte la connexion
    } catch (error: unknown) {
      const code = (error as { code?: string }).code;
      if (code === 'auth/invalid-credential' || code === 'auth/wrong-password')
        setErr('Email ou mot de passe incorrect.');
      else if (code === 'auth/user-not-found')
        setErr('Aucun compte trouvé avec cet email.');
      else if (code === 'auth/too-many-requests')
        setErr('Trop de tentatives. Réessayez dans quelques minutes.');
      else
        setErr('Erreur de connexion. Vérifiez votre connexion internet.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4" style={{ fontFamily:'Inter, sans-serif' }}>
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px]"/>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/15 rounded-full blur-[100px]"/>
      </div>
      <motion.div initial={{ opacity:0, y:30 }} animate={{ opacity:1, y:0 }}
        className="relative w-full max-w-md bg-slate-900/90 backdrop-blur-xl rounded-3xl border border-white/10 p-10 shadow-2xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-teal-500/30">
            <Shield className="w-8 h-8"/>
          </div>
          <h1 className="text-2xl font-black text-white" style={{ fontFamily:'Space Grotesk, sans-serif' }}>Dashboard Admin</h1>
          <p className="text-gray-500 text-sm mt-1">dev.brumerie.com — Espace sécurisé Firebase</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email</label>
            <input type="email" value={email} onChange={e=>setEmail(e.target.value)} required
              placeholder="votre@email.com"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"/>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Mot de passe</label>
            <div className="relative">
              <input type={showPwd?'text':'password'} value={pwd} onChange={e=>setPwd(e.target.value)} required
                placeholder="••••••••••"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-12 text-white placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-teal-500/50 transition-all"/>
              <button type="button" onClick={()=>setShowPwd(!showPwd)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300 transition-colors">
                {showPwd?<EyeOff className="w-5 h-5"/>:<Eye className="w-5 h-5"/>}
              </button>
            </div>
          </div>
          {err && <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0"/>{err}
          </div>}
          <motion.button type="submit" disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl font-bold shadow-xl shadow-teal-500/20 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            whileHover={!loading?{ scale:1.01, y:-1 }:{}} whileTap={!loading?{ scale:0.98 }:{}}>
            {loading?<><Spinner size={4}/>Connexion...</>:'Se connecter →'}
          </motion.button>
        </form>
        <div className="mt-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-xs text-gray-400 text-center">
          Authentification sécurisée via <span className="text-blue-300 font-medium">Firebase Auth</span>
        </div>
      </motion.div>
    </div>
  );
}

/* ============================================================
   LOADING SCREEN
   ============================================================ */
function LoadingScreen({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center" style={{ fontFamily:'Inter, sans-serif' }}>
      <div className="text-center">
        <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-teal-500/30">
          <Loader2 className="w-8 h-8 text-white animate-spin"/>
        </div>
        <p className="text-gray-400 text-sm">{message}</p>
      </div>
    </div>
  );
}

/* ============================================================
   TAB : VUE D'ENSEMBLE
   ============================================================ */
function TabOverview({ services, projects, blog, reviews, messages }: {
  services:Service[]; projects:Project[]; blog:BlogPost[]; reviews:Review[]; messages:Message[];
}) {
  const unread = messages.filter(m=>!m.read).length;
  const weekly = [38,52,45,61,71,28,17];
  const days   = ['Lun','Mar','Mer','Jeu','Ven','Sam','Dim'];
  const max    = Math.max(...weekly);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Wrench}        label="Services actifs"   value={services.filter(s=>s.visible).length}  gradient="from-blue-600 to-blue-700"/>
        <StatCard icon={Briefcase}     label="Projets visibles"  value={projects.filter(p=>p.visible).length}  gradient="from-teal-600 to-teal-700"/>
        <StatCard icon={Newspaper}     label="Articles publiés"  value={blog.filter(b=>b.published).length}    gradient="from-purple-600 to-purple-700"/>
        <StatCard icon={MessageSquare} label="Messages non lus"  value={unread} sub={`${messages.length} total`} gradient="from-orange-500 to-red-500"/>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Star}              label="Avis visibles"    value={reviews.filter(r=>r.visible).length}  gradient="from-yellow-500 to-orange-500"/>
        <StatCard icon={Eye}               label="Visites/semaine"  value="312"                                  gradient="from-cyan-600 to-cyan-700"/>
        <StatCard icon={MousePointerClick} label="Clics WhatsApp"   value="89"                                   gradient="from-green-600 to-green-700"/>
        <StatCard icon={TrendingUp}        label="Taux conversion"  value="6.9%"                                 gradient="from-indigo-600 to-blue-600"/>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-800/60 rounded-2xl border border-white/5 p-6">
          <h3 className="font-bold text-white mb-5 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-teal-400"/> Visites — 7 derniers jours
          </h3>
          <div className="flex items-end gap-3 h-36">
            {weekly.map((v,i)=>(
              <div key={days[i]} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-gray-500">{v}</span>
                <motion.div initial={{ height:0 }} animate={{ height:`${(v/max)*100}%` }}
                  transition={{ duration:0.8, delay:i*0.06 }}
                  className="w-full bg-gradient-to-t from-blue-600 to-teal-400 rounded-t-lg min-h-[4px]"/>
                <span className="text-xs text-gray-600">{days[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Database className="w-5 h-5 text-teal-400"/> Firestore
          </h3>
          <div className="space-y-3">
            {[
              { label:'Services',   count:services.length,  color:'text-blue-400'   },
              { label:'Projets',    count:projects.length,  color:'text-teal-400'   },
              { label:'Articles',   count:blog.length,      color:'text-purple-400' },
              { label:'Avis',       count:reviews.length,   color:'text-yellow-400' },
              { label:'Messages',   count:messages.length,  color:'text-orange-400' },
            ].map(item=>(
              <div key={item.label} className="flex items-center justify-between py-1.5 border-b border-white/5 last:border-0">
                <span className="text-sm text-gray-400">{item.label}</span>
                <span className={`text-sm font-bold ${item.color}`}>{item.count} docs</span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"/>
            Firebase connecté
          </div>
        </div>
      </div>

      {messages.length > 0 && (
        <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6">
          <h3 className="font-bold text-white mb-4 flex items-center gap-2">
            <Mail className="w-5 h-5 text-teal-400"/> Derniers messages
          </h3>
          <div className="space-y-3">
            {messages.slice(0,3).map(m=>(
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
                <span className="text-xs text-gray-600 flex-shrink-0">{m.date?.split(' ')[0]}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ============================================================
   TAB : CONTENU & PHOTO
   ============================================================ */
function TabContent({ content, onSave }: { content:SiteContent; onSave:(c:SiteContent)=>Promise<void> }) {
  const [form, setForm]     = useState(content);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved]   = useState(false);
  const fileRef             = useRef<HTMLInputElement>(null);

  useEffect(() => { setForm(content); }, [content]);

  const set = (k: keyof SiteContent) => (v: string) => setForm(p=>({...p,[k]:v}));

  const handleSave = async () => {
    setSaving(true);
    await onSave(form);
    setSaving(false); setSaved(true);
    setTimeout(()=>setSaved(false), 2500);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Photo */}
      <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6">
        <h3 className="font-bold text-white mb-5 flex items-center gap-2">
          <Image className="w-5 h-5 text-teal-400"/> Photo PDG
        </h3>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          <div className="flex-shrink-0">
            <div className="w-32 h-32 rounded-2xl overflow-hidden bg-slate-700 border-2 border-dashed border-teal-500/40">
              <img src={form.photoUrl||'/images/pdg-photo.webp'} alt="PDG"
                className="w-full h-full object-cover object-top"
                onError={(e)=>{e.currentTarget.src='/images/pdg-photo.svg';}}/>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">Aperçu</p>
          </div>
          <div className="flex-1 space-y-3">
            <Field label="URL de la photo" value={form.photoUrl} onChange={set('photoUrl')}
              placeholder="/images/pdg-photo.webp"
              hint="Placez votre photo dans public/images/ puis saisissez le chemin."/>
            <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3">
              <p className="text-xs text-green-300 font-medium">✅ Photo déjà intégrée dans le projet</p>
              <p className="text-xs text-gray-400 mt-1">Le fichier <code className="text-teal-400">pdg-photo.webp</code> est dans <code className="text-teal-400">public/images/</code></p>
            </div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden"
              onChange={e=>{
                const file=e.target.files?.[0];
                if(file){setForm(p=>({...p,photoUrl:URL.createObjectURL(file)}));}
              }}/>
            <button onClick={()=>fileRef.current?.click()}
              className="flex items-center gap-2 px-4 py-2 bg-slate-700 border border-white/10 rounded-xl text-sm text-gray-300 hover:bg-slate-600 transition-all">
              <Upload className="w-4 h-4"/> Prévisualiser un fichier local
            </button>
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6 space-y-4">
        <h3 className="font-bold text-white flex items-center gap-2"><FileText className="w-5 h-5 text-teal-400"/> Section Hero</h3>
        <Field label="Titre principal" value={form.heroTitle} onChange={set('heroTitle')}/>
        <Field label="Bio / Description" value={form.heroBio} onChange={set('heroBio')} multiline rows={3}/>
      </div>

      {/* À propos */}
      <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6 space-y-4">
        <h3 className="font-bold text-white flex items-center gap-2"><Users className="w-5 h-5 text-teal-400"/> Section À propos</h3>
        <Field label="Paragraphe 1" value={form.aboutText1} onChange={set('aboutText1')} multiline rows={3}/>
        <Field label="Paragraphe 2" value={form.aboutText2} onChange={set('aboutText2')} multiline rows={3}/>
        <Field label="Slogan footer" value={form.slogan} onChange={set('slogan')}/>
      </div>

      {/* Coordonnées */}
      <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6 space-y-4">
        <h3 className="font-bold text-white flex items-center gap-2"><Mail className="w-5 h-5 text-teal-400"/> Coordonnées</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="WhatsApp" value={form.whatsapp} onChange={set('whatsapp')}/>
          <Field label="Email" value={form.email} onChange={set('email')}/>
          <Field label="Disponibilité" value={form.disponibilite} onChange={set('disponibilite')}/>
        </div>
      </div>

      <BtnPrimary onClick={handleSave} loading={saving}>
        {saved?<><CheckCircle className="w-4 h-4"/>Sauvegardé dans Firestore !</>:<><Save className="w-4 h-4"/>Sauvegarder dans Firebase</>}
      </BtnPrimary>
    </div>
  );
}

/* ============================================================
   TAB : SERVICES — Firebase CRUD
   ============================================================ */
function TabServices({ services, reload, showToast }: { services:Service[]; reload:()=>void; showToast:(m:string,t?:'success'|'error')=>void }) {
  const [list, setList]     = useState(services);
  const [editing, setEditing] = useState<Service|null>(null);
  const [isNew, setIsNew]   = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(()=>{ setList(services); }, [services]);

  const toggle = async (s: Service) => {
    await updateService(s.id, { visible: !s.visible });
    showToast('Visibilité mise à jour'); reload();
  };

  const del = async (id: string) => {
    if(!confirm('Supprimer ce service ?')) return;
    await deleteService(id);
    showToast('Service supprimé'); reload();
  };

  const move = async (id: string, dir: 'up'|'down') => {
    const idx = list.findIndex(s=>s.id===id);
    if(dir==='up'&&idx===0) return;
    if(dir==='down'&&idx===list.length-1) return;
    const u = [...list];
    const sw = dir==='up'?idx-1:idx+1;
    [u[idx],u[sw]] = [u[sw],u[idx]];
    await Promise.all([
      updateService(u[idx].id, { order: idx+1 }),
      updateService(u[sw].id,  { order: sw+1  }),
    ]);
    showToast('Ordre mis à jour'); reload();
  };

  const openNew = () => {
    setEditing({ id:'', icon:'🚀', title:'', desc:'', gradient:GRADIENTS[0], visible:true, order:list.length+1 });
    setIsNew(true);
  };

  const saveEdit = async () => {
    if(!editing||!editing.title.trim()) return;
    setSaving(true);
    try {
      if(isNew) {
        const { id:_, ...data } = editing;
        await addService(data);
        showToast('Service ajouté !');
      } else {
        const { id, ...data } = editing;
        await updateService(id, data);
        showToast('Service mis à jour !');
      }
      setEditing(null); setIsNew(false); reload();
    } catch { showToast('Erreur Firebase', 'error'); }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400 text-sm">{list.length} services · {list.filter(s=>s.visible).length} visibles</p>
        <BtnPrimary onClick={openNew}><Plus className="w-4 h-4"/> Nouveau service</BtnPrimary>
      </div>
      <div className="space-y-3">
        {list.sort((a,b)=>a.order-b.order).map((s,idx)=>(
          <motion.div key={s.id} layout className={`bg-slate-800/60 rounded-2xl border p-4 transition-all ${s.visible?'border-white/5':'border-white/5 opacity-60'}`}>
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 bg-gradient-to-br ${s.gradient} rounded-xl flex items-center justify-center text-2xl flex-shrink-0`}>{s.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-bold text-white text-sm">{s.title||'Sans titre'}</h4>
                  <Badge color={s.visible?'teal':'gray'}>{s.visible?'Visible':'Masqué'}</Badge>
                </div>
                <p className="text-xs text-gray-500 truncate">{s.desc}</p>
              </div>
              <div className="flex items-center gap-1 flex-shrink-0">
                <button onClick={()=>move(s.id,'up')} disabled={idx===0} className="p-1.5 text-gray-500 hover:text-white disabled:opacity-20"><ArrowUp className="w-4 h-4"/></button>
                <button onClick={()=>move(s.id,'down')} disabled={idx===list.length-1} className="p-1.5 text-gray-500 hover:text-white disabled:opacity-20"><ArrowDown className="w-4 h-4"/></button>
                <button onClick={()=>toggle(s)} className={`p-1.5 rounded-lg transition-all ${s.visible?'text-teal-400 hover:bg-teal-500/10':'text-gray-500 hover:bg-white/5'}`}>
                  {s.visible?<Eye className="w-4 h-4"/>:<EyeOff className="w-4 h-4"/>}
                </button>
                <button onClick={()=>{setEditing({...s});setIsNew(false);}} className="p-1.5 text-blue-400 hover:bg-blue-500/10 rounded-lg"><Edit3 className="w-4 h-4"/></button>
                <button onClick={()=>del(s.id)} className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4"/></button>
              </div>
            </div>
          </motion.div>
        ))}
        {list.length===0 && <div className="text-center py-12 text-gray-500"><Wrench className="w-10 h-10 mx-auto mb-3 opacity-20"/><p>Aucun service — cliquez sur "Nouveau service"</p></div>}
      </div>

      <AnimatePresence>
        {editing && (
          <Modal title={isNew?'Nouveau service':'Modifier le service'} onClose={()=>setEditing(null)}>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Icône</label>
                <div className="flex flex-wrap gap-2">
                  {ICONS_S.map(ic=>(
                    <button key={ic} onClick={()=>setEditing(p=>p?{...p,icon:ic}:p)}
                      className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${editing.icon===ic?'bg-teal-500/30 border-2 border-teal-400':'bg-slate-700 border border-white/10 hover:bg-slate-600'}`}>{ic}</button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Couleur</label>
                <div className="flex flex-wrap gap-2">
                  {GRADIENTS.map(g=>(
                    <button key={g} onClick={()=>setEditing(p=>p?{...p,gradient:g}:p)}
                      className={`w-8 h-8 rounded-lg bg-gradient-to-br ${g} transition-all ${editing.gradient===g?'ring-2 ring-white scale-110':'hover:scale-105'}`}/>
                  ))}
                </div>
              </div>
              <Field label="Titre *" value={editing.title} onChange={v=>setEditing(p=>p?{...p,title:v}:p)} placeholder="Ex : Développement Web Full-Stack"/>
              <Field label="Description" value={editing.desc} onChange={v=>setEditing(p=>p?{...p,desc:v}:p)} multiline rows={3}/>
              <div className="flex gap-3 pt-2">
                <BtnPrimary onClick={saveEdit} loading={saving}><Save className="w-4 h-4"/>{isNew?'Ajouter':'Sauvegarder'}</BtnPrimary>
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
   TAB : PORTFOLIO — Firebase CRUD
   ============================================================ */
function TabPortfolio({ projects, reload, showToast }: { projects:Project[]; reload:()=>void; showToast:(m:string,t?:'success'|'error')=>void }) {
  const [editing, setEditing] = useState<Project|null>(null);
  const [isNew, setIsNew]     = useState(false);
  const [saving, setSaving]   = useState(false);

  const toggle = async (p: Project) => { await updateProject(p.id,{visible:!p.visible}); showToast('Visibilité mise à jour'); reload(); };
  const del    = async (id: string) => { if(!confirm('Supprimer ?'))return; await deleteProject(id); showToast('Projet supprimé'); reload(); };
  const openNew = () => { setEditing({id:'',category:'',title:'',desc:'',result:'',tech:'',gradient:GRADIENTS[0],visible:true,order:projects.length+1}); setIsNew(true); };
  const saveEdit = async () => {
    if(!editing||!editing.title.trim())return;
    setSaving(true);
    try {
      if(isNew){ const{id:_,...d}=editing; await addProject(d); showToast('Projet ajouté !'); }
      else{ const{id,...d}=editing; await updateProject(id,d); showToast('Projet mis à jour !'); }
      setEditing(null); setIsNew(false); reload();
    } catch { showToast('Erreur Firebase','error'); }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400 text-sm">{projects.length} projets · {projects.filter(p=>p.visible).length} visibles</p>
        <BtnPrimary onClick={openNew}><Plus className="w-4 h-4"/> Nouveau projet</BtnPrimary>
      </div>
      <div className="grid sm:grid-cols-2 gap-4">
        {projects.sort((a,b)=>a.order-b.order).map(p=>(
          <motion.div key={p.id} layout className={`bg-slate-800/60 rounded-2xl border p-5 transition-all ${p.visible?'border-white/5':'border-white/5 opacity-60'}`}>
            <div className={`h-1.5 w-full bg-gradient-to-r ${p.gradient} rounded-full mb-4`}/>
            <div className="flex items-start justify-between gap-2 mb-2">
              <div><Badge color="gray">{p.category||'Non classé'}</Badge><h4 className="font-bold text-white text-sm mt-1">{p.title}</h4></div>
              <Badge color={p.visible?'teal':'gray'}>{p.visible?'Visible':'Masqué'}</Badge>
            </div>
            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{p.desc}</p>
            {p.result && <div className="text-xs text-green-300 bg-green-500/10 border border-green-500/20 rounded-lg px-3 py-1.5 mb-3">✓ {p.result}</div>}
            <div className="flex gap-2">
              <button onClick={()=>toggle(p)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${p.visible?'bg-teal-500/20 text-teal-400':'bg-gray-700/50 text-gray-500'}`}>
                {p.visible?'Masquer':'Afficher'}
              </button>
              <button onClick={()=>{setEditing({...p});setIsNew(false);}} className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg"><Edit3 className="w-4 h-4"/></button>
              <button onClick={()=>del(p.id)} className="p-1.5 bg-red-500/20 text-red-400 rounded-lg"><Trash2 className="w-4 h-4"/></button>
            </div>
          </motion.div>
        ))}
        {projects.length===0 && <div className="sm:col-span-2 text-center py-12 text-gray-500"><Briefcase className="w-10 h-10 mx-auto mb-3 opacity-20"/><p>Aucun projet — cliquez sur "Nouveau projet"</p></div>}
      </div>

      <AnimatePresence>
        {editing && (
          <Modal title={isNew?'Nouveau projet':'Modifier le projet'} onClose={()=>setEditing(null)}>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-300 mb-2">Couleur</label>
                <div className="flex flex-wrap gap-2">{GRADIENTS.map(g=><button key={g} onClick={()=>setEditing(p=>p?{...p,gradient:g}:p)} className={`w-8 h-8 rounded-lg bg-gradient-to-br ${g} ${editing.gradient===g?'ring-2 ring-white scale-110':'hover:scale-105'}`}/>)}</div>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Catégorie" value={editing.category} onChange={v=>setEditing(p=>p?{...p,category:v}:p)} placeholder="Ex: Marketplace"/>
                <Field label="Lien" value={editing.link||''} onChange={v=>setEditing(p=>p?{...p,link:v}:p)} placeholder="https://..."/>
              </div>
              <Field label="Titre *" value={editing.title} onChange={v=>setEditing(p=>p?{...p,title:v}:p)}/>
              <ImagePicker
                label="Image du projet"
                value={editing.coverImage || ''}
                onChange={v=>setEditing(p=>p?{...p,coverImage:v}:p)}
                options={PROJET_IMG_OPTIONS}
                hint="Choisissez une image ou déposez votre capture d'écran dans public/images/projets/"
              />
              <Field label="Description" value={editing.desc} onChange={v=>setEditing(p=>p?{...p,desc:v}:p)} multiline rows={3}/>
              <Field label="Résultat" value={editing.result} onChange={v=>setEditing(p=>p?{...p,result:v}:p)} placeholder="+300% de ventes..."/>
              <Field label="Technologies" value={editing.tech} onChange={v=>setEditing(p=>p?{...p,tech:v}:p)} placeholder="React, Firebase..."/>
              <div className="flex gap-3 pt-2">
                <BtnPrimary onClick={saveEdit} loading={saving}><Save className="w-4 h-4"/>{isNew?'Ajouter':'Sauvegarder'}</BtnPrimary>
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
   TAB : BLOG — Firebase CRUD
   ============================================================ */
function TabBlog({ posts, reload, showToast }: { posts:BlogPost[]; reload:()=>void; showToast:(m:string,t?:'success'|'error')=>void }) {
  const [editing, setEditing] = useState<BlogPost|null>(null);
  const [isNew, setIsNew]     = useState(false);
  const [saving, setSaving]   = useState(false);
  const [search, setSearch]   = useState('');

  const toggle  = async (p: BlogPost) => { await updateBlogPost(p.id,{published:!p.published}); showToast('Statut mis à jour'); reload(); };
  const del     = async (id: string) => { if(!confirm('Supprimer cet article ?'))return; await deleteBlogPost(id); showToast('Article supprimé'); reload(); };
  const openNew = () => { setEditing({id:'',title:'',excerpt:'',content:'',category:BLOG_CATS[0],tags:'',date:new Date().toISOString().split('T')[0],published:false,coverEmoji:'📝'}); setIsNew(true); };
  const saveEdit = async () => {
    if(!editing||!editing.title.trim())return;
    setSaving(true);
    try {
      if(isNew){ const{id:_,...d}=editing; await addBlogPost(d); showToast('Article ajouté !'); }
      else{ const{id,...d}=editing; await updateBlogPost(id,d); showToast('Article mis à jour !'); }
      setEditing(null); setIsNew(false); reload();
    } catch { showToast('Erreur Firebase','error'); }
    setSaving(false);
  };

  const filtered = posts.filter(p=>p.title.toLowerCase().includes(search.toLowerCase())||p.category.toLowerCase().includes(search.toLowerCase()));

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..."
            className="w-full bg-slate-800/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"/>
        </div>
        <BtnPrimary onClick={openNew}><Plus className="w-4 h-4"/> Nouvel article</BtnPrimary>
      </div>
      <div className="space-y-3">
        {filtered.map(p=>(
          <motion.div key={p.id} layout className={`bg-slate-800/60 rounded-2xl border p-5 transition-all ${p.published?'border-white/5':'border-white/5 opacity-70'}`}>
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-white/10 bg-slate-700">
                <img src={p.coverImage || '/images/blog/blog-default.svg'} alt={p.title}
                  loading="lazy" className="w-full h-full object-cover"
                  onError={(e)=>{e.currentTarget.src='/images/blog/blog-default.svg';}}/>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <h4 className="font-bold text-white text-sm">{p.title}</h4>
                  <Badge color={p.published?'teal':'yellow'}>{p.published?'Publié':'Brouillon'}</Badge>
                  <Badge color="purple">{p.category}</Badge>
                </div>
                <p className="text-xs text-gray-500 line-clamp-1 mb-1">{p.excerpt}</p>
                <div className="flex gap-3 text-xs text-gray-600">
                  <span>📅 {p.date}</span>
                  {p.tags&&<span><Tag className="w-3 h-3 inline mr-1"/>{p.tags.split(',')[0].trim()}</span>}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button onClick={()=>toggle(p)} className={`p-1.5 rounded-lg transition-all ${p.published?'text-teal-400 bg-teal-500/10':'text-yellow-400 bg-yellow-500/10'}`}>
                  {p.published?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}
                </button>
                <button onClick={()=>{setEditing({...p});setIsNew(false);}} className="p-1.5 text-blue-400 bg-blue-500/10 rounded-lg"><Edit3 className="w-4 h-4"/></button>
                <button onClick={()=>del(p.id)} className="p-1.5 text-red-400 bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4"/></button>
              </div>
            </div>
          </motion.div>
        ))}
        {filtered.length===0&&<div className="text-center py-12 text-gray-500"><Newspaper className="w-10 h-10 mx-auto mb-3 opacity-20"/><p>{search?'Aucun article trouvé':'Aucun article — cliquez sur "Nouvel article"'}</p></div>}
      </div>

      <AnimatePresence>
        {editing&&(
          <Modal title={isNew?'Nouvel article':'Modifier l\'article'} onClose={()=>setEditing(null)}>
            <div className="space-y-4">
              <div><label className="block text-sm font-medium text-gray-300 mb-2">Icône couverture</label>
                <div className="flex flex-wrap gap-2">{ICONS_B.map(e=><button key={e} onClick={()=>setEditing(p=>p?{...p,coverEmoji:e}:p)} className={`w-10 h-10 rounded-xl text-xl flex items-center justify-center transition-all ${editing.coverEmoji===e?'bg-teal-500/30 border-2 border-teal-400':'bg-slate-700 border border-white/10 hover:bg-slate-600'}`}>{e}</button>)}</div>
              </div>
              <Field label="Titre *" value={editing.title} onChange={v=>setEditing(p=>p?{...p,title:v}:p)} placeholder="Titre accrocheur..."/>
              <ImagePicker
                label="Image de couverture"
                value={editing.coverImage || ''}
                onChange={v=>setEditing(p=>p?{...p,coverImage:v}:p)}
                options={BLOG_IMG_OPTIONS}
                hint="Choisissez une image ci-dessous ou entrez l'URL d'une image uploadée dans public/images/blog/"
              />
              <div className="grid sm:grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-300 mb-1.5">Catégorie</label>
                  <select value={editing.category} onChange={e=>setEditing(p=>p?{...p,category:e.target.value}:p)}
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50">
                    {BLOG_CATS.map(c=><option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <Field label="Date" value={editing.date} onChange={v=>setEditing(p=>p?{...p,date:v}:p)}/>
              </div>
              <Field label="Extrait" value={editing.excerpt} onChange={v=>setEditing(p=>p?{...p,excerpt:v}:p)} multiline rows={2} placeholder="Résumé affiché dans la liste..."/>
              <Field label="Contenu complet" value={editing.content} onChange={v=>setEditing(p=>p?{...p,content:v}:p)} multiline rows={6} placeholder="Rédigez votre article..."/>
              <Field label="Tags (séparés par virgule)" value={editing.tags} onChange={v=>setEditing(p=>p?{...p,tags:v}:p)} placeholder="IA, mobile, Côte d'Ivoire"/>
              <div className="flex items-center gap-3">
                <button onClick={()=>setEditing(p=>p?{...p,published:!p.published}:p)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-all ${editing.published?'bg-teal-500/20 border-teal-500/40 text-teal-300':'bg-slate-700 border-white/10 text-gray-400'}`}>
                  {editing.published?<><Eye className="w-4 h-4"/>Publié</>:<><EyeOff className="w-4 h-4"/>Brouillon</>}
                </button>
              </div>
              <div className="flex gap-3 pt-2">
                <BtnPrimary onClick={saveEdit} loading={saving}><Save className="w-4 h-4"/>{isNew?'Publier':'Sauvegarder'}</BtnPrimary>
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
   TAB : AVIS CLIENTS — Firebase CRUD
   ============================================================ */
function TabReviews({ reviews, reload, showToast }: { reviews:Review[]; reload:()=>void; showToast:(m:string,t?:'success'|'error')=>void }) {
  const [editing, setEditing] = useState<Review|null>(null);
  const [isNew, setIsNew]     = useState(false);
  const [saving, setSaving]   = useState(false);

  const toggle  = async (r: Review) => { await updateReview(r.id,{visible:!r.visible}); showToast('Visibilité mise à jour'); reload(); };
  const del     = async (id: string) => { if(!confirm('Supprimer cet avis ?'))return; await deleteReview(id); showToast('Avis supprimé'); reload(); };
  const openNew = () => { setEditing({id:'',author:'',role:'',company:'',text:'',stars:5,visible:true,date:new Date().toISOString().split('T')[0]}); setIsNew(true); };
  const saveEdit = async () => {
    if(!editing||!editing.author.trim())return;
    setSaving(true);
    try {
      if(isNew){ const{id:_,...d}=editing; await addReview(d); showToast('Avis ajouté !'); }
      else{ const{id,...d}=editing; await updateReview(id,d); showToast('Avis mis à jour !'); }
      setEditing(null); setIsNew(false); reload();
    } catch { showToast('Erreur Firebase','error'); }
    setSaving(false);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <p className="text-gray-400 text-sm">{reviews.length} avis · {reviews.filter(r=>r.visible).length} visibles</p>
        <BtnPrimary onClick={openNew}><Plus className="w-4 h-4"/> Nouvel avis</BtnPrimary>
      </div>
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {reviews.map(r=>(
          <motion.div key={r.id} layout className={`bg-slate-800/60 rounded-2xl border p-5 flex flex-col transition-all ${r.visible?'border-white/5':'border-white/5 opacity-60'}`}>
            <div className="flex gap-1 mb-3">{[1,2,3,4,5].map(n=><Star key={n} className={`w-4 h-4 ${n<=r.stars?'fill-yellow-400 text-yellow-400':'text-gray-700'}`}/>)}</div>
            <p className="text-gray-300 text-xs italic flex-1 mb-3 line-clamp-4">« {r.text} »</p>
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-white/10">
                <img src={r.avatar||`/images/avis/avatar-${((reviews.indexOf(r))%6)+1}.svg`}
                  alt={r.author} loading="lazy"
                  className="w-full h-full object-cover"
                  onError={(e)=>{e.currentTarget.src='/images/avis/avatar-1.svg';}}/>
              </div>
              <div>
                <p className="font-bold text-white text-sm">{r.author}</p>
                <p className="text-gray-500 text-xs">{r.role}{r.company?` — ${r.company}`:''}</p>
              </div>
            </div>
            <div className="flex gap-2 mt-auto">
              <button onClick={()=>toggle(r)} className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${r.visible?'bg-teal-500/20 text-teal-400':'bg-gray-700/50 text-gray-500'}`}>
                {r.visible?'Visible':'Masqué'}
              </button>
              <button onClick={()=>{setEditing({...r});setIsNew(false);}} className="p-1.5 bg-blue-500/20 text-blue-400 rounded-lg"><Edit3 className="w-3.5 h-3.5"/></button>
              <button onClick={()=>del(r.id)} className="p-1.5 bg-red-500/20 text-red-400 rounded-lg"><Trash2 className="w-3.5 h-3.5"/></button>
            </div>
          </motion.div>
        ))}
        {reviews.length===0&&<div className="sm:col-span-3 text-center py-12 text-gray-500"><Star className="w-10 h-10 mx-auto mb-3 opacity-20"/><p>Aucun avis — cliquez sur "Nouvel avis"</p></div>}
      </div>

      <AnimatePresence>
        {editing&&(
          <Modal title={isNew?'Nouvel avis client':'Modifier l\'avis'} onClose={()=>setEditing(null)}>
            <div className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Nom du client *" value={editing.author} onChange={v=>setEditing(p=>p?{...p,author:v}:p)} placeholder="Ex: Kouamé Assi"/>
                <Field label="Poste / Rôle" value={editing.role} onChange={v=>setEditing(p=>p?{...p,role:v}:p)} placeholder="Ex: CEO"/>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                <Field label="Entreprise" value={editing.company} onChange={v=>setEditing(p=>p?{...p,company:v}:p)} placeholder="Ex: AfroChic CI"/>
                <Field label="Date" value={editing.date} onChange={v=>setEditing(p=>p?{...p,date:v}:p)}/>
              </div>
              <Field label="Témoignage *" value={editing.text} onChange={v=>setEditing(p=>p?{...p,text:v}:p)} multiline rows={4}/>
              <ImagePicker
                label="Photo du client (optionnel)"
                value={editing.avatar || ''}
                onChange={v=>setEditing(p=>p?{...p,avatar:v}:p)}
                options={AVATAR_OPTIONS}
                hint="Choisissez un avatar ou ajoutez la vraie photo du client dans public/images/avis/"
              />
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Note</label>
                <div className="flex gap-2">{[1,2,3,4,5].map(n=>(
                  <button key={n} onClick={()=>setEditing(p=>p?{...p,stars:n}:p)}>
                    <Star className={`w-8 h-8 transition-all ${n<=editing.stars?'fill-yellow-400 text-yellow-400 scale-110':'text-gray-600 hover:text-yellow-300'}`}/>
                  </button>
                ))}</div>
              </div>
              <div className="flex gap-3 pt-2">
                <BtnPrimary onClick={saveEdit} loading={saving}><Save className="w-4 h-4"/>{isNew?'Ajouter':'Sauvegarder'}</BtnPrimary>
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
   TAB : MESSAGES — Firebase
   ============================================================ */
function TabMessages({ messages, reload }: { messages:Message[]; reload:()=>void }) {
  const [selected, setSelected] = useState<Message|null>(null);
  const [search, setSearch]     = useState('');
  const WA = 'https://wa.me/2250586867693';

  const markRead = async (m: Message) => {
    if(m.read) return;
    await updateMessage(m.id,{read:true});
    setSelected({...m,read:true}); reload();
  };

  const markReplied = async (id: string) => {
    await updateMessage(id,{replied:true,read:true}); reload();
  };

  const del = async (id: string) => {
    await deleteMessage(id);
    if(selected?.id===id) setSelected(null);
    reload();
  };

  const filtered = messages.filter(m=>
    m.nom?.toLowerCase().includes(search.toLowerCase())||
    m.message?.toLowerCase().includes(search.toLowerCase())
  );
  const unread = messages.filter(m=>!m.read).length;

  return (
    <div>
      <div className="flex items-center gap-4 mb-5">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"/>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Rechercher..."
            className="w-full bg-slate-800/60 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/50"/>
        </div>
        {unread>0&&<Badge color="blue">{unread} non lu{unread>1?'s':''}</Badge>}
      </div>
      <div className="grid lg:grid-cols-5 gap-4">
        <div className="lg:col-span-2 space-y-2">
          {filtered.map(m=>(
            <button key={m.id} onClick={()=>{setSelected(m);markRead(m);}}
              className={`w-full text-left p-4 rounded-xl border transition-all ${selected?.id===m.id?'bg-teal-500/10 border-teal-500/30':'bg-slate-800/60 border-white/5 hover:border-white/10'}`}>
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-teal-500 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0">{m.nom?.charAt(0)||'?'}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-semibold ${m.read?'text-gray-300':'text-white'}`}>{m.nom}</span>
                    {!m.read&&<div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0"/>}
                  </div>
                  <p className="text-xs text-gray-500 truncate mt-0.5">{m.message}</p>
                  <p className="text-xs text-gray-700 mt-1">{m.date}</p>
                </div>
              </div>
            </button>
          ))}
          {filtered.length===0&&<p className="text-center text-gray-500 text-sm py-8">Aucun message</p>}
        </div>
        <div className="lg:col-span-3">
          {selected?(
            <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="font-bold text-white text-lg">{selected.nom}</h3>
                  <p className="text-sm text-gray-400 flex items-center gap-1.5 mt-1"><Mail className="w-3.5 h-3.5"/>{selected.email}</p>
                </div>
                <button onClick={()=>del(selected.id)} className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all"><Trash2 className="w-4 h-4"/></button>
              </div>
              <div className="flex gap-2 mb-4 flex-wrap">
                {selected.service&&<Badge color="blue">🎯 {selected.service}</Badge>}
                <Badge color={selected.read?'gray':'blue'}>{selected.read?'Lu':'Non lu'}</Badge>
                <Badge color={selected.replied?'green':'yellow'}>{selected.replied?'✓ Répondu':'En attente'}</Badge>
              </div>
              <div className="bg-slate-700/30 rounded-xl p-5 mb-5 border border-white/5">
                <p className="text-gray-200 text-sm leading-relaxed">{selected.message}</p>
              </div>
              <p className="text-xs text-gray-600 mb-5">{selected.date}</p>
              <div className="flex gap-3 flex-wrap">
                <a href={`mailto:${selected.email}?subject=Re: Votre demande — dev.brumerie.com`}
                  onClick={()=>markReplied(selected.id)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl font-semibold text-sm hover:shadow-lg transition-all">
                  <Mail className="w-4 h-4"/> Répondre par email
                </a>
                <a href={`${WA}?text=Bonjour ${selected.nom}, suite à votre message sur dev.brumerie.com...`}
                  target="_blank" rel="noopener noreferrer"
                  onClick={()=>markReplied(selected.id)}
                  className="flex items-center gap-2 px-4 py-2.5 bg-green-600/20 border border-green-500/30 text-green-400 rounded-xl text-sm font-semibold hover:bg-green-600/30 transition-all">
                  💬 WhatsApp
                </a>
              </div>
            </div>
          ):(
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
   TAB : PARAMÈTRES
   ============================================================ */
function TabSettings({ user, onLogout, onInitFirestore, showToast }: {
  user:User|null; onLogout:()=>void; onInitFirestore:()=>Promise<void>; showToast:(m:string,t?:'success'|'error')=>void;
}) {
  const [initing, setIniting]   = useState(false);
  const [notifs, setNotifs]     = useState({email:true,wa:false,weekly:true});
  const toggle = (k: keyof typeof notifs) => setNotifs(p=>({...p,[k]:!p[k]}));

  const handleInit = async () => {
    if(!confirm('Initialiser Firestore avec les données par défaut ? (uniquement si vide)')) return;
    setIniting(true);
    await onInitFirestore();
    setIniting(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6 space-y-4">
        <h3 className="font-bold text-white flex items-center gap-2"><Shield className="w-5 h-5 text-teal-400"/> Compte Firebase</h3>
        <div className="flex items-center gap-4 p-4 bg-slate-700/40 rounded-xl">
          <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-teal-500 rounded-full flex items-center justify-center text-xl font-black flex-shrink-0">S</div>
          <div>
            <p className="font-bold text-white">Doukoua Tché Serge Alain</p>
            <p className="text-gray-400 text-sm">{user?.email||'—'}</p>
            <Badge color="teal">Super Admin · Firebase Auth</Badge>
          </div>
        </div>
        <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0"/>
          <p className="text-xs text-green-300">Authentification Firebase active · Session sécurisée</p>
        </div>
      </div>

      <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6 space-y-4">
        <h3 className="font-bold text-white flex items-center gap-2"><Database className="w-5 h-5 text-teal-400"/> Initialisation Firestore</h3>
        <p className="text-sm text-gray-400">Si Firestore est vide (premier déploiement), cliquez pour peupler avec les données par défaut.</p>
        <BtnPrimary onClick={handleInit} loading={initing}>
          <Database className="w-4 h-4"/> Initialiser Firestore avec les données par défaut
        </BtnPrimary>
      </div>

      <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6 space-y-4">
        <h3 className="font-bold text-white flex items-center gap-2"><Bell className="w-5 h-5 text-teal-400"/> Notifications</h3>
        {([
          {k:'email', label:'Email à chaque nouveau message',    icon:Mail },
          {k:'wa',    label:'Alerte WhatsApp (nouveau contact)',  icon:MessageSquare },
          {k:'weekly',label:'Rapport hebdomadaire par email',     icon:BarChart3 },
        ] as {k:keyof typeof notifs; label:string; icon:React.ElementType}[]).map(({k,label,icon:Icon})=>(
          <div key={k} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3"><Icon className="w-4 h-4 text-gray-400"/><span className="text-sm text-gray-300">{label}</span></div>
            <button onClick={()=>toggle(k)} className={`w-12 h-6 rounded-full transition-all relative ${notifs[k]?'bg-teal-500':'bg-slate-600'}`}>
              <motion.div animate={{x:notifs[k]?24:2}} className="absolute top-1 w-4 h-4 bg-white rounded-full shadow"/>
            </button>
          </div>
        ))}
      </div>

      <div className="bg-slate-800/60 rounded-2xl border border-white/5 p-6 space-y-3">
        <h3 className="font-bold text-white flex items-center gap-2"><Link className="w-5 h-5 text-teal-400"/> Infos déploiement</h3>
        {[
          {label:'URL du site',   value:'https://dev.brumerie.com'},
          {label:'Dashboard',     value:'https://dev.brumerie.com/admin'},
          {label:'Hébergement',   value:'Vercel'},
          {label:'Base de données', value:'Firebase Firestore'},
          {label:'Auth',          value:'Firebase Authentication'},
          {label:'Dashboard v',   value:'v4.0.0 — Firebase connected'},
        ].map(info=>(
          <div key={info.label} className="bg-slate-700/40 rounded-xl p-3 flex items-center justify-between gap-2">
            <p className="text-gray-500 text-xs flex-shrink-0">{info.label}</p>
            <p className="text-gray-200 font-mono text-xs truncate text-right">{info.value}</p>
          </div>
        ))}
      </div>

      <motion.button onClick={onLogout}
        className="flex items-center gap-2 px-5 py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 rounded-xl font-semibold text-sm hover:bg-red-500/30 transition-all"
        whileHover={{scale:1.02}} whileTap={{scale:0.97}}>
        <LogOut className="w-4 h-4"/> Se déconnecter de Firebase
      </motion.button>
    </div>
  );
}

/* ============================================================
   DASHBOARD PRINCIPAL — orchestration Firebase
   ============================================================ */
export default function AdminDashboard() {
  const [user, setUser]           = useState<User|null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [tab, setTab]             = useState('overview');
  const [sideOpen, setSideOpen]   = useState(true);
  const [toast, setToast]         = useState<{msg:string;type:'success'|'error'}|null>(null);

  // Données Firestore
  const [content,  setContent]  = useState<SiteContent>(DEFAULT_CONTENT);
  const [services, setServices] = useState<Service[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [blog,     setBlog]     = useState<BlogPost[]>([]);
  const [reviews,  setReviews]  = useState<Review[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  const showToast = useCallback((msg:string, type:'success'|'error'='success') => {
    setToast({msg,type});
    setTimeout(()=>setToast(null), 3500);
  }, []);

  // Observer Firebase Auth
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  // Charger les données dès connexion
  const loadAllData = useCallback(async () => {
    setDataLoading(true);
    try {
      const [c, s, p, b, r, m] = await Promise.all([
        getContent(), getServices(), getProjects(),
        getBlogPosts(), getReviews(), getMessages(),
      ]);
      if(c) setContent(c);
      setServices(s); setProjects(p); setBlog(b);
      setReviews(r);  setMessages(m);
    } catch { showToast('Erreur chargement Firestore', 'error'); }
    setDataLoading(false);
  }, [showToast]);

  useEffect(() => { if(user) loadAllData(); }, [user, loadAllData]);

  const handleSaveContent = async (c: SiteContent) => {
    await saveContent(c); setContent(c);
    showToast('Contenu sauvegardé dans Firestore !');
  };

  const handleInitFirestore = async () => {
    const result = await initFirestoreIfEmpty({
      content: DEFAULT_CONTENT,
      services: DEFAULT_SERVICES,
      projects: DEFAULT_PROJECTS,
      blog: [],
      reviews: DEFAULT_REVIEWS,
    });
    showToast(result.message, result.initialized ? 'success' : 'error');
    if(result.initialized) loadAllData();
  };

  const handleLogout = async () => { await signOut(auth); };

  // États de chargement
  if(authLoading) return <LoadingScreen message="Vérification Firebase Auth..."/>;
  if(!user) return <LoginScreen/>;
  if(dataLoading) return <LoadingScreen message="Chargement des données Firestore..."/>;

  const tabs = [
    {id:'overview',  label:"Vue d'ensemble", icon:LayoutDashboard, badge:0},
    {id:'content',   label:'Contenu & Photo', icon:FileText,        badge:0},
    {id:'services',  label:'Services',        icon:Wrench,          badge:0},
    {id:'portfolio', label:'Portfolio',       icon:Briefcase,       badge:0},
    {id:'blog',      label:'Blog',            icon:Newspaper,       badge:0},
    {id:'reviews',   label:'Avis Clients',    icon:Star,            badge:0},
    {id:'messages',  label:'Messages',        icon:MessageSquare,   badge:messages.filter(m=>!m.read).length},
    {id:'analytics', label:'Analytique',      icon:BarChart3,       badge:0},
    {id:'settings',  label:'Paramètres',      icon:Settings,        badge:0},
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white flex" style={{ fontFamily:'Inter, sans-serif' }}>
      {/* SIDEBAR */}
      <motion.aside animate={{ width:sideOpen?256:68 }} transition={{ duration:0.3, ease:'easeInOut' }}
        className="flex-shrink-0 bg-slate-900/90 backdrop-blur-xl border-r border-white/5 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-600 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg shadow-teal-500/20">
            <Shield className="w-5 h-5"/>
          </div>
          {sideOpen&&<motion.div initial={{opacity:0}} animate={{opacity:1}}>
            <p className="font-black text-white text-sm leading-none" style={{fontFamily:'Space Grotesk, sans-serif'}}>Tché.dev</p>
            <p className="text-xs text-gray-600 mt-0.5 flex items-center gap-1"><div className="w-1.5 h-1.5 bg-green-400 rounded-full"/>Firebase</p>
          </motion.div>}
        </div>

        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          {tabs.map(t=>{
            const active = tab===t.id;
            return (
              <button key={t.id} onClick={()=>setTab(t.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all relative
                  ${active?'bg-gradient-to-r from-blue-600/20 to-teal-600/20 text-white border border-teal-500/20':'text-gray-500 hover:text-gray-200 hover:bg-white/5'}`}>
                <t.icon className={`w-4 h-4 flex-shrink-0 ${active?'text-teal-400':''}`}/>
                {sideOpen&&<span className="text-sm font-medium flex-1 text-left truncate">{t.label}</span>}
                {t.badge>0&&<span className="w-5 h-5 bg-blue-500 rounded-full text-xs font-bold flex items-center justify-center flex-shrink-0">{t.badge}</span>}
                {active&&<div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-teal-400 rounded-r"/>}
              </button>
            );
          })}
        </nav>

        <div className="p-2 border-t border-white/5">
          <button onClick={()=>setSideOpen(!sideOpen)}
            className="w-full flex items-center gap-3 px-3 py-2 text-gray-600 hover:text-gray-300 hover:bg-white/5 rounded-xl transition-all">
            <ChevronRight className={`w-4 h-4 transition-transform flex-shrink-0 ${sideOpen?'rotate-180':''}`}/>
            {sideOpen&&<span className="text-xs">Réduire</span>}
          </button>
          {sideOpen&&<div className="px-3 py-2 mt-1">
            <p className="text-xs font-semibold text-white truncate">Serge Alain</p>
            <p className="text-xs text-gray-600 truncate">{user.email}</p>
          </div>}
        </div>
      </motion.aside>

      {/* CONTENU */}
      <div className="flex-1 flex flex-col min-w-0">
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
            <button onClick={loadAllData} className="p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all" title="Actualiser depuis Firestore">
              <RefreshCw className="w-4 h-4"/>
            </button>
            <a href="/" target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-xs text-gray-300 hover:text-white hover:bg-white/10 transition-all">
              <Eye className="w-3.5 h-3.5"/> Voir le site
            </a>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div key={tab} initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0,y:-8}} transition={{duration:0.2}}>
              {tab==='overview'  && <TabOverview services={services} projects={projects} blog={blog} reviews={reviews} messages={messages}/>}
              {tab==='content'   && <TabContent content={content} onSave={handleSaveContent}/>}
              {tab==='services'  && <TabServices services={services} reload={loadAllData} showToast={showToast}/>}
              {tab==='portfolio' && <TabPortfolio projects={projects} reload={loadAllData} showToast={showToast}/>}
              {tab==='blog'      && <TabBlog posts={blog} reload={loadAllData} showToast={showToast}/>}
              {tab==='reviews'   && <TabReviews reviews={reviews} reload={loadAllData} showToast={showToast}/>}
              {tab==='messages'  && <TabMessages messages={messages} reload={loadAllData}/>}
              {tab==='analytics' && (
                <div className="text-center py-20 text-gray-500">
                  <BarChart3 className="w-12 h-12 mx-auto mb-4 opacity-20"/>
                  <p className="font-semibold text-white mb-2">Analytics — Bientôt disponible</p>
                  <p className="text-sm">Connectez Vercel Analytics dans les paramètres de votre projet Vercel pour des stats temps réel gratuites.</p>
                  <a href="https://vercel.com/analytics" target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-teal-500 rounded-xl text-sm font-semibold">
                    <Link className="w-4 h-4"/> Activer Vercel Analytics
                  </a>
                </div>
              )}
              {tab==='settings'  && <TabSettings user={user} onLogout={handleLogout} onInitFirestore={handleInitFirestore} showToast={showToast}/>}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      <AnimatePresence>
        {toast&&<Toast msg={toast.msg} type={toast.type} onClose={()=>setToast(null)}/>}
      </AnimatePresence>
    </div>
  );
}
