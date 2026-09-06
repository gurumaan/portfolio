/**
 * APIPULSE — PRESET ENDPOINTS & FALLBACK TELEMETRY CATALOG
 * Pre-configured public APIs with verified CORS support for instantaneous live demonstration.
 */

window.APIPULSE_PRESETS = [
  {
    id: 'cloudflare',
    name: 'Cloudflare Edge Trace',
    tag: 'Edge CDN',
    method: 'GET',
    url: 'https://speed.cloudflare.com/meta',
    desc: 'Real-time Cloudflare Edge PoP location, client ASN, HTTP protocol version, and network latency.',
    headers: [
      { key: 'Accept', value: 'application/json', enabled: true }
    ],
    params: [],
    body: ''
  },
  {
    id: 'github',
    name: 'GitHub REST (Linux Repo)',
    tag: 'Public API',
    method: 'GET',
    url: 'https://api.github.com/repos/torvalds/linux',
    desc: 'Repository metadata, stargazers count, branch commit SHA, and license payload directly from GitHub API.',
    headers: [
      { key: 'Accept', value: 'application/vnd.github.v3+json', enabled: true },
      { key: 'User-Agent', value: 'APIPulse-Profiler/1.0', enabled: true }
    ],
    params: [],
    body: ''
  },
  {
    id: 'coingecko',
    name: 'CoinGecko Crypto Ticker',
    tag: 'Market Data',
    method: 'GET',
    url: 'https://api.coingecko.com/api/v3/simple/price?ids=bitcoin,ethereum,solana&vs_currencies=usd,inr&include_24hr_change=true',
    desc: 'High-frequency spot prices, 24h delta percentages, and currency conversions for BTC, ETH, and SOL.',
    headers: [
      { key: 'Accept', value: 'application/json', enabled: true }
    ],
    params: [
      { key: 'ids', value: 'bitcoin,ethereum,solana', enabled: true },
      { key: 'vs_currencies', value: 'usd,inr', enabled: true },
      { key: 'include_24hr_change', value: 'true', enabled: true }
    ],
    body: ''
  },
  {
    id: 'httpbin',
    name: 'HTTPBin Header Echo',
    tag: 'Diagnostic',
    method: 'GET',
    url: 'https://httpbin.org/get',
    desc: 'Network echo service inspecting client user-agent, TLS cipher suite, request origin, and forwarded headers.',
    headers: [
      { key: 'Accept', value: 'application/json', enabled: true },
      { key: 'X-Requested-With', value: 'APIPulse', enabled: true }
    ],
    params: [
      { key: 'diagnostic', value: 'latency_audit', enabled: true }
    ],
    body: ''
  },
  {
    id: 'json_placeholder',
    name: 'JSONPlaceholder (POST)',
    tag: 'Mutation',
    method: 'POST',
    url: 'https://jsonplaceholder.typicode.com/posts',
    desc: 'Simulated REST mutation testing POST payloads, custom JSON request bodies, and 201 Created responses.',
    headers: [
      { key: 'Content-Type', value: 'application/json; charset=UTF-8', enabled: true },
      { key: 'Accept', value: 'application/json', enabled: true }
    ],
    params: [],
    body: JSON.stringify({
      title: 'Real-Time Telemetry Audit',
      body: 'Testing latency waterfall and microsecond timestamp resolution.',
      userId: 42,
      timestamp: new Date().toISOString()
    }, null, 2)
  }
];

window.APIPULSE_FALLBACK_RESPONSES = {
  cloudflare: {
    status: 200,
    statusText: 'OK',
    timings: { dns: 14.2, tcp: 26.8, tls: 34.5, ttfb: 82.4, download: 12.1, total: 170.0 },
    headers: {
      'content-type': 'application/json',
      'server': 'cloudflare',
      'cf-ray': '8be3a19938b2-DEL',
      'strict-transport-security': 'max-age=31536000; includeSubDomains; preload',
      'content-security-policy': "default-src 'self'",
      'x-content-type-options': 'nosniff',
      'cache-control': 'public, max-age=60'
    },
    data: {
      hostname: 'speed.cloudflare.com',
      clientIp: '103.21.244.0',
      colo: 'DEL (Delhi, India)',
      asn: 13335,
      asOrganization: 'Cloudflare, Inc.',
      httpProtocol: 'HTTP/3 (QUIC)',
      tlsVersion: 'TLSv1.3',
      tlsCipher: 'AEAD-CHACHA20-POLY1305-SHA256'
    }
  },
  github: {
    status: 200,
    statusText: 'OK',
    timings: { dns: 18.5, tcp: 38.2, tls: 48.9, ttfb: 145.2, download: 28.4, total: 279.2 },
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'server': 'github.com',
      'x-github-media-type': 'github.v3; format=json',
      'x-ratelimit-limit': '60',
      'x-ratelimit-remaining': '59',
      'strict-transport-security': 'max-age=31536000; includeSubdomains; preload',
      'x-frame-options': 'deny',
      'x-content-type-options': 'nosniff'
    },
    data: {
      id: 2325298,
      name: 'linux',
      full_name: 'torvalds/linux',
      owner: { login: 'torvalds', id: 1024025, type: 'User' },
      description: 'Linux kernel source tree',
      stargazers_count: 184520,
      watchers_count: 184520,
      language: 'C',
      open_issues_count: 380,
      license: { key: 'gpl-2.0', name: 'GNU General Public License v2.0', spdx_id: 'GPL-2.0' },
      default_branch: 'master',
      updated_at: '2026-09-06T09:00:00Z'
    }
  },
  coingecko: {
    status: 200,
    statusText: 'OK',
    timings: { dns: 12.1, tcp: 24.5, tls: 31.8, ttfb: 95.3, download: 10.4, total: 174.1 },
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=30',
      'strict-transport-security': 'max-age=31536000',
      'x-content-type-options': 'nosniff'
    },
    data: {
      bitcoin: { usd: 89450, inr: 7780000, usd_24h_change: 2.45 },
      ethereum: { usd: 3420.5, inr: 297500, usd_24h_change: 1.18 },
      solana: { usd: 198.8, inr: 17295, usd_24h_change: 4.82 }
    }
  },
  httpbin: {
    status: 200,
    statusText: 'OK',
    timings: { dns: 15.0, tcp: 29.2, tls: 38.0, ttfb: 110.4, download: 14.2, total: 206.8 },
    headers: {
      'content-type': 'application/json',
      'server': 'gunicorn/19.9.0',
      'access-control-allow-origin': '*',
      'access-control-allow-credentials': 'true'
    },
    data: {
      args: { diagnostic: 'latency_audit' },
      headers: {
        'Accept': 'application/json',
        'Host': 'httpbin.org',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'X-Requested-With': 'APIPulse'
      },
      origin: '103.21.244.0',
      url: 'https://httpbin.org/get?diagnostic=latency_audit'
    }
  },
  json_placeholder: {
    status: 201,
    statusText: 'Created',
    timings: { dns: 11.8, tcp: 23.4, tls: 30.1, ttfb: 78.5, download: 8.9, total: 152.7 },
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'location': 'https://jsonplaceholder.typicode.com/posts/101',
      'x-content-type-options': 'nosniff',
      'access-control-allow-credentials': 'true'
    },
    data: {
      title: 'Real-Time Telemetry Audit',
      body: 'Testing latency waterfall and microsecond timestamp resolution.',
      userId: 42,
      id: 101
    }
  }
};