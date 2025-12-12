import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Collapse, Button, Nav } from 'react-bootstrap';
import { Zadanie } from '../types';

interface ZadaniaTableProps {
  rows: Zadanie[];
  searchPhrase: string;
  expandedId: number | null;
  busyId: number | null;
  onRowClick: (id: number) => void;
  onPdfClick: (id: number) => void;
  onShowUwagiModal: (zadanie: Zadanie) => void;
  onShowGodzinyModal: (zadanie: Zadanie) => void;
  onShowPodpisModal: (zadanie: Zadanie) => void;
  onShowDetailsModal: (zadanie: Zadanie) => void;
}

const ZadaniaTable: React.FC<ZadaniaTableProps> = ({
  rows,
  searchPhrase,
  expandedId,
  busyId,
  onRowClick,
  onPdfClick,
  onShowUwagiModal,
  onShowGodzinyModal,
  onShowPodpisModal,
  onShowDetailsModal
}) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'otwarte' | 'zamkniete'>('otwarte');

  const fmtDate = (d?: string | null) => {
    if (!d) return "-";
    const dt = new Date(d);
    return isNaN(+dt) ? d : dt.toLocaleDateString("pl-PL");
  };

  // Nie filtrujemy tutaj, bo filtrowanie jest wykonywane po stronie serwera
  const filteredRows = rows;

  // Podział zadań na otwarte i zamknięte
  // Zamknięte = zadanie z podpisem klienta
  const otwarte = filteredRows.filter(z => !z.vZNAG_KlientPodpis);
  const zamkniete = filteredRows
    .filter(z => !!z.vZNAG_KlientPodpis)
    .sort((a, b) => {
      // Sortowanie od najnowszych (malejąco) - jeśli jest data wykonania
      const dateA = a.vZNAG_DataWykonania ? new Date(a.vZNAG_DataWykonania).getTime() : 0;
      const dateB = b.vZNAG_DataWykonania ? new Date(b.vZNAG_DataWykonania).getTime() : 0;
      return dateB - dateA;
    });

  // Kategoryzacja zadań otwartych
  const getCategoryName = (kategoriaKod?: string | null): string => {
    if (!kategoriaKod) return 'Konserwacja';
    // P = Przeglądy/Konserwacja, R = Awarie, T = Prace różne
    switch (kategoriaKod.toUpperCase()) {
      case 'P': return 'Konserwacja (przeglądy)';
      case 'R': return 'Awarie';
      case 'T': return 'Prace różne';
      default: return 'Konserwacja';
    }
  };

  const konserwacja = otwarte.filter(z => z.vZNAG_KategoriaKod?.toUpperCase() === 'P');
  const awarieIPraceRozne = otwarte.filter(z =>
    z.vZNAG_KategoriaKod?.toUpperCase() === 'R' || z.vZNAG_KategoriaKod?.toUpperCase() === 'T'
  );
  const inne = otwarte.filter(z => {
    const kod = z.vZNAG_KategoriaKod?.toUpperCase();
    return !kod || !['P', 'R', 'T'].includes(kod);
  });

  const renderTaskRow = (z: Zadanie, index: number, showDataWykonania: boolean = false) => {
    const rowClass = index % 2 !== 0 ? 'table-secondary' : '';

    // Określ ścieżkę do której ma przekierować przycisk "Otwórz"
    const isAwariaOrPraceRozne = z.vZNAG_KategoriaKod?.toUpperCase() === 'R' || z.vZNAG_KategoriaKod?.toUpperCase() === 'T';
    const openPath = isAwariaOrPraceRozne ? `/awaria/${z.vZNAG_Id}` : `/zadania/${z.vZNAG_Id}`;

    // Zamknięte zadania to te z podpisem (showDataWykonania wskazuje na zamknięte)
    const isZamkniete = showDataWykonania;

    return (
      <tr key={z.vZNAG_Id} className={rowClass}>
        <td>
          {z.vZNAG_Id}
        </td>
        <td>{z.vZNAG_TypPrzegladu}</td>
        <td>{z.vZNAG_KlientNazwa}</td>
        <td>{z.vZNAG_KlientMiasto ?? z.vZNAG_Miejscowosc ?? "-"}</td>
        <td>{fmtDate(z.vZNAG_DataPlanowana)}</td>
        {showDataWykonania && <td>{fmtDate(z.vZNAG_DataWykonania)}</td>}
        <td>
          {!isZamkniete && (
            <Button
              variant="primary"
              onClick={(e) => {
                e.stopPropagation();
                navigate(openPath);
              }}
            >
              Otwórz
            </Button>
          )}
        </td>
        <td>
          <Button
            variant="primary"
            onClick={(e) => {
              e.stopPropagation();
              onPdfClick(z.vZNAG_Id);
            }}
            disabled={busyId === z.vZNAG_Id}
          >
            {busyId === z.vZNAG_Id ? "Generuję…" : "PDF"}
          </Button>
        </td>
      </tr>
    );
  };

  const renderCategorySection = (categoryName: string, tasks: Zadanie[]) => {
    if (tasks.length === 0) return null;

    return (
      <div className="mb-4">
        <h5 className="mt-3 mb-2 px-2 py-2 bg-light border-start border-primary border-4">
          {categoryName} ({tasks.length})
        </h5>
        <table className="table table-shadow">
          <thead>
            <tr>
              <th>ID</th>
              <th>Typ</th>
              <th>Klient</th>
              <th>Miejscowość</th>
              <th>Plan</th>
              <th colSpan={2}>Akcje</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, index) => renderTaskRow(task, index, false))}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div>
      {/* Zakładki */}
      <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k as 'otwarte' | 'zamkniete')} className="mb-3">
        <Nav.Item>
          <Nav.Link eventKey="otwarte" style={{ backgroundColor: activeTab === 'otwarte' ? '#e7f3ff' : 'transparent' }}>
            OTWARTE ({otwarte.length})
          </Nav.Link>
        </Nav.Item>
        <Nav.Item>
          <Nav.Link eventKey="zamkniete" style={{ backgroundColor: activeTab === 'zamkniete' ? '#e7f3ff' : 'transparent' }}>
            ZAMKNIĘTE ({zamkniete.length})
          </Nav.Link>
        </Nav.Item>
      </Nav>

      {/* Zawartość zakładek */}
      {activeTab === 'otwarte' && (
        <div>
          {renderCategorySection('Konserwacja (przeglądy)', konserwacja)}
          {renderCategorySection('Awarie i prace różne', awarieIPraceRozne)}
          {inne.length > 0 && renderCategorySection('Konserwacja', inne)}

          {otwarte.length === 0 && (
            <div className="alert alert-info">
              Brak otwartych zadań.
            </div>
          )}
        </div>
      )}

      {activeTab === 'zamkniete' && (
        <div>
          {zamkniete.length === 0 ? (
            <div className="alert alert-info">
              Brak zamkniętych zadań.
            </div>
          ) : (
            <table className="table table-shadow">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Typ</th>
                  <th>Klient</th>
                  <th>Miejscowość</th>
                  <th>Plan</th>
                  <th>Data przeglądu</th>
                  <th colSpan={2}>Akcje</th>
                </tr>
              </thead>
              <tbody>
                {zamkniete.map((task, index) => renderTaskRow(task, index, true))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
};

export default ZadaniaTable;
