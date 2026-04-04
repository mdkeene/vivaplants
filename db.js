const DB_NAME = "VivaPlantsDB";
const DB_VERSION = 1;
const STORE_NAME = "plants";

let db;

function initDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                db.createObjectStore(STORE_NAME, { keyPath: "id" });
            }
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            resolve(true);
        };

        request.onerror = (event) => {
            console.error("IndexedDB error:", event.target.error);
            reject(event.target.error);
        };
    });
}

function getAllPlants() {
    return new Promise((resolve, reject) => {
        if (!db) return resolve([]);
        const transaction = db.transaction(STORE_NAME, "readonly");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.getAll();

        request.onsuccess = () => {
            resolve(request.result || []);
        };

        request.onerror = (event) => {
            console.error("Error getting plants:", event.target.error);
            reject(event.target.error);
        };
    });
}

function savePlant(plant) {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");

        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.put(plant);

        request.onsuccess = () => {
            resolve(plant);
        };

        request.onerror = (event) => {
            console.error("Error saving plant:", event.target.error);
            reject(event.target.error);
        };
    });
}

function deletePlantDB(id) {
    return new Promise((resolve, reject) => {
        if (!db) return reject("DB not initialized");
        const transaction = db.transaction(STORE_NAME, "readwrite");
        const store = transaction.objectStore(STORE_NAME);
        const request = store.delete(id);

        request.onsuccess = () => {
            resolve(true);
        };

        request.onerror = (event) => {
            console.error("Error deleting plant:", event.target.error);
            reject(event.target.error);
        };
    });
}
