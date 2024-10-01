const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Check if the --cache flag is present
const enableCaching = process.argv.includes('--cache');

const setCacheHeaders = (res, maxAge) => {
  if (enableCaching) {
    res.setHeader('Cache-Control', `public, max-age=${maxAge}`);
    res.setHeader('Expires', new Date(Date.now() + maxAge * 1000).toUTCString());
  }
};

// Serve static files from the 'public' directory with conditional cache headers
app.use(express.static(path.join(__dirname, 'public'), {
  setHeaders: (res, path) => {
    if (enableCaching) {
      if (path.endsWith('.html')) {
        setCacheHeaders(res, 3600); // Cache HTML files for 1 hour
      } else if (path.match(/\.(css|js|jpg|jpeg|png|gif|svg)$/)) {
        setCacheHeaders(res, 86400); // Cache other static assets for 1 day
      }
    }
  }
}));

// Catch-all route to serve index.html for any unmatched routes
app.get('*', (req, res) => {
  if (enableCaching) {
    setCacheHeaders(res, 3600); // Cache index.html for 1 hour
  }
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  console.log(`Caching is ${enableCaching ? 'enabled' : 'disabled'}`);
});
