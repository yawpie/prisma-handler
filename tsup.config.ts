import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],

  // output format
  format: ["cjs", "esm"],

  // generate type definitions
    dts: true,
//   dts: {
//     resolve: true,
//   },

  // clean dist folder before build
  clean: true,

  // generate sourcemaps
  sourcemap: true,

  // don't bundle dependencies (important for prisma)
  external: ["@prisma/client"],

  // target node
  target: "node18",

  // splitting (only for esm)
  splitting: false,

  // optional: minify
  minify: false,
});
