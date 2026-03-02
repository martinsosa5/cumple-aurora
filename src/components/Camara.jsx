import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, Check, SwitchCamera } from 'lucide-react';
import marcoImg from '../assets/marco.png';

const Camara = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const streamRef = useRef(null);
    const [fotoCapturada, setFotoCapturada] = useState(null);
    const [modoCamara, setModoCamara] = useState("user"); 

    useEffect(() => {
        iniciarCamara();
        return () => detenerCamara();
    }, [modoCamara]);

    useEffect(() => {
        if (!fotoCapturada && streamRef.current && videoRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [fotoCapturada]);

    const iniciarCamara = async () => {
        detenerCamara();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: modoCamara,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Error cámara:", err);
        }
    };

    const detenerCamara = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
        }
    };

    const girarCamara = (e) => {
        e.stopPropagation();
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
        <div className="container text-center mt-3 mb-5 pb-5">
            {/* CONTENEDOR DE CÁMARA */}
            <div className="position-relative d-inline-block shadow-lg rounded bg-dark" 
                 style={{ width: '100%', maxWidth: '380px', aspectRatio: '9/16' }}>
                
                {/* La Cámara o la Foto */}
                <div className="w-100 h-100 rounded overflow-hidden">
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

                {/* BOTONES SUPERPUESTOS (FLOTANTES) */}
                <div className="position-absolute start-50 translate-middle-x w-100" 
                     style={{ bottom: '-45px', zIndex: 20 }}>
                    
                    {!fotoCapturada ? (
                        <div className="d-flex justify-content-center align-items-center gap-4">
                            {/* Espaciador para equilibrio visual */}
                            <div style={{ width: '50px' }}></div> 

                            {/* Botón Principal de Captura */}
                            <button className="btn btn-primary rounded-circle shadow-lg p-4 border-dark border-4" 
                                    onClick={capturarFoto}
                                    style={{ transform: 'scale(1.1)', borderColor: '#1a1a1a !important' }}>
                                <Camera size={45} />
                            </button>

                            {/* Botón Girar Cámara */}
                            <button 
                                className="btn btn-dark rounded-circle shadow border-dark border-2" 
                                style={{ 
                                    width: '50px', 
                                    height: '50px', 
                                    display: 'flex', 
                                    alignItems: 'center', 
                                    justifyContent: 'center', 
                                    backgroundColor: '#2c2c2c',
                                    borderColor: '#1a1a1a !important'
                                }}
                                onClick={girarCamara}
                            >
                                <SwitchCamera size={24} color="#f8bbd0" />
                            </button>
                        </div>
                    ) : (
                        <div className="d-flex gap-2 px-3">
                            <button className="btn btn-outline-secondary flex-grow-1 py-3 shadow fw-bold rounded-pill text-white border-dark border-2" 
                                    onClick={() => setFotoCapturada(null)}
                                    style={{ borderColor: '#1a1a1a !important', backgroundColor: 'rgba(26,26,26,0.8)' }}>
                                <RefreshCw size={20} className="me-2" /> Repetir
                            </button>
                            <button className="btn btn-success flex-grow-1 py-3 shadow fw-bold rounded-pill border-dark border-2" 
                                    onClick={() => alert("¡Listo para subir!")}
                                    style={{ borderColor: '#1a1a1a !important' }}>
                                <Check size={24} className="me-2" /> Subir
                            </button>
                        </div>
                    )}
                </div>
            </div>
            
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        </div>
    );
};

export default Camara;