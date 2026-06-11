import { Bot } from 'grammy';
import dotenv from 'dotenv';
import { registerCommands } from './commands';
import { registerWebappHandlers } from './handlers/webapp';
import { registerCallbackHandlers } from './handlers/callbacks';

// Load environment variables
dotenv.config();

// Validate required environment variables
const requiredEnvVars = ['BOT_TOKEN', 'WEBAPP_URL', 'API_URL'];
const missingVars = requiredEnvVars.filter((v) => !process.env[v]);

if (missingVars.length > 0) {
  console.error(
    `[Startup] Missing required environment variables: ${missingVars.join(', ')}`
  );
  process.exit(1);
}

// Create bot instance
const bot = new Bot(process.env.BOT_TOKEN!);

// Register all handlers
registerCommands(bot);
registerWebappHandlers(bot);
registerCallbackHandlers(bot);

// Global error handler
bot.catch((err) => {
  console.error('[Bot] Unhandled error:', err);
});

// Graceful shutdown
process.once('SIGINT', () => {
  console.log('[Bot] Received SIGINT, shutting down gracefully...');
  bot.stop();
});

process.once('SIGTERM', () => {
  console.log('[Bot] Received SIGTERM, shutting down gracefully...');
  bot.stop();
});

// Start the bot
bot.start();
console.log('[Bot] Wedding Invites Bot started successfully!');
console.log(`[Bot] Web App URL: ${process.env.WEBAPP_URL}`);
console.log(`[Bot] API URL: ${process.env.API_URL}`);
