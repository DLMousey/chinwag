const WebSocket = require('ws');
const uuid = require('uuid');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    ws.id = uuid.v4();

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        console.log('Received: ', message + ' from ID: ' + ws.id + ' with username: ' + ws.username);

        switch (data.msg_type) {
            case 'username_init':
                ws.username = data.value;
                break;
            case 'message_send':
                broadcast(JSON.stringify({
                    msg_type: 'message_broadcast',
                    data: {
                        from: ws.username,
                        value: data.value
                    }
                }));
                break;
        }
    });

    ws.on('open', (event) => {
        console.log('open event received at server', event);
    })
});

function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

function reply(data) {

}