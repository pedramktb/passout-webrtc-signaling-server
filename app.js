const WebSocket = require('ws');
const https = require('https');
const fs = require('fs');
const path = require('path');

const PORT = 8080;

const sslOptions = {
    key: fs.readFileSync(path.join(__dirname, 'key.key')),
    cert: fs.readFileSync(path.join(__dirname, 'cert.crt'))
};

const server = https.createServer(sslOptions);

const wss = new WebSocket.Server({ server });

let clients = [];

wss.on('connection', (ws) => {
    console.log('Client connected');
    clients.push(ws);

    ws.on('message', (message) => {
        let data;
        try {
            data = JSON.parse(message);
        } catch (e) {
            console.error('Invalid JSON:', e);
            return;
        }
        console.log('Received:', data);

        clients.forEach((client) => {
            if (client !== ws && client.readyState === WebSocket.OPEN) {
                client.send(JSON.stringify(data));
            }
        });
    });

    ws.on('close', () => {
        clients = clients.filter(client => client !== ws);
    });
});


server.listen(PORT, () => {
    console.log(`Signaling server running on wss://localhost:${PORT}`);
});