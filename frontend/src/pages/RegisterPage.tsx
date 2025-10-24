import {act, useState, ChangeEvent} from "react";
import {tryRegister} from "../api/auth"

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    login: '',
    name: '',
    surname: '',
    role: 101, 
    pwd: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const processedValue = name === 'role' ? parseInt(value, 10) : value;
    setFormData(prevData => ({
      ...prevData,
      [name]: processedValue
    }));
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await tryRegister(formData.login, formData.name, formData.surname, formData.pwd, formData.role);

      if (response.status === 'success') {
        
        console.log("Rejestracja udana:", response.message);
        

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
          <h4>Dodaj użytkownika</h4>
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
          <label htmlFor="name">Imię</label>
          <input
            name="name"
            placeholder="Imię"
            value={formData.name}
            onChange={handleChange}
          />
        </div>
        <div className="m-2 p-2 d-flex flex-column justify-content-center">
          <label htmlFor="surname">Nazwisko</label>
          <input
            name="surname"
            placeholder="Nazwisko"
            value={formData.surname}
            onChange={handleChange}
          />
        </div>
        <div className="m-2 p-2 d-flex flex-column justify-content-center">
          <label htmlFor="pwd">Hasło</label>
          <input
            name="pwd"
            placeholder="Hasło"
            type="password"
            value={formData.pwd}
            onChange={handleChange}
          />
        </div>
        <div className="m-2 p-2 d-flex flex-column justify-content-center">
          <label htmlFor="role">Rola</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
          >
            <option value="101">Serwisant</option>
            <option value="100">Kierownik</option>
          </select>
        </div>
        <button type="submit">Dodaj użytkownika</button>
      </form>
    </div>
   </div>
  );
}
