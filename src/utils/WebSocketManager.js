class WebSocketManager {
  constructor() {
    // Using a Map to store clients, mapping userId to the WebSocket object.
    this.clients = new Map();
  }


  addClient(userId, ws) {
    this.clients.set(userId, ws);
    console.log(`WebSocket client connected for user: ${userId}`);
  }


  removeClient(userId) {
    if (this.clients.has(userId)) {
      this.clients.delete(userId);
      console.log(`WebSocket client disconnected for user: ${userId}`);
    }
  }


  sendMessageToUser(userId, message) {
    const client = this.clients.get(userId);
    if (client && client.readyState === client.OPEN) {
      try {
        const messageString = JSON.stringify(message);
        client.send(messageString);
        console.log(`Sent message to user ${userId}:`, message.type);
      } catch (error) {
        console.error(`Failed to send message to user ${userId}:`, error);
      }
    } else {
      console.warn(`Could not send message: No open WebSocket connection found for user ${userId}.`);
    }
  }
}

// Export a singleton instance so the whole app shares one manager
const webSocketManager = new WebSocketManager();
export default webSocketManager;
