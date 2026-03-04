import React, { useEffect, useState } from 'react';
import { storage } from '../firebase';
import { ref, listAll, getDownloadURL } from "firebase/storage";
import { Download, RefreshCw } from 'lucide-react';
// Importamos AOS y sus estilos
import AOS from 'aos';
import 'aos/dist/aos.css';

const Galeria = () => {
    const [fotos, setFotos] = useState([]);
    const [cargando, setCargando] = useState(true);

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
            // Refrescamos AOS después de cargar las fotos nuevas
            setTimeout(() => AOS.refresh(), 500);
        } catch (error) {
            console.error("Error cargando galería:", error);
        } finally {
            setCargando(false);
        }
    };

    useEffect(() => {
        // Inicializamos AOS una sola vez al montar el componente
        AOS.init({
            duration: 800, // Duración de la animación en milisegundos
            once: false,   // Si querés que se repita la animación al subir y bajar
        });
        obtenerFotos();
    }, []);

    const descargarDirecto = (url, nombre) => {
        const link = document.createElement('a');
        link.href = url;
        link.download = nombre;
        link.target = "_blank";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="container-fluid pb-5">
            <div className="d-flex justify-content-between align-items-center mb-4 px-2">
                <h3 className="text-white fw-bold m-0">Galería de Recuerdos</h3>
                <button className="btn btn-outline-light btn-sm rounded-circle p-2" onClick={obtenerFotos}>
                    <RefreshCw size={20} className={cargando ? 'feather-spin' : ''} />
                </button>
            </div>

            {cargando ? (
                <div className="text-center mt-5">
                    <div className="spinner-border text-info" role="status"></div>
                </div>
            ) : (
                <div className="row g-2 overflow-hidden"> {/* overflow-hidden evita scroll horizontal por las animaciones */}
                    {fotos.length > 0 ? (
                        fotos.map((foto, index) => (
                            <div 
                                key={index} 
                                className="col-6"
                                // Aquí está la magia: animamos según si es columna par o impar
                                data-aos={index % 2 === 0 ? "fade-right" : "fade-left"}
                                data-aos-delay={index * 50} // Un pequeño retraso para que entren una tras otra
                            >
                                <div className="card bg-dark border-secondary overflow-hidden shadow-sm position-relative">
                                    <img 
                                        src={foto.url} 
                                        className="img-fluid" 
                                        style={{ aspectRatio: '9/16', objectFit: 'cover' }}
                                        alt="Recuerdo"
                                    />
                                    <button 
                                        className="btn btn-dark btn-sm position-absolute bottom-0 end-0 m-2 opacity-75 rounded-circle"
                                        onClick={() => descargarDirecto(foto.url, foto.nombre)}
                                    >
                                        <Download size={16} color="white" />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-center text-secondary">No hay fotos todavía.</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default Galeria;