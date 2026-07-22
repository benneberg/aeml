import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), ".data");
const DB_FILE = path.join(DATA_DIR, "aeml_db.json");

export interface StoredState {
  pastPRs?: any[];
  mockPRs?: any[];
  repositories?: any[];
  globalSeverityWeights?: Record<string, number>;
}

export class PersistenceAdapter {
  constructor() {
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists() {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
    } catch (err) {
      console.error("AEML Persistence: Could not create data directory:", err);
    }
  }

  public load(): StoredState | null {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, "utf-8");
        const parsed = JSON.parse(raw);
        console.log("AEML Persistence: Loaded state from persistent JSON store.");
        return parsed;
      }
    } catch (err) {
      console.error("AEML Persistence: Error loading state from disk:", err);
    }
    return null;
  }

  public save(state: StoredState) {
    try {
      this.ensureDirectoryExists();
      fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), "utf-8");
    } catch (err) {
      console.error("AEML Persistence: Error writing state to disk:", err);
    }
  }
}

export const persistenceAdapter = new PersistenceAdapter();
