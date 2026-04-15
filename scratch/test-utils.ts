import { getBaseUrl } from '../lib/utils';

// Mock process.env
const originalEnv = process.env;

function test(env: any, expected: string) {
  process.env = { ...originalEnv, ...env };
  const result = getBaseUrl();
  console.log(`Env: ${JSON.stringify(env)} => Result: ${result} (Expected: ${expected})`);
  if (result !== expected) {
    console.error('FAIL');
  } else {
    console.log('PASS');
  }
}

console.log('Testing getBaseUrl...');

test({ NEXTAUTH_URL: 'https://koda-ruddy.vercel.app/' }, 'https://koda-ruddy.vercel.app');
test({ NEXTAUTH_URL: 'http://localhost:3000' }, 'http://localhost:3000'); // Actually my logic says if it includes localhost and NEXTAUTH_URL is defined, it might fall back to VERCEL_URL. Let's re-examine logic.

// Logic:
// if (process.env.NEXTAUTH_URL && !process.env.NEXTAUTH_URL.includes("localhost")) return NEXTAUTH_URL;
// if (process.env.VERCEL_URL) return VERCEL_URL;
// return localhost;

test({ NEXTAUTH_URL: 'http://localhost:3000', VERCEL_URL: 'koda-ruddy.vercel.app' }, 'https://koda-ruddy.vercel.app');
test({ NEXTAUTH_URL: undefined, VERCEL_URL: 'koda-ruddy.vercel.app' }, 'https://koda-ruddy.vercel.app');
test({ NEXTAUTH_URL: undefined, VERCEL_URL: undefined }, 'http://localhost:3000');

process.env = originalEnv;
