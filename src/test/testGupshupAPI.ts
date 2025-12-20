import { config } from 'dotenv';
config();

import { whatsappService, WhatsAppProvider } from '../lib/whatsappService';
import { GUPSHUP_API_KEY, GUPSHUP_APP_NAME, GUPSHUP_SOURCE } from '../shared/config';

/**
 * Test actual Gupshup API call
 * Run with: node dist/test/testGupshupAPI.js
 */

async function testGupshupAPI() {
    console.log('🚀 Testing Gupshup API with actual credentials...\n');

    // Display configuration
    console.log('Configuration:');
    console.log('- API Key:', GUPSHUP_API_KEY ? `${GUPSHUP_API_KEY.substring(0, 10)}...` : 'NOT SET');
    console.log('- App Name:', GUPSHUP_APP_NAME || 'NOT SET');
    console.log('- Source:', GUPSHUP_SOURCE || 'NOT SET');
    console.log('');

    // Check provider availability
    const providers = whatsappService.getAvailableProviders();
    console.log('Available providers:', providers);
    console.log('');

    if (!providers.includes(WhatsAppProvider.GUPSHUP)) {
        console.log('❌ Gupshup provider not available. Please check your .env configuration.');
        console.log('Required variables:');
        console.log('  - GUPSHUP_API_KEY');
        console.log('  - GUPSHUP_APP_NAME');
        console.log('  - GUPSHUP_SOURCE (optional)');
        return;
    }

    // Test sending a message
    console.log('📤 Attempting to send test message via Gupshup...');
    
    try {
        const result = await whatsappService.sendTextMessage(
            '923072577808', // The destination from your curl example
            'YOUR LUDO TABLE IS READY\nTABLE NO IS 1',
            WhatsAppProvider.GUPSHUP
        );
        
        console.log('✅ Message sent successfully!');
        console.log('Response:', JSON.stringify(result, null, 2));
    } catch (error: any) {
        console.error('❌ Failed to send message:', error.message);
        if (error.response) {
            console.error('API Response:', error.response.data);
        }
    }
}

// Run the test
if (require.main === module) {
    testGupshupAPI()
        .then(() => {
            console.log('\n✨ Test completed!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Test failed:', error);
            process.exit(1);
        });
}

export { testGupshupAPI };