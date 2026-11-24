import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const esbuildPath = path.resolve(process.argv[2] || "tmp/cloudflare-tools/node_modules/esbuild/lib/main.js");
const { build } = await import(pathToFileURL(esbuildPath));
await build({
  entryPoints: ["cloudflare/worker.mjs"],
  bundle: true,
  format: "esm",
  platform: "node",
  external: ["node:*"],
  outfile: "dist/cloudflare/_worker.js",
  plugins: [{
    name: "worker-node-imports",
    setup(builder) {
      builder.onLoad({ filter: /api\/quote\.js$/ }, ({ path: filename }) => ({
        contents: fs.readFileSync(filename, "utf8").replace(
          'const { createHash } = require("node:crypto");',
          'import { createHash } from "node:crypto";\nimport { Buffer } from "node:buffer";'
        ),
        loader: "js",
      }));
    },
  }],
});
console.log("Cloudflare Pages worker compiled.");
