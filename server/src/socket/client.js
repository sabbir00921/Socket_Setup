const chalk = require("chalk");
const { io } = require("socket.io-client");

const CHAT_ID = "695321808aca9c5837aee55b"; // chat room id
const USER_ID = ""; // logged-in user id

const socket = io("http://localhost:5000", {
  query: { userId: USER_ID },
  transports: ["websocket"],
});

/* ================= CONNECT ================= */
socket.on("connect", () => {
  console.log(chalk.yellow(` Connected to chat server `));
  console.log(chalk.yellow(`🔌 Socket connected: ${socket.id}`));
  console.log(chalk.yellow(`💬 Joined chat room: ${CHAT_ID}`));

  // Join chat room
  socket.emit("joinChat", { chatId: CHAT_ID });
});

/* ================= CHAT EVENTS ================= */


// Receive new message
socket.on("newMessage", (payload) => {
  console.log(
    chalk.cyan("[NEW MESSAGE]"),
    payload.sender?.name || payload.sender,
    ":",
    payload.text
  );
});

//message read
socket.on("messageRead", (payload) => {
  console.log("👁", payload.text, "read by", payload.readBy.name);
});

// Typing indicator
socket.on("typing", ({ userId }) => {
  console.log(chalk.gray(`✍️  User ${userId} is typing...`));
});

socket.on("stopTyping", ({ userId }) => {
  console.log(chalk.gray(`🛑 User ${userId} stopped typing`));
});

/* ================= SIMULATE USER ACTION ================= */

// Simulate typing
setTimeout(() => {
  socket.emit("typing", { chatId: CHAT_ID, userId: USER_ID });
}, 2000);

setTimeout(() => {
  socket.emit("stopTyping", { chatId: CHAT_ID, userId: USER_ID });
}, 4000);

/* ================= DISCONNECT ================= */
socket.on("disconnect", () => {
  console.log(chalk.red("❌ Disconnected from server"));
});

/* ================= ERROR ================= */
socket.on("connect_error", (err) => {
  console.log(chalk.bgRed("Connection Error"), err.message);
});
