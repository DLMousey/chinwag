import './style.css';

const conn = new WebSocket('ws://localhost:8080');

document.querySelector('#username_form').addEventListener('submit', (event) => {
    console.log('username form submitted');
    event.preventDefault();

    const username = document.querySelector('#username').value;
    document.querySelector('.floating_bar').innerHTML = "Chatting as: " + username;
    initUsername(username);

    document.querySelector('#username_form').remove();
});

conn.onopen = (event) => {
    if (!localStorage.getItem('ws_identifier')) {
        conn.send(JSON.stringify({
            msg_type: 'request_id'
        }));
    }

    console.log('on open!', event);
};

conn.onmessage = (event) => {
    const metaData = JSON.parse(event.data);
    switch (metaData.msg_type) {
        case 'client_list_broadcast':
            buildClientList(metaData.data);
            break;
        case 'message_broadcast':
            appendMessage(metaData.data);
            break;
        case 'response_id':
            localStorage.setItem('ws_identifier', metaData.value);
    }
};

function initUsername(username) {
    conn.send(JSON.stringify({
        msg_type: 'username_init',
        value: username
    }));
}

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

function appendMessage(data) {
    let li = document.createElement('li');
    li.classList.add('message');
    let username = document.createElement('b');
    username.innerText = data.from;
    username.classList.add('message__username');

    li.innerText = data.value;
    li.appendChild(username);

    document.querySelector('.chat__messages').append(li);
}

document.querySelector('form').addEventListener('submit', (event) => {
    event.preventDefault();
    let message = document.querySelector('#message').value;
    conn.send(JSON.stringify({
       msg_type: 'message_send',
       value: message
    }));
    document.querySelector('#message').value = '';
});