import app from './app';
import { env } from './config/env';
import { prisma } from './config/prisma';

const server = app.listen(env.PORT, () => {
  console.log(`
  🏛️ =======================================================
  🏛️  Philosophy Recommendation Engine API is running!
  🏛️  Environment: ${env.NODE_ENV}
  🏛️  Port:        ${env.PORT}
  🏛️  URL:         http://localhost:${env.PORT}
  🏛️  Health:      http://localhost:${env.PORT}/api/v1/health
  🏛️ =======================================================
  `);
});

// Graceful Shutdown
const shutdown = async (signal: string) => {
  console.log(`\n⏳ Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    console.log('🛑 HTTP server closed.');
    await prisma.$disconnect();
    console.log('🔌 Database connection closed.');
    process.exit(0);
  });

  // Force close after 10s if graceful shutdown hangs
  setTimeout(() => {
    console.error('⚠️ Forcing server shutdown after timeout.');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
