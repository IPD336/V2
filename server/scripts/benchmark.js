/**
 * SkillSwap Standalone API Benchmarking Script
 * 
 * Runs a performance load test against any HTTP endpoint.
 * Zero-dependency: uses native Node.js fetch and performance APIs.
 * 
 * Usage:
 *   node server/scripts/benchmark.js --url http://localhost:5000/api/ping --requests 100 --concurrency 10
 * 
 * Authenticated Example:
 *   node server/scripts/benchmark.js --url http://localhost:5000/api/users/profile --email test@example.com --password mypassword
 */

const { performance } = require('perf_hooks');

// Helper to parse arguments
function parseArgs() {
  const args = {};
  const argv = process.argv.slice(2);
  for (let i = 0; i < argv.length; i++) {
    if (argv[i].startsWith('--')) {
      const key = argv[i].slice(2);
      const val = argv[i + 1];
      if (val && !val.startsWith('--')) {
        args[key] = val;
        i++;
      } else {
        args[key] = true;
      }
    }
  }
  return args;
}

async function run() {
  const args = parseArgs();
  
  const targetUrl = args.url || 'http://localhost:5000/api/ping';
  const requests = parseInt(args.requests || args.n || 100, 10);
  const concurrency = parseInt(args.concurrency || args.c || 10, 10);
  const method = (args.method || args.m || 'GET').toUpperCase();
  const bodyString = args.body || null;
  const email = args.email || null;
  const password = args.password || null;

  console.log('====================================================');
  console.log('          SKILLSWAP BENCHMARK RUNNER                ');
  console.log('====================================================');
  console.log(`Target URL:   ${targetUrl}`);
  console.log(`Method:       ${method}`);
  console.log(`Requests:     ${requests}`);
  console.log(`Concurrency:  ${concurrency}`);
  
  const headers = {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'x-bypass-rate-limit': 'benchmark-secret-key-12345' // Auto-bypass the API rate limiter
  };

  // If credentials are provided, perform login step
  if (email && password) {
    try {
      const baseUrl = new URL(targetUrl).origin;
      const loginUrl = `${baseUrl}/api/auth/login`;
      console.log(`Authenticating as: ${email}...`);
      
      const loginRes = await fetch(loginUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-bypass-rate-limit': 'benchmark-secret-key-12345'
        },
        body: JSON.stringify({ email, password })
      });
      
      if (!loginRes.ok) {
        throw new Error(`Login failed with status ${loginRes.status}: ${await loginRes.text()}`);
      }
      
      const loginData = await loginRes.json();
      if (!loginData.success || !loginData.token) {
        throw new Error(`Invalid login response structure: ${JSON.stringify(loginData)}`);
      }
      
      headers['Authorization'] = `Bearer ${loginData.token}`;
      console.log('Authentication successful! Token acquired.');
    } catch (err) {
      console.error(`\x1b[31mAuthentication Error: ${err.message}\x1b[0m`);
      process.exit(1);
    }
  }

  console.log('\nBenchmarking in progress...');
  
  const latencies = [];
  let successfulRequests = 0;
  let failedRequests = 0;
  let requestsSent = 0;
  const statusCodes = {};

  const testStartTime = performance.now();

  // Worker task queue
  async function worker() {
    while (requestsSent < requests) {
      const requestId = requestsSent++;
      if (requestId >= requests) break;

      const reqStart = performance.now();
      try {
        const response = await fetch(targetUrl, {
          method,
          headers,
          body: bodyString
        });

        const reqEnd = performance.now();
        const duration = reqEnd - reqStart;
        latencies.push(duration);

        const status = response.status;
        statusCodes[status] = (statusCodes[status] || 0) + 1;

        if (response.ok) {
          successfulRequests++;
        } else {
          failedRequests++;
        }
      } catch (err) {
        const reqEnd = performance.now();
        latencies.push(reqEnd - reqStart);
        failedRequests++;
        statusCodes['Network Error/Exception'] = (statusCodes['Network Error/Exception'] || 0) + 1;
      }
    }
  }

  // Spin up concurrent workers
  const workers = [];
  for (let i = 0; i < concurrency; i++) {
    workers.push(worker());
  }

  // Wait for all workers to finish
  await Promise.all(workers);

  const testEndTime = performance.now();
  const totalDurationSec = (testEndTime - testStartTime) / 1000;
  const rps = totalDurationSec > 0 ? requests / totalDurationSec : requests;

  // Calculate statistics
  latencies.sort((a, b) => a - b);
  const sum = latencies.reduce((a, b) => a + b, 0);
  const avg = sum / latencies.length;
  const min = latencies[0] || 0;
  const max = latencies[latencies.length - 1] || 0;
  
  const getPercentile = (p) => {
    if (latencies.length === 0) return 0;
    const index = Math.ceil((p / 100) * latencies.length) - 1;
    return latencies[index];
  };

  const p50 = getPercentile(50);
  const p90 = getPercentile(90);
  const p95 = getPercentile(95);
  const p99 = getPercentile(99);

  console.log('\n====================================================');
  console.log('                  RESULTS SUMMARY                   ');
  console.log('====================================================');
  console.log(`Total Time Elapsed:  ${totalDurationSec.toFixed(2)} seconds`);
  console.log(`Requests/sec (RPS):  ${rps.toFixed(2)}`);
  console.log(`Total Requests:      ${requests}`);
  console.log(`Successful (2xx):    \x1b[32m${successfulRequests}\x1b[0m`);
  console.log(`Failed (Non-2xx):    \x1b[31m${failedRequests}\x1b[0m`);
  
  console.log('\nStatus Code Distribution:');
  for (const [code, count] of Object.entries(statusCodes)) {
    const color = code.startsWith('2') ? '\x1b[32m' : '\x1b[31m';
    console.log(`  - Status [${color}${code}\x1b[0m]: ${count} times`);
  }

  console.log('\nLatency Metrics (Milliseconds):');
  console.log(`  - Min (Fastest):   ${min.toFixed(2)} ms`);
  console.log(`  - Average:         ${avg.toFixed(2)} ms`);
  console.log(`  - Median (50%):    ${p50.toFixed(2)} ms`);
  console.log(`  - 90% (Slowest):   ${p90.toFixed(2)} ms`);
  console.log(`  - 95% (Slowest):   ${p95.toFixed(2)} ms`);
  console.log(`  - 99% (Slowest):   ${p99.toFixed(2)} ms`);
  console.log(`  - Max (Slowest):   ${max.toFixed(2)} ms`);
  console.log('====================================================\n');
}

run().catch(err => {
  console.error('Fatal benchmark script error:', err);
});
