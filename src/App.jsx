import React, { useState } from 'react';
import Camara from './components/Camara';
import Galeria from './components/Galeria'; 
import { ArrowLeft, Camera, Images } from 'lucide-react'; 

// IMPORTANTE: Nombres de archivos actualizados
import logoImg from './assets/img_home.png'; 
import auroraImg from './assets/aurora-home.png'; 

function App() {
  const [vistaActual, setVistaActual] = useState("menu");

  return (
    <div className="container-fluid min-vh-100 pt-2 d-flex justify-content-center position-relative" style={{ backgroundColor: '#1a1a1a', overflowX: 'hidden' }}>
      
      <div className="row justify-content-center w-100 m-0 animate__animated animate__fadeIn">
        
        <div className="col-12 col-md-8 col-lg-6 text-center d-flex flex-column align-items-center">
          
          {/* MODO MENÚ */}
          {vistaActual === "menu" && (
            <div className="d-flex flex-column gap-3 animate__animated animate__fadeIn w-100" style={{ maxWidth: '400px' }}>
              
              <div className="w-100 d-flex justify-content-center mb-2">
                <img 
                  src={logoImg} 
                  alt="Mis 2 años Aurora" 
                  className="img-fluid"
                  style={{ 
                    maxWidth: '85%', 
                    height: 'auto',
                    filter: 'drop-shadow(2px 2px 4px rgba(0,0,0,0.5))'
                  }} 
                />
              </div>
              
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
                className="btn btn-sm d-flex align-items-center fw-bold shadow"
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
              <div className="w-100 d-flex justify-content-center">
                <Camara />
              </div>
            </div>
          )}

          {/* MODO GALERÍA */}
          {vistaActual === "galeria" && (
            <div className="animate__animated animate__fadeIn w-100 d-flex flex-column align-items-center">
               <button 
                className="btn btn-sm d-flex align-items-center fw-bold shadow"
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

      {/* IMAGEN DE AURORA - Solo se muestra en el MENU */}
      {vistaActual === "menu" && (
        <div 
          className="position-fixed animate__animated animate__fadeInUp" 
          style={{ 
            bottom: '0', 
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 1000,
            lineHeight: '0'
          }}
        >
          <img 
            src={auroraImg} 
            alt="Aurora" 
            className="img-fluid"
            style={{ 
              maxHeight: '170px', 
              width: 'auto',
              display: 'block'
            }} 
          />
        </div>
      )}

    </div>
  );
}

export default App;