import './style.css';

const conn = new WebSocket('ws://localhost:8080');
// const username = localStorage.getItem('ws_username');

if (!localStorage.getItem('ws_username')) {
    buildUsernameForm();
}

document.addEventListener('storage', () => {
    if (localStorage.getItem('ws_username')) {
        buildMessageForm();
    } else {
        buildUsernameForm();
    }
});

conn.onopen = (event) => {
    const username = localStorage.getItem('ws_username');
    if (username) {

        conn.send(JSON.stringify({
            msg_type: 'username_init',
            value: username
        }));

        buildMessageForm();
    }
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
    localStorage.setItem('ws_username', username);
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

function buildUsernameForm() {
    const parent = document.querySelector('.form');
    const form = document.createElement('form');
    form.setAttribute('id', 'username_form');

    const label = document.createElement('label');
    label.setAttribute('for', 'username');
    label.innerText = "Username:";

    const input = document.createElement('input');
    input.setAttribute('type', 'text');
    input.setAttribute('id', 'username');

    const button = document.createElement('button');
    button.setAttribute('type', 'submit');
    button.innerText = "Set username";

    form.appendChild(label);
    form.appendChild(input);
    form.appendChild(button);

    form.addEventListener('submit', (event) => {
        console.log('username form submitted');
        event.preventDefault();

        localStorage.setItem('ws_username', input.value);
        document.querySelector('#username_form').remove();
    });

    parent.appendChild(form);
}

function buildMessageForm() {
    const parent = document.querySelector('.form');
    const form = document.createElement('form');
    form.setAttribute('id', 'message_form');
    form.classList.add('form__message');

    const textarea = document.createElement('textarea');
    textarea.setAttribute('id', 'message');
    textarea.setAttribute('placeholder', 'Type your message and press enter to send');
    textarea.addEventListener('keydown', (event) => {
        if (event.keyCode === 13 && !event.shiftKey) {
            event.preventDefault();
            conn.send(JSON.stringify({
                msg_type: 'message_send',
                value: textarea.value
            }));

            textarea.setSelectionRange(0, 0);
            textarea.value = "";
        }
        console.log('keydown!');
    });

    form.appendChild(textarea);
    parent.appendChild(form);
}

// document.querySelector('#message_form').addEventListener('submit', (event) => {
//     event.preventDefault();
//     let message = document.querySelector('#message').value;
//     conn.send(JSON.stringify({
//        msg_type: 'message_send',
//        value: message
//     }));
//     document.querySelector('#message').value = '';
// });