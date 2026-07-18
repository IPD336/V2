# SkillSwap Performance Testing & Optimization Guide

This guide details how to measure, analyze, and optimize both the frontend (React/Vite) and backend (Express/Node) performance of the SkillSwap application.

---

## 1. Backend API Benchmarking & APM

We have built a custom, dependency-free load-testing suite and an active APM (Application Performance Monitoring) middleware in the server.

### A. Real-Time APM Stats Endpoint
The server now tracks execution metrics (count, average duration, minimum duration, maximum duration, errors, status codes) for every route in-memory.

- **Endpoint**: `/api/admin/performance-stats`
- **Method**: `GET`
- **Security**: 
  - **Local Development**: Open to all requests to make benchmarking simple.
  - **Production**: Restricted to authenticated users with the `admin` role.
- **Clear Stats**: Send a `POST` request to `/api/admin/performance-stats/clear` to reset the metrics.

### B. Custom Benchmark Script
The standalone script in `server/scripts/benchmark.js` lets you simulate high traffic and measure latency percentiles and throughput. It automatically bypasses the server rate limiters using a secret header.

#### How to run it:
1. **Start the backend server**:
   ```bash
   cd server
   npm run dev
   ```
2. **Run a test against a public route** (e.g. 100 total requests, 10 concurrent):
   ```bash
   node server/scripts/benchmark.js --url http://localhost:5000/api/ping --requests 100 --concurrency 10
   ```
3. **Run a test against a protected/authenticated route**:
   If the route is protected (requires login), pass the `--email` and `--password` flags. The script will automatically log in first, retrieve a JWT, and run the test using the token:
   ```bash
   node server/scripts/benchmark.js --url http://localhost:5000/api/users/profile --email test@example.com --password mypassword --requests 50 --concurrency 5
   ```

---

## 2. Frontend Performance Testing (Lighthouse & Web Vitals)

Since the React app is served client-side, you want to optimize how fast the assets load, parse, and execute in the browser.

### A. Google PageSpeed Insights & Google Lighthouse
Google Lighthouse measures four categories: **Performance**, **Accessibility**, **Best Practices**, and **SEO**.

#### Method 1: Google PageSpeed Insights (Web)
1. Go to [PageSpeed Insights](https://pagespeed.web.dev/).
2. Enter your live Vercel frontend URL (e.g., `https://skillswapv2.vercel.app`).
3. View the core web vitals:
   - **LCP (Largest Contentful Paint)**: Measures loading speed (target `< 2.5s`).
   - **INP (Interaction to Next Paint)**: Measures responsiveness (target `< 200ms`).
   - **CLS (Cumulative Layout Shift)**: Measures visual stability (target `< 0.1`).

#### Method 2: Google Lighthouse (Local Chrome DevTools)
To test routes that require logging in, or to test your local server:
1. Start your client local server:
   ```bash
   cd client
   npm run dev
   ```
2. Open Chrome and go to `http://localhost:5173`.
3. Press `F12` to open Chrome DevTools, and switch to the **Lighthouse** tab.
4. Set device to **Mobile** or **Desktop** and select the categories you want to test.
5. Click **Analyze page load**.
6. Repeat for crucial routes (e.g., `/dashboard`, `/browse`, `/swaps`).

### B. Bundle Size Visualizer
Heavy NPM packages slow down initial page loads. We have integrated `rollup-plugin-visualizer` into the build process.

#### How to run it:
1. Run the build command in the `client` directory:
   ```bash
   cd client
   npm run build
   ```
2. Once the build finishes, look inside the `client/dist/` directory. You will see a file named `stats.html`.
3. Open `client/dist/stats.html` in any browser. It renders an interactive, color-coded map showing exactly which files and `node_modules` take up the most space.

---

## 3. Where and How to Improve Performance

If you identify slow routes or poor Lighthouse scores, here is how you can improve them:

### A. Database Optimization (MongoDB)
Database queries are the most common source of backend latency.
1. **Explain Queries**: In MongoDB Compass (local) or Atlas, use the `.explain("executionStats")` method on slow queries to check if they perform a full collection scan (`COLLSCAN`) instead of an index scan (`IXSCAN`).
2. **Add Indexes**: 
   - Ensure fields frequently used in `.find()`, `.sort()`, or `$match` are indexed.
   - For example, if you query users by league or rating:
     ```javascript
     userSchema.index({ league: 1, score: -1 });
     ```
3. **Select Only Needed Fields**: Avoid pulling full documents from the DB if you only need a few fields. Use `.select('name avatarUrl')` or `.project()`.

### B. Code Splitting & Lazy Loading (React)
- The app already uses `React.lazy()` for router components in `App.jsx`, which is excellent because it splits each page into separate JS files loaded only when a user visits that route.
- If you have heavy modals or components that aren't immediately visible (e.g. Chat windows, Code Editors), load them lazily using:
  ```javascript
  const HeavyModal = React.lazy(() => import('./HeavyModal'));
  ```

### C. Caching Slow/Expensive API Endpoints
- Endpoints that perform complex calculations or aggregates (like `/api/leaderboard`) should be cached.
- SkillSwap currently has an in-memory LRU cache in `server/utils/cache.js`. Leverage this cache for other read-heavy, low-frequency write endpoints.

### D. Image & Asset Optimization
- Do not upload raw images directly. Use Cloudinary (which is already in the project dependencies) to dynamically resize and compress images before serving them.
- Append parameters to Cloudinary URLs to request next-gen formats (like WebP/AVIF) and optimized quality, e.g., `q_auto,f_auto`.
