import React from "react";

type Props = {
  checked: boolean;
  onChange: (v: boolean) => void;
};

export default function DoPrzegladuSwitch({ checked, onChange }: Props) {
  return (
    <label style={{ display: "inline-flex", gap: 8, alignItems: "center", cursor: "pointer" }}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span>Do przeglądu</span>
    </label>
  );
}
