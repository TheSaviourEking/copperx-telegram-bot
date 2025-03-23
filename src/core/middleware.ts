import { Middleware } from 'telegraf';
import { logger } from '../utils/logger';
import { SessionContext } from '../../global';
import { sessionManager } from '../state/session';

const sessionMiddleware: Middleware<SessionContext> = async (ctx, next) => {
    const userId = ctx.from?.id;
    if (!userId) return next();

    ctx.session = sessionManager.getSession(userId.toString());
    if (ctx.session) {
        ctx.session.lastActivity = Date.now();
    }

    return next();
};


const loggingMiddleware: Middleware<SessionContext> = async (ctx, next) => {
    const start = Date.now();
    return next().then(() => {
        const ms = Date.now() - start;
        const message = ctx.message || ctx.callbackQuery?.message;
        let text = '';
        if (message) {
            if ('text' in message) {
                text = message.text;
            } else if ('caption' in message) {
                text = message.caption ?? '[no caption]';
            } else {
                text = '[non-text message]';
            }
        }
        logger.info(`${ctx.from?.username || ctx.from?.id}: ${text} (${ms}ms)`);
    });
};

export { sessionMiddleware, loggingMiddleware };