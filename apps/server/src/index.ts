import http from "http";
import SocketService from "./services/socket";
import { startMessageConsumer, initKafka } from "./services/kafka";

async function init() {
  initKafka().catch((error) =>
    console.error("Error in initializing Kafka:", error)
  );
  startMessageConsumer().catch((error) =>
    console.error("Error in Kafka consumer:", error)
  );
  const socketService = new SocketService();

  const httpServer = http.createServer();

  socketService.io.attach(httpServer);

  const PORT = process.env.PORT || 8000;

  httpServer.listen(PORT, () => console.log(`Server started on ${PORT}`));

  socketService.initListeners();
}

init();
