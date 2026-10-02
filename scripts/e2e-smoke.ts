import { spawn } from 'node:child_process';
import path from 'node:path';
async function main() { const environment: NodeJS.ProcessEnv = { ...process.env, CLASSICMP_ENV: 'development', ELECTRON_DISABLE_SANDBOX: '1' }; delete environment.ELECTRON_RUN_AS_NODE; const child = spawn(path.resolve('node_modules/electron/dist/electron'), ['.'], { env: environment, stdio: 'ignore' }); let exited = false; child.once('exit', () => { exited = true; }); await new Promise((resolve) => setTimeout(resolve, 4000)); if (exited) throw new Error('Electron exited before the smoke-test window became ready'); child.kill('SIGTERM'); console.log('PASS Electron launch smoke test'); }
void main();
