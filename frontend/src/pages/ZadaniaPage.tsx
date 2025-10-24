import React, { useEffect, useState } from "react";
import { getZadania, generateZadaniePdf } from "../api/zadania";
import { Zadanie } from "../types";
import { Link } from "react-router-dom";

export default function ZadaniaPage() {
  const [rows, setRows] = useState<Zadanie[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<number | null>(null);
  const [searchPhrase, setSearchPhrase] = useState('');



  useEffect(() => {
    getZadania().then(setRows).finally(() => setLoading(false));
  }, []);

  const fmtDate = (d?: string | null) => {
    if (!d) return "-";
    const dt = new Date(d);
    return isNaN(+dt) ? d : dt.toLocaleDateString("pl-PL");
  };

  const handlePdf = async (id: number) => {
    try {
      setBusyId(id);
      // podaj tu serwisantów jeśli chcesz, na razie przykładowo:
      const blob = await generateZadaniePdf(id, ["Koordynator", "Serwisant"]);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `zadanie_${id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(`Nie udało się wygenerować PDF:\n${e?.message ?? e}`);
    } finally {
      setBusyId(null);
    }
  };

  const handleSearchSubmit = () => {
    let visibleRows = rows.filter( z => {
            const idAsString = String(z.ZNAG_Id);
            return idAsString.startsWith(searchPhrase);
          });
    if(visibleRows.length == 1){
      let href = '/zadania/' + visibleRows[0].ZNAG_Id;
      window.location.href = href; 
    }
      
  };

  if (loading) return <p>Ładowanie…</p>;

  return (
    <div className="container">


      <h2>Zadania</h2>
      <div className="search-bar p-2 d-flex w-100">
        <input
        className="w-100"
        type="text"
        name="searchPhrase"
        value={searchPhrase}
        onChange={(e) => setSearchPhrase(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            e.preventDefault(); 
            handleSearchSubmit();
          }
        }}
        placeholder="Wyszukaj ID..."
        />
      </div>
      <table>
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
          {rows.filter( z => {
            const idAsString = String(z.ZNAG_Id);
            return idAsString.startsWith(searchPhrase);
          }).map((z) => (
            <tr key={z.ZNAG_Id}>
              <td>{z.ZNAG_Id}</td>
              <td>{z.ZNAG_TypPrzegladu}</td>
              <td>{z.ZNAG_KlientNazwa}</td>
              <td>{z.ZNAG_KlientMiasto ?? z.ZNAG_Miejscowosc ?? "-"}</td>
              <td>{fmtDate(z.ZNAG_DataPlanowana)}</td>
              <td style={{ display: "flex", gap: 8 }}>
                <Link to={`/zadania/${z.ZNAG_Id}`}>Otwórz</Link>
                <button
                  onClick={() => handlePdf(z.ZNAG_Id)}
                  disabled={busyId === z.ZNAG_Id}
                >
                  {busyId === z.ZNAG_Id ? "Generuję…" : "PDF"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
