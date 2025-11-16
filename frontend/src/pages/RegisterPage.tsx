import { useState, ChangeEvent, FormEvent } from "react"; // Dodano typy
import { tryRegister } from "../api/auth";
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    login: '',
    name: '',
    surname: '',
    role: 101, 
    pwd: ''
  });
  
  // Stany do zarządzania feedbackiem dla użytkownika
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null); // Stan na sukces

  // Używamy typów ChangeEvent
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    // Twoja logika jest poprawna
    const processedValue = name === 'role' ? parseInt(value, 10) : value;
    
    setFormData(prevData => ({
      ...prevData,
      [name]: processedValue
    }));
  }

  // Używamy typu FormEvent
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    // Budujemy promisę dla toasta
    const registerPromise = tryRegister(
      formData.login, 
      formData.name, 
      formData.surname, 
      formData.pwd, 
      formData.role
    );

    try {
      // toast.promise automatycznie obsłuży stany ładowania, sukcesu i błędu
      const response = await toast.promise(registerPromise, {
        loading: 'Tworzenie konta...',
        success: (res) => {
          // Sprawdzamy odpowiedź z API
          if (res.status === 'success') {
            setSuccess(res.message || "Użytkownik dodany pomyślnie!");
            return res.message || "Użytkownik dodany!";
          } else {
            // Rzucamy błąd, aby toast.promise złapał go jako 'error'
            setError(res.message || "Wystąpił błąd");
            throw new Error(res.message || "Wystąpił błąd");
          }
        },
        error: (err) => {
          // Błąd sieciowy lub rzucony powyżej
          setError(err.message || "Nie udało się połączyć");
          return err.message || "Nie udało się połączyć";
        }
      });

      // Wyczyść formularz tylko po pełnym sukcesie
      if (response.status === 'success') {
        setFormData({ login: '', name: '', surname: '', role: 101, pwd: '' });
      }

    } catch (error) {
      // Błędy są już obsłużone przez toast, ale logujemy dla debugowania
      console.error("Błąd w handleSubmit:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    // Używamy Container fluid, aby wypełnić całe tło i wyśrodkować zawartość
    <Container fluid className="min-vh-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: '#f4f7f6' }}>
      <Row className="w-100">
        {/* Ograniczamy szerokość formularza i centrujemy go */}
        <Col md={6} lg={4} className="mx-auto">
          {/* Komponent Card dla ładnego tła i cienia */}
          <Card className="shadow-lg border-0">
            <Card.Body className="p-4 p-md-5">
              <h4 className="text-center mb-4">Dodaj użytkownika</h4>
              
              {/* Komponent Form z react-bootstrap */}
              <Form onSubmit={handleSubmit}>
                
                {/* Alerty do wyświetlania błędów lub sukcesu */}
                {error && <Alert variant="danger">{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}

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

                <Form.Group className="mb-3" controlId="name">
                  <Form.Label>Imię</Form.Label>
                  <Form.Control
                    type="text"
                    name="name"
                    placeholder="Wprowadź imię"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="surname">
                  <Form.Label>Nazwisko</Form.Label>
                  <Form.Control
                    type="text"
                    name="surname"
                    placeholder="Wprowadź nazwisko"
                    value={formData.surname}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="pwd">
                  <Form.Label>Hasło</Form.Label>
                  <Form.Control
                    type="password"
                    name="pwd"
                    placeholder="Wprowadź hasło"
                    value={formData.pwd}
                    onChange={handleChange}
                    required
                  />
                </Form.Group>

                <Form.Group className="mb-3" controlId="role">
                  <Form.Label>Rola</Form.Label>
                  {/* Używamy Form.Select zamiast <select> */}
                  <Form.Select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                  >
                    <option value={101}>Serwisant</option>
                    <option value={100}>Kierownik</option>
                  </Form.Select>
                </Form.Group>

                {/* Główny przycisk, rozciągnięty na całą szerokość i blokowany podczas wysyłania */}
                <Button 
                  variant="primary" 
                  type="submit" 
                  className="w-100 mt-3" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Dodawanie...' : 'Dodaj użytkownika'}
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}