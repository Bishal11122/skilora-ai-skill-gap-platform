import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app, { isOriginAllowed } from '../src/app.js';
import { getAllowedOrigins } from '../src/config/env.js';

test('CORS - Origin validator correctly allows and rejects origins', () => {
  // Empty / undefined origin (curl, mobile, health checks)
  assert.equal(isOriginAllowed(undefined), true);
  assert.equal(isOriginAllowed(null), true);
  assert.equal(isOriginAllowed(''), true);

  // Stable production Vercel domain
  assert.equal(
    isOriginAllowed('https://skilora-ai-skill-gap-platform.vercel.app'),
    true
  );
  assert.equal(
    isOriginAllowed('https://skilora-ai-skill-gap-platform.vercel.app/'),
    true
  );

  // Vercel preview domains
  assert.equal(
    isOriginAllowed('https://skilora-ai-skill-gap-platform-git-feature.vercel.app'),
    true
  );
  assert.equal(isOriginAllowed('https://skilora-preview-123.vercel.app'), true);
  assert.equal(isOriginAllowed('https://my-app.vercel.app'), true);

  // Local development
  assert.equal(isOriginAllowed('http://localhost:5173'), true);
  assert.equal(isOriginAllowed('http://localhost:5174'), true);
  assert.equal(isOriginAllowed('http://127.0.0.1:5173'), true);
  assert.equal(isOriginAllowed('http://localhost:3000'), true);

  // Reject malicious / unauthorized origins
  assert.equal(isOriginAllowed('https://attacker.com'), false);
  assert.equal(isOriginAllowed('https://vercel.app.attacker.com'), false);
  assert.equal(isOriginAllowed('http://skilora-ai-skill-gap-platform.vercel.app'), false); // HTTP not allowed for Vercel
  assert.equal(isOriginAllowed('https://evil-site.org'), false);
});

test('CORS - getAllowedOrigins includes stable Vercel and local dev origins', () => {
  const origins = getAllowedOrigins();
  assert.ok(origins.includes('https://skilora-ai-skill-gap-platform.vercel.app'));
  assert.ok(origins.includes('http://localhost:5173'));
  assert.ok(origins.includes('http://127.0.0.1:5173'));
});

test('CORS - Live HTTP Server handles OPTIONS preflight and CORS headers', async () => {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    // 1. OPTIONS preflight for /api/users/me from stable production Vercel frontend
    const preflightRes = await fetch(`${baseUrl}/api/users/me`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://skilora-ai-skill-gap-platform.vercel.app',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization,content-type',
      },
    });

    assert.equal(preflightRes.status, 204);
    assert.equal(
      preflightRes.headers.get('access-control-allow-origin'),
      'https://skilora-ai-skill-gap-platform.vercel.app'
    );
    assert.equal(
      preflightRes.headers.get('access-control-allow-credentials'),
      'true'
    );
    const allowHeaders = preflightRes.headers.get('access-control-allow-headers') || '';
    assert.match(allowHeaders, /authorization/i);
    assert.match(allowHeaders, /content-type/i);
    const allowMethods = preflightRes.headers.get('access-control-allow-methods') || '';
    assert.match(allowMethods, /GET/);
    assert.match(allowMethods, /OPTIONS/);

    // 2. OPTIONS preflight for /api/careers from a Vercel preview domain
    const previewPreflight = await fetch(`${baseUrl}/api/careers`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'https://skilora-preview-branch.vercel.app',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'authorization',
      },
    });

    assert.equal(previewPreflight.status, 204);
    assert.equal(
      previewPreflight.headers.get('access-control-allow-origin'),
      'https://skilora-preview-branch.vercel.app'
    );

    // 3. Regular GET /api/health with production Vercel Origin
    const healthRes = await fetch(`${baseUrl}/api/health`, {
      headers: {
        Origin: 'https://skilora-ai-skill-gap-platform.vercel.app',
      },
    });

    assert.equal(healthRes.status, 200);
    assert.equal(
      healthRes.headers.get('access-control-allow-origin'),
      'https://skilora-ai-skill-gap-platform.vercel.app'
    );
    assert.equal(
      healthRes.headers.get('access-control-allow-credentials'),
      'true'
    );
    assert.equal(
      healthRes.headers.get('cross-origin-resource-policy'),
      'cross-origin'
    );

    // 4. Regular GET /api/health with local development origin
    const localRes = await fetch(`${baseUrl}/api/health`, {
      headers: {
        Origin: 'http://localhost:5173',
      },
    });

    assert.equal(localRes.status, 200);
    assert.equal(
      localRes.headers.get('access-control-allow-origin'),
      'http://localhost:5173'
    );

    // 5. Unauthorized origin should not receive Access-Control-Allow-Origin
    const untrustedRes = await fetch(`${baseUrl}/api/health`, {
      headers: {
        Origin: 'https://unauthorized-domain.com',
      },
    });

    assert.equal(untrustedRes.headers.get('access-control-allow-origin'), null);

    // 6. Direct server-to-server request (no Origin) succeeds
    const noOriginRes = await fetch(`${baseUrl}/api/health`);
    assert.equal(noOriginRes.status, 200);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
});
