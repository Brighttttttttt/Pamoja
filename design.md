# Pamoja — Brief design

Ce document sert de base au passage design (maquettes) puis à l'implémentation code, à partir de ce brief + [plan-mvp-1.md](./plan-mvp-1.md) + [architecture.md](./architecture.md).

## 1. Principes directeurs

- **Deux vues très différentes** : la vue coach est dense et analytique (données, tableaux, calendrier de planification) ; la vue athlète est minimaliste, épurée, pensée pour être regardée vite et partagée.
- **L'objectif toujours visible** : dès qu'un objectif existe, il est mis en avant en haut du calendrier athlète (nom de la course, date, compte à rebours).
- **Mobile-first côté athlète** (consultation rapide, partage réseaux sociaux), desktop-first côté coach (planification, comparaison de données).
- **Simplicité avant tout** : pas de surcharge de métriques au MVP, on privilégie distance / allure / durée / D+ / FC.

## 2. Écrans — Coach

### Dashboard coach
- Liste des athlètes (nom, dernière activité, prochaine séance planifiée, statut objectif).
- Bouton "Inviter un athlète".

### Fiche athlète
- En-tête : nom, objectif (si défini), coach actuel.
- Historique des activités : liste/tableau (date, distance, allure, durée, D+, FC).
- Accès au calendrier de planification de cet athlète.

### Calendrier coach (par athlète)
- Vue mensuelle/hebdomadaire.
- Ajout de séance : date, type (endurance, fractionné, sortie longue, repos...), description libre.
- Indicateur visuel séance faite / manquée / à venir (rapprochement avec activité Strava importée).

## 3. Écrans — Athlète

### Dashboard / accueil athlète
- Bandeau objectif en haut (si objectif défini) : nom de la course, date, compte à rebours (J-X).
- Dernières séances sous forme de cartes minimalistes (pas de tableau dense).
- Statut connexion Strava (connecté / à reconnecter).

### Calendrier athlète
- Vue lecture seule des séances planifiées par le coach.
- Objectif toujours affiché en tête de vue, y compris en scrollant si possible (sticky).

### Carte de séance (partageable)
- Format pensé pour export image (proportions réseaux sociaux, ex. carré ou story).
- Contenu minimal : distance, allure moyenne, durée, D+, date, éventuellement type de séance.
- Style épuré, peu de texte, lisible en un coup d'œil.

## 4. Composants clés à designer

- `GoalBanner` — bandeau objectif avec compte à rebours.
- `Calendar` — deux variantes (édition coach / lecture athlète), vue mois + semaine.
- `ActivityCard` (coach) — ligne/carte dense avec métriques.
- `ShareCard` (athlète) — carte minimaliste exportable en image.
- `AthleteListItem` — ligne de la liste d'athlètes côté coach.
- `SessionForm` — formulaire de création/édition de séance planifiée.
- `StravaConnectButton` — bouton de connexion/reconnexion Strava avec statut.

## 5. Direction visuelle (point de départ, à affiner en maquette)

- Palette simple et sportive : une couleur d'accent forte (ex. orange/vert énergique) sur fond neutre clair, contraste élevé pour la lisibilité en extérieur/mobile.
- Typographie claire, chiffres/métriques mis en avant (taille plus grande) car ce sont l'information centrale.
- Peu d'ornements, pas de surcharge visuelle — cohérent avec le principe "minimaliste" demandé côté athlète.
- Même base visuelle pour coach et athlète (cohérence de marque) mais densité d'information différente selon la vue.

## 6. Flows utilisateurs principaux

1. **Onboarding coach** : inscription → choix rôle "coach" → dashboard vide → invite un athlète.
2. **Onboarding athlète** : inscription (ou via lien d'invitation) → choix rôle "athlète" → connexion Strava → import des activités → (optionnel) saisie de l'objectif.
3. **Planification** : coach ouvre la fiche d'un athlète → calendrier → ajoute une séance.
4. **Réalisation** : athlète fait sa séance sur Strava → sync auto → séance planifiée marquée faite si rapprochée.
5. **Partage** : athlète ouvre une activité → génère la carte → télécharge/partage l'image.
6. **Changement de coach** : athlète (ou coach) déclenche le changement → confirmation → nouveau coachId, historique conservé.

## 7. Étape suivante

Utiliser ce brief pour produire les maquettes (design), puis développer l'implémentation en s'appuyant sur les maquettes validées, [plan-mvp-1.md](./plan-mvp-1.md) (priorisation) et [architecture.md](./architecture.md) (modèle de données, routes).
