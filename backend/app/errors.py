class ProtokolNotFound(Exception):
    """Podniesiony, gdy protokół o danym ID nie istnieje."""
    def __init__(self, pnagl_id: int):
        self.pnagl_id = pnagl_id
        super().__init__(f"Protokół o ID {pnagl_id} nie został znaleziony.")

class PdfNotGenerated(Exception):
    """Podniesiony, gdy plik PDF nie istnieje na dysku."""
    def __init__(self, path: str):
        self.path = path
        super().__init__(f"Plik PDF nie istnieje w ścieżce: {path}")

class SaveError(Exception):
    """Podniesiony przy błędzie zapisu."""
    pass