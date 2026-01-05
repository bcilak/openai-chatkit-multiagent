import Database from 'better-sqlite3';
import * as crypto from 'crypto';
import * as path from 'path';
import * as fs from 'fs';

export interface Bot {
    id: string;
    name: string;
    siteId: string;
    workflowId: string;
    apiKey?: string;
    color: string;
    title: string;
    position: "bottom-right" | "bottom-left";
}

export interface Config {
    apiKey: string;
    bots: Bot[];
}

// Encryption helpers
const ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production-min-32-chars!!';

function getEncryptionKey(): Buffer {
    // Hash the key to ensure it's exactly 32 bytes
    return crypto.createHash('sha256').update(ENCRYPTION_KEY).digest();
}

function encrypt(text: string): string {
    if (!text) return '';
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, getEncryptionKey(), iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();
    return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

function decrypt(text: string): string {
    if (!text) return '';
    const parts = text.split(':');
    if (parts.length !== 3) return text; // Fallback for non-encrypted data

    const iv = Buffer.from(parts[0], 'hex');
    const authTag = Buffer.from(parts[1], 'hex');
    const encrypted = parts[2];

    const decipher = crypto.createDecipheriv(ALGORITHM, getEncryptionKey(), iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

// Database connection
let db: Database.Database | null = null;

function getDb(): Database.Database {
    if (db) return db;

    // Ensure data directory exists
    const dataDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    const dbPath = path.join(dataDir, 'chatkit.db');
    db = new Database(dbPath);

    // Enable WAL mode for better concurrency
    db.pragma('journal_mode = WAL');

    // Create tables if not exist
    db.exec(`
        CREATE TABLE IF NOT EXISTS config (
            id INTEGER PRIMARY KEY CHECK (id = 1),
            apiKey TEXT
        );

        CREATE TABLE IF NOT EXISTS bots (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            siteId TEXT NOT NULL UNIQUE,
            workflowId TEXT NOT NULL,
            apiKey TEXT,
            color TEXT NOT NULL,
            title TEXT NOT NULL,
            position TEXT NOT NULL
        );

        -- Insert default config if not exists
        INSERT OR IGNORE INTO config (id, apiKey) VALUES (1, '');
    `);

    return db;
}

// Config operations
export function getConfig(): Config {
    const database = getDb();

    const configRow = database.prepare('SELECT apiKey FROM config WHERE id = 1').get() as { apiKey: string } | undefined;
    const botsRows = database.prepare('SELECT * FROM bots ORDER BY name').all() as Bot[];

    return {
        apiKey: configRow ? decrypt(configRow.apiKey) : '',
        bots: botsRows.map(bot => ({
            ...bot,
            apiKey: bot.apiKey ? decrypt(bot.apiKey) : undefined
        }))
    };
}

export function saveConfig(config: Partial<Config>): boolean {
    try {
        const database = getDb();

        // Use transaction for atomic updates
        const transaction = database.transaction(() => {
            // Update global API key if provided
            if (config.apiKey !== undefined) {
                const encrypted = encrypt(config.apiKey);
                database.prepare('UPDATE config SET apiKey = ? WHERE id = 1').run(encrypted);
            }

            // Update bots if provided
            if (config.bots !== undefined) {
                // Clear existing bots
                database.prepare('DELETE FROM bots').run();

                // Insert new bots
                const insertBot = database.prepare(`
                    INSERT INTO bots (id, name, siteId, workflowId, apiKey, color, title, position)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                `);

                for (const bot of config.bots) {
                    insertBot.run(
                        bot.id,
                        bot.name,
                        bot.siteId,
                        bot.workflowId,
                        bot.apiKey ? encrypt(bot.apiKey) : null,
                        bot.color,
                        bot.title,
                        bot.position
                    );
                }
            }
        });

        transaction();
        return true;
    } catch (e) {
        console.error('SQLite saveConfig error:', e);
        return false;
    }
}

export function getApiKeyForSite(siteId?: string): { apiKey: string | null; workflowId: string | null } {
    const config = getConfig();

    if (siteId) {
        const bot = config.bots.find((b) => b.siteId === siteId);
        if (bot) {
            return {
                apiKey: bot.apiKey || config.apiKey || process.env.OPENAI_API_KEY || null,
                workflowId: bot.workflowId,
            };
        }
    }

    return {
        apiKey: config.apiKey || process.env.OPENAI_API_KEY || null,
        workflowId: null,
    };
}

// Graceful shutdown
process.on('exit', () => {
    if (db) {
        db.close();
    }
});

process.on('SIGINT', () => {
    if (db) {
        db.close();
    }
    process.exit(0);
});
