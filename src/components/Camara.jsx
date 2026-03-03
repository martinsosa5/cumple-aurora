import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Camera, RefreshCw, Check, SwitchCamera, Sparkles } from 'lucide-react';
import { FaceMesh } from '@mediapipe/face_mesh';

import marcoImg from '../assets/marco.png';
import lentesImg from '../assets/lentes.png';
import gorroImg from '../assets/gorro.png';

const Camara = () => {
    const videoRef = useRef(null);
    const canvasOverlayRef = useRef(null);
    const canvasProcesadoRef = useRef(null);
    const streamRef = useRef(null);
    const faceMeshRef = useRef(null);
    
    const [fotoCapturada, setFotoCapturada] = useState(null);
    const [modoCamara, setModoCamara] = useState("user");
    const [filtroActivo, setFiltroActivo] = useState(false);
    const [predicciones, setPredicciones] = useState(null);

    // Pre-cargar imágenes para evitar parpadeos y que no aparezcan
    const assets = useMemo(() => {
        const imgL = new Image(); imgL.src = lentesImg;
        const imgG = new Image(); imgG.src = gorroImg;
        const imgM = new Image(); imgM.src = marcoImg;
        return { lentes: imgL, gorro: imgG, marco: imgM };
    }, []);

    // 1. Inicializar FaceMesh y Cámara
    useEffect(() => {
        const faceMesh = new FaceMesh({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });

        faceMesh.setOptions({
            maxNumFaces: 1,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });

        faceMesh.onResults((results) => {
            const landmarks = results.multiFaceLandmarks ? results.multiFaceLandmarks[0] : null;
            setPredicciones(landmarks);
            if (filtroActivo && landmarks) drawOverlay(landmarks);
        });

        faceMeshRef.current = faceMesh;
        iniciarCamara();
        
        return () => detenerCamara();
    }, [modoCamara]);

    // 2. Vincular video al volver de "Repetir"
    useEffect(() => {
        if (!fotoCapturada && streamRef.current && videoRef.current) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [fotoCapturada]);

    // 3. Loop de procesamiento de frames
    useEffect(() => {
        let timer;
        const enviarFrame = async () => {
            if (filtroActivo && videoRef.current && videoRef.current.readyState === 4 && !fotoCapturada) {
                await faceMeshRef.current.send({ image: videoRef.current });
            } else if (!filtroActivo || fotoCapturada) {
                const ctx = canvasOverlayRef.current?.getContext('2d');
                ctx?.clearRect(0, 0, canvasOverlayRef.current.width, canvasOverlayRef.current.height);
            }
            timer = requestAnimationFrame(enviarFrame);
        };
        enviarFrame();
        return () => cancelAnimationFrame(timer);
    }, [filtroActivo, fotoCapturada]);

    const iniciarCamara = async () => {
        detenerCamara();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: modoCamara, width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false
            });
            streamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) { console.error("Error al iniciar cámara:", err); }
    };

    const detenerCamara = () => {
        if (streamRef.current) streamRef.current.getTracks().forEach(t => t.stop());
    };

    const drawOverlay = (landmarks) => {
        const canvas = canvasOverlayRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        renderAssets(ctx, landmarks, canvas.width, canvas.height);
    };

    const renderAssets = (ctx, landmarks, w, h) => {
        const pIzq = landmarks[33];
        const pDer = landmarks[263];
        const pFrente = landmarks[10];

        const xIzq = pIzq.x * w; const yIzq = pIzq.y * h;
        const xDer = pDer.x * w; const yDer = pDer.y * h;
        
        const centroX = (xIzq + xDer) / 2;
        const centroY = (yIzq + yDer) / 2;
        const anchoLentes = Math.abs(xDer - xIzq) * 2.3;
        const angulo = Math.atan2(yDer - yIzq, xDer - xIzq);

        // Lentes
        ctx.save();
        ctx.translate(centroX, centroY);
        ctx.rotate(angulo);
        ctx.drawImage(assets.lentes, -anchoLentes / 2, -anchoLentes / 4, anchoLentes, anchoLentes / 2);
        ctx.restore();

        // Gorro
        const anchoGorro = anchoLentes * 1.1;
        ctx.save();
        ctx.translate(pFrente.x * w, pFrente.y * h - (anchoGorro * 0.3));
        ctx.rotate(angulo);
        ctx.drawImage(assets.gorro, -anchoGorro / 2, -anchoGorro * 0.9, anchoGorro, anchoGorro);
        ctx.restore();
    };

    const capturarFoto = () => {
        const video = videoRef.current;
        const canvas = canvasProcesadoRef.current;
        const ctx = canvas.getContext('2d');

        canvas.width = 1080;
        canvas.height = 1920;

        // Fondo del video
        if (modoCamara === "user") {
            ctx.translate(canvas.width, 0); ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        // Filtros inteligentes
        if (filtroActivo && predicciones) {
            renderAssets(ctx, predicciones, canvas.width, canvas.height);
        }

        // Marco decorativo
        ctx.drawImage(assets.marco, 0, 0, canvas.width, canvas.height);
        setFotoCapturada(canvas.toDataURL('image/jpeg', 0.8));
    };

    return (
        <div className="container text-center mt-3 mb-5 pb-5">
            <div className="position-relative d-inline-block shadow-lg rounded bg-dark" 
                 style={{ width: '100%', maxWidth: '380px', aspectRatio: '9/16', overflow: 'visible' }}>
                
                <div className="w-100 h-100 rounded overflow-hidden position-relative">
                    {!fotoCapturada ? (
                        <>
                            <video ref={videoRef} autoPlay playsInline muted className="w-100 h-100" 
                                   style={{ objectFit: 'cover', transform: modoCamara === "user" ? "scaleX(-1)" : "none" }} />
                            
                            <canvas ref={canvasOverlayRef} width="380" height="675" 
                                    className="position-absolute top-0 start-0 w-100 h-100"
                                    style={{ zIndex: 15, pointerEvents: 'none', transform: modoCamara === "user" ? "scaleX(-1)" : "none" }} />

                            <img src={marcoImg} className="position-absolute top-0 start-0 w-100 h-100" 
                                 style={{ pointerEvents: 'none', zIndex: 20, objectFit: 'contain' }} />
                        </>
                    ) : (
                        <img src={fotoCapturada} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                    )}
                </div>

                <div className="position-absolute start-50 translate-middle-x w-100" style={{ bottom: '-45px', zIndex: 30 }}>
                    {!fotoCapturada ? (
                        <div className="d-flex justify-content-center align-items-center gap-4">
                            <button className={`btn rounded-circle shadow border-dark border-2 ${filtroActivo ? 'btn-warning' : 'btn-dark'}`}
                                    style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    onClick={() => setFiltroActivo(!filtroActivo)}>
                                <Sparkles size={24} color={filtroActivo ? "black" : "#f8bbd0"} />
                            </button>
                            <button className="btn btn-primary rounded-circle shadow-lg p-4 border-dark border-4" onClick={capturarFoto} style={{ transform: 'scale(1.1)' }}>
                                <Camera size={45} />
                            </button>
                            <button className="btn btn-dark rounded-circle shadow border-dark border-2" 
                                    style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    onClick={() => setModoCamara(m => m === "user" ? "environment" : "user")}>
                                <SwitchCamera size={24} color="#f8bbd0" />
                            </button>
                        </div>
                    ) : (
                        <div className="d-flex gap-2 px-3">
                            <button className="btn btn-secondary flex-grow-1 py-3 text-white rounded-pill border-dark border-2" onClick={() => setFotoCapturada(null)}>
                                <RefreshCw size={20} className="me-2" /> Repetir
                            </button>
                            <button className="btn btn-success flex-grow-1 py-3 shadow fw-bold rounded-pill border-dark border-2" onClick={() => alert("¡Pronto: Firebase!")}>
                                <Check size={24} className="me-2" /> Subir
                            </button>
                        </div>
                    )}
                </div>
            </div>
            <canvas ref={canvasProcesadoRef} style={{ display: 'none' }}></canvas>
        </div>
    );
};

export default Camara;