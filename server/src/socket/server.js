let io = null;
const { Server } = require("socket.io");
const { CustomError } = require("../helpers/customError");

module.exports = {
  initSocket: (httpServer) => {
    if (io) return io;

    io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });

    io.on("connection", (socket) => {
      if (process.env.NODE_ENV !== "production") {
        console.log("🔌 Socket connected:", socket.id);
      }

      /* ========== USER ROOM ========== */
      const userId = socket.handshake.query?.userId;
      if (userId) {
        socket.join(userId);
        console.log("👤 User joined personal room:", userId);
      }

      /* ========== CHAT ROOM ========== */
      socket.on("joinChat", ({ chatId }) => {
        if (!chatId) return;
        socket.join(chatId);
        console.log(`💬 Joined chat room: ${chatId}`);
      });

      socket.on("leaveChat", ({ chatId }) => {
        if (!chatId) return;
        socket.leave(chatId);
        console.log(`🚪 Left chat room: ${chatId}`);
      });

      /* ========== TYPING ========== */
      socket.on("typing", ({ chatId, userId }) => {
        if (!chatId || !userId) return;
        socket.broadcast.to(chatId).emit("typing", { userId });
      });

      socket.on("stopTyping", ({ chatId, userId }) => {
        if (!chatId || !userId) return;
        socket.broadcast.to(chatId).emit("stopTyping", { userId });
      });

      socket.on("disconnect", () => {
        if (process.env.NODE_ENV !== "production") {
          console.log("❌ Socket disconnected:", socket.id);
        }
      });
    });

    return io;
  },

  getIo: () => {
    if (!io) {
      throw new CustomError(500, "Socket.io not initialized");
    }
    return io;
  },
};
