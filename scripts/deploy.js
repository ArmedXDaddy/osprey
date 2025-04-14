
// Simple GitHub Pages deploy script
const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get repository information from Git
function getRepoInfo() {
  try {
    const remoteUrl = execSync('git config --get remote.origin.url').toString().trim();
    const username = remoteUrl.match(/github\.com[:\/]([^\/]+)\//).pop();
    const repository = remoteUrl.match(/\/([^\/]+)(\.git)?$/).pop().replace('.git', '');
    return { username, repository };
  } catch (error) {
    console.error('Error getting repository info:', error.message);
    return null;
  }
}

// Main execution
const repoInfo = getRepoInfo();
if (!repoInfo) {
  console.error('Could not determine repository information. Make sure you have a GitHub remote configured.');
  process.exit(1);
}

// Make sure dist directory exists after build
const distDir = path.resolve(__dirname, '../dist');
if (!fs.existsSync(distDir)) {
  console.error('Dist directory not found. Run "npm run build" first.');
  process.exit(1);
}

// Create .nojekyll file to prevent Jekyll processing
fs.writeFileSync(path.join(distDir, '.nojekyll'), '');

// Use gh-pages to deploy
try {
  console.log('Deploying to GitHub Pages...');
  execSync('npx gh-pages -d dist', { stdio: 'inherit' });
  console.log(`\nDeployed to https://${repoInfo.username}.github.io/${repoInfo.repository}/`);
} catch (error) {
  console.error('Deployment failed:', error.message);
  process.exit(1);
}
