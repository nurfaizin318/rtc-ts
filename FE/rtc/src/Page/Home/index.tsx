import socket from '../../Utils/Socket'
import React, { useState } from 'react'
import { Link } from 'react-router-dom'

const Home = () => {



    const [room, setRoom] = useState<string>()
    const [name, setName] = useState<string>()


    const data = {room:room,name:name}

    React.useEffect(() => {


    })

    return (<div>

        <input placeholder="your name" onChange={(e) => { setName(e.target.value) }}></input>
        <input placeholder="input id" onChange={(e) => { setRoom(e.target.value) }}></input>

        <button onClick={()=>{socket.emit("stream",room)}}>
            <Link to={"/stream"} state={data}>
                create stream
            </Link>
        </button>

        <button onClick={()=>{socket.emit("join",room)}}>
            <Link to={`/watch/${room}`}>watch
            </Link>
        </button>


    </div>)
}

export default Home;