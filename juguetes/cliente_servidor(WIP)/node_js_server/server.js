const http = require('http');
const fs = require('fs');

const port = 3000;
const host = 'localhost';

const server = http.createServer((req, res) => {
    console.log('request made');
    console.log(req.url, req.method);
    
    //res.writeHead(200, { 'Content-Type': 'text/plain' });
    //res.write('Servidor node js');
    //res.end('finalizacion de la respuesta');

    //res.writeHead(200, { 'Content-Type': 'text/html' });
    //res.write('<head><link rel="stylesheet" href="#"></head>');
    //res.write('<p>Servidor node js</p>');
    //res.write('<p>finalizacion de la respuesta</p>');
    //res.end();

    //res.writeHead(200, { 'Content-Type': 'text/html' });
    
    res.setHeader('Content-Type', 'text/html');

    let path = "./views/";
    switch(req.url){
        case '/':
            path += 'index.html';
            res.statusCode = 200;
            break;
        case '/about':
            path += 'about.html';
            res.statusCode = 200;
            break;
        case '/about-me':
            res.statusCode = 301;
            res.setHeader('Location', '/about');
            res.end();
            break;
        default:
            path += '404.html';
            res.statusCode = 404;
            break;
    }

    fs.readFile(path,(err, data) => {
        if(err){
            console.log(err)
            res.end();
        }else{
            //res.write(data);
            res.end(data);
        }
    })
});

server.listen(port, host, () => {
    console.log(`Server running at http://${host}:${port}/`);
});
