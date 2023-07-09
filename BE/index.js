const express = require("express");
const app = express();
const { Server } = require("socket.io");
const port = process.env.PORT || 9800;
const http = require("http").createServer(app)
  ;
const cors = require("cors");
const { json } = require("express");


const io = new Server(http, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }))


app.get("/", (req, res) => {
  res.status(200).send({
    success: true,
    message: "welcome to the beginning of greatness",
  });
});


app.use(cors())

var dataStream = {}


io.sockets.on("connection", socket => {


  socket.on("stream", (room) => {

    socket.join(room)

    console.log(socket.id, "stream to room ", room)

  
    dataStream[room] = {'streamer':socket.id}
    


  })


  socket.on("join", (room) => {

    socket.join(room)

    console.log(socket.id, "join to room ", room)
  })


  socket.on("sendMessage", (data, message) => {


    io.in(data.room).emit('message', data.name, message)


  })

  socket.on("watch", (room) => {
   
    console.log("data ", dataStream)

    if(dataStream[room]){
      io.to(dataStream[room].streamer).emit("watch",socket.id)

    }else{
      io.to(socket.id).emit("room_not_found")
    }

  })

  socket.on("offer",(toId,sdp)=>{
    io.to(toId).emit("offer",sdp)
    console.log("offer")
  })


  socket.on("answer",(room,sdp)=>{
    io.to(dataStream[room].streamer).emit("answer",sdp)
  })


  socket.on("candidate",(toId,candidate)=>{
    io.to(toId).emit("ice_candidate",candidate)
  })

  

});




//Listen the HTTP Server 
http.listen(port, () => {
  console.log("Server Is Running Port: " + port);
});