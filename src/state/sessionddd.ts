import { Session } from "../../global";
import config from "../config";

const SESSION_EXPIRY = config.sessionExpiry;

const sessions: { [userId: string]: Session } = {};

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
        return sessions[userId];
    },

    cleanupSessions() {
        const now = Date.now();
        Object.keys(sessions).forEach(userId => {
            const session = sessions[userId];
            if (now - session.lastActivity > SESSION_EXPIRY) {
                delete sessions[userId];
            }
        });
    }
};

// Set up session cleanup interval
setInterval(() => sessionManager.cleanupSessions(), 60 * 60 * 1000); // Every hour

export { sessionManager };