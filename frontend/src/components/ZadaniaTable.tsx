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

  // Filtrowanie zadań na podstawie wyszukiwania
  const getFilteredRows = () => {
    return rows.filter(z => {
      const idAsString = String(z.vZNAG_Id);
      const klientNazwa = (z.vZNAG_KlientNazwa || '').toLowerCase();
      const searchLower = searchPhrase.toLowerCase();

      return idAsString.startsWith(searchPhrase) || klientNazwa.includes(searchLower);
    });
  };

  const filteredRows = getFilteredRows();

  // Podział zadań na otwarte i zamknięte (archiwalne)
  // Archiwalne = zadanie z podpisem klienta I datą wykonania
  const otwarte = filteredRows.filter(z => !(z.vZNAG_KlientPodpis && z.vZNAG_DataWykonania));
  const zamkniete = filteredRows
    .filter(z => !!(z.vZNAG_KlientPodpis && z.vZNAG_DataWykonania))
    .sort((a, b) => {
      // Sortowanie od najnowszych (malejąco)
      const dateA = a.vZNAG_DataWykonania ? new Date(a.vZNAG_DataWykonania).getTime() : 0;
      const dateB = b.vZNAG_DataWykonania ? new Date(b.vZNAG_DataWykonania).getTime() : 0;
      return dateB - dateA;
    });

  // Kategoryzacja zadań otwartych
  const getCategoryName = (kategoriaKod?: string | null): string => {
    if (!kategoriaKod) return 'Inne';
    // P = Przeglądy/Konserwacja, R = Awarie, T = Prace różne
    switch (kategoriaKod.toUpperCase()) {
      case 'P': return 'Konserwacja (przeglądy)';
      case 'R': return 'Awarie';
      case 'T': return 'Prace różne';
      default: return 'Inne';
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
    // Zadanie jest archiwalne jeśli ma podpis klienta
    const isArchival = !!z.vZNAG_KlientPodpis;

    // Dla awarii (R) i prac różnych (T) nie rozwijamy szczegółów
    const isAwariaOrPraceRozne = z.vZNAG_KategoriaKod?.toUpperCase() === 'R' || z.vZNAG_KategoriaKod?.toUpperCase() === 'T';

    // Określ ścieżkę do której ma przekierować przycisk "Otwórz"
    const openPath = isAwariaOrPraceRozne ? `/awaria/${z.vZNAG_Id}` : `/zadania/${z.vZNAG_Id}`;

    return (
      <React.Fragment key={z.vZNAG_Id}>
        <tr
          onClick={() => !isAwariaOrPraceRozne && onRowClick(z.vZNAG_Id)}
          style={{
            cursor: isAwariaOrPraceRozne ? 'default' : 'pointer',
            color: isArchival ? '#dc3545' : 'inherit',
            fontWeight: isArchival ? 'bold' : 'normal'
          }}
          className={rowClass}
        >
          <td>
            {z.vZNAG_Id}
            {isArchival && <span style={{ marginLeft: '8px', fontSize: '0.8em' }}>(ARCHIWALNE)</span>}
          </td>
          <td>{z.vZNAG_TypPrzegladu}</td>
          <td>{z.vZNAG_KlientNazwa}</td>
          <td>{z.vZNAG_KlientMiasto ?? z.vZNAG_Miejscowosc ?? "-"}</td>
          <td>{fmtDate(z.vZNAG_DataPlanowana)}</td>
          {showDataWykonania && <td>{fmtDate(z.vZNAG_DataWykonania)}</td>}
          <td>
            <Button
              variant="primary"
              onClick={(e) => {
                e.stopPropagation();
                navigate(openPath);
              }}
            >
              Otwórz
            </Button>
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
          <td>
            {!isAwariaOrPraceRozne && (expandedId === z.vZNAG_Id ? "▾" : "▸")}
          </td>
        </tr>

        {/* Wiersz ze szczegółami - tylko dla przeglądów (kategoria P) */}
        {!isAwariaOrPraceRozne && (
        <tr className={`details-pane ${rowClass}`}>
          <td colSpan={showDataWykonania ? 9 : 8} style={{ padding: 0 }}>
            <Collapse in={expandedId === z.vZNAG_Id}>
              <div>
                <table className="table table-light table-striped w-100 mb-0 details-table">
                  <thead>
                    <tr>
                      <th style={{ width: '30%' }}>Element</th>
                      <th>Status / Dane</th>
                      <th style={{ textAlign: 'right' }}>Akcja</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td><strong>Uwagi</strong></td>
                      <td style={{
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                        maxWidth: '400px'
                      }}>
                        {z.vZNAG_Uwagi || "Brak uwag"}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={(e) => { e.stopPropagation(); onShowUwagiModal(z); }}
                        >
                          Zarządzaj uwagami
                        </button>
                      </td>
                    </tr>

                    <tr>
                      <td><strong>Godziny</strong></td>
                      <td style={{
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        wordBreak: 'break-word',
                        maxWidth: '400px'
                      }}>
                        {(() => {
                          const godziny = [];
                          if (z.vZNAG_GodzSwieta) godziny.push(`Święta: ${z.vZNAG_GodzSwieta}`);
                          if (z.vZNAG_GodzSobNoc) godziny.push(`Sob/Noc: ${z.vZNAG_GodzSobNoc}`);
                          if (z.vZNAG_GodzDojazdu) godziny.push(`Dojazd: ${z.vZNAG_GodzDojazdu}`);
                          if (z.vZNAG_GodzNaprawa) godziny.push(`Naprawa: ${z.vZNAG_GodzNaprawa}`);
                          if (z.vZNAG_GodzWyjazd) godziny.push(`Wyjazd: ${z.vZNAG_GodzWyjazd}`);
                          if (z.vZNAG_GodzDieta) godziny.push(`Dieta: ${z.vZNAG_GodzDieta}`);
                          if (z.vZNAG_GodzKm) godziny.push(`Km: ${z.vZNAG_GodzKm}`);
                          return godziny.length > 0 ? godziny.join(', ') : "Nie zaraportowano";
                        })()}
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={(e) => { e.stopPropagation(); onShowGodzinyModal(z); }}
                        >
                          Zarządzaj godzinami
                        </button>
                      </td>
                    </tr>

                    <tr>
                      <td><strong>Podpis klienta</strong></td>
                      <td>{z.vZNAG_KlientPodpis ? "Złożony" : "Brak podpisu"}</td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={(e) => { e.stopPropagation(); onShowPodpisModal(z); }}
                        >
                          Pokaż / Złóż podpis
                        </button>
                      </td>
                    </tr>

                    {(z.vZNAG_KategoriaKod === 'R' || z.vZNAG_KategoriaKod === 'T') && (
                      <tr>
                        <td><strong>{z.vZNAG_KategoriaKod === 'R' ? 'Dane awarii' : 'Dane prac różnych'}</strong></td>
                        <td style={{
                          wordWrap: 'break-word',
                          overflowWrap: 'break-word',
                          wordBreak: 'break-word',
                          maxWidth: '400px'
                        }}>
                          {z.vZNAG_Urzadzenie || z.vZNAG_Tonaz || z.vZNAG_AwariaNumer
                            ? `${z.vZNAG_Urzadzenie || '-'} / ${z.vZNAG_Tonaz || '-'} / ${z.vZNAG_AwariaNumer || '-'} / ${z.vZNAG_OkrGwar ? 'Gwarancja: TAK' : 'Gwarancja: NIE'}`
                            : "Brak danych"
                          }
                        </td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={(e) => { e.stopPropagation(); onShowDetailsModal(z); }}
                          >
                            Zarządzaj danymi
                          </button>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Collapse>
          </td>
        </tr>
        )}
      </React.Fragment>
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
              <th colSpan={3}>Akcje</th>
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
          {inne.length > 0 && renderCategorySection('Inne', inne)}

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
                  <th colSpan={3}>Akcje</th>
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
