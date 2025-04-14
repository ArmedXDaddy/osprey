
# HerCollabHub

A collaboration platform for professional women to network, find mentorship, share resources, and support each other's career growth.

## Development

To run this project locally:

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

## Deployment

This project is configured for GitHub Pages deployment using GitHub Actions.

### Automatic Deployment
1. Push your code to the `main` branch on GitHub
2. The GitHub Actions workflow will automatically build and deploy your site
3. Your site will be available at `https://yourusername.github.io/repository-name/`

### Manual Deployment
If you prefer to deploy manually:

1. Build the project:
```bash
npm run build
```

2. Run the deploy script:
```bash
node scripts/deploy.js
```

Note: Make sure to have the `gh-pages` package installed globally or run with `npx gh-pages -d dist`.
