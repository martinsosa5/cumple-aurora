import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Camera, RefreshCw, Check, SwitchCamera, Sparkles, Download, CheckCircle } from 'lucide-react';
import { FaceMesh } from '@mediapipe/face_mesh';

// IMPORTANTE: Importamos el storage desde tu archivo de configuración
import { storage } from '../firebase'; 
import { ref, uploadBytes } from "firebase/storage";

import marcoImg from '../assets/marco.png';
import lentesImg from '../assets/lentes.png';
import gorroImg from '../assets/gorro.png';
import iconoFiltroMenu from '../assets/icono_filtro.png';

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
    const [subiendo, setSubiendo] = useState(false);
    const [mostrarExito, setMostrarExito] = useState(false); // Estado para el nuevo mensaje

    const filtroActivoRef = useRef(false);
    useEffect(() => {
        filtroActivoRef.current = filtroActivo;
    }, [filtroActivo]);

    const assets = useMemo(() => {
        const imgL = new Image(); imgL.src = lentesImg;
        const imgG = new Image(); imgG.src = gorroImg;
        const imgM = new Image(); imgM.src = marcoImg;
        return { lentes: imgL, gorro: imgG, marco: imgM };
    }, []);

    useEffect(() => {
        iniciarCamara();
        const faceMesh = new FaceMesh({
            locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`,
        });
        faceMesh.setOptions({
            maxNumFaces: 4,
            refineLandmarks: true,
            minDetectionConfidence: 0.5,
            minTrackingConfidence: 0.5,
        });
        faceMesh.onResults((results) => {
            setPredicciones(results.multiFaceLandmarks); 
            if (canvasOverlayRef.current) {
                const canvas = canvasOverlayRef.current;
                const ctx = canvas.getContext('2d');
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                if (filtroActivoRef.current && results.multiFaceLandmarks) {
                    results.multiFaceLandmarks.forEach((faceLandmarks) => {
                        renderAssets(ctx, faceLandmarks, canvas.width, canvas.height);
                    });
                }
            }
        });
        faceMeshRef.current = faceMesh;
        return () => detenerCamara();
    }, [modoCamara]);

    useEffect(() => {
        const reactivarVideo = async () => {
            if (!fotoCapturada && streamRef.current && videoRef.current) {
                videoRef.current.srcObject = streamRef.current;
                try {
                    await videoRef.current.play();
                } catch (err) {
                    console.log("Esperando interacción...");
                }
            }
        };
        reactivarVideo();
    }, [fotoCapturada]);

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
        } catch (err) { console.error("Error cámara:", err); }
    };

    const detenerCamara = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(t => t.stop());
            streamRef.current = null;
        }
    };

    useEffect(() => {
        let timer;
        const enviarFrame = async () => {
            if (videoRef.current && videoRef.current.readyState === 4 && !fotoCapturada && faceMeshRef.current) {
                try {
                    await faceMeshRef.current.send({ image: videoRef.current });
                } catch (e) { console.error("Error enviando frame:", e); }
            }
            timer = requestAnimationFrame(enviarFrame);
        };
        enviarFrame();
        return () => cancelAnimationFrame(timer);
    }, [fotoCapturada]);

    const renderAssets = (ctx, landmarks, w, h) => {
        if (!assets.lentes.complete || !assets.gorro.complete) return;
        const pIzq = landmarks[33]; 
        const pDer = landmarks[263]; 
        const pFrente = landmarks[10]; 
        const xIzq = pIzq.x * w; const yIzq = pIzq.y * h;
        const xDer = pDer.x * w; const yDer = pDer.y * h;
        const centroX = (xIzq + xDer) / 2;
        const centroY = (yIzq + yDer) / 2;
        const distOjosPX = Math.sqrt(Math.pow(xDer - xIzq, 2) + Math.pow(yDer - yIzq, 2));
        const angulo = Math.atan2(yDer - yIzq, xDer - xIzq);
        const anchoLentes = distOjosPX * 2.4; 
        const lentesRatio = assets.lentes.naturalHeight / assets.lentes.naturalWidth;
        const altoLentes = anchoLentes * lentesRatio;
        ctx.save();
        ctx.translate(centroX, centroY);
        ctx.rotate(angulo);
        ctx.drawImage(assets.lentes, -anchoLentes / 2, -altoLentes / 2, anchoLentes, altoLentes);
        ctx.restore();
        const anchoGorro = anchoLentes * 1.0;
        const gorroRatio = assets.gorro.naturalHeight / assets.gorro.naturalWidth;
        const altoGorro = anchoGorro * gorroRatio;
        ctx.save();
        ctx.translate(pFrente.x * w, pFrente.y * h + (altoGorro * 0.1)); 
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
            ctx.translate(canvas.width, 0);
            ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        if (filtroActivo && predicciones) {
            predicciones.forEach((faceLandmarks) => {
                renderAssets(ctx, faceLandmarks, canvas.width, canvas.height);
            });
        }
        ctx.setTransform(1, 0, 0, 1, 0, 0); 
        ctx.drawImage(assets.marco, 0, 0, canvas.width, canvas.height);
        setFotoCapturada(canvas.toDataURL('image/jpeg', 0.9));
    };

    const descargarFoto = () => {
        if (!fotoCapturada) return;
        const link = document.createElement('a');
        link.href = fotoCapturada;
        link.download = `foto_cumple_aurora_${Date.now()}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const subirAFirebase = async () => {
        if (!fotoCapturada || subiendo) return;
        setSubiendo(true);

        try {
            const response = await fetch(fotoCapturada);
            const blob = await response.blob();
            const nombreArchivo = `fotos_cumple/foto_aurora_${Date.now()}.jpg`;
            const storageRef = ref(storage, nombreArchivo);

            await uploadBytes(storageRef, blob);
            
            // ACTIVAMOS EL MENSAJE LINDO
            setMostrarExito(true);
            setTimeout(() => {
                setMostrarExito(false);
                setFotoCapturada(null); 
            }, 3500);

        } catch (error) {
            console.error("Error al subir:", error);
            alert("Hubo un error al subir la foto. Intenta de nuevo.");
        } finally {
            setSubiendo(false);
        }
    };

    return (
        <div className="container text-center mt-3 mb-5 pb-5 position-relative">
            <div className="position-relative d-inline-block shadow-lg rounded bg-dark" 
                  style={{ width: '100%', maxWidth: '380px', aspectRatio: '9/16' }}>
                
                <div className="w-100 h-100 rounded overflow-hidden position-relative">
                    {!fotoCapturada ? (
                        <>
                            <video ref={videoRef} autoPlay playsInline muted className="w-100 h-100" 
                                    style={{ objectFit: 'cover', transform: modoCamara === "user" ? "scaleX(-1)" : "none" }} />
                            
                            <canvas ref={canvasOverlayRef} width="380" height="675" 
                                    className="position-absolute top-0 start-0 w-100 h-100"
                                    style={{ 
                                        zIndex: 15, 
                                        pointerEvents: 'none', 
                                        transform: modoCamara === "user" ? "scaleX(-1)" : "none",
                                        display: filtroActivo ? 'block' : 'none' 
                                    }} />

                            <img src={marcoImg} className="position-absolute top-0 start-0 w-100 h-100" 
                                 style={{ pointerEvents: 'none', zIndex: 20, objectFit: 'contain' }} alt="Marco" />
                        </>
                    ) : (
                        <img src={fotoCapturada} className="w-100 h-100" style={{ objectFit: 'cover' }} />
                    )}
                </div>

                <div className="position-absolute start-50 translate-middle-x w-100" style={{ bottom: '-70px', zIndex: 30 }}>
                    {!fotoCapturada ? (
                        <div className="d-flex justify-content-center align-items-center gap-4">
                            <div className="d-flex flex-column align-items-center">
                                <button 
                                    className="btn rounded-circle shadow border-dark border-2"
                                    style={{ 
                                        width: '55px', height: '55px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        backgroundColor: filtroActivo ? '#fae5a4' : '#ffffff', 
                                        overflow: 'hidden', padding: '5px' 
                                    }}
                                    onClick={() => setFiltroActivo(!filtroActivo)}
                                >
                                    <img src={iconoFiltroMenu} alt="Filtro" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                                </button>
                                <small className="text-white mt-1 fw-bold" style={{ fontSize: '9px' }}>FILTRO</small>
                            </div>

                            <div className="d-flex flex-column align-items-center">
                                <button className="btn btn-primary rounded-circle shadow-lg p-4 border-dark border-4" onClick={capturarFoto} style={{ transform: 'scale(1.1)' }}>
                                    <Camera size={45} />
                                </button>
                                <small className="text-white mt-1 fw-bold" style={{ fontSize: '9px' }}>FOTO</small>
                            </div>

                            <div className="d-flex flex-column align-items-center">
                                <button className="btn btn-dark rounded-circle shadow border-dark border-2" 
                                        style={{ width: '50px', height: '50px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                                        onClick={girarCamara}>
                                    <SwitchCamera size={24} color="#f8bbd0" />
                                </button>
                                <small className="text-white mt-1 fw-bold" style={{ fontSize: '9px' }}>GIRAR</small>
                            </div>
                        </div>
                    ) : (
                        <div className="d-flex gap-2 px-1 w-100">
                            <button className="btn btn-secondary flex-grow-1 py-3 text-white rounded-pill border-dark border-2" 
                                    onClick={() => setFotoCapturada(null)} style={{ backgroundColor: '#2c2c2c', fontSize: '12px' }} disabled={subiendo}>
                                <RefreshCw size={18} className="me-1" /> REPETIR
                            </button>
                            
                            {/* BOTÓN DESCARGAR: AHORA AMARILLO */}
                            <button className="btn flex-grow-1 py-3 shadow fw-bold rounded-pill border-dark border-2" 
                                    onClick={descargarFoto} style={{ backgroundColor: '#ffeb3b', color: '#000', fontSize: '12px' }} disabled={subiendo}>
                                <Download size={18} className="me-1" /> DESCARGAR
                            </button>

                            <button className="btn btn-success flex-grow-1 py-3 shadow fw-bold rounded-pill border-dark border-2" 
                                    onClick={subirAFirebase} style={{ fontSize: '12px' }} disabled={subiendo}>
                                <Check size={18} className="me-1" /> {subiendo ? 'SUBIENDO...' : 'SUBIR'}
                            </button>
                        </div>                        
                    )}
                </div>
            </div>
            
            {/* MENSAJE DE ÉXITO PERSONALIZADO */}
            {mostrarExito && (
                <div className="position-fixed top-50 start-50 translate-middle animate__animated animate__zoomIn" style={{ zIndex: 1000, width: '85%', maxWidth: '320px' }}>
                    <div className="bg-white p-4 rounded-4 shadow-lg border border-warning border-4 text-center">
                        <CheckCircle size={50} color="#28a745" className="mb-3" />
                        <h5 className="fw-bold text-dark mb-2">¡Subida con éxito!</h5>
                        <p className="text-secondary small mb-0">Tu foto ya está en la galería para que todos la vean.</p>
                    </div>
                </div>
            )}

            <canvas ref={canvasProcesadoRef} style={{ display: 'none' }}></canvas>
        </div>
    );
};

export default Camara;
