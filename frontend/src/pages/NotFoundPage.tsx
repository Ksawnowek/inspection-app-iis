import {React, useState, ChangeEvent} from "react";
import { ProtokolPozycja } from "../types";



export default function LoginPage() {
  const [login, setLogin] = useState<string>("");
  const [passowrd, setPassword] = useState<string>("");
  const handleLoginChange = (e: ChangeEvent<HTMLInputElement>) => {
    setLogin(e.target.value);
  };

  return (
   <div style={{ marginTop:6 }}>
              <h1>Page Not Found</h1>
    </div>
  );
}
