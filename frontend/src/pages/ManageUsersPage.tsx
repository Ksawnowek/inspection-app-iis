import { useState, useEffect, useCallback } from "react"; // Dodano useCallback
import { getUsers, patchUser } from "../api/users";
import { Uzytkownik } from "../types";
import toast from 'react-hot-toast';
import { Button, Table, Alert } from 'react-bootstrap';
import Spinner from "../components/Spinner";
import TopBar from "../components/TopBar";

// ### KROK 1: Importy
import { UserEditModal, UserUpdatePayload } from "../components/modals/UserEditModal"; // Załóżmy, że tam jest
//import { patchUser } from "../api/users"; // Zakładamy, że ta funkcja istnieje

// Definicja typów modali
type ModalType = 'edit-user' | null;

export default function ManageUsersPage() {
  const [users, setUsers] = useState<Uzytkownik[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  // ### KROK 2: Stany do obsługi modala
  const [activeModal, setActiveModal] = useState<ModalType>(null);
  const [selectedUser, setSelectedUser] = useState<Uzytkownik | null>(null);

  // Wyciągamy fetchUsers na zewnątrz, aby móc go wywołać ponownie
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setError(err as Error);
      toast.error("Nie udało się pobrać użytkowników");
    } finally {
      setLoading(false);
    }
  }, []); // Pusta tablica zależności, funkcja się nie zmienia

  // Pobieranie danych przy starcie
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]); // Teraz fetchUsers jest stabilną zależnością

  // ### KROK 3: Handlery do otwierania/zamykania modala
  const handleClose = () => {
    setActiveModal(null);
    setSelectedUser(null);
  };

  const handleShow = (user: Uzytkownik) => {
    setSelectedUser(user);
    setActiveModal('edit-user');
  };

  // ### KROK 4: Funkcja zapisu (przekazywana do modala)
  const handleSaveUser = async (userId: number, data: UserUpdatePayload) => {
    const updatedUser = await patchUser(userId, data);

    setUsers(prevUsers =>
       prevUsers.map(user =>
         user.UZT_Id === userId ? updatedUser : user
       )
    );
  };

  // ----- Renderowanie -----

  if (loading && !selectedUser) { // Nie pokazuj globalnego spinnera, gdy modal jest otwarty
    return <Spinner />;
  }

  if (error) {
    return (
      <Alert variant="danger" className="m-3">
        <Alert.Heading>Wystąpił błąd!</Alert.Heading>
        <p>{error.message}</p>
      </Alert>
    );
  }

  return (
    <>
      <TopBar title="Zarządzanie użytkownikami" />
      <div className="container" style={{ marginTop: '70px' }}>
        {users.length === 0 && !loading ? ( // Poprawka warunku
          <Alert variant="info">Nie znaleziono żadnych użytkowników.</Alert>
        ) : (
          <Table striped bordered hover responsive variant="secondary">
            <thead>
              <tr>
                <th>#</th>
                <th>Imię</th>
                <th>Nazwisko</th>
                <th>Login</th>
                <th>Rola</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user, index) => (
                // ### KROK 5: Użyj UZT_Id jako klucza i dodaj onClick
                // BARDZO WAŻNE: Użyj ID użytkownika jako klucza, nie loginu!
                <tr key={user.UZT_Id}> 
                  <td>{index + 1}</td>
                  <td>{user.UZT_Imie}</td>
                  <td>{user.UZT_Nazwisko}</td>
                  <td>{user.UZT_Login}</td>
                  <td>{user.ROL_Opis}</td>
                  <td>
                    <Button
                      variant="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => handleShow(user)} // <-- TUTAJ AKCJA
                    >
                      Edytuj
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </div>

      {/* ### KROK 6: Renderowanie modala */}
      <UserEditModal
        show={activeModal === 'edit-user'}
        onHide={handleClose}
        user={selectedUser}
        onSave={handleSaveUser}
      />
    </>
  );
}