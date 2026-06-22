"""MongoDB data layer (PyMongo, synchronous) with small repository helpers.

Documents are returned as `Doc` (a dict with attribute access) so the existing
serializers — which read `row.field` and `row.id` — keep working unchanged.
"""
from datetime import datetime
from pymongo import MongoClient
from bson import ObjectId
from bson.errors import InvalidId
from .config import settings

_client = MongoClient(settings.mongo_uri)
db = _client[settings.mongo_db]


class Doc:
    """Thin attribute-access wrapper over a Mongo document dict.

    Not a dict subclass — so data keys never collide with dict methods
    (e.g. a skill's `items` field returns the list, not `dict.items`).
    `.id` returns str(_id); missing keys -> None.
    """
    __slots__ = ("_d",)

    def __init__(self, d):
        object.__setattr__(self, "_d", d)

    def __getattr__(self, key):
        d = object.__getattribute__(self, "_d")
        if key == "id":
            v = d.get("_id")
            return str(v) if v is not None else None
        return d.get(key)

    def get(self, key, default=None):
        return object.__getattribute__(self, "_d").get(key, default)

    def __getitem__(self, key):
        return object.__getattribute__(self, "_d")[key]

    def __contains__(self, key):
        return key in object.__getattribute__(self, "_d")

    def __bool__(self):
        return bool(object.__getattribute__(self, "_d"))


def oid(value):
    """Coerce a value to ObjectId, or None if it isn't a valid id."""
    if isinstance(value, ObjectId):
        return value
    if value is None:
        return None
    try:
        return ObjectId(str(value))
    except (InvalidId, TypeError):
        return None


def wrap(d):
    return Doc(d) if d is not None else None


# ── Repository helpers ───────────────────────────────────────────────────────
def find(coll, query=None, sort=None):
    cur = db[coll].find(query or {})
    if sort:
        cur = cur.sort(sort)
    return [Doc(d) for d in cur]


def find_one(coll, query=None):
    return wrap(db[coll].find_one(query or {}))


def get_by_id(coll, id):
    _id = oid(id)
    return wrap(db[coll].find_one({"_id": _id})) if _id else None


def insert(coll, doc):
    now = datetime.utcnow()
    doc.setdefault("created_at", now)
    res = db[coll].insert_one(doc)
    return wrap(db[coll].find_one({"_id": res.inserted_id}))


def update_by_id(coll, id, changes):
    _id = oid(id)
    if not _id:
        return None
    db[coll].update_one({"_id": _id}, {"$set": changes})
    return wrap(db[coll].find_one({"_id": _id}))


def delete_by_id(coll, id):
    _id = oid(id)
    if not _id:
        return False
    return db[coll].delete_one({"_id": _id}).deleted_count > 0


def count(coll, query=None):
    return db[coll].count_documents(query or {})


def init_db() -> None:
    """Create the few indexes we rely on (idempotent)."""
    db.blog_posts.create_index("slug", unique=True)
    db.notes.create_index("section_id")
    db.applications.create_index("resume_variant_id")
