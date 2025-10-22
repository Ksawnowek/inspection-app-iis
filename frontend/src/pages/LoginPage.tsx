import {React, useState, ChangeEvent} from "react";

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
    console.log(formData.login)
    console.log(formData.password)
  };



  return (
    <div id="container" class="min-vh-100 min-vw-100 d-flex justify-content-center align-items-center">
    <div id="login-form-div" class="d-flex justify-content-center align-items-center">
      <form onSubmit={handleSubmit} id="login-form" class="d-flex flex-column justify-content-center align-items-center w-50">
        <h4>Zaloguj się</h4>
        <div class="m-2 p-2 d-flex flex-column justify-content-center">
          <label htmlFor="login">Login</label>
          <input
            name="login"
            placeholder="Login"
            value={formData.login}
            onChange={handleChange}
          />
        </div>
        <div class="m-2 p-2 d-flex flex-column justify-content-center">
          <label htmlFor="password" >Hasło</label>
          <input
            name="password"
            placeholder="Hasło"
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
