"use client";

import { useSocket } from "./context/SocketProvider.context";
import Classes from "./page.module.css";
import { useState } from "react";

export default function Page() {
  const { sendMsg, messages } = useSocket();

  const [message, setMessage] = useState("");
  return (
    <>
      <div>
        <div>
          <input
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className={Classes["chat-input"]}
            placeholder="Message.."
          />
          <button
            onClick={(e) => {
              sendMsg(message);
              setMessage("");
            }}
            className={Classes["button"]}
          >
            Send
          </button>
        </div>
        <div>
          <h1>All messages will appear here</h1>
          {messages?.map((item, idx) => <li key={idx}>{item}</li>)}
        </div>
      </div>
    </>
  );
}
