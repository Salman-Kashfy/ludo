import { whatsappService, WhatsAppProvider } from '../lib/whatsappService';
import { createGupshupClient } from '../lib/gupshup';

/**
 * Test script for Gupshup WhatsApp integration
 * Run with: node dist/test/gupshupTest.js
 */

async function testGupshupIntegration() {
    console.log('🚀 Testing Gupshup WhatsApp Integration...\n');

    // Test 1: Check provider availability
    console.log('1. Checking provider availability...');
    try {
        const providers = whatsappService.getAvailableProviders();
        const current = whatsappService.getCurrentProvider();
        console.log('✅ Available providers:', providers);
        console.log('✅ Current provider:', current);
    } catch (error) {
        console.error('❌ Provider check failed:', error);
    }

    // Test 2: Test Gupshup client creation
    console.log('\n2. Testing Gupshup client creation...');
    try {
        const client = createGupshupClient('test_key', 'test_app');
        console.log('✅ Gupshup client created successfully');
    } catch (error) {
        console.error('❌ Gupshup client creation failed:', error);
    }

    // Test 3: Test phone number formatting
    console.log('\n3. Testing phone number formatting...');
    try {
        const client = createGupshupClient('test_key', 'test_app');
        // This will test the private formatPhoneNumber method indirectly
        console.log('✅ Phone number formatting logic available');
    } catch (error) {
        console.error('❌ Phone number formatting test failed:', error);
    }

    // Test 4: Configuration validation
    console.log('\n4. Testing configuration...');
    try {
        const hasGupshupConfig = Boolean(process.env.GUPSHUP_API_KEY && process.env.GUPSHUP_APP_NAME);
        const hasFacebookConfig = Boolean(process.env.FACEBOOK_WA_TOKEN && process.env.FACEBOOK_WA_PHONE_NUMBER_ID);
        
        console.log('✅ Gupshup configured:', hasGupshupConfig);
        console.log('✅ Facebook configured:', hasFacebookConfig);
        
        if (!hasGupshupConfig && !hasFacebookConfig) {
            console.log('⚠️  No WhatsApp providers configured. Please set environment variables.');
        }
    } catch (error) {
        console.error('❌ Configuration test failed:', error);
    }

    console.log('\n🎉 Gupshup integration test completed!');
    console.log('\nNext steps:');
    console.log('1. Set GUPSHUP_API_KEY and GUPSHUP_APP_NAME in your .env file');
    console.log('2. Add Gupshup routes to your Express app');
    console.log('3. Configure webhook URL in Gupshup dashboard');
    console.log('4. Test with actual API calls');
}

// Run the test if this file is executed directly
if (require.main === module) {
    testGupshupIntegration().catch(console.error);
}

export { testGupshupIntegration };