import Camara from './components/Camara';

function App() {
  return (
    <div className="container-fluid min-vh-100 py-4" style={{ backgroundColor: '#1a1a1a' }}>
      <div className="row justify-content-center">
        <div className="col-12 col-md-6 text-center">
          {/* <h1 className="display-4 fw-bold" style={{ color: '#ff69b4', textShadow: '0 0 10px rgba(255,105,180,0.5)' }}>
            Aurora's Birthday
          </h1> */}
          <p className="lead" style={{ color: '#f8bbd0' }}>
            Capturá un momento mágico y compartilo
          </p>
          
          <div className="mt-4">
             <Camara />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
