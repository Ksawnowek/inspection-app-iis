import React from 'react';


const Spinner: React.FC = () => {
  return (
    <div className="d-flex justify-content-center my-5" aria-live="polite" aria-atomic="true">
      
      <div className="spinner-border" role="status">
        
        <span className="visually-hidden">Ładowanie...</span>
      
      </div>
    </div>
  );
};

export default Spinner;