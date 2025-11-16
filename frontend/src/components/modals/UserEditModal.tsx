import { useState, useEffect, ChangeEvent } from "react";
import { Modal, Button, Form } from 'react-bootstrap';
import toast from 'react-hot-toast';
import { Uzytkownik } from "../../types"; // Importujemy główny typ

/**
 * Definiujemy DTO (Payload) dla formularza aktualizacji.
 * To są dane, które wyślemy w `patchUser`.
 */
export type UserUpdatePayload = {
  UZT_Imie: string;
  UZT_Nazwisko: string;
  UZT_Login: string;
  UZT_ROL_Id: number;
  password: string;
};

type UserEditModalProps = {
  show: boolean;
  onHide: () => void;
  user: Uzytkownik | null; // Użytkownik do edycji
  onSave: (userId: number, data: UserUpdatePayload) => Promise<void>;
};

export function UserEditModal({ show, onHide, user, onSave }: UserEditModalProps) {
  
  // Wewnętrzny stan formularza
  const [formData, setFormData] = useState<UserUpdatePayload | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Efekt do wypełnienia formularza, gdy wybrany użytkownik się zmienia
  useEffect(() => {
    if (user) {
      setFormData({
        UZT_Imie: user.UZT_Imie,
        UZT_Nazwisko: user.UZT_Nazwisko,
        UZT_Login: user.UZT_Login,
        UZT_ROL_Id: user.UZT_ROL_Id,
        password: ""
      });
    } else {
      setFormData(null); // Wyczyść formularz po zamknięciu
    }
  }, [user]); // Obserwuj zmianę 'user'

  // Generyczna funkcja do obsługi zmian w formularzu
  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
  const { name, value } = e.target;
  
  setFormData(prev => {
    if (!prev) return null;
    
    let newValue: string | number = value;

    if (name === 'UZT_ROL_Id') {
      newValue = parseInt(value, 10) || 0; // Użyj 0 jako fallback
    }
    return {
      ...prev,
      [name]: newValue,
    };
  });
};

  const handleSave = async () => {
    if (!formData || !user) return;

    setIsSaving(true);
    try {
      await toast.promise(
        onSave(user.UZT_Id, formData), // Zakładam, że 'user' ma UZT_Id!
        {
          loading: 'Zapisywanie...',
          success: 'Zapisano pomyślnie!',
          error: (err) => `Błąd: ${err.message || 'Nie udało się zapisać'}`,
        }
      );
      onHide(); // Zamknij modal po sukcesie
    } catch (error) {
      console.error("Błąd zapisu (obsłużony przez toast):", error);
    } finally {
      setIsSaving(false);
    }
  };
  
  // Nie renderuj nic, jeśli nie ma danych (np. przy zamykaniu)
  if (!formData) return null;

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>Edytuj użytkownika: {user?.UZT_Imie} {user?.UZT_Nazwisko}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Form.Group className="mb-3" controlId="formImie">
            <Form.Label>Imię</Form.Label>
            <Form.Control
              type="text"
              name="UZT_Imie"
              value={formData.UZT_Imie}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formNazwisko">
            <Form.Label>Nazwisko</Form.Label>
            <Form.Control
              type="text"
              name="UZT_Nazwisko"
              value={formData.UZT_Nazwisko}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formLogin">
            <Form.Label>Login</Form.Label>
            <Form.Control
              type="text"
              name="UZT_Login"
              value={formData.UZT_Login}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formLogin">
            <Form.Label>Nowe hasło</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="formRolaId">
            <Form.Label>Rola</Form.Label>
            <Form.Select
                name="UZT_ROL_Id"
                value={formData.UZT_ROL_Id} 
                onChange={handleChange}
                aria-label="Wybierz rolę"
            >
                <option value={0} disabled>Wybierz z listy...</option>
                <option value={100}>Kierownik</option>
                <option value={101}>Serwisant</option>
            </Form.Select>
            </Form.Group>
        </Form>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onHide}>Anuluj</Button>
        <Button variant="primary" onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Zapisywanie..." : "Zapisz"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}