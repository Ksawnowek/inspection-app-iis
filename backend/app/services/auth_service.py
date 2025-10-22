from app.schemas.user import User
from fastapi import Depends
from app.repositories.users_repo import UserRepo
import bcrypt
from app.core.config import settings
from datetime import datetime, timezone, timedelta
from jose import JWTError, jwt

class AuthService():
    def __init__(self, repo: UserRepo = Depends(UserRepo)):
        self.repo = repo
    
    def auth_user(self, login, pwd):
        user = self.repo.get_by_login(login)
        if user is None:
            return None
        hashed_from_db_bytes = user.pwd.strip().encode('utf-8')
        password_attempt_bytes = pwd.encode('utf-8')
        if bcrypt.checkpw(password_attempt_bytes, hashed_from_db_bytes):
            token_data = {"sub": user.login}
            token = self._create_access_token(data=token_data)
            return token
        else:
            return None

    def _create_access_token(self, data: dict):
        to_encode = data.copy()

        expire = datetime.now(timezone.utc) + timedelta(minutes=int(settings.ACCESS_TOKEN_EXPIRE_MINUTES))
        to_encode.update({"exp": expire})

        encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ACCESS_TOKEN_ALGORITHM)
        return encoded_jwt



    def register_user(self, login, pwd, imie, nazwisko, rola):
        #TODO włączyć unique na loginie xD
        passwordHash = bcrypt.hashpw(pwd.encode('utf-8'), bcrypt.gensalt())
        user = User(imie=imie, nazwisko=nazwisko, login=login, pwd=passwordHash, rola=rola)
        result = self.repo.add_user(user)

        return result