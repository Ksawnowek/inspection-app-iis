import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getZadaniePozycje, getZadaniePozycjeSerwisant, setDoPrzegladu } from "../api/zadania";
import { ZadaniePozycja } from "../types";
import DoPrzegladuSwitch from "../components/DoPrzegladuSwitch";
import { Button } from 'react-bootstrap'; 
import Spinner from "../components/Spinner";
import DoPrzegladuButton from "../components/DoPrzegladuButton";
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import TopBar from "../components/TopBar";
import BackButton from "../components/BackButton";

const USER = "koordynator"; // albo z logowania

export default function ZadaniePozycjePage() {
  const { znagId } = useParams();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<ZadaniePozycja[]>([]);
  const [saving, setSaving] = useState<number | null>(null);
  const { user, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  const showDoPrzegladu = user.role == "Kierownik";

  useEffect(() => {
    if (!znagId) return;
      getZadaniePozycje(Number(znagId)).then(setRows).finally(() => setLoading(false));
  }, [znagId]);

  async function toggle(zpoz: ZadaniePozycja, value: boolean) {
    try {
      await toast.promise(
        setDoPrzegladu(zpoz.ZPOZ_Id, value, USER), 
        {
          loading: 'Wykonuje operacje...', 
          success: 'Oznaczono pomyślnie!',
          error: (err) => `Błąd: ${err.message || 'Operacja niepowiodła się'}`, 
        }
      );

      setRows((prev) => prev.map(r => r.ZPOZ_Id === zpoz.ZPOZ_Id ? { ...r, ZPOZ_UrzadzenieDoPrzegladu: value ? true : false } : r));

    } catch (error) {
      console.error("Operacja nie powiodła się (obsłużone przez toast):", error);
    } 
  }

  



  return (
    <>
    <TopBar title={"Zadanie #" + znagId}/>
    <div className="container" style={{ marginTop: '70px' }}>
      <BackButton/>
      <div style={{ marginTop: 12 }}>
  {loading === false ? (
    <table style={{ width: "100%", borderCollapse: "collapse" }} className="table table-secondary table-striped table-shadow">
      <thead>
        <tr style={{ borderBottom: "1px solid #ccc" }}>
          <th style={{ padding: 8, textAlign: "left" }}>Numer</th>
          <th style={{ padding: 8, textAlign: "left" }}>Opis</th>
          {showDoPrzegladu && (
          <th style={{ padding: 8, textAlign: "left" }}>Do przeglądu</th>
          )}
          <th style={{ padding: 8, textAlign: "left" }}>Akcje</th>
        </tr>
      </thead>
      <tbody>
        {rows.map(r => (
          <tr key={r.ZPOZ_Id} style={{ borderBottom: "1px solid #eee" }}>
            
            <td style={{ padding: 8 }}>
              <b>{r.ZPOZ_UrzadzenieNumer}</b>
            </td>
            
            <td style={{ padding: 8 }}>
              {r.ZPOZ_UrzadzenieOpis}
            </td>

            {showDoPrzegladu && (
              <td style={{ padding: 8 }}>
                <DoPrzegladuButton
                  isDoPrzegladu={r.ZPOZ_UrzadzenieDoPrzegladu === true}
                  onChange={(v) => toggle(r, v)}
                ></DoPrzegladuButton>
              </td>
            )}

            <td style={{ padding: 8 }}>
              {/* {saving === r.ZPOZ_Id && <span>Zapisywanie…</span>} */}
              {r.ZPOZ_UrzadzenieDoPrzegladu === true &&
                // <Link to={`/protokol/${r.ZPOZ_Id}`}>Protokół</Link>
                <Button
                  variant="primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/protokol/${r.ZPOZ_Id}`);
                  }}
                >
                  Otwórz protokół
                </Button>}
            </td>
          
          </tr>
        ))}
      </tbody>
    </table>
  ) : (
    <Spinner />
  )}
</div>
    </div>
    </>
  );
}
