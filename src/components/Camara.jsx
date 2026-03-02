import React, { useRef, useEffect, useState } from 'react';
import { Camera, RefreshCw, Check } from 'lucide-react';
import marcoImg from '../assets/marco.png';

const Camara = () => {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const [fotoCapturada, setFotoCapturada] = useState(null);
    const [cargandoCamara, setCargandoCamara] = useState(true);

    useEffect(() => {
        iniciarCamara();
    }, []);

    const iniciarCamara = async () => {
        setCargandoCamara(true);
        try {
            // Pedimos resolución específica para que coincida con el marco vertical
            const constraints = {
                video: {
                    facingMode: "user",
                    width: { ideal: 1080 },
                    height: { ideal: 1920 }
                },
                audio: false
            };
            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setCargandoCamara(false);
        } catch (err) {
            console.error("Error cámara:", err);
            alert("Error: Por favor, habilita la cámara en la configuración de tu iPhone/Navegador.");
        }
    };

    const capturarFoto = () => {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // IMPORTANTE: El canvas debe tener el tamaño del MARCO para no distorsionar
        // Usamos las medidas estándar de tu diseño de Photoshop
        canvas.width = 1080;
        canvas.height = 1920;

        // 1. Dibujamos el video adaptándolo al tamaño del canvas (Cover)
        const videoRatio = video.videoWidth / video.videoHeight;
        const canvasRatio = canvas.width / canvas.height;
        let drawWidth, drawHeight, drawX, drawY;

        if (videoRatio > canvasRatio) {
            drawHeight = canvas.height;
            drawWidth = canvas.height * videoRatio;
            drawX = -(drawWidth - canvas.width) / 2;
            drawY = 0;
        } else {
            drawWidth = canvas.width;
            drawHeight = canvas.width / videoRatio;
            drawX = 0;
            drawY = -(drawHeight - canvas.height) / 2;
        }

        context.drawImage(video, drawX, drawY, drawWidth, drawHeight);

        // 2. Dibujamos el marco encima
        const imgMarco = new Image();
        imgMarco.src = marcoImg;
        imgMarco.onload = () => {
            context.drawImage(imgMarco, 0, 0, canvas.width, canvas.height);
            const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
            setFotoCapturada(dataUrl);
        };
    };

    const reintentar = () => {
        setFotoCapturada(null);
        // Pequeño timeout para asegurar que el elemento video se monte antes de iniciar
        setTimeout(() => iniciarCamara(), 100);
    };

    return (
        <div className="container text-center mt-3">
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
                            style={{ objectFit: 'cover' }}
                        />
                        <img 
                            src={marcoImg} 
                            className="position-absolute top-0 start-0 w-100 h-100" 
                            style={{ pointerEvents: 'none', zIndex: 10, objectFit: 'contain' }} 
                        />
                        {cargandoCamara && (
                            <div className="position-absolute top-50 start-50 translate-middle text-white">
                                <RefreshCw className="spinner-border border-0" />
                            </div>
                        )}
                    </>
                ) : (
                    <img src={fotoCapturada} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                )}
            </div>

            <div className="mt-4 d-flex justify-content-center gap-3 pb-5">
                {!fotoCapturada ? (
                    <button 
                        className="btn btn-primary btn-lg rounded-circle p-4 shadow" 
                        onClick={capturarFoto}
                        disabled={cargandoCamara}
                    >
                        <Camera size={40} />
                    </button>
                ) : (
                    <>
                        <button className="btn btn-outline-danger btn-lg px-4" onClick={reintentar}>
                            <RefreshCw size={20} className="me-2" /> Repetir
                        </button>
                        <button className="btn btn-success btn-lg px-4 shadow" onClick={() => alert("Subiendo...")}>
                            <Check size={24} className="me-2" /> Subir foto
                        </button>
                    </>
                )}
            </div>
            <canvas ref={canvasRef} style={{ display: 'none' }}></canvas>
        </div>
    );
};

export default Camara;