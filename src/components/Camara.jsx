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

    const assets = useMemo(() => {
        const imgL = new Image(); imgL.src = lentesImg;
        const imgG = new Image(); imgG.src = gorroImg;
        const imgM = new Image(); imgM.src = marcoImg;
        return { lentes: imgL, gorro: imgG, marco: imgM };
    }, []);

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
            
            if (filtroActivo && landmarks && canvasOverlayRef.current) {
                const canvas = canvasOverlayRef.current;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                renderAssets(ctx, landmarks, canvas.width, canvas.height);
            }
        });

        faceMeshRef.current = faceMesh;
        iniciarCamara();
        
        return () => detenerCamara();
    }, [modoCamara, filtroActivo]); 

    const girarCamara = () => {
        setModoCamara(prev => prev === "user" ? "environment" : "user");
    };

    const iniciarCamara = async () => {
        detenerCamara();
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: modoCamara, width: { ideal: 1280 }, height: { ideal: 720 } },
                audio: false
            });
            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                videoRef.current.onloadedmetadata = () => videoRef.current.play();
            }
        } catch (err) { console.error(err); }
    };

    const detenerCamara = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
    };

    useEffect(() => {
        if (!fotoCapturada && streamRef.current && videoRef.current) {
            videoRef.current.srcObject = streamRef.current;
            videoRef.current.play().catch(() => {});
        }
    }, [fotoCapturada]);

    useEffect(() => {
        let timer;
        const enviarFrame = async () => {
            if (filtroActivo && videoRef.current && videoRef.current.readyState === 4 && !fotoCapturada) {
                try {
                    await faceMeshRef.current.send({ image: videoRef.current });
                } catch (e) { console.error(e); }
            } else if (!filtroActivo && canvasOverlayRef.current) {
                const ctx = canvasOverlayRef.current.getContext('2d');
                ctx.clearRect(0, 0, canvasOverlayRef.current.width, canvasOverlayRef.current.height);
            }
            timer = requestAnimationFrame(enviarFrame);
        };
        enviarFrame();
        return () => cancelAnimationFrame(timer);
    }, [filtroActivo, fotoCapturada]);

    const renderAssets = (ctx, landmarks, w, h) => {
        if (!assets.lentes.complete || !assets.gorro.complete) return;

        const pIzq = landmarks[33];
        const pDer = landmarks[263];
        const pFrente = landmarks[10];

        // CORRECCIÓN DE ESPEJO: Si es selfie, invertimos la X de los puntos
        const getX = (p) => (modoCamara === "user" ? (1 - p.x) * w : p.x * w);
        const getY = (p) => p.y * h;

        const xIzq = getX(pIzq); const yIzq = getY(pIzq);
        const xDer = getX(pDer); const yDer = getY(pDer);
        
        const centroX = (xIzq + xDer) / 2;
        const centroY = (yIzq + yDer) / 2;
        
        const distOjosPX = Math.abs(xDer - xIzq);
        const angulo = Math.atan2(yDer - yIzq, xDer - xIzq);

        // --- LENTES: Formato original y escala 3.5 (Ajuste equilibrado para móvil) ---
        const anchoLentes = distOjosPX * 3.5; 
        const lentesRatio = assets.lentes.naturalHeight / assets.lentes.naturalWidth;
        const altoLentes = anchoLentes * lentesRatio;

        ctx.save();
        ctx.translate(centroX, centroY);
        ctx.rotate(angulo);
        ctx.drawImage(assets.lentes, -anchoLentes / 2, -altoLentes / 2, anchoLentes, altoLentes);
        ctx.restore();

        // --- GORRO: Bajado para que entre bien en la cabeza (multiplicador 0.25) ---
        const anchoGorro = anchoLentes * 1.3;
        const gorroRatio = assets.gorro.naturalHeight / assets.gorro.naturalWidth;
        const altoGorro = anchoGorro * gorroRatio;

        ctx.save();
        ctx.translate(getX(pFrente), getY(pFrente) + (altoGorro * 0.25)); 
        ctx.rotate(angulo);
        ctx.drawImage(assets.gorro, -anchoGorro / 2, -altoGorro, anchoGorro, altoGorro);
        ctx.restore();
    };

    const capturarFoto = () => {
        const video = videoRef.current;
        const canvas = canvasProcesadoRef.current;
        const ctx = canvas.getContext('2d');
        canvas.width = 1080;
        canvas.height = 1920;

        if (modoCamara === "user") {
            ctx.translate(canvas.width, 0); ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        ctx.setTransform(1, 0, 0, 1, 0, 0);

        if (filtroActivo && predicciones) {
            renderAssets(ctx, predicciones, canvas.width, canvas.height);
        }

        ctx.drawImage(assets.marco, 0, 0, canvas.width, canvas.height);
        setFotoCapturada(canvas.toDataURL('image/jpeg', 0.9));
    };

    return (
        <div className="container text-center mt-3 mb-5 pb-5">
            <div className="position-relative d-inline-block shadow-lg rounded bg-dark" 
                 style={{ width: '100%', maxWidth: '380px', aspectRatio: '9/16', overflow: 'hidden' }}>
                
                {!fotoCapturada ? (
                    <>
                        <video ref={videoRef} autoPlay playsInline muted className="w-100 h-100" 
                               style={{ objectFit: 'cover', transform: modoCamara === "user" ? "scaleX(-1)" : "none" }} />
                        
                        <canvas ref={canvasOverlayRef} width="1080" height="1920" 
                                className="position-absolute top-0 start-0 w-100 h-100"
                                style={{ 
                                    zIndex: 15, 
                                    pointerEvents: 'none',
                                    display: filtroActivo ? 'block' : 'none' 
                                }} />

                        <img src={marcoImg} className="position-absolute top-0 start-0 w-100 h-100" 
                             style={{ pointerEvents: 'none', zIndex: 20, objectFit: 'contain' }} />
                    </>
                ) : (
                    <img src={fotoCapturada} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                )}
            </div>

            <div className="mt-4 d-flex justify-content-center align-items-center gap-4 pb-5">
                {!fotoCapturada ? (
                    <>
                        <div className="d-flex flex-column align-items-center">
                            <button className={`btn rounded-circle shadow border-dark border-2 ${filtroActivo ? 'btn-warning' : 'btn-dark'}`}
                                    style={{ width: '55px', height: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    onClick={() => setFiltroActivo(!filtroActivo)}>
                                <Sparkles size={24} color={filtroActivo ? "black" : "#f8bbd0"} />
                            </button>
                            <small className="text-white mt-1" style={{ fontSize: '10px' }}>FILTRO</small>
                        </div>

                        <div className="d-flex flex-column align-items-center">
                            <button className="btn btn-primary rounded-circle shadow-lg p-4 border-dark border-4" 
                                    onClick={capturarFoto} style={{ transform: 'scale(1.1)' }}>
                                <Camera size={45} />
                            </button>
                            <small className="text-white mt-1" style={{ fontSize: '10px' }}>FOTO</small>
                        </div>

                        <div className="d-flex flex-column align-items-center">
                            <button className="btn btn-dark rounded-circle shadow border-dark border-2" 
                                    style={{ width: '55px', height: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                    onClick={girarCamara}>
                                <SwitchCamera size={24} color="#f8bbd0" />
                            </button>
                            <small className="text-white mt-1" style={{ fontSize: '10px' }}>GIRAR</small>
                        </div>
                    </>
                ) : (
                    <div className="d-flex gap-2 px-3">
                        <button className="btn btn-secondary flex-grow-1 py-3 text-white rounded-pill border-dark border-2" 
                                onClick={() => setFotoCapturada(null)} style={{ backgroundColor: '#2c2c2c' }}>
                            <RefreshCw size={20} className="me-2" /> REPETIR
                        </button>
                        <button className="btn btn-success flex-grow-1 py-3 shadow fw-bold rounded-pill border-dark border-2" onClick={() => alert("Subiendo...")}>
                            <Check size={24} className="me-2" /> SUBIR
                        </button>
                    </div>
                )}
            </div>
            <canvas ref={canvasProcesadoRef} style={{ display: 'none' }}></canvas>
        </div>
    );
};

export default Camara;