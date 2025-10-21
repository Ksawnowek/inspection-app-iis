import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ZadaniaPage from "./pages/ZadaniaPage";
import ZadaniePozycjePage from "./pages/ZadaniePozycjePage";
import ProtokolPage from "./pages/ProtokolPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ZadaniaPage />} />
        <Route path="/zadania/:znagId" element={<ZadaniePozycjePage />} />
        <Route path="/protokol/:pnaglId" element={<ProtokolPage />} />
      </Routes>
    </BrowserRouter>
  );
}
