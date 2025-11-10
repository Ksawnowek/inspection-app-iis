import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Collapse, Button } from 'react-bootstrap'; // Import Collapse
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
  onShowPodpisModal
}) => {
  const navigate = useNavigate();

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
          <th colSpan={3}>Akcje</th>
        </tr>
      </thead>
      <tbody>
        {rows.filter(z => {
          const idAsString = String(z.vZNAG_Id);
          return idAsString.startsWith(searchPhrase);
        }).map((z) => (
          <React.Fragment key={z.vZNAG_Id}>
            <tr onClick={() => onRowClick(z.vZNAG_Id)} style={{ cursor: 'pointer' }}>
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

            {/* Wiersz z Collapse */}
            <tr className="details-pane">
              <td colSpan={8} style={{ padding: 0 }}>
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
                      </tbody>
                    </table>
                  </div>
                </Collapse>
              </td>
            </tr>
          </React.Fragment>
        ))}
      </tbody>
    </table>
  );
};

export default ZadaniaTable;