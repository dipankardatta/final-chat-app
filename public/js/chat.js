const ORIGIN = window.location.origin;
const STORED_CHATS_LENGTH = 10;

const token = localStorage.getItem('token');
const decodedToken = parseJwt(token);
const username = decodedToken.username;
const userId = decodedToken.userId;

const usernameNav = document.getElementById('username-nav');
const chatList = document.getElementById('chat-list');
const messageInput = document.getElementById('message');
const sendBtn = document.getElementById('send-btn');
const errorMsg = document.getElementById('err-msg');
const logoutBtn = document.getElementById('logout-btn');

function showUserInfoInDOM(){
    usernameNav.innerText = username.charAt(0).toUpperCase() + username.slice(1);
}

function showMyChatInDOM(message){
    const div = document.createElement('div');
    const div2 = document.createElement('div');
    div2.innerText = `${username}: ${message}`;
    div.className = 'd-flex flex-row-reverse my-1';
    div2.className = 'rounded bg-success text-light px-2 py-1';
    div.appendChild(div2);
    chatList.appendChild(div);
    messageInput.value = '';
}

function addMessage(){
    if(messageInput.value === ''){
        showErrorInDOM('Please enter message!');
        return;
    }

    const chat = {
        message: messageInput.value
    };

    axios.post(`${ORIGIN}/chat`, chat, { headers: {Authorization: token} })
    .then((res) => {
        const message = res.data.message;
        const messageId = res.data.id;
        const chat = {
            id: messageId,
            message,
            user: { username }
        };
        const oldChats = localStorage.getItem('oldChats') ? JSON.parse(localStorage.getItem('oldChats')) : [];
        oldChats.push(chat);
        const chats = oldChats.slice(oldChats.length - STORED_CHATS_LENGTH); // get the latest 10 chats
        localStorage.setItem('oldChats', JSON.stringify(chats));

        showMyChatInDOM(message);
    })
    .catch((err) => {
        const msg = err.response.data.msg ? err.response.data.msg : 'Could not add chat :(';
        showErrorInDOM(msg);
    });
}

function showChatInDOM(chat){
    const div = document.createElement('div');
    const div2 = document.createElement('div');
    div2.innerText = `${chat.user.username}: ${chat.message}`;
    if(username === chat.user.username){
        div.className = 'd-flex flex-row-reverse my-1';
        div2.className = 'rounded bg-success text-light px-2 py-1';
    }else{
        div.className = 'd-flex flex-row my-1';
        div2.className = 'rounded bg-secondary text-light px-2 py-1';
    }
    div.appendChild(div2);
    chatList.appendChild(div);
}

function showMessages(){
    const oldChats = localStorage.getItem('oldChats') ? JSON.parse(localStorage.getItem('oldChats')) : [];
    const lastmessageid = oldChats.length > 0 ? oldChats[oldChats.length-1].id : -1;

    axios.get(`${ORIGIN}/all-chats?lastmessageid=${lastmessageid}`)
    .then((res) => {
        const newChats = res.data;
        const totalChats = [...oldChats, ...newChats];
        const chats = totalChats.slice(totalChats.length - STORED_CHATS_LENGTH); // get the latest 10 chats
        localStorage.setItem('oldChats', JSON.stringify(chats));

        chatList.innerText = '';
        chats.forEach((chat) => {
            showChatInDOM(chat);
        });
    })
    .catch((err) => {
        const msg = err.response.data.msg ? err.response.data.msg : 'Could not fetch chats :(';
        showErrorInDOM(msg);
    });
}

function logout(){
    if(confirm('Are you sure you want to logout ?')){
        localStorage.clear();
        window.location.href = '/';
    }
}

function parseJwt (token) {
    var base64Url = token.split('.')[1];
    var base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    var jsonPayload = decodeURIComponent(window.atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    return JSON.parse(jsonPayload);
}

function showSuccessInDOM(msg){
    successMsg.innerText = msg;
    setTimeout(() => successMsg.innerText = '', 3000);
}

function showErrorInDOM(msg){
    errorMsg.innerText = msg;
    setTimeout(() => errorMsg.innerText = '', 3000);
}

window.addEventListener('DOMContentLoaded', () => {
    showUserInfoInDOM();
    showMessages();
    setInterval(showMessages, 5000); //get the chats from backend every 5 sec.
    sendBtn.addEventListener('click', addMessage);
    logoutBtn.addEventListener('click', logout);
});