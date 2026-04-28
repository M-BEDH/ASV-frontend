# ASV — Application web/mobile (Expo / React Native)

Application de suivi vétérinaire multi-établissements, développée avec **Expo Router / React Native Web**.  
Fonctionne sur **web**, **Android** et **iOS** depuis une base de code unique.

Repo principal (infra Docker) : [ASV](https://github.com/M-BEDH/ASV)  
Repo API : [ASV-backend](https://github.com/M-BEDH/ASV-backend)

---

## Prérequis

- Node.js 20+
- npm
- Expo CLI (`npm install -g expo-cli`)
- Pour Android : Android Studio + émulateur ou appareil physique
- Pour iOS : Xcode (Mac uniquement)

---

## Installation

```bash
npm install
```

Variable d'environnement optionnelle (sinon les valeurs par défaut s'appliquent) :

```bash
# .env.local
EXPO_PUBLIC_API_URL=http://localhost:8080
```

Par défaut l'app pointe sur `http://localhost:8080` (web/iOS) ou `http://10.0.2.2:8080` (Android émulateur).

---

## Lancer en développement

```bash
npm start          # menu Expo interactif
npm run web        # navigateur uniquement
npm run android    # émulateur Android
npm run ios        # simulateur iOS
```

Le backend doit tourner (voir `docker-compose.yml` du repo principal, API sur http://localhost:8080).

---

## Structure

```
mobile-web/
├── app/
│   ├── _layout.tsx              # layout racine (AuthContext, ThemeContext, ToastContext)
│   ├── index.tsx                # point d'entrée / redirection
│   ├── (auth)/
│   │   ├── login.tsx            # écran de connexion
│   │   └── register.tsx         # écran d'inscription / activation de pré-compte
│   └── (tabs)/
│       ├── _layout.tsx          # navigation par onglets
│       ├── index.tsx            # tableau de bord
│       ├── animaux.tsx          # liste et gestion des animaux
│       ├── consultations.tsx    # consultations médicales
│       ├── proprietaires.tsx    # gestion des propriétaires
│       ├── equipe.tsx           # gestion du staff (admin+)
│       └── mentionLegales.tsx
├── components/                  # composants réutilisables
│   ├── AppHeader.tsx
│   ├── AnimalDetailModal.tsx
│   ├── ConsultationFormModal.tsx
│   ├── FormModal.tsx / ConfirmModal.tsx
│   ├── SearchBar.tsx / Dropdown.tsx
│   ├── PasswordInput.tsx / FieldLabel.tsx
│   └── themed-text.tsx / themed-view.tsx
├── context/
│   ├── AuthContext.tsx          # état d'authentification + JWT
│   ├── ThemeContext.tsx         # thème clair/sombre
│   └── ToastContext.tsx         # notifications toast
├── services/
│   └── api.ts                   # client HTTP (fetch + gestion JWT)
├── hooks/
│   ├── useCrud.ts               # hook générique CRUD
│   ├── use-breakpoint.ts        # responsive web
│   └── use-theme-color.ts
├── types/
│   └── index.ts                 # types TypeScript partagés
├── styles/                      # styles globaux
├── utils/                       # fonctions utilitaires
└── assets/                      # images, icônes, polices
```

---

## Authentification

JWT géré via `services/api.ts` :
- **Mobile** : token stocké dans `expo-secure-store`
- **Web** : token stocké dans `AsyncStorage`
- Cache mémoire pour éviter des accès disque à chaque requête

---

## Rôles et accès

L'interface s'adapte au rôle de l'utilisateur connecté (fourni par le JWT) :

| Rôle | Accès |
|---|---|
| `super_admin` | Toutes les cliniques, tous les utilisateurs |
| `admin` | Gestion complète de sa clinique |
| `veterinaire` | Animaux et consultations de sa clinique |
| `benevole` | Lecture/écriture dans refuges et associations |
| `client` | Ses propres animaux et leur historique médical |

---

## Tests

```bash
npm test
```

Les tests se trouvent dans `components/` (ex: `FieldLabel.test.tsx`).

---

## Lint

```bash
npm run lint
```

---

## Build web (statique)

```bash
npx expo export --platform web   # génère le dossier dist/
```

---

## CI

Le pipeline GitHub Actions de **ce repo** s'exécute à chaque push sur `master` :

1. Vérification TypeScript (`tsc --noEmit`)
2. Build web statique (`expo export --platform web`)
