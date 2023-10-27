const { context } = require('esbuild')

async function main() {
  const ctx = await context({
    entryPoints: ['src/index.jsx'],
    bundle: true,
    sourcemap: true,
    outfile: 'public/bundled/index.js',
    logLevel: 'info',
    jsx: 'automatic',
  })

  await ctx.watch()
  await ctx.serve({
    servedir: 'public',
  })
}

main()
