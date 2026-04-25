# Brumerie — Site Vitrine Professionnel

> Site vitrine de Doukoua Tché Serge Alain, PDG de Brumerie.
> Stack : React 18 + TypeScript + Vite + Tailwind CSS + Framer Motion

## Checklist accomplie

- Navigation fluide avec scroll doux (offset nav 80px)
- Menu hamburger fonctionnel + fermeture auto au resize
- Formulaire de contact valide (nom, email regex, message min 20 chars)
- Bouton WhatsApp flottant : +225 05 86 86 76 93
- Images lazy-loading (loading="lazy" decoding="async")
- Responsive mobile 375px -> desktop 1440px
- Aucun warning console (particles fixes, sans window cote SSR)
- Build Vercel sans erreur (vercel.json inclus)
- Balises meta SEO completes (OG, Twitter Card, Schema.org JSON-LD)
- Animations Framer Motion au scroll (whileInView, once: true)

## Demarrage rapide

```bash
npm install
npm run dev
npm run build
npm run preview
```

## Deploiement Vercel

Connectez votre repo GitHub sur vercel.com — le vercel.json est pret.

## Personnalisation

### Numero WhatsApp
Dans src/app/App.tsx, ligne 22 :
```ts
const WA_NUMBER = '2250586867693';
```

### Formulaire de contact
Remplacer le setTimeout dans ContactForm.handleSubmit :
```ts
await fetch('https://formspree.io/f/VOTRE_ID', {
  method: 'POST',
  body: JSON.stringify(form),
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
});
```

### Images portfolio
Ajouter dans public/images/ :
- portfolio-1.webp (AfroChic CI)
- portfolio-2.webp (ImmoCocody)
- portfolio-3.webp (GestPaie CI)
- portfolio-4.webp (Formation Banque)

## Structure

```
brumerie-vitrine/
├── public/favicon.svg
├── src/
│   ├── app/App.tsx       <- Composant principal
│   ├── styles/index.css  <- Tailwind + globaux
│   └── main.tsx
├── index.html            <- SEO complet
├── vite.config.ts
├── tailwind.config.js
├── vercel.json
└── package.json
```

Concu avec coeur a Abidjan, Cote d'Ivoire — 2026 Brumerie
