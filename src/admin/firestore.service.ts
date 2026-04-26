/**
 * firestore.service.ts
 * Toutes les opérations Firestore pour dev.brumerie.com
 *
 * Collections :
 *  - siteContent   (document unique "main")
 *  - services      (liste)
 *  - projects      (liste)
 *  - blog          (liste)
 *  - reviews       (liste)
 *  - messages      (liste — créés par le formulaire public)
 */

import {
  collection, doc, getDoc, getDocs, setDoc,
  addDoc, updateDoc, deleteDoc, query,
  orderBy, serverTimestamp, type DocumentData,
} from 'firebase/firestore';
import { db } from './firebase';

/* ─── Helpers ─────────────────────────────────────────── */

/** Convertit un doc Firestore en objet typé avec son id */
function withId<T>(snap: DocumentData): T {
  return { id: snap.id, ...snap.data() } as T;
}

/* ============================================================
   CONTENU DU SITE (document unique)
   ============================================================ */
export interface SiteContent {
  heroTitle:    string;
  heroBio:      string;
  aboutText1:   string;
  aboutText2:   string;
  whatsapp:     string;
  email:        string;
  photoUrl:     string;
  disponibilite:string;
  slogan:       string;
}

const CONTENT_REF = doc(db, 'siteContent', 'main');

export async function getContent(): Promise<SiteContent | null> {
  const snap = await getDoc(CONTENT_REF);
  return snap.exists() ? (snap.data() as SiteContent) : null;
}

export async function saveContent(data: SiteContent): Promise<void> {
  await setDoc(CONTENT_REF, data, { merge: true });
}

/* ============================================================
   SERVICES
   ============================================================ */
export interface Service {
  id:       string;
  icon:     string;
  title:    string;
  desc:     string;
  gradient: string;
  visible:  boolean;
  order:    number;
}

export async function getServices(): Promise<Service[]> {
  const q    = query(collection(db, 'services'), orderBy('order'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => withId<Service>(d));
}

export async function addService(data: Omit<Service, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'services'), data);
  return ref.id;
}

export async function updateService(id: string, data: Partial<Service>): Promise<void> {
  await updateDoc(doc(db, 'services', id), data);
}

export async function deleteService(id: string): Promise<void> {
  await deleteDoc(doc(db, 'services', id));
}

/* ============================================================
   PORTFOLIO (projets)
   ============================================================ */
export interface Project {
  id:       string;
  category: string;
  title:    string;
  desc:     string;
  result:   string;
  tech:     string;
  gradient: string;
  visible:  boolean;
  order:    number;
  link?:    string;
}

export async function getProjects(): Promise<Project[]> {
  const q    = query(collection(db, 'projects'), orderBy('order'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => withId<Project>(d));
}

export async function addProject(data: Omit<Project, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'projects'), data);
  return ref.id;
}

export async function updateProject(id: string, data: Partial<Project>): Promise<void> {
  await updateDoc(doc(db, 'projects', id), data);
}

export async function deleteProject(id: string): Promise<void> {
  await deleteDoc(doc(db, 'projects', id));
}

/* ============================================================
   BLOG
   ============================================================ */
export interface BlogPost {
  id:          string;
  title:       string;
  excerpt:     string;
  content:     string;
  category:    string;
  tags:        string;
  date:        string;
  published:   boolean;
  coverEmoji:  string;
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const q    = query(collection(db, 'blog'), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => withId<BlogPost>(d));
}

export async function addBlogPost(data: Omit<BlogPost, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'blog'), data);
  return ref.id;
}

export async function updateBlogPost(id: string, data: Partial<BlogPost>): Promise<void> {
  await updateDoc(doc(db, 'blog', id), data);
}

export async function deleteBlogPost(id: string): Promise<void> {
  await deleteDoc(doc(db, 'blog', id));
}

/* ============================================================
   AVIS CLIENTS
   ============================================================ */
export interface Review {
  id:      string;
  author:  string;
  role:    string;
  company: string;
  text:    string;
  stars:   number;
  visible: boolean;
  date:    string;
}

export async function getReviews(): Promise<Review[]> {
  const q    = query(collection(db, 'reviews'), orderBy('date', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => withId<Review>(d));
}

export async function addReview(data: Omit<Review, 'id'>): Promise<string> {
  const ref = await addDoc(collection(db, 'reviews'), data);
  return ref.id;
}

export async function updateReview(id: string, data: Partial<Review>): Promise<void> {
  await updateDoc(doc(db, 'reviews', id), data);
}

export async function deleteReview(id: string): Promise<void> {
  await deleteDoc(doc(db, 'reviews', id));
}

/* ============================================================
   MESSAGES (formulaire contact)
   ============================================================ */
export interface Message {
  id:       string;
  nom:      string;
  email:    string;
  service:  string;
  message:  string;
  date:     string;
  read:     boolean;
  replied:  boolean;
  createdAt?: unknown;
}

export async function getMessages(): Promise<Message[]> {
  const q    = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
  const snap = await getDocs(q);
  return snap.docs.map((d) => withId<Message>(d));
}

/** Appelé par le formulaire public du site vitrine */
export async function sendMessage(data: Omit<Message, 'id' | 'read' | 'replied' | 'createdAt'>): Promise<void> {
  await addDoc(collection(db, 'messages'), {
    ...data,
    read:      false,
    replied:   false,
    createdAt: serverTimestamp(),
  });
}

export async function updateMessage(id: string, data: Partial<Message>): Promise<void> {
  await updateDoc(doc(db, 'messages', id), data);
}

export async function deleteMessage(id: string): Promise<void> {
  await deleteDoc(doc(db, 'messages', id));
}

/* ============================================================
   INITIALISATION — peupler Firestore si vide
   Appeler une seule fois depuis le Dashboard Admin
   ============================================================ */
export async function initFirestoreIfEmpty(defaultData: {
  content:  SiteContent;
  services: Omit<Service, 'id'>[];
  projects: Omit<Project, 'id'>[];
  blog:     Omit<BlogPost, 'id'>[];
  reviews:  Omit<Review, 'id'>[];
}): Promise<{ initialized: boolean; message: string }> {
  // Vérifier si Firestore est déjà peuplé
  const contentSnap = await getDoc(CONTENT_REF);
  if (contentSnap.exists()) {
    return { initialized: false, message: 'Firestore déjà initialisé — aucune action.' };
  }

  // Peupler en parallèle
  await Promise.all([
    setDoc(CONTENT_REF, defaultData.content),
    ...defaultData.services.map((s) => addDoc(collection(db, 'services'), s)),
    ...defaultData.projects.map((p) => addDoc(collection(db, 'projects'), p)),
    ...defaultData.blog.map((b)     => addDoc(collection(db, 'blog'),     b)),
    ...defaultData.reviews.map((r)  => addDoc(collection(db, 'reviews'),  r)),
  ]);

  return { initialized: true, message: '✅ Firestore initialisé avec succès !' };
}
