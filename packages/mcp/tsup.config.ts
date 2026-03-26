import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["esm"],
  dts: true,
  clean: true,
  target: "node20",
  external: ["express"],
  banner: {
    js: "#!/usr/bin/env node",
  },
});
