import app from './app.js';
import config from './config/config.js';

const PORT = config.port;

// Start server
const server = app.listen(PORT, () => {
  console.log('╔════════════════════════════════════════╗');
  console.log('║     HomEase Backend API Server        ║');
  console.log('╚════════════════════════════════════════╝');
  console.log(`🚀 Environment: ${config.nodeEnv}`);
  console.log(`🌐 Server running on: http://localhost:${PORT}`);
  console.log(`📡 API Base URL: http://localhost:${PORT}/api`);
  console.log(`❤️  Health Check: http://localhost:${PORT}/health`);
  console.log('═══════════════════════════════════════════');
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`\n${signal} signal received: closing HTTP server`);
  server.close(() => {
    console.log('HTTP server closed');
    process.exit(0);
  });

  // Force close after 10 seconds
  setTimeout(() => {
    console.error('Forcing server shutdown');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  gracefulShutdown('UNHANDLED_REJECTION');
});

export default server;
