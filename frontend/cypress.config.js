const { defineConfig } = require("cypress");

module.exports = defineConfig({
    e2e: {
        baseUrl: "http://127.0.0.1:8000",
        supportFile: false,
        video: true,
        screenshotOnRunFailure: true,
        defaultCommandTimeout: 15000,
        viewportWidth: 1280,
        viewportHeight: 720,
    },
});
