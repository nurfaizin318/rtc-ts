import socket from '../../Utils/Socket'
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './index.css'
import Logo from '../../assets/WebRTC_Log.png'

const Home = () => {



    const [room, setRoom] = useState<string>()
    const [name, setName] = useState<string>()
    const navigate = useNavigate();

    const data = { room: room, name: name }


    const handleWatch = () =>{
        socket.emit("join", room)
        navigate(`/watch/${room}`,{state:data})
    }

    const handleStream = () =>{
        socket.emit("stream", room)
        navigate("/stream",{state:data})
    }

    React.useEffect(() => {


    })

    return (
        <div className='container'>
            <div className='box'>
                <img src={Logo}  style={{width:"150px",height:"auto",margin:"10px auto"}}/>
                <input type='text' placeholder="Input Name" onChange={(e) => { setName(e.target.value) }}></input>
                <input type='text' placeholder="Input Room" onChange={(e) => { setRoom(e.target.value) }}></input>

                <button className='button1' onClick={handleStream}>
                 Stream
                </button>
            
                <button  className='button2' onClick={handleWatch}>
                    Watch
                </button>
           
            </div>
        </div>
    )
}

export default Home;