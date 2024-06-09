import path from 'node:path';

import { build } from 'esbuild';
import { nodeExternalsPlugin } from 'esbuild-node-externals';

build({
  entryPoints: ['./app/bin/lambda.ts', './app/bin/lambda-migrate.ts'],
  bundle: true,
  platform: 'node',
  target: 'node20',
  outdir: './build',
  // minify: true,
  format: 'esm',
  treeShaking: true,
  plugins: [
    nodeExternalsPlugin({
      packagePath: path.resolve(import.meta.dirname, '../package.json'),
      dependencies: true,
      devDependencies: false,
      allowList: () => true,
    }),
  ],
  banner: {
    js: `import { createRequire } from 'module'; const require = createRequire(import.meta.url);`, // https://github.com/evanw/esbuild/pull/2067#issuecomment-1324171716
  },
}).catch(() => process.exit(1));
