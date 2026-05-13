export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    if (process.env.NEXT_PHASE === 'phase-production-build') return

    // Using CamelCase turbopackIgnore as suggested by the warning message
    const { registerNode } = await import(/* turbopackIgnore: true */ './lib/instrumentation-node')
    await registerNode()
  }
}
