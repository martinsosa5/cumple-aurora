import React, { useState } from 'react';
import Camara from './components/Camara';
import Galeria from './components/Galeria'; 
import { ArrowLeft, Camera, Images } from 'lucide-react'; 

function App() {
  const [vistaActual, setVistaActual] = useState("menu");

  return (
    /* AGREGAMOS justify-content-center AQUÍ para centrar todo horizontalmente */
    <div className="container-fluid min-vh-100 py-4 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#1a1a1a' }}>
      
      {/* Forzamos que la fila ocupe el ancho necesario y se centre */}
      <div className="row justify-content-center w-100 m-0">
        
        {/* El col-12 centrará el contenido de texto y componentes */}
        <div className="col-12 col-md-8 col-lg-6 text-center d-flex flex-column align-items-center">
          
          {/* MODO MENÚ */}
          {vistaActual === "menu" && (
            <div className="d-flex flex-column gap-4 animate__animated animate__fadeIn w-100" style={{ maxWidth: '400px' }}>
              <h1 className="text-white mb-5 fw-bold" style={{ color: '#f8bbd0', textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
                Cumple de Aurora
              </h1>
              
              <button 
                className="btn py-4 rounded-pill shadow-lg border-white border-2 fw-bold d-flex align-items-center justify-content-center gap-3 text-white"
                onClick={() => setVistaActual("camara")}
                style={{ fontSize: '22px', backgroundColor: '#ff4081' }}
              >
                <Camera size={28} /> SACAR FOTO
              </button>

              <button 
                className="btn py-4 rounded-pill shadow-lg border-white border-2 fw-bold text-white d-flex align-items-center justify-content-center gap-3"
                onClick={() => setVistaActual("galeria")}
                style={{ fontSize: '22px', backgroundColor: '#17a2b8' }}
              >
                <Images size={28} /> VER GALERÍA
              </button>
            </div>
          )}

          {/* MODO CÁMARA */}
          {vistaActual === "camara" && (
            <div className="animate__animated animate__fadeIn w-100 d-flex flex-column align-items-center">
              <button 
                className="btn btn-sm mb-4 d-flex align-items-center fw-bold shadow"
                style={{ 
                    borderRadius: '20px', 
                    backgroundColor: '#ffeb3b', 
                    color: '#000',
                    border: '2px solid #000',
                    padding: '8px 20px'
                }}
                onClick={() => setVistaActual("menu")}
              >
                <ArrowLeft size={20} className="me-2" /> Volver al Menú Principal
              </button>
              <div className="mt-2 w-100 d-flex justify-content-center">
                <Camara />
              </div>
            </div>
          )}

          {/* MODO GALERÍA */}
          {vistaActual === "galeria" && (
            <div className="animate__animated animate__fadeIn w-100 d-flex flex-column align-items-center">
               <button 
                className="btn btn-sm mb-4 d-flex align-items-center fw-bold shadow"
                style={{ 
                    borderRadius: '20px', 
                    backgroundColor: '#ffeb3b', 
                    color: '#000',
                    border: '2px solid #000',
                    padding: '8px 20px'
                }}
                onClick={() => setVistaActual("menu")}
              >
                <ArrowLeft size={20} className="me-2" /> Volver al Menú Principal
              </button>
              <div className="w-100">
                <Galeria alIrACamara={setVistaActual} />
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;