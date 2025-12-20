import { config } from 'dotenv';

// Load environment variables
const result = config();

console.log('🔍 Environment Debug Information\n');

console.log('Dotenv result:', result);
console.log('');

console.log('Environment variables:');
console.log('- NODE_ENV:', process.env.NODE_ENV);
console.log('- GUPSHUP_API_KEY:', process.env.GUPSHUP_API_KEY ? `${process.env.GUPSHUP_API_KEY.substring(0, 10)}...` : 'NOT SET');
console.log('- GUPSHUP_APP_NAME:', process.env.GUPSHUP_APP_NAME || 'NOT SET');
console.log('- GUPSHUP_SOURCE:', process.env.GUPSHUP_SOURCE || 'NOT SET');
console.log('- FACEBOOK_WA_TOKEN:', process.env.FACEBOOK_WA_TOKEN ? `${process.env.FACEBOOK_WA_TOKEN.substring(0, 10)}...` : 'NOT SET');
console.log('');

// Try loading config after dotenv
import { GUPSHUP_API_KEY, GUPSHUP_APP_NAME, GUPSHUP_SOURCE } from '../shared/config';

console.log('Config constants:');
console.log('- GUPSHUP_API_KEY:', GUPSHUP_API_KEY ? `${GUPSHUP_API_KEY.substring(0, 10)}...` : 'NOT SET');
console.log('- GUPSHUP_APP_NAME:', GUPSHUP_APP_NAME || 'NOT SET');
console.log('- GUPSHUP_SOURCE:', GUPSHUP_SOURCE || 'NOT SET');