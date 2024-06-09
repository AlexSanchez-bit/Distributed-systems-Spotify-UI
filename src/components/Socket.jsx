import { useState, useEffect } from "react";
import { io } from "socket.io-client";

export const Socket = () => {
  const [socket, setSocket] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const socketIO = io("http://localhost:5000"); // Replace with your server URL
    setSocket(socketIO);

    socketIO.on("message", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    return () => socketIO.disconnect(); // Cleanup on component unmount
  }, []);

  const sendMessage = (message) => {
    if (socket) {
      socket.emit("message", message);
    }
  };

  sendMessage("holaa");

  return (
    <div>
      <ul>
        {messages.map((message) => (
          <li key={message}>{message}</li>
        ))}
      </ul>
      <input
        type="text"
        placeholder="Enter message"
        onKeyUp={(e) => {
          if (e.key === "Enter") {
            sendMessage(e.target.value);
            e.target.value = "";
          }
        }}
      />
    </div>
  );
};
