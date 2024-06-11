import { Server } from "socket.io";
import Redis from "ioredis";

const pub = new Redis({
  host: "127.0.0.1",
  port: 6379,
});

const sub = new Redis({
  host: "127.0.0.1",
  port: 6379,
});

class SocketService {
  private readonly REDIS_CHANNEL = "MESSAGES";
  private readonly _io: Server;
  constructor() {
    console.log("___Socker Server Init___");
    this._io = new Server({
      cors: {
        allowedHeaders: ["*"],
        origin: "*",
      },
    });

    sub.subscribe(this.REDIS_CHANNEL);
  }

  get io() {
    return this._io;
  }

  public initListeners() {
    const io = this.io;

    console.log("Socket listeners initialized");

    io.on("connect", async (socket) => {
      console.log("new Socket Connected", socket.id);

      socket.on("event:message", async ({ message }: { message: string }) => {
        console.log("New msg rec:", message);
        await pub.publish(this.REDIS_CHANNEL, JSON.stringify({ message }));
        // publish this msg to redis
      });
    });

    sub.on("message", async (channel, message) => {
      if (channel === this.REDIS_CHANNEL) {
        io.emit("message", message);
      }
      console.log("channel:", channel);
      console.log("message:", message);
    });
  }
}

export default SocketService;
