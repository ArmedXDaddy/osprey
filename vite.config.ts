
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// Get the repository name for GitHub Pages
const getBasePath = () => {
  try {
    if (process.env.NODE_ENV === 'production') {
      // For GitHub Pages, we need to use the repository name as the base path
      // You can override this with an environment variable if needed
      return process.env.BASE_PATH || '/her-collab-hub';
    }
    return '/';
  } catch (e) {
    return '/';
  }
};

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: getBasePath(),
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
