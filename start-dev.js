#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Inflight Login Development Environment...\n');

// Start backend server
const backend = spawn('npm', ['run', 'dev'], {
  cwd: join(__dirname, 'backend'),
  stdio: 'inherit',
  shell: true
});

// Start frontend server
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: __dirname,
  stdio: 'inherit',
  shell: true
});

// Handle process termination
const cleanup = () => {
  console.log('\n🛑 Shutting down servers...');
  backend.kill();
  frontend.kill();
  // eslint-disable-next-line no-undef
  process.exit(0);
};

// eslint-disable-next-line no-undef
process.on('SIGINT', cleanup);
// eslint-disable-next-line no-undef
process.on('SIGTERM', cleanup);

// Handle backend exit
backend.on('close', (code) => {
  console.log(`Backend server exited with code ${code}`);
  cleanup();
});

// Handle frontend exit
frontend.on('close', (code) => {
  console.log(`Frontend server exited with code ${code}`);
  cleanup();
});

console.log('✅ Both servers are starting up...');
console.log('📱 Frontend will be available at: http://localhost:5173');
console.log('🔧 Backend will be available at: http://localhost:3000');
console.log('Press Ctrl+C to stop both servers\n'); 