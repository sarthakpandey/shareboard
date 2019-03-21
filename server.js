const express = require("express");
const path = require("path");
const http = require("http");
const socketio = require("socket.io");

const app = express();

const httpServer = http.createServer(app);

const FRONTEND_PATH = path.join(__dirname, "public");

const io = socketio(httpServer);

app.use(express.static(FRONTEND_PATH));

let result = [];

io.on("connection", socket => {
  
    socket.on('refresh', ()=>{
        result = [];
        return;
    })

    socket.on("reDraw", data => {
    let id = data.id;

    for (res of result) {
      io.to(id).emit("drawing", res);
    }
  });

  socket.on("drawing", data => {
    result.push(data);
    socket.broadcast.emit("drawing", data);
  });
});

httpServer.listen(2222, () => {
  console.log("Backend Server started");
});
