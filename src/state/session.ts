// @ts-nocheck

import { Session } from "../../global";
import config from "../config";
import fs from 'fs';
import path from 'path';

const SESSION_EXPIRY = config.sessionExpiry;
const SESSION_DIR = path.join(process.cwd(), 'data', 'sessions');

// Ensure the sessions directory exists
if (!fs.existsSync(SESSION_DIR)) {
    fs.mkdirSync(SESSION_DIR, { recursive: true });
}

// In-memory cache
const sessions: { [userId: string]: Session } = {};

// Load existing sessions from disk on startup
function loadSessionsFromDisk() {
    try {
        if (fs.existsSync(SESSION_DIR)) {
            const files = fs.readdirSync(SESSION_DIR);
            for (const file of files) {
                if (file.endsWith('.json')) {
                    const userId = file.replace('.json', '');
                    try {
                        const data = fs.readFileSync(path.join(SESSION_DIR, file), 'utf8');
                        sessions[userId] = JSON.parse(data);
                    } catch (error) {
                        console.error(`Failed to load session for ${userId}:`, error);
                    }
                }
            }
            console.log(`Loaded ${Object.keys(sessions).length} sessions from disk`);
        }
    } catch (error) {
        console.error('Error loading sessions from disk:', error);
    }
}

// Save a session to disk
function saveSessionToDisk(userId: string, session: Session) {
    try {
        const filePath = path.join(SESSION_DIR, `${userId}.json`);
        fs.writeFileSync(filePath, JSON.stringify(session, null, 2));
    } catch (error) {
        console.error(`Failed to save session for ${userId}:`, error);
    }
}

// Remove a session file from disk
function removeSessionFromDisk(userId: string) {
    try {
        const filePath = path.join(SESSION_DIR, `${userId}.json`);
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    } catch (error) {
        console.error(`Failed to remove session file for ${userId}:`, error);
    }
}

// Load sessions at startup
loadSessionsFromDisk();

interface SessionManager {
    getSession(userId: string): Session;
    createSession(): Session;
    clearSession(userId: string): Session;
    cleanupSessions(): void;
}

const sessionManager: SessionManager = {
    getSession(userId) {
        if (!sessions[userId]) {
            sessions[userId] = this.createSession();
        }

        // Update last activity time
        sessions[userId].lastActivity = Date.now();

        return sessions[userId];
    },

    createSession() {
        return {
            state: null,
            isAuthenticated: false,
            token: null,
            organizationId: null,
            profile: null,
            data: {},
            lastActivity: Date.now()
        };
    },

    clearSession(userId) {
        sessions[userId] = this.createSession();
        // Remove from disk as well
        removeSessionFromDisk(userId);
        return sessions[userId];
    },

    cleanupSessions() {
        const now = Date.now();
        Object.keys(sessions).forEach(userId => {
            const session = sessions[userId];
            if (now - session.lastActivity > SESSION_EXPIRY) {
                delete sessions[userId];
                // Remove expired sessions from disk as well
                removeSessionFromDisk(userId);
            }
        });
    }
};

// Set up session cleanup interval
setInterval(() => sessionManager.cleanupSessions(), 60 * 60 * 1000); // Every hour

// Update your AuthServiceImpl to save sessions after modification
// This function wraps the sessionManager to automatically save changes
function withPersistence<T extends keyof typeof sessionManager>(
    methodName: T,
    autoSave = false
): typeof sessionManager[T] {
    const originalMethod = sessionManager[methodName];

    return function (...args: any[]) {
        const result = originalMethod.apply(sessionManager, args);

        // If this is a method that should auto-save the session
        if (autoSave && typeof args[0] === 'string') {
            const userId = args[0];
            saveSessionToDisk(userId, sessions[userId]);
        }

        return result;
    } as typeof sessionManager[T];
}

// Create a new session manager with automatic persistence
const persistentSessionManager = {
    ...sessionManager,
    getSession: withPersistence('getSession', true),
    clearSession: withPersistence('clearSession', false)
};

export { persistentSessionManager as sessionManager };