import io from "socket.io-client";

const conn = io.connect("http://0.0.0.0:80");

conn.on("connect", ()=>{
    console.log("CONNECTED");
})