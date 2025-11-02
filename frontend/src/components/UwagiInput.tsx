import React, { useState, useEffect } from 'react';

export function UwagiInput({ ppozId, initialValue, onChange: save }) {
  const [value, setValue] = useState(initialValue ?? "");

  useEffect(() => {
    setValue(initialValue ?? "");
  }, [initialValue]);

  function handleBlur() {
    if (value !== (initialValue ?? "")) {
      save(ppozId, { PPOZ_Uwagi: value });
    }
  }

  return (
    <input
      placeholder="Uwagi…"
      value={value}
      onChange={(e) => setValue(e.target.value)}
      onBlur={handleBlur}
      style={{ width: "100%" }}
    />
  );
}