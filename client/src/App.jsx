import React, { useEffect, useState } from "react";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import ChatWindow from "./components/ChatWindow";
import UserBadge from "./components/UserBadge";
import { socket } from "./context/SocketContect";

const CHAT_ID = "6952c17e16d965cb462eac9b";

const App = () => {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState("");
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [typingUser, setTypingUser] = useState(null);

  const login = async (email, password) => {
    const res = await fetch("http://localhost:5000/api/v1/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    setUser(data.data.user);
    setAccessToken(data.data.accessToken);

    socket.auth = {
      accesstoken: data.data.accessToken,
      userId: data.data.user._id,
    };

    socket.connect();
  };

  useEffect(() => {
    socket.on("connect", () => {
      socket.emit("joinChat", { chatId: CHAT_ID });
    });

    socket.on("newMessage", (msg) => {
      setMessages((prev) => [...prev, msg]);
    });

    socket.on("typing", () => setTypingUser(true));
    socket.on("stopTyping", () => setTypingUser(null));

    return () => socket.off();
  }, []);

  const sendMessage = async () => {
    if (!text.trim()) return;

    await fetch("http://localhost:5000/api/v1/message/send-message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accesstoken: accessToken,
      },
      body: JSON.stringify({ chatId: CHAT_ID, text }),
    });

    setText("");
  };

  const readMessage = async (id) => {
    await fetch(`http://localhost:5000/api/v1/message/markas-read/${id}`, {
      method: "POST",
      headers: { accesstoken: accessToken },
    });
  };

  if (!user) return <Login onLogin={login} />;

  return (
    <>
      <UserBadge user={user} />

      <div style={{ display: "flex", marginTop: 60 }}>
        <Sidebar chats={[{ _id: CHAT_ID, name: "General Chat" }]} />
        <ChatWindow
          messages={messages}
          text={text}
          setText={setText}
          sendMessage={sendMessage}
          typingUser={typingUser}
          handleTyping={(e) => setText(e.target.value)}
          user={user}
          readMessage={readMessage}
        />
      </div>
    </>
  );
};

export default App;
