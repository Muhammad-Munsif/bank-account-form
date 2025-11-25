const http = require("http");
const server = http.createServer((req, res) => {
  res.write("hello sir");
  res.end("Hello, World!\n");
});
server.listen(8080);
