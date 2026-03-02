import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, Check, SwitchCamera } from 'lucide-react';
import marcoImg from '../assets/marco.png';

const Camara = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [fotoCapturada, setFotoCapturada] = useState(null);
    const [modoCamara, setModoCamara] = useState("user"); 

    useEffect(() => {
        iniciarCamara();
    }, [modoCamara]);

    const iniciarCamara = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: modoCamara,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error cámara:", err);
        }
    };

    const girarCamara = () => {
        setModoCamara(prev => prev === "user" ? "environment" : "user");
    };

    const capturarFoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        canvas.width = 1080;
        canvas.height = 1920;

        const videoRatio = video.videoWidth / video.videoHeight;
        const canvasRatio = canvas.width / canvas.height;
        let dW, dH, dX, dY;

        if (videoRatio > canvasRatio) {
            dW = canvas.height * videoRatio; dH = canvas.height;
            dX = -(dW - canvas.width) / 2; dY = 0;
        } else {
            dW = canvas.width; dH = canvas.width / videoRatio;
            dX = 0; dY = -(dH - canvas.height) / 2;
        }

        if (modoCamara === "user") {
            context.translate(canvas.width, 0);
            context.scale(-1, 1);
        }

        context.drawImage(video, dX, dY, dW, dH);
        context.setTransform(1, 0, 0, 1, 0, 0);

        const imgMarco = new Image();
        imgMarco.src = marcoImg;
        imgMarco.onload = () => {
            context.drawImage(imgMarco, 0, 0, canvas.width, canvas.height);
            setFotoCapturada(canvas.toDataURL('image/jpeg', 0.8));
        };
    };

    return (
        <div className="container text-center mt-3">
            {/* VISTA PREVIA DE LA CÁMARA O FOTO */}
            <div className="position-relative d-inline-block shadow-lg rounded overflow-hidden bg-dark" 
                 style={{ width: '100%', maxWidth: '380px', aspectRatio: '9/16' }}>
                
                {!fotoCapturada ? (
                    <>
                        <video 
                            ref={videoRef} 
                            autoPlay 
                            playsInline 
                            muted
                            className="w-100 h-100" 
                            style={{ 
                                objectFit: 'cover', 
                                transform: modoCamara === "user" ? "scaleX(-1)" : "none" 
                            }}
                        />
                        {/* Marco flotante encima del video */}
                        <img 
                            src={marcoImg} 
                            className="position-absolute top-0 start-0 w-100 h-100" 
                            style={{ pointerEvents: 'none', zIndex: 10, objectFit: 'contain' }} 
                            alt="Filtro"
                        />
                    </>
                ) : (
                    <img src={fotoCapturada} className="w-100 h-100" style={{ objectFit: 'cover' }} alt="Captura" />
                )}
            </div>

            {/* BOTONES */}
            <div className="mt-4 d-flex justify-content-center align-items-center gap-4 pb-5">
                {!fotoCapturada ? (
                    <>
                        <div style={{ width: '50px' }}></div> 

                        <button className="btn btn-primary btn-lg rounded-circle p-4 shadow" onClick={capturarFoto}>
                            <Camera size={40} />
                        </button>

                        <button 
                            className="btn btn-dark rounded-circle shadow-sm border-0" 
                            style={{ 
                                width: '50px', 
                                height: '50px', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center', 
                                backgroundColor: '#2c2c2c' 
                            }}
                            onClick={girarCamara}
                        >
                            <SwitchCamera size={24} color="#f8bbd0" />
                        </button>
                    </>
                ) : (
                    <div className="d-flex gap-3 w-100 px-4">
                        <button className="btn btn-outline-secondary flex-grow-1 py-3 text-white border-secondary" onClick={() => setFotoCapturada(null)}>
                            <RefreshCw size={20} className="me-2" /> Repetir
                        </button>
                        <button className="btn btn-success flex-grow-1 py-3 shadow fw-bold" onClick={() => alert("¡Mañana conectamos Firebase!")}>
                            <Check size={24} className="me-2" /> Subir
                        </button>
                    </div>
                )}
            </div>
            
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        </div>
    );
};

export default Camara;