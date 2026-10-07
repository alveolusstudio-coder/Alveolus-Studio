import os
import re
import secrets
import logging
from pathlib import Path
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Annotated

from dotenv import load_dotenv

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, ConfigDict, BeforeValidator
from bson import ObjectId
import bcrypt

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

logger = logging.getLogger("alveolus")

PyObjectId = Annotated[str, BeforeValidator(str)]

SESSION_IDLE_MINUTES = 60
SESSION_ABS_HOURS = 12
MAX_FAILED_ATTEMPTS = 5
LOCKOUT_MINUTES = 15

PRICE_MAP = {"BASIC": 350000, "CINEMATIC": 500000, "PREMIUM": 600000}

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


def iso(dt: datetime) -> str:
    return dt.isoformat()


def parse_dt(value) -> datetime:
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    return datetime.fromisoformat(str(value))


# ---------------- Password hashing ----------------

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


# ---------------- Models ----------------

class BaseDocument(BaseModel):
    model_config = ConfigDict(populate_by_name=True, arbitrary_types_allowed=True)
    id: PyObjectId = Field(default_factory=lambda: str(ObjectId()), alias="_id", serialization_alias="id")

    def to_mongo(self) -> dict:
        doc = self.model_dump(by_alias=True, exclude={"id"})
        doc["_id"] = ObjectId(self.id)
        return doc


class BookingCreate(BaseModel):
    name: str
    phone: str
    date: str
    location: str
    package: str
    category: Optional[str] = ""
    notes: Optional[str] = ""


class LoginInput(BaseModel):
    email: Optional[str] = ""
    password: Optional[str] = ""


class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None


class PasswordChange(BaseModel):
    old_password: str
    new_password: str
    confirm_password: str


class StatusUpdate(BaseModel):
    status: str


class PackageUpdate(BaseModel):
    price: Optional[int] = None
    is_active: Optional[bool] = None


class EquipmentUpdate(BaseModel):
    status: str


class SettingsUpdate(BaseModel):
    studio_name: Optional[str] = None
    whatsapp: Optional[str] = None


# ---------------- Audit log ----------------

async def audit(admin: dict, action: str, target_type: str = "", target_id: str = "", ip: str = ""):
    await db.audit_logs.insert_one({
        "admin_id": str(admin["_id"]),
        "admin_email": admin.get("email", ""),
        "action": action,
        "target_type": target_type,
        "target_id": target_id,
        "ip_address": ip,
        "created_at": iso(utcnow()),
    })


# ---------------- Sessions & auth dependency ----------------

async def create_session(admin_id: ObjectId, ip: str) -> str:
    token = secrets.token_urlsafe(32)
    now = utcnow()
    await db.sessions.insert_one({
        "token": token,
        "admin_id": admin_id,
        "created_at": iso(now),
        "last_active": iso(now),
        "expires_at": iso(now + timedelta(minutes=SESSION_IDLE_MINUTES)),
        "absolute_expiry": iso(now + timedelta(hours=SESSION_ABS_HOURS)),
        "ip_address": ip,
    })
    return token


def set_session_cookie(response: Response, token: str):
    response.set_cookie(
        key="alv_session",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=SESSION_ABS_HOURS * 3600,
        path="/",
    )


async def get_current_admin(request: Request) -> dict:
    token = request.cookies.get("alv_session")
    if not token:
        raise HTTPException(status_code=401, detail="Sesi tidak ditemukan. Silakan login.")
    session = await db.sessions.find_one({"token": token})
    if not session:
        raise HTTPException(status_code=401, detail="Sesi tidak valid. Silakan login kembali.")
    now = utcnow()
    if parse_dt(session["expires_at"]) < now or parse_dt(session["absolute_expiry"]) < now:
        await db.sessions.delete_one({"_id": session["_id"]})
        raise HTTPException(status_code=401, detail="Sesi telah berakhir. Silakan login kembali.")
    await db.sessions.update_one(
        {"_id": session["_id"]},
        {"$set": {"last_active": iso(now), "expires_at": iso(now + timedelta(minutes=SESSION_IDLE_MINUTES))}},
    )
    user = await db.users.find_one({"_id": session["admin_id"]})
    if not user:
        raise HTTPException(status_code=401, detail="Sesi tidak valid.")
    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Akun admin ini tidak aktif. Hubungi administrator.")
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Akses ditolak. Halaman ini khusus admin.")
    return user


def public_user(user: dict) -> dict:
    return {
        "id": str(user["_id"]),
        "name": user.get("name", ""),
        "email": user.get("email", ""),
        "role": user.get("role", ""),
        "created_at": user.get("created_at", ""),
        "updated_at": user.get("updated_at", ""),
        "last_login": user.get("last_login", ""),
        "is_active": user.get("is_active", True),
    }


# ---------------- Public endpoints ----------------

@api_router.get("/")
async def root():
    return {"message": "ALVEOLUS.STUDIO API — READY TO FLY"}


@api_router.post("/bookings")
async def create_booking(input: BookingCreate):
    now = utcnow()
    day_key = now.strftime("%Y%m%d")
    count = await db.bookings.count_documents({"created_day": day_key})
    doc = {
        "name": input.name,
        "phone": input.phone,
        "date": input.date,
        "location": input.location,
        "package": input.package,
        "category": input.category or "",
        "notes": input.notes or "",
        "status": "menunggu",
        "booking_code": f"ALV-{day_key}-{count + 1:03d}",
        "price_estimate": PRICE_MAP.get(input.package.upper(), 0),
        "created_day": day_key,
        "created_at": iso(now),
    }
    result = await db.bookings.insert_one(doc)
    return {"ok": True, "booking_code": doc["booking_code"], "id": str(result.inserted_id)}


# ---------------- Auth endpoints ----------------

@api_router.post("/auth/login")
async def login(input: LoginInput, request: Request, response: Response):
    email = (input.email or "").strip().lower()
    password = input.password or ""
    ip = request.client.host if request.client else ""

    if not email or not password:
        raise HTTPException(status_code=400, detail="Email dan password wajib diisi.")
    if not EMAIL_RE.match(email):
        raise HTTPException(status_code=400, detail="Format email tidak valid.")

    identifier = email
    attempt = await db.login_attempts.find_one({"identifier": identifier})
    now = utcnow()
    if attempt and attempt.get("count", 0) >= MAX_FAILED_ATTEMPTS:
        locked_until = parse_dt(attempt.get("locked_until", iso(now)))
        if now < locked_until:
            raise HTTPException(status_code=429, detail="Terlalu banyak percobaan login. Silakan coba lagi beberapa saat.")
        await db.login_attempts.delete_one({"identifier": identifier})

    user = await db.users.find_one({"email": email})
    if not user or not verify_password(password, user.get("password_hash", "")):
        new_count = (attempt.get("count", 0) if attempt else 0) + 1
        update = {"identifier": identifier, "count": new_count, "last_attempt": iso(now)}
        if new_count >= MAX_FAILED_ATTEMPTS:
            update["locked_until"] = iso(now + timedelta(minutes=LOCKOUT_MINUTES))
        await db.login_attempts.update_one({"identifier": identifier}, {"$set": update}, upsert=True)
        raise HTTPException(status_code=401, detail="Email atau password tidak sesuai.")

    if not user.get("is_active", True):
        raise HTTPException(status_code=403, detail="Akun admin ini tidak aktif. Hubungi administrator.")
    if user.get("role") != "admin":
        raise HTTPException(status_code=403, detail="Akses ditolak. Halaman ini khusus admin.")

    await db.login_attempts.delete_one({"identifier": identifier})
    await db.users.update_one({"_id": user["_id"]}, {"$set": {"last_login": iso(now)}})
    token = await create_session(user["_id"], ip)
    set_session_cookie(response, token)
    await audit(user, "LOGIN", "session", "", ip)
    user["last_login"] = iso(now)
    return public_user(user)


@api_router.post("/auth/logout")
async def logout(request: Request, response: Response):
    token = request.cookies.get("alv_session")
    if token:
        session = await db.sessions.find_one({"token": token})
        await db.sessions.delete_one({"token": token})
        if session:
            user = await db.users.find_one({"_id": session["admin_id"]})
            if user:
                await audit(user, "LOGOUT", "session", "", request.client.host if request.client else "")
    response.delete_cookie("alv_session", path="/")
    return {"ok": True}


@api_router.get("/auth/me")
async def me(admin: dict = Depends(get_current_admin)):
    return public_user(admin)


# ---------------- Admin: profile ----------------

@api_router.get("/admin/profile")
async def get_profile(admin: dict = Depends(get_current_admin)):
    return public_user(admin)


@api_router.patch("/admin/profile")
async def update_profile(input: ProfileUpdate, request: Request, admin: dict = Depends(get_current_admin)):
    update = {}
    if input.name is not None:
        if not input.name.strip():
            raise HTTPException(status_code=400, detail="Nama wajib diisi.")
        update["name"] = input.name.strip()
    if input.email is not None:
        email = input.email.strip().lower()
        if not EMAIL_RE.match(email):
            raise HTTPException(status_code=400, detail="Format email tidak valid.")
        existing = await db.users.find_one({"email": email, "_id": {"$ne": admin["_id"]}})
        if existing:
            raise HTTPException(status_code=400, detail="Email sudah digunakan akun lain.")
        update["email"] = email
    if not update:
        return public_user(admin)
    update["updated_at"] = iso(utcnow())
    await db.users.update_one({"_id": admin["_id"]}, {"$set": update})
    await audit(admin, "ACCOUNT_CHANGE", "user", str(admin["_id"]), request.client.host if request.client else "")
    fresh = await db.users.find_one({"_id": admin["_id"]})
    return public_user(fresh)


@api_router.post("/admin/change-password")
async def change_password(input: PasswordChange, request: Request, admin: dict = Depends(get_current_admin)):
    if not verify_password(input.old_password, admin.get("password_hash", "")):
        raise HTTPException(status_code=400, detail="Password lama tidak sesuai.")
    if len(input.new_password) < 8:
        raise HTTPException(status_code=400, detail="Password baru minimal 8 karakter.")
    if input.new_password != input.confirm_password:
        raise HTTPException(status_code=400, detail="Konfirmasi password tidak sama.")
    await db.users.update_one(
        {"_id": admin["_id"]},
        {"$set": {"password_hash": hash_password(input.new_password), "updated_at": iso(utcnow())}},
    )
    await audit(admin, "PASSWORD_CHANGE", "user", str(admin["_id"]), request.client.host if request.client else "")
    return {"ok": True, "message": "Password berhasil diperbarui."}


# ---------------- Admin: bookings ----------------

def shape_booking(d: dict) -> dict:
    d["id"] = str(d.pop("_id"))
    if "booking_code" not in d:
        created = d.get("created_at", "")[:10].replace("-", "")
        d["booking_code"] = f"ALV-{created or 'LEGACY'}-000"
    d.setdefault("status", "menunggu")
    d.setdefault("price_estimate", PRICE_MAP.get(str(d.get("package", "")).upper(), 0))
    d.pop("created_day", None)
    return d


@api_router.get("/admin/bookings")
async def admin_bookings(status: Optional[str] = None, admin: dict = Depends(get_current_admin)):
    query = {}
    if status:
        query["status"] = status
    docs = await db.bookings.find(query).sort("_id", -1).to_list(1000)
    return [shape_booking(d) for d in docs]


@api_router.patch("/admin/bookings/{booking_id}/status")
async def set_booking_status(booking_id: str, input: StatusUpdate, request: Request, admin: dict = Depends(get_current_admin)):
    allowed = {"dikonfirmasi", "ditolak", "dibatalkan", "menunggu"}
    if input.status not in allowed:
        raise HTTPException(status_code=400, detail="Status tidak valid.")
    try:
        oid = ObjectId(booking_id)
    except Exception:
        raise HTTPException(status_code=404, detail="Booking tidak ditemukan.")
    result = await db.bookings.update_one({"_id": oid}, {"$set": {"status": input.status, "updated_at": iso(utcnow())}})
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Booking tidak ditemukan.")
    action_map = {"dikonfirmasi": "BOOKING_CONFIRM", "ditolak": "BOOKING_REJECT", "dibatalkan": "BOOKING_CANCEL", "menunggu": "BOOKING_RESET"}
    await audit(admin, action_map[input.status], "booking", booking_id, request.client.host if request.client else "")
    return {"ok": True, "status": input.status}


@api_router.get("/admin/stats")
async def admin_stats(admin: dict = Depends(get_current_admin)):
    now = utcnow()
    today = now.date().isoformat()
    month = now.strftime("%Y-%m")
    docs = await db.bookings.find().to_list(5000)
    stats = {
        "booking_hari_ini": 0,
        "menunggu_konfirmasi": 0,
        "booking_aktif": 0,
        "total_bulan_ini": 0,
        "estimasi_pendapatan": 0,
    }
    for d in docs:
        status = d.get("status", "menunggu")
        if d.get("date") == today:
            stats["booking_hari_ini"] += 1
        if status == "menunggu":
            stats["menunggu_konfirmasi"] += 1
        if status == "dikonfirmasi" and d.get("date", "") >= today:
            stats["booking_aktif"] += 1
        if str(d.get("created_at", "")).startswith(month):
            stats["total_bulan_ini"] += 1
        if status == "dikonfirmasi" and str(d.get("date", "")).startswith(month):
            stats["estimasi_pendapatan"] += d.get("price_estimate", PRICE_MAP.get(str(d.get("package", "")).upper(), 0))
    return stats


# ---------------- Admin: customers ----------------

@api_router.get("/admin/customers")
async def admin_customers(admin: dict = Depends(get_current_admin)):
    docs = await db.bookings.find().to_list(5000)
    customers = {}
    for d in docs:
        key = d.get("phone") or d.get("name")
        if not key:
            continue
        c = customers.setdefault(key, {
            "name": d.get("name", ""),
            "phone": d.get("phone", ""),
            "total_bookings": 0,
            "last_booking": "",
            "packages": set(),
        })
        c["total_bookings"] += 1
        c["packages"].add(d.get("package", ""))
        if str(d.get("created_at", "")) > str(c["last_booking"]):
            c["last_booking"] = d.get("created_at", "")
    for c in customers.values():
        c["packages"] = sorted(p for p in c["packages"] if p)
    return sorted(customers.values(), key=lambda c: c["total_bookings"], reverse=True)


# ---------------- Admin: packages & equipment ----------------

DEFAULT_PACKAGES = [
    {"key": "basic", "name": "BASIC", "sub": "Drone Only", "price": 350000, "is_active": True},
    {"key": "cinematic", "name": "CINEMATIC", "sub": "Drone + Editing", "price": 500000, "is_active": True},
    {"key": "premium", "name": "PREMIUM", "sub": "Full Experience", "price": 600000, "is_active": True},
]

DEFAULT_EQUIPMENT = [
    {"key": "mini3-01", "name": "DJI Mini 3 — Unit 01", "type": "DRONE", "status": "siap"},
    {"key": "mini3-batt", "name": "Intelligent Flight Battery ×3", "type": "BATTERY", "status": "siap"},
    {"key": "mini3-rc", "name": "DJI RC-N1 Remote Controller", "type": "CONTROLLER", "status": "siap"},
    {"key": "mini3-nd", "name": "ND Filter Set", "type": "ACCESSORY", "status": "siap"},
    {"key": "mini3-sd", "name": "MicroSD 128GB UHS-I", "type": "ACCESSORY", "status": "siap"},
]


@api_router.get("/admin/packages")
async def admin_packages(admin: dict = Depends(get_current_admin)):
    docs = await db.packages.find().sort("price", 1).to_list(50)
    for d in docs:
        d["id"] = str(d.pop("_id"))
    return docs


@api_router.patch("/admin/packages/{key}")
async def update_package(key: str, input: PackageUpdate, request: Request, admin: dict = Depends(get_current_admin)):
    update = {}
    if input.price is not None:
        if input.price < 0:
            raise HTTPException(status_code=400, detail="Harga tidak valid.")
        update["price"] = input.price
        await audit(admin, "PRICE_CHANGE", "package", key, request.client.host if request.client else "")
    if input.is_active is not None:
        update["is_active"] = input.is_active
        await audit(admin, "PACKAGE_CHANGE", "package", key, request.client.host if request.client else "")
    if update:
        update["updated_at"] = iso(utcnow())
        await db.packages.update_one({"key": key}, {"$set": update})
    doc = await db.packages.find_one({"key": key})
    if not doc:
        raise HTTPException(status_code=404, detail="Paket tidak ditemukan.")
    doc["id"] = str(doc.pop("_id"))
    return doc


@api_router.get("/admin/equipment")
async def admin_equipment(admin: dict = Depends(get_current_admin)):
    docs = await db.equipment.find().to_list(50)
    for d in docs:
        d["id"] = str(d.pop("_id"))
    return docs


@api_router.patch("/admin/equipment/{key}")
async def update_equipment(key: str, input: EquipmentUpdate, request: Request, admin: dict = Depends(get_current_admin)):
    if input.status not in {"siap", "disewa", "maintenance"}:
        raise HTTPException(status_code=400, detail="Status tidak valid.")
    await db.equipment.update_one({"key": key}, {"$set": {"status": input.status, "updated_at": iso(utcnow())}})
    await audit(admin, "EQUIPMENT_CHANGE", "equipment", key, request.client.host if request.client else "")
    doc = await db.equipment.find_one({"key": key})
    if not doc:
        raise HTTPException(status_code=404, detail="Peralatan tidak ditemukan.")
    doc["id"] = str(doc.pop("_id"))
    return doc


# ---------------- Admin: settings & audit ----------------

@api_router.get("/admin/settings")
async def get_settings(admin: dict = Depends(get_current_admin)):
    doc = await db.settings.find_one({"key": "studio"})
    if not doc:
        return {"studio_name": "ALVEOLUS.STUDIO", "whatsapp": "085702253873"}
    doc["id"] = str(doc.pop("_id"))
    return doc


@api_router.patch("/admin/settings")
async def update_settings(input: SettingsUpdate, request: Request, admin: dict = Depends(get_current_admin)):
    update = {k: v for k, v in input.model_dump().items() if v is not None}
    if update:
        update["updated_at"] = iso(utcnow())
        await db.settings.update_one({"key": "studio"}, {"$set": update}, upsert=True)
        await audit(admin, "SETTINGS_CHANGE", "settings", "studio", request.client.host if request.client else "")
    return await get_settings(admin)


@api_router.get("/admin/audit-logs")
async def get_audit_logs(admin: dict = Depends(get_current_admin)):
    docs = await db.audit_logs.find().sort("_id", -1).to_list(100)
    for d in docs:
        d["id"] = str(d.pop("_id"))
    return docs


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')


@app.on_event("startup")
async def startup_seed():
    await db.users.create_index("email", unique=True)
    await db.sessions.create_index("token", unique=True)
    await db.login_attempts.create_index("identifier")
    await db.audit_logs.create_index("created_at")

    admin_email = os.environ.get("ADMIN_EMAIL", "").strip().lower()
    admin_password = os.environ.get("ADMIN_PASSWORD", "")
    if admin_email and admin_password:
        existing = await db.users.find_one({"email": admin_email})
        if existing is None:
            now = iso(utcnow())
            await db.users.insert_one({
                "name": "Admin",
                "email": admin_email,
                "password_hash": hash_password(admin_password),
                "role": "admin",
                "is_active": True,
                "created_at": now,
                "updated_at": now,
                "last_login": None,
            })
            logger.info("Admin account seeded: %s", admin_email)

    for p in DEFAULT_PACKAGES:
        await db.packages.update_one({"key": p["key"]}, {"$setOnInsert": p}, upsert=True)
    for e in DEFAULT_EQUIPMENT:
        await db.equipment.update_one({"key": e["key"]}, {"$setOnInsert": e}, upsert=True)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
