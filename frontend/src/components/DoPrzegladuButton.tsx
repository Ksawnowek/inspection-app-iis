import React, { useState, useEffect } from "react";

type Props = {
  isDoPrzegladu: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean; 
};

export default function DoPrzegladuButton({ 
  isDoPrzegladu, 
  onChange, 
  disabled = false 
}: Props) {
  
  const [optimisticState, setOptimisticState] = useState(isDoPrzegladu);

  useEffect(() => {
    setOptimisticState(isDoPrzegladu);
  }, [isDoPrzegladu]); 

  
  const handleClick = () => {
    const newValue = !optimisticState;
    setOptimisticState(newValue);
    onChange(newValue);
  };

  const btnText = optimisticState ? "TAK" : "NIE";
  const btnClass = optimisticState ? "btn-success" : "btn-danger";

  return (
    <button
      className={`btn ${btnClass}`}
      onClick={handleClick}
      disabled={disabled}
    >
      {btnText}
    </button>
  );
}