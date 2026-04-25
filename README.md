# Brumerie — Site Vitrine + Dashboard Admin

> Stack : React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion + Firebase

## Nouveautés v2.0

- Photo PDG carrée avec cadre degradé bleu/teal dans le Hero
- Dashboard Admin complet sur /admin
- Authentification Firebase sécurisée
- 7 onglets : Vue d'ensemble, Contenu, Portfolio, Messages, Témoignages, Analytique, Paramètres

## Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Configurer l'environnement
cp .env.example .env.local
# Editer .env.local avec vos vraies valeurs Firebase

# 3. Lancer en dev
npm run dev

# 4. Build production
npm run build
```

## Accès Dashboard Admin

URL : https://www.brumerie.com/admin
Email (par défaut pour les tests) : admin@brumerie.ci
Mot de passe (par défaut pour les tests) : Brumerie2026!

IMPORTANT : En production, activer Firebase Auth et supprimer
la simulation dans AdminDashboard.tsx handleLogin().

## Votre photo PDG

1. Nommer votre photo : pdg-photo.webp
2. La placer dans : public/images/pdg-photo.webp
3. Format recommandé : carré, minimum 600x600px, format WebP

## Configuration Firebase (production)

1. Créer un projet sur console.firebase.google.com
2. Activer Authentication (Email/Password)
3. Créer le compte admin dans Firebase Console → Authentication → Users
4. Copier les valeurs dans .env.local
5. Dans AdminDashboard.tsx, remplacer la simulation par :
   import { signInWithEmailAndPassword } from 'firebase/auth';
   import { auth } from './firebase';
   await signInWithEmailAndPassword(auth, email, password);

## Structure du projet

```
brumerie-vitrine/
├── public/
│   ├── favicon.svg
│   └── images/
│       └── pdg-photo.webp    <- VOTRE PHOTO ICI
├── src/
│   ├── app/
│   │   └── App.tsx           <- Site principal
│   ├── admin/
│   │   ├── AdminDashboard.tsx <- Dashboard complet
│   │   ├── firebase.ts        <- Config Firebase
│   │   └── main-admin.tsx     <- Entrée admin
│   ├── styles/
│   │   └── index.css
│   └── main.tsx
├── index.html                 <- Site principal (SEO complet)
├── admin.html                 <- Dashboard admin (noindex)
├── vite.config.ts             <- Multi-page build
├── vercel.json                <- Routes /admin + sécurité
├── .env.example               <- Template variables
└── package.json
```

## Déploiement Vercel

```bash
vercel --prod
```

Ou connecter le repo GitHub sur vercel.com.
Ajouter les variables d'environnement dans :
Vercel → Project → Settings → Environment Variables

Conçu avec coeur à Abidjan, Côte d'Ivoire — 2026 Brumerie
