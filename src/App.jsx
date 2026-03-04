import React, { useState } from 'react';
import Camara from './components/Camara';
import Galeria from './components/Galeria'; 

function App() {
  // Usamos un estado para saber qué componente mostrar
  // "menu" = botones principales, "camara" = la cámara, "galeria" = las fotos
  const [vistaActual, setVistaActual] = useState("menu");

  return (
    <div className="container-fluid min-vh-100 py-4 d-flex align-items-center" style={{ backgroundColor: '#1a1a1a' }}>
      <div className="row justify-content-center w-100">
        <div className="col-12 col-md-6 text-center">
          
          {/* MODO MENÚ: Los dos botones principales */}
          {vistaActual === "menu" && (
            <div className="d-flex flex-column gap-4 animate__animated animate__fadeIn">
              <h1 className="text-white mb-4 fw-bold" style={{ color: '#f8bbd0' }}>Cumple de Aurora</h1>
              
              <button 
                className="btn btn-primary py-4 rounded-pill shadow-lg border-white border-2 fw-bold"
                onClick={() => setVistaActual("camara")}
                style={{ fontSize: '20px', backgroundColor: '#007bff' }}
              >
                📸 SACAR FOTO
              </button>

              <button 
                className="btn btn-info py-4 rounded-pill shadow-lg border-white border-2 fw-bold text-white"
                onClick={() => setVistaActual("galeria")}
                style={{ fontSize: '20px', backgroundColor: '#17a2b8' }}
              >
                🖼️ VER GALERÍA
              </button>
            </div>
          )}

          {/* MODO CÁMARA */}
          {vistaActual === "camara" && (
            <div className="position-relative">
              {/* Botón para volver al menú */}
              <button 
                className="btn btn-sm btn-outline-light position-absolute top-0 start-0 m-2"
                style={{ zIndex: 100, borderRadius: '20px' }}
                onClick={() => setVistaActual("menu")}
              >
                ← Volver
              </button>
              <Camara />
            </div>
          )}

          {/* MODO GALERÍA */}
          {vistaActual === "galeria" && (
            <div>
               <button 
                className="btn btn-sm btn-outline-light mb-3"
                style={{ borderRadius: '20px' }}
                onClick={() => setVistaActual("menu")}
              >
                ← Volver al Menú
              </button>
              <Galeria />
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default App;
