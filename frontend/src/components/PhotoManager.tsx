import React, { useState } from 'react';
import { Button } from 'react-bootstrap';
import { dodajZdjecieDoPozycji, usunZdjecieZPozycji } from '../api/zdjecia'; 
import Spinner from './Spinner'; // Mały spinner
import { ZdjecieProtokolPoz } from '../types';
import { CameraFill } from 'react-bootstrap-icons';

// Typ dla zdjęcia (dla przykładu)
interface Zdjecie {
  id: number;
  url: string; // URL do miniaturki
}

// Propsy dla komponentu
interface PhotoManagerProps {
  ppozId: number;
  initialZdjecia: ZdjecieProtokolPoz[];
  onSyncZdjecia: (ppozId: number, nowaListaZdjec: ZdjecieProtokolPoz[]) => void;
}

function PhotoManager({ ppozId, initialZdjecia, onSyncZdjecia }: PhotoManagerProps) {
  // Stan ładowania, aby pokazać spinner podczas uploadu/usuwania
  const [loading, setLoading] = useState(false);
  
  // Własny komponent przycisku do uploadu (używa <input type="file">)
  const PhotoButton = ({ onPick }) => {  
    const handleChange = (e) => {
      if (e.target.files && e.target.files[0]) {
        onPick(e.target.files[0]);
      }
      // Resetuj input, aby móc wybrać ten sam plik ponownie
      e.target.value = null; 
    };
    return (
      <label>
        <CameraFill 
          className="icon-hover-lift"
          size={50} 
        />
        <input type="file" accept="image/*" capture="environment" 
               onChange={handleChange} style={{ display: 'none' }} />
      </label>
    );
  };

  /**
   * Funkcja do obsługi UPLOADU
   */
  async function handleUpload(file: File) {
    setLoading(true);
    try {
      const noweZdjecie: ZdjecieProtokolPoz = await dodajZdjecieDoPozycji(ppozId, file);
      const nowaLista = [...initialZdjecia, noweZdjecie];
      onSyncZdjecia(ppozId, nowaLista);
    } catch (err) {
      console.error("Błąd dodawania zdjęcia:", err);
      alert("Nie udało się dodać zdjęcia.");
    } finally {
      setLoading(false);
    }
  }

  /**
   * Funkcja do obsługi USUNIĘCIA
   */
  async function handleDelete(zdjecieId: number) {
    if (!confirm("Czy na pewno usunąć to zdjęcie?")) return;
    
    setLoading(true);
    try {
      await usunZdjecieZPozycji(zdjecieId);
      const nowaLista = initialZdjecia.filter(z => z.ZDJP_Id !== zdjecieId);
      onSyncZdjecia(ppozId, nowaLista);

    } catch (err) {
      console.error("Błąd usuwania zdjęcia:", err);
      alert("Nie udało się usunąć zdjęcia.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div style={{ fontWeight: 600, fontSize: '0.9em', marginBottom: 4 }}>Zdjęcia:</div>
      
      {/* Lista miniaturek */}
      <div className='align-items-center' style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {initialZdjecia && initialZdjecia.map(zdjecie => (
          <div key={zdjecie.ZDJP_Id} style={{ position: 'relative' }}>
            <img src={"http://localhost:8080" + zdjecie.ZDJP_Sciezka} alt="miniaturka" style={{ width: 80, height: 80, objectFit: 'cover', borderRadius: 4 }} />
            <Button 
              variant="danger"
              onClick={() => handleDelete(zdjecie.ZDJP_Id)}
              style={{ position: 'absolute', top: 2, right: 2, cursor: 'pointer'}}
            >
              X
            </Button>
          </div>
        ))}
        
        {/* Przycisk dodawania lub spinner */}
        {loading ? (
          <Spinner />
        ) : (
          <PhotoButton onPick={handleUpload} />
        )}
      </div>
    </div>
  );
}

export default PhotoManager;