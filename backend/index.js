const app = require("./app");
const http = require("http");

//utils
const config = require("./utils/config");

// connect to server
const server = http.createServer(app);

server.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
