# Pamoja — Git Workflow

Runbook pour créer et opérer le repo GitHub via Claude Code CLI (MCP GitHub). S'appuie sur [architecture.md](./architecture.md) (stack Next.js/Vercel/Prisma) et [plan-mvp-1.md](./plan-mvp-1.md) (phasage). À suivre pour toute contribution, humaine ou IA.

## 1. Principes

- Tout changement de code part d'une **issue** (obligatoire, y compris pour l'IA).
- **Aucun push direct** sur `main` ou `dev` : tout passe par une Pull Request.
- La **CI doit passer sur toutes les branches/PR**, sans exception, avant tout merge.
- `main` ne peut recevoir de merge **que depuis `dev`** (jamais directement depuis une branche d'issue).
- Ces règles sont appliquées par des protections techniques (branch protection + checks CI obligatoires), pas seulement par convention — donc valables même si tout est exécuté par une IA.

## 2. Environnements & branches

| Branche | Rôle | Environnement | Déploiement |
|---|---|---|---|
| `main` | Code de production | Prod | Auto au merge → domaine prod (Vercel) |
| `dev` | Intégration / préproduction | Preprod | Auto au merge → domaine preprod (Vercel) |
| `issue-<n>-<slug>` | Une branche par issue | — | Preview Vercel automatique sur chaque PR |

Pas de branche `staging` séparée : `dev` fait office de préprod.

## 3. Étape 1 — Issue obligatoire

Avant tout code, créer une issue décrivant la tâche (référencer la phase du `plan-mvp-1.md` concernée).

```
gh issue create --title "Phase 1 — Connexion Strava OAuth" --body "Contexte / Objectif / Critères d'acceptation" --label "phase-1"
```

Le numéro d'issue sert de référence pour la branche et la PR.

## 4. Étape 2 — Branche de travail

Une branche par issue, créée à partir de `dev` toujours à jour :

```
git checkout dev
git pull
git checkout -b issue-<numero>-<slug-court>
```

Jamais de commit direct sur `dev` ou `main`.

## 5. Étape 3 — Pull Request vers `dev`

- PR obligatoire, titre/description référençant l'issue (`Closes #<numero>`).
- Stratégie de merge : **Rebase and merge** (historique linéaire, pas de commit de merge).
- Le bouton merge n'est actif que si la CI est verte (imposé par branch protection, section 7).
- Suppression automatique de la branche après merge.

## 6. Étape 4 — `dev` → `main` (release)

- Seule `dev` peut être mergée dans `main`, jamais une branche d'issue directement.
- PR obligatoire `dev` → `main`, déclenchée manuellement quand `dev` est stable (CI verte, phase du plan terminée).
- Stratégie de merge : **merge commit classique** (pas de rebase) pour garder une trace claire de chaque mise en prod dans l'historique de `main`. À ajuster si tu préfères aussi un rebase ici.

## 7. Protections techniques à configurer sur le repo

### Branch protection `main`
- Require pull request before merging
- Require status checks to pass: `build`, `check` (section 7.3)
- Require branches to be up to date before merging
- Do not allow bypassing the above settings (inclut les admins et toute automatisation IA)
- Bloquer force push et suppression de branche

### Branch protection `dev`
- Require pull request before merging
- Require status checks to pass: `build`
- Bloquer force push et suppression de branche

⚠️ **Piège de nommage** : les "required status checks" GitHub se déclarent par **nom du job**, pas par nom du workflow. Le workflow `ci.yml` a un seul job nommé `build` → le check requis est `build`, pas `ci`. Le workflow `verify-source-branch.yml` a un job nommé `check` → le check requis est `check`, pas `verify-source-branch`. Si le nom du job change, mettre à jour la branch protection en conséquence (`gh api repos/:owner/:repo/branches/:branch/protection`).

### Check custom `verify-source-branch` (obligatoire pour toute PR vers `main`)

GitHub ne permet pas nativement de restreindre la branche *source* d'une PR — on l'impose via un check CI obligatoire :

`.github/workflows/verify-source-branch.yml`
```yaml
name: verify-source-branch
on:
  pull_request:
    branches: [main]
jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - name: Only dev can merge into main
        run: |
          if [ "${{ github.head_ref }}" != "dev" ]; then
            echo "Seule la branche dev peut être mergée dans main."
            exit 1
          fi
```

Ce check est ensuite ajouté comme "required status check" dans la protection de `main`.

## 8. CI — sur toutes les branches / PR, sans exception

`.github/workflows/ci.yml`
```yaml
name: ci
on:
  pull_request:
  push:
    branches: [dev, main]
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm ci
      - run: npm run lint
      - run: npx tsc --noEmit
      - run: npm run build
      # - run: npm test   (à activer dès que des tests existent)
```

Ce check `ci` est requis sur `main` et `dev` (section 7).

## 9. CD — déploiement (Vercel)

- Projet Vercel connecté au repo GitHub.
- **Production Branch = `main`** → chaque merge déploie sur le domaine de production.
- Domaine preprod assigné à la branche `dev` (Vercel > Settings > Domains > Assign to a Git Branch) → chaque merge sur `dev` déploie sur ce domaine.
- Chaque PR (branche d'issue) génère automatiquement une preview Vercel pour review avant merge.
- Variables d'environnement à dupliquer par environnement Vercel (Production / Preview) : `DATABASE_URL`, `NEXTAUTH_SECRET`, `STRAVA_CLIENT_ID`, `STRAVA_CLIENT_SECRET`, `STRAVA_WEBHOOK_VERIFY_TOKEN` (voir architecture.md section 8).

⚠️ **Point d'attention Strava** : une app Strava n'a qu'un seul "Authorization Callback Domain". Prévoir une app Strava distincte pour prod et preprod (avec comptes de test dédiés côté preprod), sinon l'OAuth Strava cassera sur l'un des deux environnements.

## 10. .gitignore

```
node_modules/
.next/
.env
.env*.local
.vercel
*.log
.DS_Store
prisma/dev.db
```

## 11. Création du repo — checklist pour Claude Code CLI

1. Créer le repo : `gh repo create pamoja --private --description "SaaS de suivi course à pied — coachs et athlètes" --gitignore Node` (ou en local puis `gh repo create --source=. --push`)
2. Compléter le `.gitignore` (section 10)
3. Premier commit avec les .md existants : `recherche.md`, `plan-mvp-1.md`, `architecture.md`, `design.md`, `CLAUDE.md`, `README.md`, `gitworkflow.md`
4. Créer la branche `dev` à partir de `main`, la pousser (`git checkout -b dev && git push -u origin dev`)
5. Ajouter les workflows `.github/workflows/ci.yml` et `.github/workflows/verify-source-branch.yml` (sections 8 et 7.3)
6. Configurer les branch protections sur `main` et `dev` (section 7) via l'UI GitHub ou `gh api repos/:owner/:repo/branches/:branch/protection`
7. Connecter le repo à Vercel : Production Branch = `main`, domaine preprod assigné à `dev`, variables d'env par environnement
8. Créer une app Strava dédiée à chaque environnement (prod / preprod) et renseigner les callback domains
9. Créer la première issue (Phase 0 de `plan-mvp-1.md` — scaffold Next.js/Prisma/Auth.js) et démarrer le cycle issue → branche → PR → merge

## 12. Règles pour l'IA (Claude Code)

- Ne jamais commit/push directement sur `main` ou `dev`.
- Toujours partir d'une issue existante ; en créer une si besoin avant d'écrire du code.
- Toujours travailler sur une branche `issue-<n>-<slug>` dédiée, créée depuis `dev` à jour.
- Toujours passer par une PR (jamais de merge manuel forcé) et laisser la CI se dérouler.
- Ne jamais désactiver ou contourner les branch protections, même en cas de blocage — signaler le blocage plutôt que de forcer un merge.
- Ne proposer une PR `dev` → `main` que lorsque `dev` est stable (CI verte, fonctionnalités de la phase terminées).
