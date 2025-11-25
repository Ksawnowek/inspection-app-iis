# Logo dla dokumentów PDF

## Instrukcja użycia

Aby dodać logo firmy w wygenerowanych dokumentach PDF:

1. Umieść plik logo w tym katalogu jako `logo.png`
2. Zalecane parametry:
   - Format: PNG z przezroczystym tłem
   - Szerokość: 200-300px
   - Wysokość: 60-100px
   - Proporcje: poziome (szersze niż wyższe)

3. Logo zostanie automatycznie użyte w następujących dokumentach:
   - Protokół przeglądów
   - Zadania serwisowe
   - Awarie
   - Prace różne

## Przykładowa ścieżka

```
backend/app/static/images/logo.png
```

Jeśli plik logo.png nie istnieje, wyświetlany będzie tekst "CRANES & COMPONENTS".
