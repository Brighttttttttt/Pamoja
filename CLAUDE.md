# CLAUDE.md — Contexte projet Pamoja

Ce fichier oriente toute session Claude Code travaillant sur ce repo.

## Le projet

Pamoja est un SaaS de suivi course à pied reliant coachs et athlètes. Un coach suit et planifie les séances de ses athlètes ; un athlète a une vue simple/minimaliste de ses données avec son objectif final mis en avant. Un athlète a un seul coach actif à la fois (modifiable). Données de séances importées depuis Strava.

Docs de référence à lire avant toute implémentation :
- [recherche.md](./recherche.md) — recherche initiale, choix Strava vs Garmin/Coros
- [plan-mvp-1.md](./plan-mvp-1.md) — scope fonctionnel et priorisation du MVP1
- [architecture.md](./architecture.md) — stack, modèle de données, routes API, flux Strava
- [design.md](./design.md) — écrans, composants, direction visuelle

## Stack

- Next.js (App Router, TypeScript)
- PostgreSQL + Prisma
- Auth.js pour l'auth compte, OAuth Strava séparé pour l'import de données
- Tailwind CSS
- Déploiement Vercel

## Conventions

- TypeScript strict, pas de `any` sauf nécessité justifiée.
- Un seul repo (frontend + API routes), pas de séparation microservices au MVP.
- Toute nouvelle route API suit la liste définie dans `architecture.md` (section 5) ; si un besoin nouveau apparaît, mettre à jour `architecture.md` en même temps que le code.
- Le modèle de données suit `architecture.md` (section 3) ; toute migration Prisma doit rester cohérente avec ce schéma ou le mettre à jour explicitement.
- Tokens Strava toujours chiffrés au repos, jamais loggués.
- Respecter la distinction vue coach (dense) / vue athlète (minimaliste) définie dans `design.md`.

## Ce qui est hors scope MVP1 (ne pas implémenter sans validation)

Garmin/Coros, paiement, analyse avancée (TSS/CTL/ATL), messagerie intégrée, templates de plans, multi-sports, app mobile native. Voir `plan-mvp-1.md` section 5.

## Commandes (à compléter au scaffold initial)

```
npm run dev       # lancer en local
npm run build     # build production
npm run lint      # lint
npx prisma migrate dev   # migrations DB en local
```

## Variables d'environnement attendues

`DATABASE_URL`, `NEXTAUTH_SECRET`, `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_WEBHOOK_VERIFY_TOKEN`.
