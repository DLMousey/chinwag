const WebSocket = require('ws');
const uuid = require('uuid');
const wss = new WebSocket.Server({ port: 8080 });

wss.on('connection', (ws) => {
    if (!ws.hasOwnProperty('id')) {
        ws.id = uuid.v4();
    }

    broadcast(JSON.stringify({
        msg_type: 'client_list_broadcast',
        data: buildClientList()
    }));

    ws.on('message', (message) => {
        const data = JSON.parse(message);
        switch (data.msg_type) {
            case 'username_init':
                ws.username = data.value;
                broadcast(JSON.stringify({
                    msg_type: 'client_list_broadcast',
                    data: buildClientList()
                }));
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
            case 'request_id':
                ws.send(JSON.stringify({
                    msg_type: 'response_id',
                    value: ws.id
                }));
                break;
        }
    });

    ws.on('close', () => {
        broadcast(JSON.stringify({
            msg_type: 'client_list_broadcast',
            data: buildClientList()
        }));
    });
});

function broadcast(data) {
    wss.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

function buildClientList() {
    const clients = [];
    wss.clients.forEach((client) => {
        clients.push({id: client.id, username: client.username || 'Anonymous'});
    });

    return clients;
}