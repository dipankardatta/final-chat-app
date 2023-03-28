const token = localStorage.getItem('token');
const decodedToken = parseJwt(token);
const username = decodedToken.username;
const userId = decodedToken.userId;
const chats = localStorage.getItem('chats') ? JSON.parse(localStorage.getItem('chats')) : [];

const usernameNav = document.getElementById('username-nav');
const chatList = document.getElementById('chat-list');
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('send-btn');

function showUserInfoInDOM(){
    usernameNav.innerText = username;
}

function showUserJoinedInDOM(){
    const li = document.createElement('li');
    li.innerText = `${username} joined`;
    li.id = userId;
    li.className = 'list-group-item';
    chatList.appendChild(li);
    chats.push({ username, userId, message: 'joined' });
    localStorage.setItem('chats', JSON.stringify(chats));
}

function addMessageInDOM(){
    const li = document.createElement('li');
    li.innerText = `${username}: ${messageInput.value}`;
    li.id = userId;
    li.className = 'list-group-item';
    chatList.appendChild(li);
    chats.push({ username, userId, message: messageInput.value });
    localStorage.setItem('chats', JSON.stringify(chats));
    messageInput.value = '';
}

function showMessagesInDOM(){
    chats.forEach((chat) => {
        const li = document.createElement('li');
        if(chat.message === 'joined'){
            li.innerText = `${chat.username} ${chat.message}`;
        }else{
            li.innerText = `${chat.username}: ${chat.message}`;
        }
        li.id = chat.userId;
        li.className = 'list-group-item';
        chatList.appendChild(li);
    });
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

window.addEventListener('DOMContentLoaded', () => {
    showUserInfoInDOM();
    showMessagesInDOM();
    showUserJoinedInDOM();
    sendBtn.addEventListener('click', addMessageInDOM);
});