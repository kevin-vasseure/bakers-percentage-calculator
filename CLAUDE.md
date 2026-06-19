# Baker's Percentage Calculator

Application web permettant aux boulangers de calculer et gérer les pourcentages de boulanger — les quantités d'ingrédients sont exprimées en pourcentages relatifs au poids total de la farine.

## Stack technique

- **Framework** : SvelteKit 2 + Svelte 5 (transition en cours depuis Svelte 4)
- **Langage** : TypeScript 5 (avec `allowJs`, config via `jsconfig.json`)
- **Styling** : Tailwind CSS v4 (plugin Vite natif, pas de `tailwind.config.js`) + classes sémantiques dans `app.css`
- **Persistance** : `localStorage` (recettes sauvegardées côté navigateur, sans backend ni compte)
- **Éditeur Markdown** : ByteMD avec GFM
- **Déploiement** : Vercel (`@sveltejs/adapter-vercel`)
- **Tests** : Vitest + Testing Library (setup minimal)
- **Package manager** : npm

## Commandes

```bash
npm run dev          # Serveur de développement
npm run build        # Build production
npm run preview      # Preview du build
npm run check        # Type-checking Svelte
npm run lint         # Prettier + ESLint
npm run format       # Formatage Prettier
npm run test         # Tests unitaires (run once)
npm run test:unit    # Tests unitaires (watch)
```

## Architecture

```
src/
├── routes/
│   ├── +layout.svelte          # Layout racine (import CSS + slot)
│   └── +page.svelte            # Page unique de l'app
├── lib/
│   ├── components/             # Composants Svelte
│   │   ├── IngredientTable.svelte      # Table conteneur (switch view/edit)
│   │   ├── IngredientRowView.svelte    # Ligne lecture seule
│   │   ├── IngredientRowEdit.svelte    # Ligne éditable (modal, drag, toggle flour)
│   │   ├── EditModal.svelte            # Modal générique d'édition
│   │   ├── TotalWeight.svelte          # Poids total (éditable en mode edit)
│   │   ├── ViewModeToggle.svelte       # FAB toggle view/edit
│   │   ├── ShareButton.svelte          # Partage via URL
│   │   ├── MarkdownEditor.svelte       # Wrapper ByteMD
│   │   ├── RecipeList.svelte           # Panel recettes sauvegardées
│   │   ├── SaveRecipeModal.svelte      # Modal sauvegarde recette
│   │   ├── BottomBar.svelte            # Barre navigation fixe
│   │   └── HelpSection.svelte          # Guide utilisateur
│   ├── stores/
│   │   ├── currentRecipeStore.ts       # Store principal unifié (source de vérité)
│   │   ├── ingredientsStore.ts         # Store legacy (encore importé dans certains composants)
│   │   ├── recipesStore.ts             # CRUD des recettes via localStorage
│   │   └── dragDropStore.ts            # État drag-and-drop
│   └── utils/
│       ├── calculations.ts             # Helpers purs : totalWeight, flourCount, flourWeight
│       └── urlEncoding.ts              # Encodage Base64 recette ↔ hash URL
├── app.css                             # Styles globaux (imports Tailwind + classes @apply)
├── app.html                            # HTML entry point
└── app.d.ts                            # Déclarations TypeScript
```

## Patterns et conventions

### State management
- **Store factory pattern** : chaque store est créé via une fonction factory (`createCurrentRecipeStore()`) qui retourne un objet avec `subscribe` + méthodes d'action.
- **Store principal** : `currentRecipeStore.ts` — objet `CurrentRecipe` unique avec des derived stores (`currentIngredients`, `currentNotes`, `totalWeight`, etc.).
- `ingredientsStore.ts` est legacy mais encore utilisé dans certains composants.

### Logique de calcul (pourcentages boulanger)
- Changement d'une **farine** → recalcul des quantités de tous les non-farines via leurs pourcentages
- Changement d'un **non-farine** → recalcul de son pourcentage par rapport au total farine
- Changement d'un **pourcentage** → recalcul de la quantité en grammes
- **Toggle flour** → recalcul du total farine, préservation des quantités/pourcentages selon le cas

### Syntaxe Svelte mixte
Le projet est en **transition Svelte 4 → Svelte 5**. On trouve :
- Svelte 5 : `$props()`, `$derived()`, `$state()` (ex: `+layout.svelte`, `RecipeList.svelte`)
- Svelte 4 : `export let`, `$:`, `on:event` (ex: `IngredientRowEdit.svelte`)

### Partage de recettes
Encodage URL sans serveur : la recette complète est sérialisée en Base64 dans le hash de l'URL, permettant un partage stateless.

### Persistance des recettes
`recipesStore.ts` gère les recettes sauvegardées dans `localStorage` (clé `bakers-recipes`), sans backend ni authentification. Chaque recette a un `id` généré (`crypto.randomUUID()`) et des timestamps ISO.

### CSS
Approche hybride : utilitaires Tailwind inline + classes sémantiques définies avec `@apply` dans `app.css` + blocs `<style>` scopés dans les composants.

## Variables d'environnement

Aucune variable d'environnement requise — l'application est entièrement côté client.
