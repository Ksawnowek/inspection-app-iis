import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Navbar, Container, Button, Spinner } from 'react-bootstrap';
import { BoxArrowRight, People, PersonAdd  } from 'react-bootstrap-icons';

import { useAuth } from '../contexts/AuthContext'; 

interface TopBarProps {
  title: string;
}


const TopBar: React.FC<TopBarProps> = ({ title }) => {
  const { user, isLoading, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  /**
   * Funkcja pomocnicza do renderowania prawej strony paska
   */
  const renderNavContent = () => {
    if (isLoading) {
      return (
        <Navbar.Text>
          <Spinner animation="border" size="sm" className="me-2" />
          Ładowanie...
        </Navbar.Text>
      );
    }

    if (user) {
      return (
        <>
          <Navbar.Text className="me-3">
            {user.name} {user.surname}
          </Navbar.Text>
          {user.role === 'Kierownik' && 
            <Button
              className="me-3" 
              variant="outline-light" 
              onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/register`);
                  }}
            >
              <PersonAdd className="me-2" />
              Dodaj użytkownika
            </Button>
    }
    {user.role === 'Kierownik' &&
            <Button
              className="me-3"  
              variant="outline-light" 
              onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/manage-users`);
                  }}
            >
              <People className="me-2" />
              Zarządzaj użytkownikami
            </Button>
          }
          <Button 
            variant="outline-light" 
            onClick={handleLogout}
          >
            <BoxArrowRight className="me-2" />
            Wyloguj
          </Button>
        </>
      );
    }

    // 6. Jeśli nie ładuje i nie ma użytkownika (np. strona logowania),
    //    nie pokazuj nic po prawej stronie.
    return null; 
  };

  return (
    <Navbar bg="dark" variant="dark" expand="lg" fixed="top" className="shadow-sm">
      <Container fluid>
        <Navbar.Brand href="/">{title}</Navbar.Brand>

        <Navbar.Toggle aria-controls="topbar-nav" />
        <Navbar.Collapse id="topbar-nav" className="justify-content-end">
          
          {/* Dynamiczna zawartość (ładowanie / zalogowany / wylogowany) */}
          {renderNavContent()}

        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default TopBar;