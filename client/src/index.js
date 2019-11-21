let username;

setUsername = (event) => {
    event.preventDefault();
    username = document.querySelector('#username').value;
    const form = document.querySelector('#username_form');

    document.querySelector('.floating_bar').innerHTML = "Chatting as: " + username;
    form.remove();

    establishConnection();
};

establishConnection = () => {
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
            case 'message_broadcast':
                console.log('message broadcast event!', metaData);
                let li = document.createElement('li');
                li.classList.add('msg');
                let username = document.createElement('b');
                username.innerText = metaData.data.from;
                username.classList.add('msg__username');

                li.innerText = metaData.data.value;
                li.appendChild(username);

                document.querySelector('#chat').append(li);
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

