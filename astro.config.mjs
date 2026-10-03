// @ts-check
import { defineConfig } from 'astro/config';

// En local, le serveur de développement ne sert pas /demos/xxx/ tout seul
// (un hébergeur le fait). Cette petite règle corrige ça pour pouvoir tester.
const demosEnLocal = {
  name: 'demos-en-local',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (req.url && /^\/demos\/[a-z0-9-]+\/(\?.*)?$/.test(req.url)) req.url = req.url.replace(/\/(\?.*)?$/, '/index.html$1');
      next();
    });
  },
};

export default defineConfig({
  site: 'https://nouvelleardoise.ch',
  trailingSlash: 'always',
  vite: { plugins: [demosEnLocal] },
});
