// components/RaportGenerator.tsx
import React, { useState } from 'react';
import axios from 'axios';

interface RaportGeneratorProps {
  zadanieId: number;
  kategoria: string;
  protokolId?: number;
}

export const RaportGenerator: React.FC<RaportGeneratorProps> = ({ 
  zadanieId, 
  kategoria, 
  protokolId 
}) => {
  const [loading, setLoading] = useState(false);

  const generateReport = async (type: string) => {
    setLoading(true);
    try {
      const id = type === 'konserwacja' ? protokolId : zadanieId;
      
      const response = await axios.post(
        `/api/raporty/generuj/${type}/${id}`,
        {},
        { responseType: 'blob' }
      );

      // Pobierz plik PDF
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${type}_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
    } catch (error) {
      console.error('Błąd generowania raportu:', error);
      alert('Błąd generowania raportu');
    } finally {
      setLoading(false);
    }
  };

  const getAvailableReports = () => {
    const reports = [];
    
    if (kategoria === 'AWARIA') {
      reports.push({
        type: 'awaria',
        name: 'Raport Awarii',
        icon: '🔧'
      });
    }
    
    if (kategoria === 'PRACE_ROZNE') {
      reports.push({
        type: 'prace_rozne',
        name: 'Raport Prac Różnych',
        icon: '📝'
      });
    }
    
    if (kategoria === 'KONSERWACJA' && protokolId) {
      reports.push({
        type: 'konserwacja',
        name: 'Protokół Konserwacji',
        icon: '📋'
      });
    }
    
    if (kategoria === 'MONTAZ') {
      reports.push({
        type: 'montaz',
        name: 'Raport Montażu',
        icon: '🏗️'
      });
    }
    
    return reports;
  };

  const availableReports = getAvailableReports();

  return (
    <div className="raport-generator">
      <h3>Dostępne raporty</h3>
      {availableReports.length === 0 ? (
        <p>Brak dostępnych raportów dla tego zadania</p>
      ) : (
        <div className="report-buttons">
          {availableReports.map(report => (
            <button
              key={report.type}
              onClick={() => generateReport(report.type)}
              disabled={loading}
              className="report-btn"
            >
              <span className="icon">{report.icon}</span>
              {report.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};