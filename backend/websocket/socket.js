const WebSocket = require("ws");

let wss;

const initializeWebSocket = (server) => {
  wss = new WebSocket.Server({ server });

  console.log("WebSocket server initialized");

  wss.on("connection", (ws) => {
    console.log("Dashboard connected through WebSocket");

    ws.send(
      JSON.stringify({
        type: "CONNECTED",
        message: "Real-time connection established"
      })
    );

    ws.on("close", () => {
      console.log("Dashboard disconnected");
    });
  });
};

const broadcast = (data) => {
  if (!wss) return;

  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(JSON.stringify(data));
    }
  });
};

module.exports = {
  initializeWebSocket,
  broadcast
};