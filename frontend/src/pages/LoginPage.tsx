import { useState, ChangeEvent, FormEvent } from "react"; // Dodano typy
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom'; // <-- KROK 1: Import do przekierowania
import toast from 'react-hot-toast';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';

export default function LoginPage() {
  const [formData, setFormData] = useState({
    login: '', 
    password: ''
  });
  
  // Zmieniona nazwa dla spójności
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null); // Stan na błędy w Alercie
  
  const { login } = useAuth();
  const navigate = useNavigate(); // <-- KROK 2: Inicjalizacja hooka

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: value
    }));
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null); // Wyczyść stare błędy

    try {
      await toast.promise(
        login(formData.login, formData.password), 
        {
          loading: 'Logowanie...', 
          success: 'Zalogowano pomyślnie!',
          error: (err) => `Błąd: ${err.message || 'Nieprawidłowy login lub hasło'}`, 
        }
      );
      
      // Sukces!
      // <-- KROK 3: Użyj navigate zamiast window.location.href
      setTimeout(() => {
        navigate('/'); // Przekieruj na stronę główną
      }, 500); // Opóźnienie, aby toast był widoczny

    } catch (error: any) {
      // Błąd zostanie złapany, jeśli toast.promise go "przepuści" (re-throw)
      setError(error.message || "Nieprawidłowy login lub hasło");
      console.error("Wystąpił błąd logowania:", error);
    }
    finally{
      setIsSubmitting(false);
    }
  };

  return (
    <Container fluid className="min-vh-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: '#f4f7f6' }}>
      <Row className="w-100">
        <Col md={6} lg={4} className="mx-auto">
          <Card className="shadow-lg border-0">
            <Card.Body className="p-4 p-md-5">
              <h4 className="text-center mb-4">Zaloguj się</h4>
              
              <Form onSubmit={handleSubmit}>
                
                {/* Alert do wyświetlania błędów logowania */}
                {error && <Alert variant="danger">{error}</Alert>}

                <Form.Group className="mb-3" controlId="login">
                  <Form.Label>Login</Form.Label>
                  <Form.Control
                    type="text"
                    name="login"
                    placeholder="Wprowadź login"
                    value={formData.login}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="password">
                  <Form.Label>Hasło</Form.Label>
                  <Form.Control
                    type="password"
                    name="password"
                    placeholder="Wprowadź hasło"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 mt-3"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Logowanie..." : "Zaloguj"}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}