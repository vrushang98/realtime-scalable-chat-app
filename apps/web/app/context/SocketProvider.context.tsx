"use client";

import {
  FC,
  ReactNode,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { Socket, io } from "socket.io-client";

interface ISocketContext {
  sendMsg: (msg: string) => any;
  messages: string[];
}
const SocketContext = createContext<ISocketContext | null>(null);

export const useSocket = () => {
  const state = useContext(SocketContext);

  if (!state) throw new Error(`state is undefined`);

  return state;
};

export const SocketProvider: FC<{ children?: ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket>();
  const [messages, setMessages] = useState<string[]>([]);

  const sendMsg: ISocketContext["sendMsg"] = useCallback(
    (msg: string) => {
      console.log("Send Msg:", msg);
      if (socket) {
        socket.emit("event:message", { message: msg });
      }
    },
    [socket]
  );

  const onMessageRec = useCallback((msg: string) => {
    console.log("From server msg rec:", msg);

    const message = JSON.parse(msg)?.message ?? "";
    setMessages((prev) => [...prev, message]);
  }, []);

  useEffect(() => {
    const _socket = io("localhost:8000");
    _socket.on("message", onMessageRec);
    setSocket(_socket);

    return () => {
      _socket.disconnect();
      _socket.off("message");
      setSocket(undefined);
    };
  }, []);

  return (
    <SocketContext.Provider value={{ sendMsg, messages }}>
      {children}
    </SocketContext.Provider>
  );
};
