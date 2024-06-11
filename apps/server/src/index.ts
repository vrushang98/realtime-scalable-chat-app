import http from "http";
import SocketService from "./services/socket";

async function init() {
  const socketService = new SocketService();

  const httpServer = http.createServer();

  socketService.io.attach(httpServer);

  const PORT = process.env.PORT || 8000;

  httpServer.listen(PORT, () => console.log(`Server started on ${PORT}`));

  socketService.initListeners();
}

init();
