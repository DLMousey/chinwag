import './style.css';

let tempConn;
let username;

(function() {
    tempConn = new WebSocket('ws://localhost:8080');

    tempConn.onmessage = (event) => {
        const metadata = JSON.parse(event.data);
        if (metadata.msg_type === 'client_list_broadcast') {
            buildClientList(metadata.data);
        }
    }
})();

document.querySelector('#username_form').addEventListener('submit', (event) => {
    console.log('username form submitted');
    event.preventDefault();
    username = document.querySelector('#username').value;
    const form = document.querySelector('#username_form');

    document.querySelector('.floating_bar').innerHTML = "Chatting as: " + username;
    form.remove();

    establishConnection();
});

function buildClientList(clients) {
    const list = document.querySelector('.clients__list');
    while (list.firstChild) {
        list.removeChild(list.firstChild);
    }

    clients.forEach((client) => {
        const node = document.createElement('li');
        const id = document.createElement('small');
        const usrname = document.createElement('b');

        id.innerText = client.id;
        usrname.innerText = client.username;

        node.classList.add('client');
        id.classList.add('client__id');
        usrname.classList.add('client__username');

        node.appendChild(id);
        node.appendChild(usrname);

        list.appendChild(node);
    });
}

function establishConnection() {
    tempConn.close();
    const connection = new WebSocket('ws://localhost:8080');

    connection.onopen = () => {
        connection.send(JSON.stringify({
            msg_type: 'username_init',
            value: username
        }));
        console.log('onopen event - connection established');
    };

    connection.onclose = () => {
        console.log('onclose event - connection terminated');
    };

    connection.onerror = (err) => {
        console.error('onerror event - failed to connect', err);
    };

    connection.onmessage = (event) => {
        const metaData = JSON.parse(event.data);

        console.log(metaData);
        switch (metaData.msg_type) {
            case 'client_list_broadcast':
                buildClientList(metaData.data);
                break;
            case 'message_broadcast':
                console.log('message broadcast event!', metaData);
                let li = document.createElement('li');
                li.classList.add('message');
                let username = document.createElement('b');
                username.innerText = metaData.data.from;
                username.classList.add('message__username');

                li.innerText = metaData.data.value;
                li.appendChild(username);

                document.querySelector('.chat__messages').append(li);
                break;
        }
    };

    document.querySelector('form').addEventListener('submit', (event) => {
        event.preventDefault();
        let message = document.querySelector('#message').value;
        connection.send(JSON.stringify({
           msg_type: 'message_send',
           value: message
        }));
        document.querySelector('#message').value = '';
    });
}

