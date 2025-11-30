import React, { useEffect, useState } from "react";
import { subscribeChat } from "../lib/chatService";
import { useParams } from "react-router-dom";

export default function OrderChatMonitor() {
  const { orderId } = useParams();
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const unsub = subscribeChat(orderId, (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    return () => unsub.unsubscribe();
  }, []);

  return (
    <div style={{ padding: 20 }}>
      <h1>Chat Order #{orderId}</h1>

      <div
        style={{
          border: "1px solid #ddd",
          borderRadius: 8,
          padding: 10,
          height: "80vh",
          overflowY: "scroll",
        }}
      >
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: 10 }}>
            <b>{m.sender}</b>: {m.message}
          </div>
        ))}
      </div>
    </div>
  );
}
