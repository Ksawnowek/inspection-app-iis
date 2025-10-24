import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import ZadaniaPage from "./pages/ZadaniaPage";
import ZadaniePozycjePage from "./pages/ZadaniePozycjePage";
import ProtokolPage from "./pages/ProtokolPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import NotFoundPage from "./pages/NotFoundPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ZadaniaPage />} />
        <Route path="/zadania/:znagId" element={<ZadaniePozycjePage />} />
        <Route path="/protokol/:pnaglId" element={<ProtokolPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
