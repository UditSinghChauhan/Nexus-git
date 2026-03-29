let ioInstance = null;

function setSocketServer(io) {
  ioInstance = io;
}

function getSocketServerUrl() {
  return (
    process.env.BACKEND_PUBLIC_URL ||
    process.env.SOCKET_SERVER_URL ||
    `http://127.0.0.1:${process.env.PORT || 3000}`
  );
}

async function publishThroughSocketServer(eventName, payload) {
  const { io } = require("socket.io-client");

  await new Promise((resolve, reject) => {
    const socket = io(getSocketServerUrl(), {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: false,
      timeout: 1500,
    });

    socket.on("connect", () => {
      socket.emit("vcs:publish", { eventName, payload });
      setTimeout(() => {
        socket.close();
        resolve();
      }, 100);
    });

    socket.on("connect_error", (error) => {
      socket.close();
      reject(error);
    });
  });
}

async function emitSocketEvent(eventName, payload) {
  if (!ioInstance) {
    try {
      await publishThroughSocketServer(eventName, payload);
    } catch (err) {
      return;
    }

    return;
  }

  ioInstance.emit(eventName, payload);
}

module.exports = {
  emitSocketEvent,
  setSocketServer,
};
