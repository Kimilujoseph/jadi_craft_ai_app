# WebSocket Integration Guide for Frontend

This guide explains how to connect to the backend WebSocket server to receive real-time updates for chat messages and sessions.

## 1. Connection

First, establish a WebSocket connection to the server. The URL will be the same as the backend server's address, but using the `ws` (or `wss` for secure connections) protocol.

```javascript
// Example: Connecting to a local server
const ws = new WebSocket('ws://localhost:3001');
```

## 2. Authentication

Immediately after the connection is established (`onopen` event), you must authenticate the client by sending an `auth` message containing the user's valid JWT token.

The server will not send any data until the connection is authenticated.

**Authentication Message Format:**

```json
{
  "type": "auth",
  "token": "YOUR_JWT_TOKEN"
}
```

### Example: Authenticating on Connection

```javascript
ws.onopen = () => {
  console.log('WebSocket connection established.');
  
  const token = localStorage.getItem('jwt_token'); // Or wherever you store the token
  
  if (token) {
    const authMessage = {
      type: 'auth',
      token: token
    };
    ws.send(JSON.stringify(authMessage));
  } else {
    console.error('No JWT token found. Cannot authenticate WebSocket.');
    ws.close();
  }
};
```

## 3. Listening for Server Messages

Once authenticated, the server will start pushing messages to the client. All messages from the server are JSON strings with a `type` and a `payload`.

You should handle incoming messages in the `onmessage` event handler.

### Message Structure

```typescript
interface ServerMessage {
  type: 'auth_success' | 'auth_error' | 'new_message' | 'new_chat' | 'error';
  payload?: any;
  message?: string;
}
```

### Example: Handling Incoming Messages

```javascript
ws.onmessage = (event) => {
  try {
    const serverMessage = JSON.parse(event.data);
    console.log('Received message from server:', serverMessage);

    switch (serverMessage.type) {
      case 'auth_success':
        console.log('WebSocket authentication successful!');
        break;
        
      case 'auth_error':
        console.error('WebSocket authentication failed:', serverMessage.message);
        // Handle auth failure, perhaps by redirecting to login
        ws.close();
        break;

      case 'new_message':
        // A new message for an existing chat has arrived.
        // The payload is a full Message object.
        const newMessage = serverMessage.payload;
        // Example: dispatch an action to add the message to the correct chat in your state
        // addMessageToChat(newMessage.chatId, newMessage);
        break;

      case 'new_chat':
        // A new chat session has been created.
        // The payload is a full Chat object.
        const newChat = serverMessage.payload;
        // Example: dispatch an action to add the new chat to your list of chats
        // addNewChat(newChat);
        break;
        
      case 'error':
        console.error('Received error from server:', serverMessage.message);
        break;
        
      default:
        console.warn('Received unknown message type:', serverMessage.type);
    }
  } catch (error) {
    console.error('Error parsing server message:', error);
  }
};
```

## 4. Example Payloads

The `payload` for `new_message` and `new_chat` events will match the structure of the corresponding models in the database.

### `new_message` Payload

```json
{
  "type": "new_message",
  "payload": {
    "id": "123",
    "chatId": "17",
    "role": "assistant",
    "content": "This is the AI's response...",
    "precis": "AI response summary.",
    "audioUrl": "https://path/to/audio.mp3",
    "fallbackUsed": false,
    "status": "COMPLETED",
    "createdAt": "2025-10-07T12:00:00.000Z"
  }
}
```

### `new_chat` Payload

```json
{
  "type": "new_chat",
  "payload": {
    "id": "18",
    "userId": "1",
    "title": "The first question of the chat...",
    "summary": "This chat is about: The first question...",
    "createdAt": "2025-10-07T12:05:00.000Z",
    "updatedAt": "2025-10-07T12:05:00.000Z"
  }
}
```

## 5. Handling Disconnections

You should also implement logic to handle when the connection is closed (`onclose` event), for example, by attempting to reconnect after a short delay.

```javascript
ws.onclose = (event) => {
  console.log('WebSocket connection closed.', event.code, event.reason);
  // Optional: Implement a reconnection strategy here
  // setTimeout(() => {
  //   console.log('Attempting to reconnect WebSocket...');
  //   // Re-initialize the WebSocket connection
  // }, 5000); // Reconnect after 5 seconds
};

ws.onerror = (error) => {
  console.error('WebSocket error:', error);
  ws.close();
};
```
