import net from 'node:net'
import { spawn } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const mode = process.argv[2]
if (!['dev', 'start'].includes(mode)) {
  console.error('Usage: node scripts/auto-port.mjs <dev|start>')
  process.exit(1)
}

const basePort = Number(process.env.PORT || 3001)
const maxPort = Number(process.env.MAX_PORT || basePort + 50)
const scriptDir = path.dirname(fileURLToPath(import.meta.url))
const pnpmCli = process.env.npm_execpath

function isPortFree(port) {
  const hosts = ['127.0.0.1', '::']
  return Promise.all(hosts.map((host) => new Promise((resolve) => {
    const server = net.createServer()
    server.unref()
    server.on('error', () => resolve(false))
    server.listen({ port, host }, () => {
      server.close(() => resolve(true))
    })
  }))).then(results => results.every(Boolean))
}

function getRandomFreePort() {
  return new Promise((resolve, reject) => {
    const server = net.createServer()
    server.unref()
    server.on('error', reject)
    server.listen({ port: 0, host: '::' }, () => {
      const address = server.address()
      const port = typeof address === 'object' && address ? address.port : null
      server.close(() => {
        if (!port) {
          reject(new Error('Could not allocate a free port'))
          return
        }
        resolve(port)
      })
    })
  })
}

async function pickPort() {
  for (let port = basePort; port <= maxPort; port += 1) {
    // Skip occupied ports so local runs can continue without manual cleanup.
    // Next.js will receive the first free port we find.
    // eslint-disable-next-line no-await-in-loop
    if (await isPortFree(port)) return port
  }
  return getRandomFreePort()
}

const port = await pickPort()
console.log(`Auto-selected port ${port}`)
const runArgs = pnpmCli
  ? [pnpmCli, 'exec', 'next', mode, '-p', String(port)]
  : [path.join(scriptDir, '..', 'node_modules', 'next', 'dist', 'bin', 'next'), mode, '-p', String(port)]

const child = spawn(
  pnpmCli ? process.execPath : process.execPath,
  runArgs,
  {
    cwd: path.join(scriptDir, '..'),
    stdio: 'inherit',
    env: {
      ...process.env,
      PORT: String(port),
    },
  }
)

child.on('exit', (code) => {
  process.exit(code ?? 0)
})
