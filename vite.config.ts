import { defineConfig, loadEnv, type UserConfig } from "vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import tsConfigPaths from "vite-tsconfig-paths";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";

export default defineConfig(async ({ mode, command }): Promise<UserConfig> => {
  // Injeta as VITE_* como constantes de build. O Vite já faz isso para o
  // bundle de cliente, mas o build de SSR (nitro) precisa do define explícito
  // para que as variáveis cheguem ao Worker.
  const env = loadEnv(mode, process.cwd(), "VITE_");
  const define: Record<string, string> = {};
  for (const [key, value] of Object.entries(env)) {
    define[`import.meta.env.${key}`] = JSON.stringify(value);
  }

  return {
    define,
    css: { transformer: "lightningcss" },
    resolve: {
      alias: { "@": `${process.cwd()}/src` },
      // React e TanStack Query precisam ser instância única: duplicatas
      // quebram hooks e o cache de query no build de SSR.
      dedupe: [
        "react",
        "react-dom",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
        "@tanstack/react-query",
        "@tanstack/query-core",
      ],
    },
    optimizeDeps: {
      include: [
        "react",
        "react-dom",
        "react-dom/client",
        "react/jsx-runtime",
        "react/jsx-dev-runtime",
      ],
    },
    // Porta fixa: Ylink usa a 8080 e o site do Pr. Daniel a 8090. strictPort
    // falha em vez de pular para outra porta, que quebraria os redirects do Supabase.
    server: { host: "::", port: 8091, strictPort: true },
    plugins: [
  

      tailwindcss(),
      tsConfigPaths({ projects: ["./tsconfig.json"] }),
      tanstackStart({
        // src/server.ts envolve o handler de SSR para tratar erros catastróficos.
        server: { entry: "server" },
        // Impede que código de servidor vaze para o bundle de cliente.
        importProtection: {
          behavior: "error",
          client: {
            files: ["**/server/**"],
            specifiers: ["server-only"],
          },
        },
      }),
      // Nitro só roda no build: é ele que gera o Worker da Cloudflare em .output/
      ...(command === "build"
        ? [
            nitro({
              defaultPreset: "cloudflare-module",
              // public/_headers só alcança os arquivos estáticos servidos pelo
              // binding ASSETS. Tudo que o Worker renderiza precisa dos
              // cabeçalhos aqui.
              routeRules: {
                "/**": {
                  headers: {
                    "X-Content-Type-Options": "nosniff",
                    "Referrer-Policy": "strict-origin-when-cross-origin",
                    "X-Frame-Options": "SAMEORIGIN",
                    "Permissions-Policy": "geolocation=(), camera=(), microphone=()",
                    // Só HTTPS por 1 ano. Sem includeSubDomains: e-mail do domínio pode
                    // usar subdomínios que não são deste site.
                    "Strict-Transport-Security": "max-age=31536000",
                  },
                },
              },
            }),
          ]
        : []),
      viteReact(),
    ],
  };
});
