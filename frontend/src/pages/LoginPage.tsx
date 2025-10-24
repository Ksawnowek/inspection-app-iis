import {act, useState, ChangeEvent} from "react";
import {tryLogin} from "../api/auth"

export default function LoginPage() {
  const [login, setLogin] = useState<string>("");
  const [passowrd, setPassword] = useState<string>("");
  const [formData, setFormData] = useState({
    login: '', 
    password: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await tryLogin(formData.login, formData.password);

      if (response.status === 'success') {
        
        console.log("Logowanie udane:", response.message);
        
        window.location.href = '/'; 

      } else {
        console.error("Błąd logowania:", response.message);
      }

    } catch (error) {
      console.error("Wystąpił błąd połączenia:", error);
    }
  };



  return (
    <div id="container" className="min-vh-100 min-vw-100 d-flex justify-content-center align-items-center">
    <div id="login-form-div" className="d-flex justify-content-center align-items-center">
      <form onSubmit={handleSubmit} id="login-form" className="d-flex flex-column justify-content-center align-items-center">
        <div>
          <h4>Zaloguj się</h4>
        </div>
        <div className="m-2 p-2 d-flex flex-column justify-content-center">
          <label htmlFor="login">Login</label>
          <input
            name="login"
            placeholder="Login"
            value={formData.login}
            onChange={handleChange}
          />
        </div>
        <div className="m-2 p-2 d-flex flex-column justify-content-center">
          <label htmlFor="password" >Hasło</label>
          <input
            name="password"
            placeholder="Hasło"
            type="password"
            value={formData.password}
            onChange={handleChange}
          />
        </div>
        <button type="submit">Zaloguj</button>
      </form>
    </div>
   </div>
  );
}
