import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

export default defineConfig(({ mode }) => {
  // 1. Load env variables (including .env.local)
  const env = loadEnv(mode, process.cwd(), '');
  
  // 2. Polyfill process.env for the API handler
  Object.assign(process.env, env);

  return {
    plugins: [
      react(),
      {
        name: 'local-api-middleware',
        configureServer(server) {
          // Intercept /api/chat requests
          server.middlewares.use('/api/chat', async (req, res, next) => {
            if (req.method === 'POST') {
              let body = '';
              req.on('data', chunk => {
                body += chunk.toString();
              });
              
              req.on('end', async () => {
                try {
                  const parsedBody = JSON.parse(body);
                  
                  // Mock Vercel-like Request object
                  const vReq = Object.assign(req, {
                    body: parsedBody
                  });
                  
                  // Mock Vercel-like Response object
                  const vRes = Object.assign(res, {
                    status: (code: number) => {
                      res.statusCode = code;
                      return vRes;
                    },
                    json: (data: any) => {
                      res.setHeader('Content-Type', 'application/json');
                      res.end(JSON.stringify(data));
                      return vRes;
                    }
                  });

                  // Dynamic import the handler to allow hot-reloading-ish behavior
                  // Using file:// protocol for Windows compatibility in ESM
                  const handlerPath = path.resolve(process.cwd(), 'api/chat.js');
                  const handlerUrl = `file://${handlerPath.replace(/\\/g, '/')}?t=${Date.now()}`;
                  
                  const handlerModule = await import(handlerUrl);
                  
                  await handlerModule.default(vReq, vRes);
                  
                } catch (error) {
                  console.error('Local API Middleware Error:', error);
                  res.statusCode = 500;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Internal Server Error', details: String(error) }));
                }
              });
            } else {
              // If not POST, let standard 404 or other handlers take it? 
              // Or strictly return 405 like the real handler?
              // The real handler checks method, so we can just pass it through if we want,
              // but since we parse body manually, let's just next() for non-POST or handle it.
              // To match handler logic, let's just handle it.
              // But parsing body for GET hangs.
              // So we pass req/res to handler directly?
              // Handler checks `if (req.method !== 'POST')`.
              // So for GET, we don't need body.
              
              if (req.method !== 'POST') {
                 // Mock minimal objects for GET/etc
                 const vReq = req;
                 const vRes = Object.assign(res, {
                    status: (code: number) => { res.statusCode = code; return vRes; },
                    json: (data: any) => { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify(data)); return vRes; }
                 });
                 
                 const handlerPath = path.resolve(process.cwd(), 'api/chat.js');
                 const handlerUrl = `file://${handlerPath.replace(/\\/g, '/')}?t=${Date.now()}`;
                 const handlerModule = await import(handlerUrl);
                 await handlerModule.default(vReq, vRes);
                 return;
              }
              
              next();
            }
          });
        }
      }
    ],
  }
})
