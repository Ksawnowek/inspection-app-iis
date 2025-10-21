import React, { useRef } from "react";

type Props = {
  onPick: (file: File) => void;
};

export default function PhotoButton({ onPick }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <>
      <button type="button" onClick={() => ref.current?.click()}>📷 Zdjęcie</button>
      <input
        ref={ref}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
        }}
      />
    </>
  );
}
