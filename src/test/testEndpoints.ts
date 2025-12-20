import { config } from 'dotenv';
config();

import express from 'express';
import gupshupRoutes from '../routes/gupshupRoutes';

/**
 * Simple test server to test Gupshup endpoints
 * Run with: node dist/test/testEndpoints.js
 */

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add Gupshup routes
app.use('/gupshup', gupshupRoutes);

const PORT = 3001;

app.listen(PORT, () => {
    console.log(`🚀 Test server running on http://localhost:${PORT}`);
    console.log('');
    console.log('Available endpoints:');
    console.log('- POST /gupshup/send-text');
    console.log('- POST /gupshup/send-template');
    console.log('- POST /gupshup/send-media');
    console.log('- POST /gupshup/send-interactive');
    console.log('- POST /gupshup/opt-in');
    console.log('- POST /gupshup/opt-out');
    console.log('- GET /gupshup/message-status/:messageId');
    console.log('- GET /gupshup/provider-info');
    console.log('- POST /gupshup/webhook');
    console.log('');
    console.log('Example curl command:');
    console.log(`curl -X POST http://localhost:${PORT}/gupshup/send-text \\`);
    console.log('  -H "Content-Type: application/json" \\');
    console.log('  -d \'{"to":"923072577808","text":"Hello from API endpoint!"}\'');
    console.log('');
    console.log('Press Ctrl+C to stop the server');
});

export default app;