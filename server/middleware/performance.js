const stats = new Map();
let totalRequests = 0;
const processStart = Date.now();

function getRouteKey(req) {
  // Use req.route.path if matched, e.g., /api/users/:id
  // req.baseUrl provides the base path, e.g., /api/users
  if (req.route && req.route.path) {
    const basePath = req.baseUrl || '';
    return `${req.method} ${basePath}${req.route.path}`;
  }
  // Fallback for unmatched routes or static files
  return `${req.method} ${req.baseUrl || ''}${req.path}`;
}

function performanceMiddleware(req, res, next) {
  const start = process.hrtime();
  totalRequests++;

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const durationMs = (diff[0] * 1e9 + diff[1]) / 1e6; // Convert to milliseconds
    const routeKey = getRouteKey(req);
    const statusCode = res.statusCode;
    const isError = statusCode >= 400;

    let routeStats = stats.get(routeKey);
    if (!routeStats) {
      routeStats = {
        route: routeKey,
        count: 0,
        totalDuration: 0,
        minDuration: Infinity,
        maxDuration: -Infinity,
        errors: 0,
        statusCodes: {},
      };
      stats.set(routeKey, routeStats);
    }

    routeStats.count++;
    routeStats.totalDuration += durationMs;
    if (durationMs < routeStats.minDuration) routeStats.minDuration = durationMs;
    if (durationMs > routeStats.maxDuration) routeStats.maxDuration = durationMs;
    if (isError) routeStats.errors++;

    routeStats.statusCodes[statusCode] = (routeStats.statusCodes[statusCode] || 0) + 1;
  });

  next();
}

function getStats() {
  const result = [];
  const mem = process.memoryUsage();

  for (const [key, value] of stats.entries()) {
    result.push({
      route: value.route,
      count: value.count,
      avgDurationMs: Math.round((value.totalDuration / value.count) * 100) / 100,
      minDurationMs: Math.round(value.minDuration * 100) / 100,
      maxDurationMs: Math.round(value.maxDuration * 100) / 100,
      errors: value.errors,
      statusCodes: value.statusCodes,
    });
  }

  return {
    uptimeSeconds: Math.floor((Date.now() - processStart) / 1000),
    totalRequests,
    memoryUsage: {
      rss: Math.round(mem.rss / 1024 / 1024 * 100) / 100 + ' MB',
      heapTotal: Math.round(mem.heapTotal / 1024 / 1024 * 100) / 100 + ' MB',
      heapUsed: Math.round(mem.heapUsed / 1024 / 1024 * 100) / 100 + ' MB',
      external: Math.round(mem.external / 1024 / 1024 * 100) / 100 + ' MB',
    },
    routes: result.sort((a, b) => b.avgDurationMs - a.avgDurationMs), // Sort by slowest average response time
  };
}

function clearStats() {
  stats.clear();
  totalRequests = 0;
}

module.exports = {
  performanceMiddleware,
  getStats,
  clearStats,
};
