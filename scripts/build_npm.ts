import { build, emptyDir } from "@deno/dnt";
import { bgGreen } from "@std/fmt/colors";
import denoJson from "../deno.json" with { type: "json" };

const version = denoJson.version;

console.log(bgGreen(`version: ${version}`));

await emptyDir("./.npm");

await build({
  entryPoints: ["./mod.ts"],
  outDir: "./.npm",
  shims: {
    deno: false,
  },
  test: false,
  compilerOptions: {
    lib: ["ES2021", "DOM"],
  },
  package: {
    name: "timerider",
    version,
    description: "Accurate timers with drift correction, pause/resume, and long delay support.",
    keywords: [
      "timer",
      "timeout",
      "interval",
      "drift-correction",
      "pause",
      "resume",
      "long-delay",
      "deno",
      "npm",
    ],
    license: "MIT",
    repository: {
      type: "git",
      url: "git+https://github.com/denostack/timerider.git",
    },
    bugs: {
      url: "https://github.com/denostack/timerider/issues",
    },
  },
  postBuild() {
    Deno.copyFileSync("LICENSE", ".npm/LICENSE");
    Deno.copyFileSync("README.md", ".npm/README.md");
  },
});
