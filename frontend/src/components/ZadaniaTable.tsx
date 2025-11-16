import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Collapse, Button } from 'react-bootstrap';
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
    // KROK 1: Usuń 'table-secondary' i 'table-striped'
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
        {rows.filter(z => {
          const idAsString = String(z.vZNAG_Id);
          return idAsString.startsWith(searchPhrase);
        })
        // KROK 2: Dodaj 'index' do mapowania
        .map((z, index) => {

          // KROK 3: Ustal klasę na podstawie indeksu
          // index 0 (parzysty) = brak klasy (biały)
          // index 1 (nieparzysty) = table-secondary (szary)
          // index 2 (parzysty) = brak klasy (biały)
          // ...itd.
          const rowClass = index % 2 !== 0 ? 'table-secondary' : 'table-active';

          return (
            <React.Fragment key={z.vZNAG_Id}>
              {/* KROK 4: Zastosuj dynamiczną klasę do głównego wiersza */}
              <tr
                onClick={() => onRowClick(z.vZNAG_Id)}
                style={{ cursor: 'pointer' }}
                className={rowClass}
              >
                <td>{z.vZNAG_Id}</td>
                <td>{z.vZNAG_TypPrzegladu}</td>
                <td>{z.vZNAG_KlientNazwa}</td>
                <td>{z.vZNAG_KlientMiasto ?? z.vZNAG_Miejscowosc ?? "-"}</td>
                <td>{fmtDate(z.vZNAG_DataPlanowana)}</td>
                <td>
                  <Button
                    variant="primary"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/zadania/${z.vZNAG_Id}`);
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
                  {expandedId === z.vZNAG_Id ? "▾" : "▸"}
                </td>
              </tr>

              {/* KROK 5: Zastosuj tę samą klasę do wiersza ze szczegółami */}
              <tr className={`details-pane ${rowClass}`}>
                <td colSpan={8} style={{ padding: 0 }}>
                  <Collapse in={expandedId === z.vZNAG_Id}>
                    <div>
                      {/* Tabela wewnętrzna nie potrzebuje zmian */}
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
                    </div>
                  </Collapse>
                </td>
              </tr>
            </React.Fragment>
          );
        })}
      </tbody>
    </table>
  );
};

export default ZadaniaTable;