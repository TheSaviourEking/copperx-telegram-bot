// src/bot/keyboards.ts
import { Markup } from 'telegraf';

export const mainMenuKeyboard = Markup.keyboard([
    ['/balance', '/send'],
    ['/withdraw', '/history'],
    ['/profile', '/help']
]).resize();

export const cancelKeyboard = Markup.keyboard([
    ['/cancel']
]).resize();

export const confirmationKeyboard = Markup.inlineKeyboard([
    [
        Markup.button.callback('✅ Confirm', 'confirm'),
        Markup.button.callback('❌ Cancel', 'cancel')
    ]
]);

export const backToMainMenuKeyboard = Markup.keyboard([
    ['/balance', '/send'],
    ['/withdraw', '/history'],
    ['/profile', '/help']
]).resize();