import { Context } from 'telegraf';

// Define the shape of your session object
interface SessionData {
    [key: string]: any; // You can make this more specific based on your needs
}

// Extend the Context interface to include session
interface CustomContext extends Context {
    session: SessionData;
}

export { CustomContext, SessionData };