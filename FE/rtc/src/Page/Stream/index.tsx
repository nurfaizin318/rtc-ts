
import socket from '../../Utils/Socket'
import { useLocation } from 'react-router-dom';
import React, { useEffect, useState, useRef } from 'react'
import "./index.css"

interface MessageList {
    name: string,
    message: string
}


interface InitData {
    room: string,
    name: string,
}

const Stream = () => {





    const [initData, setInitData] = useState<InitData>()
    const [message, setMessage] = useState<string>()
    const [listMessage, setListMessage] = useState<MessageList[]>([])
    const location = useLocation();
    const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
    const [sdp, setSdp] = useState<string>("")

    const videoElement = useRef<HTMLVideoElement>(null)// ini untuk menampilkan video di streamer
    var videoStream = useRef<MediaStream | null>(null) // ini untuk mengirim video ke remote stream





    const getUserMedia = () => {



        navigator.getUserMedia = (navigator.getUserMedia ||
            navigator.webkitGetUserMedia ||
            navigator.mozGetUserMedia ||
            navigator.msGetUserMedia);


        const config = {
            video: true,
            audio: true
        }
        navigator.mediaDevices.getUserMedia(config)
            .then(stream => {


                let video = videoElement.current
                video!.srcObject = stream


                videoStream.current = stream

                video!.play()
            })
            .then(() => {
                console.log("add track success")
            })
            .catch(error => console.error("error", error));



    }




    const createOffer = async (toId: string) => {

        const configuration: RTCConfiguration = { iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] };
        const peerConnection = new RTCPeerConnection(configuration);


        peerConnectionRef.current = peerConnection




        if (videoStream.current) {
            try {
                videoStream.current.getTracks().forEach(tracks => { peerConnection.addTrack(tracks, videoStream.current!) })

            } catch (error) {
                console.log(error)
            }


        }


        peerConnection.onconnectionstatechange = e => {
            console.log(e)
        }

        peerConnection.onnegotiationneeded = async () => {
            console.log("abc")
        }


        peerConnection.onicecandidate = event => {
            const { candidate } = event;
            // Kirim ICE candidate ke pihak lain (misalnya, melalui WebSocket)
            if (candidate) {
                // console.log(JSON.stringify(candidate))
                return socket.emit("candidate", toId, JSON.stringify(candidate))
            }
        }



        const offerOptions: RTCOfferOptions = {
            offerToReceiveAudio: true,
            offerToReceiveVideo: true,

        };



        peerConnectionRef!.current.createOffer(offerOptions)
            .then((sdp) => {

                let parseSDP = JSON.stringify(sdp)

                setSdp(parseSDP)
                if (peerConnectionRef.current) {
                    peerConnectionRef!.current.setLocalDescription(sdp).then(() => {
                        console.log("sucess create local description")
                    });
                    socket.emit("offer", toId, JSON.stringify(sdp))
                }


            })
            .then(() => {
                console.log("succes create offer")
            })
            .catch((error) => {
                console.log("failed create offer with error : ", error)
            })


    }


    const createRemoteDescription = (sdp: string) => {

        let answer = JSON.parse(sdp)
        if (peerConnectionRef.current) {
            peerConnectionRef.current.setRemoteDescription(new RTCSessionDescription(answer))
                .then(() => {
                    console.log("success createRemoteDescription")
                    console.log(peerConnectionRef.current)
                })
                .catch((error) => {
                    console.log("failed createRemoteDescription with error : ", error)
                })
        }



    }


    socket.on("message", (name: string, message: string) => {

        setListMessage([...listMessage, { name: name, message: message }])

    })

    useEffect(() => {

        getUserMedia()

        setInitData({ name: location.state.name, room: location.state.room })



        socket.on("watch", (fromId: string,) => {

            createOffer(fromId)

        })

        socket.on("answer", (sdp: string) => {

            createRemoteDescription(sdp)
            console.log("answer")

        })






        return () => {
            socket.off("watch", createOffer);
            socket.off("answer", createRemoteDescription);
            socket.off("message");
            socket.off("room_not_found");
        };


    }, [])




    return (

        <div className="main-container">
            <div className="stream-video-stream">
                <video className="video" autoPlay ref={videoElement} />
            </div>
            <div className="stream-chat-container">
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
                <div className='stream-chat-input'>
                    <input style={{ width: "80%" }} placeholder="message" onChange={(e) => { setMessage(e.target.value) }}></input>
                    <button onClick={() => { socket.emit("sendMessage", initData, message) }}>send</button>
                </div>

            </div>
        </div>

    )
}

export default Stream;