# Pamoja — Architecture

Référence technique du MVP1. Voir aussi [plan-mvp-1.md](./plan-mvp-1.md) pour le scope fonctionnel et [design.md](./design.md) pour les écrans.

## 1. Stack

- **Framework** : Next.js (App Router, TypeScript) — un seul repo pour le frontend et les routes API
- **Base de données** : PostgreSQL managé (Supabase ou Neon)
- **ORM** : Prisma
- **Auth** : Auth.js (NextAuth) pour la connexion compte (email/magic link) — distincte de l'OAuth Strava qui sert à l'import de données
- **Intégration données** : Strava API v3 (OAuth 2.0 + webhooks)
- **Style/UI** : Tailwind CSS
- **Génération image partageable** : rendu côté serveur (ex. `@vercel/og` ou équivalent) pour exporter les cartes de séance en image
- **Hébergement** : Vercel (app + routes API) + DB managée séparée

Choix guidé par la simplicité : un seul repo, un seul langage (TypeScript), pas de service supplémentaire à opérer pour le MVP.

## 2. Modèle de relation coach-athlète

Décision : **un athlète a un seul coach actif à la fois**, modifiable à tout moment (changement de coach = mise à jour du lien, pas de suppression d'historique des séances déjà planifiées/importées).

Ce choix simplifie le modèle par rapport à une relation many-to-many : pas de table de liaison, un simple champ `coachId` nullable sur le profil athlète.

## 3. Modèle de données (Prisma, simplifié)

```
User
- id
- email
- name
- passwordHash (ou compte via magic link)
- role: "coach" | "athlete"   // un compte a un rôle principal pour le MVP
- createdAt

AthleteProfile
- id
- userId          -> User (role = athlete)
- coachId          -> User (role = coach), nullable
- goalName         // ex: "Marathon de Paris"
- goalDate         // date de la course cible
- goalDistanceKm
- goalTargetTime    // optionnel, format HH:MM:SS
- stravaAthleteId
- stravaAccessToken   // chiffré
- stravaRefreshToken  // chiffré
- stravaTokenExpiresAt

CoachInvite
- id
- coachId          -> User
- athleteEmail
- status: "pending" | "accepted" | "expired"
- token
- createdAt

Activity
- id
- athleteProfileId -> AthleteProfile
- source: "strava"
- externalId        // id activité Strava
- startDate
- distanceMeters
- movingTimeSeconds
- avgPaceSecPerKm    // dérivé
- avgHeartRate       // nullable
- elevationGainM
- activityType        // "Run", "TrailRun", etc. (filtré à la course à pied)
- raw                 // JSON brut Strava utile pour évolutions futures

PlannedSession
- id
- athleteProfileId -> AthleteProfile
- createdByCoachId -> User
- date
- type              // ex: "Endurance fondamentale", "Fractionné", "Sortie longue"
- description
- status: "planned" | "done" | "missed"
- linkedActivityId -> Activity, nullable   // rapproché automatiquement ou manuellement
```

## 4. Flux Strava

### Connexion (côté athlète)
1. L'athlète clique "Connecter Strava" → redirection OAuth Strava (`scope=activity:read_all`).
2. Callback : on récupère `access_token` / `refresh_token`, on les stocke chiffrés sur `AthleteProfile`.
3. Import initial : appel `GET /athlete/activities` pour récupérer les N dernières activités de type course.
4. Abonnement au webhook Strava (si pas déjà fait au niveau appli — un seul push subscription par appli, pas par athlète).

### Synchronisation continue
1. Strava envoie un event webhook (`activity` create/update/delete) à notre callback.
2. On identifie l'athlète via `owner_id` (= `stravaAthleteId`).
3. On récupère le détail de l'activité via l'API et on upsert dans `Activity`.
4. Si l'event est une révocation d'accès (`aspect_type=update`, `updates.authorized=false`), on vide les tokens Strava du profil et on notifie l'athlète qu'il doit se reconnecter.

### Refresh token
- Job (ou vérification à la volée) pour rafraîchir `access_token` avant expiration via `refresh_token`.

## 5. Routes API (Next.js route handlers)

```
POST   /api/auth/...              (Auth.js)
GET    /api/strava/connect        -> redirige vers OAuth Strava
GET    /api/strava/callback       -> échange code, stocke tokens, lance import initial
POST   /api/strava/webhook        -> callback webhook Strava (vérif token + traitement events)

GET    /api/coach/athletes        -> liste des athlètes du coach connecté
POST   /api/coach/invites         -> créer une invitation (email athlète)
POST   /api/invites/:token/accept -> athlète accepte une invitation, coachId mis à jour
POST   /api/athletes/:id/coach    -> changer/retirer le coach d'un athlète

GET    /api/athletes/:id/activities
GET    /api/athletes/:id/sessions        (calendrier)
POST   /api/athletes/:id/sessions        (coach crée une séance planifiée)
PATCH  /api/sessions/:id                 (modifier statut, rapprocher une activité)

GET    /api/athletes/:id/share-card/:activityId  -> génère l'image partageable
```

## 6. Structure de dossiers (proposition)

```
/app
  /(auth)/login, /(auth)/register
  /coach/dashboard
  /coach/athletes/[id]
  /coach/athletes/[id]/calendar
  /athlete/dashboard
  /athlete/calendar
  /athlete/activities/[id]/share
  /api/... (route handlers ci-dessus)
/components
  /calendar
  /activity-card
  /share-card
  /goal-banner
/lib
  /strava (client API, webhook handling)
  /auth
  /db (client Prisma)
/prisma
  schema.prisma
```

## 7. Sécurité / points d'attention techniques

- Tokens Strava chiffrés au repos (pas de stockage en clair même en DB managée).
- Vérification de la signature/`verify_token` sur le webhook Strava.
- Un athlète change de coach → l'ancien coach perd l'accès à ses données futures mais garde l'historique des séances déjà créées par lui (traçabilité via `createdByCoachId`), sauf décision contraire.
- Rate limit Strava (200 req/15 min, 2000/jour par appli par défaut) : le webhook évite le polling, donc la consommation reste faible ; à surveiller si >10 athlètes actifs (palier self-service).

## 8. Déploiement

- Preview automatique par PR (Vercel).
- Variables d'env : `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_WEBHOOK_VERIFY_TOKEN`, `DATABASE_URL`, `NEXTAUTH_SECRET`.
- Une seule base pour commencer (pas de séparation staging/prod nécessaire tant qu'on est en beta fermée).
