import * as http from 'http';
import * as p from 'path';
import * as fs from 'fs';

const server = http.createServer();
const publicPath = p.resolve(__dirname, 'public');

server.on('request', (request: http.IncomingMessage, response) => {

  const { url } = request;

  console.log(url, '------')

  switch (url) {
    case '/index.html':
      fs.readFile(p.join(publicPath, 'index.html'), (err, data) => {
        response.end(data);
      })
      break;
    case '/index.css':
      fs.readFile(p.join(publicPath, 'index.css'), (err, data) => {
        response.end(data);
      })
      break;
    case '/index.js':
      fs.readFile(p.join(publicPath, 'index.js'), (err, data) => {
        response.end(data);
      })
      break;
    default:
      response.end();
  }
});

server.listen(8888);
