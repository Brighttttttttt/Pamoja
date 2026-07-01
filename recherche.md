# Pamoja — Recherche MVP

## 1. Vision

SaaS de suivi course à pied reliant coachs et athlètes.

- **Coach** : voit les données de ses athlètes, les analyse, planifie les séances dans un calendrier.
- **Athlète** : voit une version simplifiée de ses propres données (format partageable réseaux sociaux, minimaliste), avec un calendrier qui met en avant son objectif final (course cible) s'il existe.
- **Relation** : many-to-many. Un athlète peut avoir plusieurs coachs, un coach a plusieurs athlètes.

Objectif : MVP le plus simple possible, données récupérées automatiquement depuis Strava (ou Garmin/Coros si plus simple).

## 2. Choix de la source de données

| Critère | Strava | Garmin Connect | Coros |
|---|---|---|---|
| Accès développeur | Self-service, immédiat via developers.strava.com | Formulaire de demande, validation ~2 jours ouvrés, usage "business" uniquement, call d'intégration requis | Candidature API à valider par Coros, process partenaire plus fermé |
| Auth | OAuth 2.0 standard | OAuth 2.0 | OAuth 2.0 (portail développeur) |
| Limites | 200 req/15 min et 2000 req/jour par appli (défaut) ; nouveau système de paliers depuis juin 2026 : le palier "Standard" permet un auto-upgrade jusqu'à 10 athlètes sans review ; au-delà, palier "Extended Access" avec review manuelle | Pas de limite publique standardisée aussi simple ; process plus lourd | Peu documenté publiquement |
| Temps réel | Webhooks natifs (nouvelle activité, suppression, mise à jour) → pas besoin de polling | Existe mais plus complexe à mettre en place | Sync via appli tierces (Strava, TrainingPeaks...) plutôt que push direct |
| Couverture utilisateurs | Très large (running, tous devices qui syncent vers Strava, y compris Garmin/Coros/Apple Watch/Suunto) | Uniquement utilisateurs Garmin | Uniquement utilisateurs Coros (marché plus restreint) |
| Coût | Gratuit | Gratuit | Gratuit (sous accord partenaire) |

**Recommandation MVP : Strava.**
Raisons : mise en place la plus rapide (pas d'approbation à attendre pour démarrer en dev), couvre indirectement les utilisateurs Garmin/Coros/Suunto/Apple Watch (la plupart syncent déjà leurs séances vers Strava), webhooks pour mise à jour automatique des données sans job de polling. Limite réelle : le palier gratuit ne couvre que 10 athlètes connectés sans validation manuelle — largement suffisant pour un MVP/beta fermée, à surveiller si la base grossit vite (demande de palier "Extended Access" à anticiper).

Garmin et Coros restent des pistes d'extension post-MVP (utile pour capter les athlètes qui ne veulent pas connecter Strava), mais alourdissent la V1 avec un process d'approbation et une intégration séparée pour un gain de couverture marginal.

## 3. Utilisateurs & modèle de données (simplifié)

Entités principales :

- **User** (id, email, nom, mot de passe/OAuth, rôle(s) — un même compte peut être coach *et* athlète)
- **CoachAthlete** (table de liaison) : coach_id, athlete_id, statut (invité / actif), date de début
- **Athlete profile** : objectif principal (nom de la course, date, distance cible, allure/temps visé) — optionnel
- **Activity** : id, athlete_id, source (strava/garmin/coros), données brutes importantes (date, distance, durée, allure, FC moyenne, D+, type de séance), lien vers l'activité source
- **PlannedSession** (calendrier) : athlete_id, coach_id (créateur), date, type de séance, description, statut (planifiée / faite / manquée), lien optionnel vers l'Activity réalisée pour comparer prévu/réalisé

La relation many-to-many coach↔athlète est le point structurant : elle implique dès le MVP une table de liaison avec invitation/acceptation, plutôt qu'un simple champ `coach_id` sur l'athlète.

## 4. Fonctionnalités MVP

### Côté coach
- Liste des athlètes rattachés (accepter une invitation d'athlète, ou inviter un athlète par email)
- Pour chaque athlète : historique des séances importées (distance, allure, FC, D+, charge hebdo simple)
- Vue calendrier par athlète pour planifier les séances à venir (type, description, date)
- Comparatif simple prévu vs réalisé (a minima : séance planifiée marquée faite/pas faite, avec l'activité liée)

### Côté athlète
- Connexion Strava (import auto des séances)
- Vue "carte" minimaliste par séance ou par période, pensée pour être exportée/partagée (image simple : distance, allure, temps, D+)
- Calendrier personnel : séances prévues par le(s) coach(s) + objectif final toujours visible en tête (course cible + compte à rebours)
- Peut avoir zéro, un, ou plusieurs coachs

### Transverse
- Invitation coach ↔ athlète (lien/email)
- Connexion Strava OAuth + import initial + sync via webhook
- Notion d'objectif (goal) rattaché à l'athlète, affiché en priorité dans son calendrier

## 5. Ce qu'on laisse hors MVP (V2+)

- Garmin/Coros en sources additionnelles
- Paiement / abonnement coach-athlète
- Analyse avancée (courbe de forme, TSS/CTL/ATL type TrainingPeaks, zones de puissance)
- Messagerie intégrée coach-athlète
- Templates de plans d'entraînement réutilisables
- Multi-sports (natation, vélo) — rester 100% course à pied pour le MVP
- Application mobile native (une web app responsive suffit au départ)

## 6. Stack technique proposée (simple, un seul repo)

- **Frontend + backend** : Next.js (App Router) — un seul projet, pages coach et pages athlète
- **Base de données** : PostgreSQL (Supabase ou Neon pour rester managé et gratuit en MVP)
- **Auth** : Auth.js (NextAuth) — email/password ou magic link, plus OAuth Strava distinct pour l'import de données
- **Intégration Strava** : OAuth 2.0 pour connecter le compte athlète, webhook Strava pour la sync automatique des nouvelles activités, job de récupération initiale (import des N dernières activités à la connexion)
- **Génération des visuels partageables** : rendu d'une image (ex. via une librairie de génération d'image côté serveur) pour export réseaux sociaux
- **Hébergement** : Vercel (frontend/API) + DB managée

Ce choix minimise le nombre de services à opérer pour un solo/petite équipe qui veut sortir un MVP vite.

## 7. Points d'attention / risques

- **Quota Strava à 10 athlètes** sur le palier gratuit sans review : ok pour une beta fermée, à anticiper si croissance rapide (demande d'upgrade de palier).
- **Vie privée des activités** : un athlète peut avoir des activités marquées privées sur Strava — nécessite le scope `activity:read_all` et d'être clair avec l'utilisateur sur ce qui est partagé à son(ses) coach(s).
- **Consentement multi-coachs** : si un athlète a plusieurs coachs, définir si toutes les séances/data sont visibles par tous ses coachs ou si un filtrage est nécessaire (probablement hors scope MVP : tout visible par tous les coachs liés).
- **Révocation d'accès Strava** : le webhook Strava notifie quand un athlète révoque l'accès — à gérer pour ne pas garder un state incohérent.

## 8. Prochaines étapes suggérées

1. Valider ce périmètre MVP.
2. Créer une app Strava (developers.strava.com) et tester l'OAuth + import d'une activité en local.
3. Modéliser la base de données (schéma détaillé à partir de la section 3).
4. Prototyper les deux vues clés : calendrier coach (planification) et carte partageable athlète.
5. Beta fermée avec un petit nombre de coachs/athlètes réels avant d'ouvrir plus largement (reste sous la limite des 10 athlètes Strava en self-service).

## Sources

- [Strava — Rate Limits](https://developers.strava.com/docs/rate-limits/)
- [Strava — Getting Started with the API](https://developers.strava.com/docs/getting-started/)
- [Strava — Webhook Events API](https://developers.strava.com/docs/webhooks/)
- [Strava Community — An Update To Our Developer Program](https://communityhub.strava.com/insider-journal-9/an-update-to-our-developer-program-13428)
- [Garmin Connect Developer Program — Overview](https://developer.garmin.com/gc-developer-program/)
- [Garmin Connect Developer Program — FAQ](https://developer.garmin.com/gc-developer-program/program-faq/)
- [Garmin Connect Developer Access Request Form](https://www.garmin.com/en-US/forms/GarminConnectDeveloperAccess/)
- [Coros — Submitting an API Application](https://support.coros.com/hc/en-us/articles/17085887816340-Submitting-an-API-Application)
- [Coros Developer Portal](https://developers.coro.net/)
- [TrainingPeaks vs Final Surge — comparatif](https://trainingtilt.com/trainingpeaks-vs-final-surge/)
- [Final Surge — For Coaches](https://www.finalsurge.com/coaches)
- [TrainingPeaks — Calendar Efficiency Features](https://www.trainingpeaks.com/coach-blog/speed-up-your-coaching-with-5-trainingpeaks-calendar-efficiency-features/)
