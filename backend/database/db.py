import os
import json
import logging
from typing import Dict, Any, List, Optional

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger('database')

DB_FILE = os.path.join(os.path.dirname(os.path.abspath(__file__)), "db.json")

def load_db() -> Dict[str, Any]:
    if os.path.exists(DB_FILE):
        try:
            with open(DB_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception as e:
            logger.warning(f"Failed to load local database: {e}")
    return {}

def save_db(data: Dict[str, Any]):
    try:
        with open(DB_FILE, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        logger.warning(f"Failed to save local database: {e}")

_in_memory_db = load_db()
_firestore_db = None
logger.info("Operating exclusively with local persistent JSON database (db.json).")



class DatabaseManager:

    @staticmethod
    def insert(collection: str, doc_id: str, data: Dict[str, Any]) -> bool:
        if collection not in _in_memory_db:
            _in_memory_db[collection] = {}
        _in_memory_db[collection][doc_id] = data

        if _firestore_db:
            try:
                _firestore_db.collection(collection).document(doc_id).set(data)
            except Exception as e:
                logger.warning(f"Firestore insert error for {collection}/{doc_id}: {e}")
        return True

    @staticmethod
    def get(collection: str, doc_id: str) -> Optional[Dict[str, Any]]:
        if _firestore_db:
            try:
                doc = _firestore_db.collection(collection).document(doc_id).get()
                if doc.exists:
                    return doc.to_dict()
            except Exception as e:
                logger.warning(f"Firestore get error for {collection}/{doc_id}: {e}")
        return _in_memory_db.get(collection, {}).get(doc_id)

    @staticmethod
    def get_all(collection: str, query_filter: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        if _firestore_db:
            try:
                ref = _firestore_db.collection(collection)
                if query_filter:
                    for key, val in query_filter.items():
                        ref = ref.where(key, "==", val)
                docs = ref.stream()
                items = [d.to_dict() for d in docs]
                if items:
                    return items
            except Exception as e:
                logger.warning(f"Firestore query error for {collection}: {e}")

        items = list(_in_memory_db.get(collection, {}).values())
        if query_filter:
            filtered = []
            for item in items:
                matches = True
                for key, val in query_filter.items():
                    if item.get(key) != val:
                        matches = False
                        break
                if matches:
                    filtered.append(item)
            return filtered
        return items

    @staticmethod
    def delete(collection: str, doc_id: str) -> bool:
        deleted = False
        if collection in _in_memory_db and doc_id in _in_memory_db[collection]:
            del _in_memory_db[collection][doc_id]
            deleted = True

        if _firestore_db:
            try:
                _firestore_db.collection(collection).document(doc_id).delete()
                deleted = True
            except Exception as e:
                logger.warning(f"Firestore delete error for {collection}/{doc_id}: {e}")
        return deleted

    @staticmethod
    def update(collection: str, doc_id: str, data: Dict[str, Any]) -> bool:
        if collection in _in_memory_db and doc_id in _in_memory_db[collection]:
            _in_memory_db[collection][doc_id].update(data)

        if _firestore_db:
            try:
                _firestore_db.collection(collection).document(doc_id).update(data)
            except Exception as e:
                logger.warning(f"Firestore update error for {collection}/{doc_id}: {e}")
        return True