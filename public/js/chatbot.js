// Initialize Socket.io connection
const socket = io();

// DOM elements
const chatForm = document.getElementById('chat-form');
const chatInput = document.getElementById('chat-input');
const chatMessages = document.getElementById('chat-messages');
const chatStatus = document.getElementById('chat-status');

// Update chat status based on connection
socket.on('connect', () => {
    updateChatStatus(true);
});

socket.on('disconnect', () => {
    updateChatStatus(false);
});

// Handle form submission
chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const message = chatInput.value.trim();
    if (!message) return;
    
    // Add user message to chat
    addMessageToChat('user', message);
    
    // Send message to server
    socket.emit('chatMessage', message);
    
    // Show typing indicator
    showTypingIndicator();
    
    // Clear input
    chatInput.value = '';
    chatInput.focus();
});

// Handle bot responses
socket.on('botReply', (response) => {
    // Remove typing indicator
    removeTypingIndicator();
    
    // Add bot message to chat
    addMessageToChat('bot', response);
});

// Helper function to add message to chat
function addMessageToChat(sender, message) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', sender);
    
    // Create avatar
    const avatarElement = document.createElement('div');
    avatarElement.classList.add('avatar', sender === 'user' ? 'user-avatar' : 'bot-avatar');
    avatarElement.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';
    
    // Create message content
    const contentElement = document.createElement('div');
    contentElement.classList.add('message-content');
    
    // If it's a bot message and contains HTML, render it as HTML
    if (sender === 'bot' && (message.includes('<br>') || message.includes('<strong>'))) {
        contentElement.innerHTML = message;
    } else {
        contentElement.textContent = message;
    }
    
    // Assemble message
    if (sender === 'user') {
        messageElement.appendChild(contentElement);
        messageElement.appendChild(avatarElement);
    } else {
        messageElement.appendChild(avatarElement);
        messageElement.appendChild(contentElement);
    }
    
    // Add message to chat
    chatMessages.appendChild(messageElement);
    
    // Scroll to bottom
    scrollToBottom();
}

// Helper function to show typing indicator
function showTypingIndicator() {
    const typingElement = document.createElement('div');
    typingElement.classList.add('message', 'bot', 'typing-indicator-container');
    
    const avatarElement = document.createElement('div');
    avatarElement.classList.add('avatar', 'bot-avatar');
    avatarElement.innerHTML = '<i class="fas fa-robot"></i>';
    
    const contentElement = document.createElement('div');
    contentElement.classList.add('message-content');
    
    const indicatorElement = document.createElement('div');
    indicatorElement.classList.add('typing-indicator');
    indicatorElement.innerHTML = '<span></span><span></span><span></span>';
    
    contentElement.appendChild(indicatorElement);
    typingElement.appendChild(avatarElement);
    typingElement.appendChild(contentElement);
    
    chatMessages.appendChild(typingElement);
    
    scrollToBottom();
}

// Helper function to remove typing indicator
function removeTypingIndicator() {
    const typingElement = document.querySelector('.typing-indicator-container');
    if (typingElement) {
        typingElement.remove();
    }
}

// Helper function to scroll chat to bottom
function scrollToBottom() {
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Helper function to update chat status
function updateChatStatus(isOnline) {
    chatStatus.textContent = isOnline ? 'Online' : 'Offline';
    chatStatus.classList.toggle('text-red-500', !isOnline);
}

// Initial welcome message
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        addMessageToChat('bot', 'Hello! I\'m your Resume Scout AI assistant. How can I help you with your resume or job search today?');
    }, 500);
}); 