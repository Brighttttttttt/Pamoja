# Pamoja — Plan MVP1

Voir [architecture.md](./architecture.md) pour le détail technique et [design.md](./design.md) pour les écrans.

## 1. Objectif du MVP1

Prouver la valeur core : un coach peut suivre et planifier les séances d'un athlète connecté via Strava, et l'athlète a une vue simple de ses séances avec son objectif en avant. Cible : beta fermée, quelques coachs et leurs athlètes (sous la limite Strava de 10 athlètes en self-service).

## 2. Décisions de scope confirmées

- Source de données unique : **Strava**.
- Relation coach-athlète : **un seul coach actif par athlète**, modifiable à tout moment.
- Un seul sport : course à pied.
- Web app responsive, pas d'app mobile native.

## 3. User stories — Must have (MVP1)

**Compte & connexion**
- En tant qu'utilisateur, je crée un compte et choisis un rôle (coach ou athlète).
- En tant qu'athlète, je connecte mon compte Strava et mes activités de course s'importent automatiquement.
- En tant qu'athlète, mes nouvelles activités Strava se synchronisent automatiquement (webhook), sans action manuelle.

**Lien coach-athlète**
- En tant que coach, j'invite un athlète par email.
- En tant qu'athlète, j'accepte une invitation et le coach devient mon coach actif.
- En tant qu'athlète ou coach, je peux changer/retirer le coach associé.

**Objectif**
- En tant qu'athlète, je définis un objectif final (course, date, distance, temps visé — optionnel).
- L'objectif est mis en avant en haut du calendrier athlète (compte à rebours) s'il existe.

**Vue coach**
- En tant que coach, je vois la liste de mes athlètes.
- En tant que coach, je vois l'historique des séances importées d'un athlète (distance, allure, durée, FC, D+).
- En tant que coach, je planifie une séance future dans le calendrier d'un athlète (type, description, date).
- En tant que coach, je vois en un coup d'œil si une séance planifiée a été faite (rapprochement automatique avec une activité Strava importée à la même date).

**Vue athlète**
- En tant qu'athlète, je vois mon calendrier avec les séances prévues par mon coach et mon objectif en tête.
- En tant qu'athlète, je vois mes séances réalisées sous une forme simple et minimaliste (carte résumée : distance, allure, temps, D+).
- En tant qu'athlète, je peux exporter une séance sous forme d'image partageable pour les réseaux sociaux.

## 4. Nice to have (si le temps le permet, sinon V1.1)

- Notification (email) quand une séance est planifiée par le coach.
- Statut "manquée" automatique si aucune activité rapprochée après la date.
- Historique des changements de coach.

## 5. Hors scope MVP1 (V2+)

- Garmin / Coros comme sources additionnelles.
- Paiement / abonnement coach-athlète.
- Analyse avancée (charge d'entraînement type TSS/CTL/ATL, zones de puissance).
- Messagerie intégrée.
- Templates de plans réutilisables, multi-athlètes en masse.
- Multi-sports.

## 6. Phasage

**Phase 0 — Setup**
Scaffold Next.js + Prisma + DB + Auth.js. Déploiement Vercel de base.

**Phase 1 — Comptes & Strava**
Inscription/connexion, connexion Strava OAuth, import initial des activités, webhook de sync.

**Phase 2 — Lien coach-athlète**
Invitation par email, acceptation, changement de coach.

**Phase 3 — Vue coach**
Liste des athlètes, historique des séances par athlète.

**Phase 4 — Calendrier & planification**
Calendrier coach (création de séances), calendrier athlète (lecture), rapprochement séance planifiée / activité réalisée.

**Phase 5 — Vue athlète minimaliste & partage**
Cartes de séance minimalistes, bandeau objectif avec compte à rebours, export image partageable.

**Phase 6 — Beta fermée**
Onboarding de quelques coachs/athlètes réels, retours, corrections.

## 7. Definition of Done du MVP1

- Un coach peut inviter un athlète, voir ses séances importées de Strava, et planifier une séance future.
- Un athlète peut connecter Strava, voir son calendrier avec son objectif en avant, et exporter une carte partageable d'une séance.
- Le changement de coach fonctionne sans perte de données historiques.
- Testé de bout en bout avec au moins un vrai compte Strava connecté.
