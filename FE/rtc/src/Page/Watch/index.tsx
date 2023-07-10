
import socket from '../../Utils/Socket'
import React, { useState, useRef } from 'react'
import { useParams ,useLocation} from 'react-router-dom';

import "./index.css"



interface MessageList {
    name: string,
    message: string
}

interface InitData {
    room: string,
    name: string,
}


const Watch = () => {


    const [initData, setInitData] = useState<InitData>()
    const { room } = useParams();
    const videoElement = useRef<HTMLVideoElement>(null)
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const [listMessage, setListMessage] = useState<MessageList[]>([])
    const [message, setMessage] = useState<string>()
    const location = useLocation();
    // const [sdp, setSdp] = useState<string>("")




    const createRemoteDescription = (sdp: string) => {

        const value = JSON.parse(sdp)

        if (peerConnectionRef.current) {
            peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(value))
                .then(() => {
                    console.log("sucess create remote descriprion")
                })
                .then(() => {
                    createAnswewr()
                })
                .catch((error) => {
                    console.log("failed setRemoteDescription with error :", error)
                })
        }




    }

    const createAnswewr = () => {


        if (peerConnectionRef.current) {
            peerConnectionRef.current.createAnswer()
                .then((sdp) => {
                    if (peerConnectionRef.current) {
                        peerConnectionRef.current.setLocalDescription(sdp);
                        let answer = JSON.stringify(sdp)
                        // setSdp(answer)
                        socket.emit("answer", room, answer)
                    }

                    // text.current.value = JSON.stringify(sdp)
                })
                .then(() => {
                    console.log("success create answer")
                })
                .catch((error) => {
                    console.log("failed create answer with error : ", error)
                })
        }

    }


    const addIceCandidate = (candidate: string) => {

        // setelah melakukan riset ice candidate yang bisa membentuk koneksi adalah ice candidate yang pertama 

        const candidateParse: RTCIceCandidate = JSON.parse(candidate)
        if (peerConnectionRef.current) {
            peerConnectionRef.current.addIceCandidate(candidateParse)
                .then(() => {

                    console.log("success ad ice candidate")
                })
                .catch((error) => {
                    console.log("failed add candidate with error : ", error)
                })

        }



    }


    socket.on("message", (name: string, message: string) => {
        console.log(message)


        setListMessage([...listMessage, { name: name, message: message }])

    })

    React.useEffect(() => {

        setInitData({ name: location.state.name, room: location.state.room })

        socket.emit("watch", room)




        socket.on("offer", (sdp: string) => {

            createRemoteDescription(sdp)
            console.log("offer")


        })

        socket.on("room_not_found", () => {
            alert("room not found")
        })


        socket.on("ice_candidate", (candidate: string) => {
            addIceCandidate(candidate)

        })
        const configuration: RTCConfiguration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
        const peerConnection = new RTCPeerConnection(configuration);

        peerConnectionRef.current = peerConnection


        peerConnection.ontrack = e => {

            console.log("ontrack", e.streams[0])

            const remoteStream = new MediaStream()

            e.streams[0].getTracks().forEach((track) => {
                remoteStream.addTrack(track)


            })

            if (videoElement.current) {
                videoElement.current.srcObject = remoteStream;
            }

        }



        return () => {
            socket.off("watch");
            socket.off("offer", createRemoteDescription);
            socket.off("message");
            socket.off("room_not_found");
        };





    }, [])



    return (
        <div className="main-container">
            <>{initData?.room}</>
            <div className="video-stream">
                <video className="video" style={{ width: "400px" }} autoPlay ref={videoElement} />
            </div>
            <div className="chat-container">

               
                    <div className="watch-chat-container">
                        <div style={{ fontWeight: "bold", fontSize: "20px" }}>
                            your name : {initData?.name}
                            <p>
                                room : {initData?.room}
                            </p>

                        </div>
                        <div style={{ backgroundColor: "white", height: "80%", textAlign: "left", padding: "10px", borderRadius: 5 }}>
                            {listMessage.map((data: MessageList, index: number) => {
                                return (
                                    <div key={index}>{data.name} : {data.message} </div>
                                )
                            })}
                        </div>
                        <div className='watch-chat-input'>
                            <input style={{ width: "80%" }} placeholder="message" onChange={(e) => { setMessage(e.target.value) }}></input>
                            <button onClick={() => { socket.emit("sendMessage", initData, message) }}>send</button>
                        </div>

                    </div>
                </div>

            </div>
      
    )
}

export default Watch;