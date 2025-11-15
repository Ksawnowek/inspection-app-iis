import React from 'react';
import { Link } from 'react-router-dom';
import { Zadanie } from '../types'; // Założenie, że typy są w '../types'

// Definicja propsów dla nowego komponentu
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

  // DEBUG: Sprawdź co przychodzi z API
  React.useEffect(() => {
    if (rows.length > 0) {
      console.log('=== DEBUG: Pierwsze zadanie ===');
      console.log('Typ przeglądu:', rows[0].vZNAG_TypPrzegladu);
      console.log('Kategoria kod:', rows[0].vZNAG_KategoriaKod);
      console.log('Urządzenie:', rows[0].vZNAG_Urzadzenie);
      console.log('Tonaż:', rows[0].vZNAG_Tonaz);
      console.log('Awaria numer:', rows[0].vZNAG_AwariaNumer);
      console.log('OkrGwar:', rows[0].vZNAG_OkrGwar);
      console.log('Wszystkie klucze:', Object.keys(rows[0]));

      // Sprawdź ile jest zadań każdego typu
      const typeCounts: Record<string, number> = {};
      const kategoriaCounts: Record<string, number> = {};
      rows.forEach(z => {
        const typ = z.vZNAG_TypPrzegladu || 'NULL';
        const kat = z.vZNAG_KategoriaKod || 'NULL';
        typeCounts[typ] = (typeCounts[typ] || 0) + 1;
        kategoriaCounts[kat] = (kategoriaCounts[kat] || 0) + 1;
      });
      console.log('Zadania według typu:', typeCounts);
      console.log('Zadania według kategorii (KOD):', kategoriaCounts);
    }
  }, [rows]);

  const fmtDate = (d?: string | null) => {
    if (!d) return "-";
    const dt = new Date(d);
    return isNaN(+dt) ? d : dt.toLocaleDateString("pl-PL");
  };

  return (
    <table className="table table-secondary table-striped table-shadow">
      <thead>
        <tr>
          <th>ID</th>
          <th>Typ</th>
          <th>Klient</th>
          <th>Miejscowość</th>
          <th>Plan</th>
          <th>Akcje</th>
        </tr>
      </thead>
      <tbody>
        {rows.filter(z => {
          const idAsString = String(z.vZNAG_Id);
          return idAsString.startsWith(searchPhrase);
        }).map((z) => (
          // React.Fragment użyty, bo map musi zwracać jeden element
          <React.Fragment key={z.vZNAG_Id}>
            <tr onClick={() => onRowClick(z.vZNAG_Id)} style={{ cursor: 'pointer' }}>
              <td>{z.vZNAG_Id}</td>
              <td>{z.vZNAG_TypPrzegladu}</td>
              <td>{z.vZNAG_KlientNazwa}</td>
              <td>{z.vZNAG_KlientMiasto ?? z.vZNAG_Miejscowosc ?? "-"}</td>
              <td>{fmtDate(z.vZNAG_DataPlanowana)}</td>
              <td style={{ display: "flex", gap: 8 }}>
                <Link to={`/zadania/${z.vZNAG_Id}`}>Otwórz</Link>
                <button
                  onClick={(e) => {
                    // Zatrzymaj propagację, by kliknięcie przycisku nie rozwinęło wiersza
                    e.stopPropagation();
                    onPdfClick(z.vZNAG_Id); // Użycie funkcji z props
                  }}
                  disabled={busyId === z.vZNAG_Id}
                >
                  {busyId === z.vZNAG_Id ? "Generuję…" : "PDF"}
                </button>
              </td>
            </tr>

            {/* Renderowanie warunkowe wiersza szczegółów */}
            {expandedId === z.vZNAG_Id && (
              <tr className="details-pane">
                {/* 1. Komórka rozpięta na 6 kolumn, bez wewnętrznego paddingu */}
                <td colSpan={6} style={{ padding: 0 }}> {/* Poprawiony colSpan na 6 */}

                  {/* 2. Zagnieżdżona tabela (użyłem klas Bootstrapa) */}
                  {/* Użyłem 'table-light' dla lekkiego tła */}
                  <table className="table table-light table-striped w-100 mb-0 details-table">

                    {/* Opcjonalny nagłówek dla przejrzystości */}
                    <thead>
                      <tr>
                        <th style={{ width: '30%' }}>Element</th>
                        <th>Status / Dane</th>
                        <th style={{ textAlign: 'right' }}>Akcja</th>
                      </tr>
                    </thead>
                    <tbody>
                      {/* Wiersz 1: Uwagi */}
                      <tr>
                        <td><strong>Uwagi</strong></td>
                        <td>{z.vZNAG_Uwagi || "Brak uwag"}</td>
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
                        <td>{z.vZNAG_UwagiGodziny || "Nie zaraportowano"}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            // 3. Podpinamy drugą funkcję
                            onClick={(e) => { e.stopPropagation(); onShowGodzinyModal(z); }}
                            >
                            Zarządzaj godzinami
                          </button>
                        </td>
                      </tr>

                      {/* Wiersz 3: Podpis klienta */}
                      <tr>
                        <td><strong>Podpis klienta</strong></td>
                        <td>{z.vZNAG_KlientPodpis ? "Złożony" : "Brak podpisu"}</td>
                        <td style={{ textAlign: 'right' }}>
                          <button
                            className="btn btn-sm btn-outline-primary"
                            // 3. Podpinamy trzecią funkcję
                            onClick={(e) => { e.stopPropagation(); onShowPodpisModal(z); }}
                            >
                            Pokaż / Złóż podpis
                          </button>
                        </td>
                      </tr>

                      {/* Wiersz 4: Dane awarii/prac różnych (tylko dla kategorii R i T) */}
                      {(z.vZNAG_KategoriaKod === 'R' || z.vZNAG_KategoriaKod === 'T') && (
                        <tr>
                          <td><strong>{z.vZNAG_KategoriaKod === 'R' ? 'Dane awarii' : 'Dane prac różnych'}</strong></td>
                          <td>
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
                </td>
              </tr>
            )}
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};

export default ZadaniaTable;
