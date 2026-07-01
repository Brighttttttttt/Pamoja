# Pamoja

SaaS de suivi course à pied reliant coachs et athlètes.

- **Coach** : suit les données de ses athlètes (importées depuis Strava) et planifie leurs séances dans un calendrier.
- **Athlète** : vue simple et minimaliste de ses séances, cartes exportables pour les réseaux sociaux, calendrier avec son objectif final toujours mis en avant.
- Un athlète a un seul coach actif à la fois, modifiable à tout moment.

## Documentation

- [recherche.md](./recherche.md) — recherche initiale (choix de Strava comme source de données)
- [plan-mvp-1.md](./plan-mvp-1.md) — scope et phasage du MVP1
- [architecture.md](./architecture.md) — stack technique, modèle de données, routes API
- [design.md](./design.md) — écrans, composants, direction visuelle
- [CLAUDE.md](./CLAUDE.md) — contexte projet pour les sessions de développement assisté
- [gitworkflow.md](./gitworkflow.md) — workflow git, branches, CI/CD

## Stack

Next.js (TypeScript) · PostgreSQL + Prisma · Auth.js · Strava API · Tailwind CSS · Vercel

## Démarrage

```
npm install                # génère aussi le client Prisma (postinstall)
cp .env.example .env       # renseigner DATABASE_URL, NEXTAUTH_SECRET, STRAVA_CLIENT_ID, STRAVA_CLIENT_SECRET, STRAVA_WEBHOOK_VERIFY_TOKEN
npx prisma migrate dev     # nécessite une DATABASE_URL PostgreSQL valide
npm run dev
```

## Statut

Phase 0 (setup) scaffoldée : Next.js (App Router, TypeScript, Tailwind), Prisma (schéma initial), Auth.js (Credentials : inscription/connexion par rôle). Voir `plan-mvp-1.md` pour l'avancement des phases suivantes.
