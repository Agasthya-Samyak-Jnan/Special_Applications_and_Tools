document.addEventListener('DOMContentLoaded', async () => {
    const message_form = document.getElementById('message_form');
    const msg_box = document.getElementById('message_box');
    const msg_list = document.getElementById('message_list');
    const receiver_box = document.getElementById('receiver_box');
    const send_button = document.getElementById('send');
    const clear_button = document.getElementById('clear');
    const enter_chat_button = document.getElementById('enter_chat');
    const logout_button = document.getElementById('logout');

    // Connect to the Socket.io server to receive and send messages.
    const socket = io();

    // Register User's socket connection to the chat server.
    socket.emit('register', username); 

    // Fetch previous messages from the server between Logged-in User and required User and display them.
    async function FetchPreviousMessages (receiverUser) {
        try {
            clearMessage();
            const response = await fetch(`/api/messages/${receiverUser}`);
            if (response.ok) {
                const messages = await response.json();
                messages.forEach((msg) => { displayMessage(msg.sender_id, msg.msg); });
            } 
            else { console.error("Failed to load messages:", response.statusText); }
        } 
        catch (error) { console.error("Error fetching messages:", error); }
    }

    // Clear previous Messages from Front Page and DataBase.
    async function ClearPreviousMessages (receiverUser) {
        try {
            const response = await fetch(`/api/delete-messages/${receiverUser}`);
            if (response.ok) {
                clearMessage();
                alert('Chat History cleared.');
            }
            else {
                console.error("Failed to delete messages:", response.statusText);
            }
        }
        catch (error) {
            console.error("Error deleting messages:", error);
        }
    }

    // To Display Chat History
    function displayMessage(sender, message) {
        // Create a new HTML element to display the message and fill it with message text.
        const msg = document.createElement('p');
        msg.textContent = `${sender}: ${message}`;
        // Append it to the Chat or currently running message list.
        msg_list.appendChild(msg);
        // Clear Message Input Box
        msg_box.value = '';
    }

    // To clear Chat History
    function clearMessage () {
        msg_list.replaceChildren();
    }

    // Listen for messages from the server
    socket.on('receive-message', (data) => {
        console.log('Message received:', data); // Debugging line
        displayMessage(data.sender, data.message);
    });

    // Enter Chat with a specific user.
    enter_chat_button.addEventListener('click', function(event) {
        event.preventDefault();
        const receiverUser = receiver_box.value;
        FetchPreviousMessages(receiverUser);
    });

    // Clear Chat History Routing for Frontend 
    clear_button.addEventListener('click', async function(event) {
        event.preventDefault();
        const receiverUser = receiver_box.value;
        ClearPreviousMessages(receiverUser);
    });
    
    // Detect send message Activity / Event.
    send_button.addEventListener('click', function(event) {
        
        event.preventDefault();

        const message = msg_box.value;
        const receiver = receiver_box.value;

        if (!receiver) {
            alert("Please enter the receiver name."); // Alert if inputs are empty
            return;
        }

        if (!message) {
            alert("Message Cannot be Empty."); // Alert if inputs are empty
            return;
        }

        // Emit the message to the server
        socket.emit('send-message', {
            message: message,
            sender: username, 
            receiver: receiver
        });

        // Display User's Own Message to them Locally.
        displayMessage(username,message);

        console.log('Message sent.', { message, receiver }); // Debugging.
    });

    // Logout Event Handler
    logout_button.addEventListener('click', async function(event) {
        try {
            const response = await fetch('/logout', { method: 'POST'} );
            if (response.ok) { 
                window.location.href = '/signin';
                alert('Logged Out Succesfully'); 
            }
            else { console.error("Failed to Log Out:", response.statusText); }
        }
        catch (error) {
            console.error("Failed to Log Out:", error);
        }
    }) 
});