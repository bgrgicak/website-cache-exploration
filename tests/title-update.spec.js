const { test, expect } = require("@playwright/test");
const { exec } = require("child_process");

const startServer = async (path, cache = false) => {
  return new Promise((resolve, reject) => {
    const cacheArg = cache ? "-- --cache" : "";
    const serverProcess = exec(
      `npm run server ${path} ${cacheArg}`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(`Error starting server: ${error.message}`);
          reject(error);
          return;
        }
        console.log(`Server started on port 3000`);
      }
    );

    // Wait for the server to start
    setTimeout(() => {
      resolve(serverProcess);
    }, 1000);
  });
};

const stopServer = (serverProcess) => {
  return new Promise((resolve, reject) => {
    if (!serverProcess) {
      reject(new Error("No server process provided"));
      return;
    }

    serverProcess.kill();
    serverProcess.on("exit", (code) => {
      console.log(`Server stopped with exit code ${code}`);
      resolve();
    });
  });
};

const startOldServer = async (cache = false) => {
  return await startServer("sites/old-title", cache);
};

const startNewServer = async (cache = false) => {
  return await startServer("sites/new-title", cache);
};

test.beforeEach(async ({ context }) => {
  await context.clearCookies();
  await context.clearPermissions();
});

test("a change to the page is reflected in the browser when caching is disabled", async ({
  page,
}) => {
  let serverProcess;
  try {
    serverProcess = await startOldServer();
    await page.goto("http://localhost:3000");
    await expect(page).toHaveTitle("Your Old Page Title");

    await stopServer(serverProcess);

    serverProcess = await startNewServer();
    await page.goto("http://localhost:3000");
    await expect(page).toHaveTitle("Your New Page Title");
  } finally {
    await stopServer(serverProcess);
  }
});

test("a cached response is returned when caching is enabled instead of a live response", async ({
  page,
}) => {
  let serverProcess;
  try {
    serverProcess = await startOldServer(true);
    await page.goto("http://localhost:3000");
    await expect(page).toHaveTitle("Your Old Page Title");

    await stopServer(serverProcess);

    serverProcess = await startNewServer(true);
    await page.goto("http://localhost:3000");
    // Why is Express returning the new title here if it's cached?
    await expect(page).toHaveTitle("Your Old Page Title");
  } finally {
    await stopServer(serverProcess);
  }
});
