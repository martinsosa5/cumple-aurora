import React, { useEffect, useState } from 'react';
import { storage } from '../firebase'; 
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { Download, Camera, X, Images } from 'lucide-react'; 
import AOS from 'aos';
import 'aos/dist/aos.css';

const Galeria = ({ alIrACamara }) => {
    const [fotos, setFotos] = useState([]);
    const [cargando, setCargando] = useState(true);
    const [fotoSeleccionada, setFotoSeleccionada] = useState(null);

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

    const ejecutarDescarga = async (e, url, nombre) => {
        e.stopPropagation();
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = nombre;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
        } catch (err) {
            window.open(url, '_blank');
        }
    };

    return (
        <div className="container-fluid pb-5 position-relative" style={{ minHeight: '100vh' }}>
            {/* Título con Icono Rosa */}
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
                <div className="row g-2 overflow-hidden">
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

            {/* BOTÓN FLOTANTE DE CÁMARA */}
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

            {/* MODAL DE ZOOM */}
            {fotoSeleccionada && (
                <div 
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex flex-column align-items-center justify-content-center animate__animated animate__fadeIn"
                    style={{ backgroundColor: 'rgba(0,0,0,0.8)', zIndex: 2000, padding: '15px' }}
                    onClick={() => setFotoSeleccionada(null)}
                >
                    <button className="btn position-absolute top-0 end-0 m-3 text-white">
                        <X size={35} onClick={() => setFotoSeleccionada(null)} />
                    </button>
                    
                    <img 
                        src={fotoSeleccionada.url} 
                        className="img-fluid animate__animated animate__zoomIn" 
                        style={{ maxHeight: '75vh', borderRadius: '15px', boxShadow: '0 0 20px rgba(255,255,255,0.2)' }}
                        alt="Zoom"
                    />

                    <button 
                        className="btn mt-4 rounded-pill px-4 py-2 fw-bold shadow-lg d-flex align-items-center"
                        style={{ backgroundColor: '#ffeb3b', color: '#000', border: 'none', fontSize: '15px' }}
                        onClick={(e) => ejecutarDescarga(e, fotoSeleccionada.url, fotoSeleccionada.nombre)}
                    >
                        <Download size={18} className="me-2" /> GUARDAR EN GALERÍA
                    </button>
                </div>
            )}
        </div>
    );
};

export default Galeria;