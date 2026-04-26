# Règles Firestore — dev.brumerie.com

Copiez ces règles dans :
Firebase Console → Firestore → Rules → Publish

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Lecture publique (site vitrine) — écriture admin seulement
    match /siteContent/{doc} { allow read: if true; allow write: if request.auth != null; }
    match /services/{doc}    { allow read: if true; allow write: if request.auth != null; }
    match /projects/{doc}    { allow read: if true; allow write: if request.auth != null; }
    match /blog/{doc}        { allow read: if true; allow write: if request.auth != null; }
    match /reviews/{doc}     { allow read: if true; allow write: if request.auth != null; }

    // Messages : création publique (formulaire), lecture/modif/suppression admin
    match /messages/{doc} {
      allow create: if true;
      allow read, update, delete: if request.auth != null;
    }
  }
}
```
