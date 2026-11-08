const WS_URL = import.meta.env.VITE_WS_URL || "ws://localhost:5000";

export const connectWebSocket = (onMessage, onStatusChange) => {
  const socket = new WebSocket(WS_URL);

  socket.onopen = () => {
    console.log("WebSocket connected");
    onStatusChange(true);
  };

  socket.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      onMessage(data);
    } catch (error) {
      console.error("WebSocket message error:", error);
    }
  };

  socket.onclose = () => {
    console.log("WebSocket disconnected");
    onStatusChange(false);
  };

  socket.onerror = (error) => {
    console.error("WebSocket error:", error);
    onStatusChange(false);
  };

  return socket;
};