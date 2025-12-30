# 🔌 Socket.IO Documentation

This document explains the **Socket.IO architecture and flow used in this project**, exactly matching the current backend and client implementation. You can copy this section directly into your **README.md**.

---

## 📌 Overview

Socket.IO is used for **real-time chat features**, including:

* User-based personal rooms
* Chat room join/leave
* Typing indicators
* Real-time message & read events

The socket server is initialized **once** and shared across the application.

---

## 🏗️ Project Architecture

```
src/
├── socket/
│   └── server.js        # Socket initialization & event handlers
├── helpers/
│   └── customError.js
├── routes/
│   └── index.api.js
├── app.js / server.js   # Express + HTTP + Socket bootstrap
```

---

## 🔌 Socket Initialization (Singleton Pattern)

The socket server is initialized only once using a **singleton pattern**.

```js
let io = null;

initSocket(httpServer) → initializes socket
getIo() → returns existing socket instance
```

### Why Singleton?

* Prevents multiple socket servers
* Allows emitting events from controllers
* Ensures global access via `getIo()`

---

## 🌐 Server Setup Flow

```js
const server = http.createServer(app);
const io = initSocket(server);
```

* Express creates HTTP server
* Socket.IO attaches to the same server
* Socket instance is exported globally

---

## 👤 User Identification (Personal Rooms)

Each client sends `userId` during connection:

```js
io("http://localhost:5000", {
  query: { userId }
});
```

On connection, the server assigns a **personal room**:

```js
const userId = socket.handshake.query?.userId;
if (userId) {
  socket.join(userId);
}
```

### ✅ Result

* Each user has a private room named after their `userId`
* Enables direct notifications & private events

```js
io.to(userId).emit("notification", data);
```

---

## 💬 Chat Room Handling

Users explicitly join or leave chat rooms.

### Join Chat Room

```js
socket.emit("joinChat", { chatId });
```

```js
socket.on("joinChat", ({ chatId }) => {
  socket.join(chatId);
});
```

### Leave Chat Room

```js
socket.emit("leaveChat", { chatId });
```

```js
socket.on("leaveChat", ({ chatId }) => {
  socket.leave(chatId);
});
```

---

## ✍️ Typing Indicator Flow

### Client Emits

```js
socket.emit("typing", { chatId, userId });
socket.emit("stopTyping", { chatId, userId });
```

### Server Broadcasts (excluding sender)

```js
socket.broadcast.to(chatId).emit("typing", { userId });
socket.broadcast.to(chatId).emit("stopTyping", { userId });
```

### Purpose

* Real-time typing indicator
* Broadcasts only to other users in the same chat room

---

## 📩 Message & Read Events (Server Emits)

These events are usually emitted from controllers using `getIo()`.

### New Message

```js
io.to(chatId).emit("newMessage", payload);
```

### Message Read

```js
io.to(chatId).emit("messageRead", payload);
```

---

## 🧪 Test Client (Node.js)

A Node-based socket client is used for testing:

* Connects with `userId`
* Joins chat room
* Simulates typing
* Listens for messages

This helps validate socket behavior without frontend UI.

---

## ❌ Disconnection Handling

```js
socket.on("disconnect", () => {
  console.log("Socket disconnected");
});
```

Automatically removes socket from all rooms.

---

## ⚠️ Error Handling

```js
socket.on("connect_error", (err) => {
  console.log(err.message);
});
```

---

## 🚀 Best Practices Used

* ✅ Singleton socket initialization
* ✅ Room-based architecture
* ✅ Broadcast excluding sender
* ✅ Environment-based logging
* ❌ No multiple socket instances

---

## 📦 Event Summary

| Event          | Direction       | Description                |
| -------------- | --------------- | -------------------------- |
| `joinChat`     | Client → Server | Join a chat room           |
| `leaveChat`    | Client → Server | Leave a chat room          |
| `typing`       | Client → Server | User started typing        |
| `stopTyping`   | Client → Server | User stopped typing        |
| `newMessage`   | Server → Client | New chat message           |
| `messageRead`  | Server → Client | Message read update        |
| `notification` | Server → Client | User-specific notification |

---

## 📚 Socket.IO Events – Learning Guide

This section explains **each socket event step-by-step**, why it exists, and how it works in this architecture.

---

## 🔌 `connection` Event

### What it does

Triggered automatically when a client connects to the socket server.

### Server Side

```js
io.on("connection", (socket) => {
  console.log("Socket connected", socket.id);
});
```

### Why it matters

* Entry point of all socket communication
* Used to identify users
* Assign rooms

---

## 👤 Personal User Room (`userId`)

### What it does

Creates a **private room per user** for direct events.

### Server Side

```js
const userId = socket.handshake.query?.userId;
if (userId) socket.join(userId);
```

### Use cases

* Notifications
* Private messages
* Presence updates

---

## 💬 `joinChat` Event

### What it does

Adds the user to a **chat-specific room**.

### Client Side

```js
socket.emit("joinChat", { chatId });
```

### Server Side

```js
socket.on("joinChat", ({ chatId }) => {
  socket.join(chatId);
});
```

### Why it matters

* Enables group messaging
* Limits message broadcast to chat members

---

## 🚪 `leaveChat` Event

### What it does

Removes the socket from a chat room.

### Client Side

```js
socket.emit("leaveChat", { chatId });
```

### Server Side

```js
socket.on("leaveChat", ({ chatId }) => {
  socket.leave(chatId);
});
```

### Why it matters

* Stops receiving messages
* Saves server resources

---

## ✍️ `typing` Event

### What it does

Notifies other users that someone is typing.

### Client Side

```js
socket.emit("typing", { chatId, userId });
```

### Server Side

```js
socket.broadcast.to(chatId).emit("typing", { userId });
```

### Why `broadcast`?

* Prevents sender from receiving their own typing event

---

## 🛑 `stopTyping` Event

### What it does

Stops the typing indicator.

### Client Side

```js
socket.emit("stopTyping", { chatId, userId });
```

### Server Side

```js
socket.broadcast.to(chatId).emit("stopTyping", { userId });
```

---

## 📩 `newMessage` Event

### What it does

Sends a new message to all users in a chat room.

### Server Emit (Controller)

```js
io.to(chatId).emit("newMessage", payload);
```

### Client Listener

```js
socket.on("newMessage", (data) => {
  console.log(data);
});
```

---

## 👁 `messageRead` Event

### What it does

Notifies chat members that a message has been read.

### Server Emit

```js
io.to(chatId).emit("messageRead", payload);
```

---

## 🔔 `notification` Event

### What it does

Sends **user-specific notifications**.

### Server Emit

```js
io.to(userId).emit("notification", data);
```

### Why personal room?

* Only target user receives the event

---

## ❌ `disconnect` Event

### What it does

Triggered when a user disconnects.

### Server Side

```js
socket.on("disconnect", () => {
  console.log("User disconnected");
});
```

### Why it matters

* Cleanup
* Online/offline tracking

---

## 🧠 Important Socket Concepts (Must Learn)

### `socket.emit`

Sends event to **current socket only**.

### `socket.broadcast.emit`

Sends event to **everyone except sender**.

### `io.emit`

Sends event to **all connected users**.

### `io.to(room).emit`

Sends event to **specific room or user**.

### `socket.join(room)`

Adds socket to a room.

### `socket.leave(room)`

Removes socket from a room.

---

## 🔐 Security Reminder

Currently using `query.userId` (development).

For production:

* Use JWT in `socket.handshake.auth`
* Verify token in `io.use()` middleware

---

## ✅ Learning Outcome

After understanding this document, you should be able to:

* Build a real-time chat system
* Design room-based socket architecture
* Debug socket events confidently
* Explain Socket.IO in interviews

---

🎯 **This is a complete learning-focused Socket.IO documentation aligned with your real project.**
