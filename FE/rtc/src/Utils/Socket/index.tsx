import * as io from "socket.io-client";

const socket = io.connect("http://192.168.1.160:9800");



export default socket;