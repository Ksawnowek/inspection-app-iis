// frontend/src/components/ZadaniaList.tsx
import React from "react";

type Zadanie = { ZNAG_Id: number; ZNAG_KlientNazwa: string; ZNAG_DataPlanowana?: string };

export const ZadaniaList: React.FC<{ items: Zadanie[] }> = ({ items }) => {
  const handlePdf = async (id: number) => {
    const resp = await fetch(`/api/zadania/${id}/pdf`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ serwisanci: ["Koordynator", "Serwisant"] }),
    });
    if (!resp.ok) {
      alert("Nie udało się wygenerować PDF");
      return;
    }
    const blob = await resp.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `zadanie_${id}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <table className="table">
      <thead>
        <tr>
          <th>Nr</th><th>Klient</th><th>Plan</th><th>Akcje</th>
        </tr>
      </thead>
      <tbody>
        {items.map(z => (
          <tr key={z.ZNAG_Id}>
            <td>{z.ZNAG_Id}</td>
            <td>{z.ZNAG_KlientNazwa}</td>
            <td>{z.ZNAG_DataPlanowana || "-"}</td>
            <td><button onClick={() => handlePdf(z.ZNAG_Id)}>PDF</button></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
