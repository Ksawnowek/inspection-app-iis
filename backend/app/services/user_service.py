from typing import Any

from app.domain.requestsDTO import UzytkownikUpdateDTO
from app.models.models import Uzytkownik
from app.repositories.users_repo import UserRepo
import bcrypt
from app.core.config import settings
from datetime import datetime, timezone, timedelta
from jose import JWTError, jwt

from app.services.auth_service import AuthService


class UserService:
    def __init__(self, repo: UserRepo, auth_service: AuthService):
        self.repo = repo
        self.auth_service = auth_service

    def get_all_users(self):
        return self.repo.get_all_users()

    def patch_user(self, uzt_id: int, update_dto: UzytkownikUpdateDTO):
        user = self.repo.get_user_by_id(uzt_id)
        if user is None:
            return None
        update_data = update_dto.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            if key == "password":
                value = self.auth_service.hash_pwd(value)
                key = "UZT_pwd"
            setattr(user, key, value)
        return user
