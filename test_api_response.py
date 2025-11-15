#!/usr/bin/env python3
"""
Skrypt diagnostyczny sprawdzający co zwraca API zadań
"""
import requests
import json

# Spróbuj pobrać zadania z API
try:
    response = requests.get('http://localhost:8000/api/zadania', timeout=5)
    print(f"Status: {response.status_code}")

    if response.status_code == 200:
        data = response.json()
        print(f"\nZnaleziono {len(data)} zadań")

        # Sprawdź pierwsze zadanie
        if data:
            first = data[0]
            print(f"\nPierwsze zadanie (ID: {first.get('vZNAG_Id')}):")
            print(f"  Typ przeglądu: {first.get('vZNAG_TypPrzegladu')}")
            print(f"  Urządzenie: {first.get('vZNAG_Urzadzenie')}")
            print(f"  Tonaż: {first.get('vZNAG_Tonaz')}")
            print(f"  Awaria nr: {first.get('vZNAG_AwariaNumer')}")
            print(f"  OkrGwar: {first.get('vZNAG_OkrGwar')}")

            # Sprawdź czy są zadania typu R lub T
            print("\n--- Zadania według typu ---")
            types_count = {}
            for z in data:
                typ = z.get('vZNAG_TypPrzegladu', 'NULL')
                types_count[typ] = types_count.get(typ, 0) + 1

            for typ, count in sorted(types_count.items()):
                print(f"  Typ '{typ}': {count} zadań")

            # Pokaż przykładowe zadanie typu R lub T jeśli istnieje
            for z in data:
                if z.get('vZNAG_TypPrzegladu') in ['R', 'T']:
                    print(f"\n--- Przykładowe zadanie typu {z.get('vZNAG_TypPrzegladu')} ---")
                    print(f"  ID: {z.get('vZNAG_Id')}")
                    print(f"  Klient: {z.get('vZNAG_KlientNazwa')}")
                    print(f"  Urządzenie: {z.get('vZNAG_Urzadzenie')}")
                    print(f"  Tonaż: {z.get('vZNAG_Tonaz')}")
                    print(f"  Awaria nr: {z.get('vZNAG_AwariaNumer')}")
                    print(f"  OkrGwar: {z.get('vZNAG_OkrGwar')}")
                    break
        else:
            print("Brak zadań w bazie!")
    else:
        print(f"Błąd: {response.text}")

except requests.exceptions.ConnectionError:
    print("Nie można połączyć się z backendem na http://localhost:8000")
    print("Upewnij się, że backend jest uruchomiony!")
except Exception as e:
    print(f"Błąd: {e}")
