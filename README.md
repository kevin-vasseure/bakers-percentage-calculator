# Baker's Percentage Calculator

A modern web application for calculating baker's percentages and managing bread recipes.

## Features

- **Interactive Recipe Builder**: Add, edit, and reorder ingredients with drag & drop
- **Automatic Calculations**: Convert between percentages and weights automatically
- **URL Sharing**: Recipes are encoded in the URL for easy sharing
- **Responsive Design**: Works on desktop and mobile devices
- **Recipe Management**: Save and organize your favorite recipes locally in the browser

## Recipe Storage

Saved recipes are persisted in the browser via `localStorage` (key `bakers-recipes`) — no account or backend required. Recipes can also be shared statelessly: the full recipe is encoded in the URL hash.

## Development

```bash
npm install
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Building

To create a production version of your app:

```bash
npm run build
```

You can preview the production build with `npm run preview`.

## Tech Stack

- **Frontend**: SvelteKit, Tailwind CSS, TypeScript
- **Storage**: Browser `localStorage` (no backend)
- **Deployment**: Vercel
