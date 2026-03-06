import React, { useEffect, useState } from 'react';
import { storage } from '../firebase'; 
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { Download, Camera, X, Images, CheckCircle } from 'lucide-react'; 
import AOS from 'aos';
import 'aos/dist/aos.css';

const Galeria = ({ alIrACamara }) => {
    const [fotos, setFotos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [fotoSeleccionada, setFotoSeleccionada] = useState(null);
    const [mostrarMensajeDescarga, setMostrarMensajeDescarga] = useState(false);

    const obtenerFotos = async () => {
        setCargando(true);
        try {
            const listaRef = ref(storage, 'fotos_cumple');
            const res = await listAll(listaRef);
            const urls = await Promise.all(
                res.items.map(async (item) => {
                    const url = await getDownloadURL(item);
                    return { url, nombre: item.name };
                })
            );
            setFotos(urls.reverse());
            setTimeout(() => AOS.refresh(), 500);
        } catch (error) {
            console.error("Error cargando galería:", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        AOS.init({ duration: 800, once: false });
        obtenerFotos();
    }, []);

    // ESTA ES LA FUNCIÓN QUE FALTABA CORREGIR:
    const ejecutarDescarga = async (e, url, nombre) => {
        e.stopPropagation();
        
        try {
            // 1. Obtenemos la imagen como datos puros (Blob)
            const response = await fetch(url);
            const blob = await response.blob();
            
            // 2. Creamos una URL temporal que el navegador entienda como archivo local
            const urlBlob = window.URL.createObjectURL(blob);
            
            // 3. Forzamos la descarga silenciosa (sin abrir pestañas)
            const link = document.createElement('a');
            link.href = urlBlob;
            link.download = nombre || `foto_aurora_${Date.now()}.jpg`;
            document.body.appendChild(link);
            link.click();
            
            // 4. Limpiamos todo
            document.body.removeChild(link);
            window.URL.revokeObjectURL(urlBlob);

            // 5. Mostramos el mensaje de éxito
            setMostrarMensajeDescarga(true);
            setTimeout(() => setMostrarMensajeDescarga(false), 2500);

        } catch (err) {
            console.error("Error en descarga silenciosa:", err);
            // Si falla por CORS en localhost, este es el único caso donde abriría link
            // Pero en Vercel (producción) debería funcionar directo.
            window.open(url, '_blank');
        }
    };

    return (
        <div className="container-fluid pb-5 position-relative" style={{ minHeight: '100vh' }}>
            
            <div className="text-center mb-4 pt-2 d-flex align-items-center justify-content-center gap-2">
                <Images size={32} color="#f8bbd0" /> 
                <h2 className="text-white fw-bold m-0" style={{ color: '#f8bbd0', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                    Galería del cumple Aurora
                </h2>
            </div>

            {cargando ? (
                <div className="text-center mt-5">
                    <div className="spinner-border text-warning" role="status"></div>
                </div>
            ) : (
                <div className="row g-2 overflow-hidden px-1">
                    {fotos.map((foto, index) => (
                        <div 
                            key={index} 
                            className="col-6"
                            data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}
                            onClick={() => setFotoSeleccionada(foto)}
                        >
                            <div className="card bg-dark border-0 overflow-hidden shadow-sm" style={{ borderRadius: '12px' }}>
                                <img 
                                    src={foto.url} 
                                    className="img-fluid" 
                                    style={{ aspectRatio: '9/16', objectFit: 'cover', cursor: 'pointer' }}
                                    alt="Recuerdo"
                                />
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="position-fixed" style={{ bottom: '25px', right: '20px', zIndex: 1000 }}>
                <button 
                    className="btn shadow-lg d-flex align-items-center justify-content-center"
                    onClick={() => alIrACamara('camara')}
                    style={{ 
                        width: '65px', height: '65px', borderRadius: '50%', 
                        backgroundColor: '#ff4081', border: '3px solid white', color: 'white' 
                    }}
                >
                    <Camera size={30} />
                </button>
            </div>

            {fotoSeleccionada && (
                <div 
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center animate__animated animate__fadeIn"
                    style={{ backgroundColor: 'rgba(0,0,0,0.85)', zIndex: 2000, padding: '15px' }}
                    onClick={() => setFotoSeleccionada(null)}
                >
                    <button className="btn position-absolute top-0 end-0 m-3 text-white">
                        <X size={35} onClick={() => setFotoSeleccionada(null)} />
                    </button>
                    
                    <img 
                        src={fotoSeleccionada.url} 
                        className="img-fluid animate__animated animate__zoomIn shadow-lg" 
                        style={{ maxHeight: '70vh', borderRadius: '15px' }}
                        alt="Zoom"
                    />

                    <div className="d-flex gap-2 mt-4">
                        <button 
                            className="btn rounded-pill px-4 py-2 fw-bold shadow-lg d-flex align-items-center"
                            style={{ backgroundColor: '#ffeb3b', color: '#000', border: 'none', fontSize: '15px' }}
                            onClick={(e) => ejecutarDescarga(e, fotoSeleccionada.url, fotoSeleccionada.nombre)}
                        >
                            <Download size={18} className="me-2" /> GUARDAR FOTO
                        </button>
                    </div>
                </div>
            )}

            {/* MENSAJE DE ÉXITO */}
            {mostrarMensajeDescarga && (
                <div className="position-fixed top-50 start-50 translate-middle animate__animated animate__bounceIn" 
                     style={{ zIndex: 3000, pointerEvents: 'none' }}>
                    <div className="bg-white p-4 rounded-4 shadow-lg text-center border border-warning border-4">
                        <CheckCircle size={50} color="#28a745" className="mb-2" />
                        <h5 className="fw-bold mb-0 text-dark">¡Foto guardada!</h5>
                        <p className="text-muted small mb-0">Revisá tu galería de fotos.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Galeria;