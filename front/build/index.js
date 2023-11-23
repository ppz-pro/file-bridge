const { context } = require('esbuild')

async function main() {
  const ctx = await context({
    entryPoints: ['src/index.jsx'],
    bundle: true,
    sourcemap: true,
    outfile: 'public/bundled/index.js',
    logLevel: 'info',
    jsx: 'automatic', // 自动 import jsx
    jsxFactory: 'jsx', // React.createElement -> jsx
    jsxImportSource: '@emotion/react', // jsx 来自哪个包
  })

  await ctx.watch()
}

main()
