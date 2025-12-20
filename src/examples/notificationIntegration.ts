/**
 * Complete integration example for WhatsApp notifications in your Ludo game
 * This file shows how to integrate all notification features into your application
 */

import express from 'express';
import { notificationScheduler } from '../services/notificationScheduler';
import { whatsappNotificationService } from '../services/whatsappNotificationService';
import { NotificationHooks } from '../services/notificationHooks';
import gupshupRoutes from '../routes/gupshupRoutes';
import notificationRoutes from '../routes/notificationRoutes';

// ============================================================================
// 1. EXPRESS APP SETUP
// ============================================================================

const app = express();

// Add middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Add WhatsApp routes
app.use('/gupshup', gupshupRoutes);
app.use('/notifications', notificationRoutes);

// ============================================================================
// 2. START NOTIFICATION SCHEDULER
// ============================================================================

// Start the notification scheduler when your app starts
app.listen(5000, () => {
    console.log('🚀 Server started on port 5000');
    
    // Start automatic notifications
    notificationScheduler.start();
    
    console.log('📱 WhatsApp notifications are now active!');
});

// ============================================================================
// 3. INTEGRATION EXAMPLES
// ============================================================================

/**
 * Example: Customer Registration with WhatsApp Welcome
 */
export async function registerCustomerExample() {
    // Your existing customer registration logic
    const customerData = {
        firstName: 'Ahmed',
        lastName: 'Khan',
        phoneCode: '92',
        phoneNumber: '3001234567',
        companyUuid: 'your-company-uuid'
    };

    // Save customer (this will automatically trigger welcome notification)
    // const result = await context.customer.save(customerData);
    
    // Manual notification trigger (if needed)
    await NotificationHooks.onCustomerRegistered(customerData);
    
    console.log('✅ Customer registered and welcome message sent!');
}

/**
 * Example: Table Booking with Confirmation
 */
export async function bookTableExample() {
    const bookingData = {
        customerUuid: 'customer-uuid',
        tableUuid: 'table-uuid',
        categoryPriceUuid: 'price-uuid',
        companyUuid: 'company-uuid',
        paymentMethod: { paymentScheme: 'CASH' }
    };

    // Book table (this will automatically trigger booking confirmation)
    // const result = await context.tableSession.bookSession(bookingData);
    
    console.log('✅ Table booked and confirmation sent!');
}

/**
 * Example: Tournament Start Notification
 */
export async function startTournamentExample() {
    const tournamentData = {
        tournament: {
            uuid: 'tournament-uuid',
            name: 'Friday Night Championship',
            date: '2025-12-20',
            startTime: '20:00',
            prizePool: 5000
        },
        participants: [
            {
                phoneCode: '92',
                phoneNumber: '3001234567',
                firstName: 'Ahmed',
                lastName: 'Khan'
            },
            {
                phoneCode: '92',
                phoneNumber: '3007654321',
                firstName: 'Sara',
                lastName: 'Ali'
            }
        ]
    };

    // Send tournament start notifications
    await NotificationHooks.onTournamentStart(tournamentData);
    
    console.log('✅ Tournament start notifications sent to all participants!');
}

/**
 * Example: Manual Promotional Message
 */
export async function sendPromotionalExample() {
    const customers = [
        {
            phoneCode: '92',
            phoneNumber: '3001234567',
            firstName: 'Ahmed',
            lastName: 'Khan'
        },
        {
            phoneCode: '92',
            phoneNumber: '3007654321',
            firstName: 'Sara',
            lastName: 'Ali'
        }
    ];

    const message = `🎮 SPECIAL OFFER! 🎮\n\n` +
                   `Hi {name}!\n\n` +
                   `Get 50% OFF on your next table booking!\n` +
                   `Valid until midnight today.\n\n` +
                   `🎯 Book now at LUDO ROYAL CLUB\n` +
                   `📞 Call us or visit our app!`;

    const successCount = await whatsappNotificationService.sendPromotionalMessage(
        customers,
        message
    );

    console.log(`✅ Promotional message sent to ${successCount} customers!`);
}

// ============================================================================
// 4. API ENDPOINTS EXAMPLES
// ============================================================================

/**
 * Example API calls you can make to your notification endpoints
 */

// Send tournament start notification
/*
POST /notifications/tournament/start
{
    "tournamentUuid": "your-tournament-uuid"
}
*/

// Send tournament reminder
/*
POST /notifications/tournament/reminder
{
    "tournamentUuid": "your-tournament-uuid"
}
*/

// Send promotional message to specific customers
/*
POST /notifications/promotional
{
    "message": "🎮 Special offer! Get 50% off your next game!",
    "customerUuids": ["customer-1-uuid", "customer-2-uuid"]
}
*/

// Send promotional message to all customers of a company
/*
POST /notifications/promotional
{
    "message": "🎮 New tournament starting tomorrow!",
    "companyUuid": "your-company-uuid"
}
*/

// Send session expiry warning
/*
POST /notifications/session/expiry-warning
{
    "sessionUuid": "session-uuid",
    "remainingMinutes": 5
}
*/

// Test notification
/*
POST /notifications/test
{
    "phoneNumber": "923001234567",
    "message": "This is a test message!"
}
*/

// Get notification stats
/*
GET /notifications/stats
*/

// ============================================================================
// 5. SCHEDULED NOTIFICATIONS (AUTOMATIC)
// ============================================================================

/**
 * The notification scheduler automatically handles:
 * 
 * 1. Tournament Reminders (30 minutes before start)
 *    - Runs every 5 minutes
 *    - Checks for tournaments starting in 30 minutes
 *    - Sends reminders to all participants
 * 
 * 2. Tournament Start Notifications (at start time)
 *    - Runs every minute
 *    - Checks for tournaments starting now
 *    - Sends start notifications to all participants
 * 
 * 3. Session Expiry Warnings (5 minutes before end)
 *    - Runs every minute
 *    - Checks for sessions expiring in 5 minutes
 *    - Sends warnings to customers
 */

// ============================================================================
// 6. INTEGRATION WITH YOUR EXISTING CODE
// ============================================================================

/**
 * To integrate with your existing models, add these imports to your model files:
 */

// In src/schema/customer/model.ts:
// import { NotificationHooks } from '../../services/notificationHooks';

// In src/schema/table-session/model.ts:
// import { NotificationHooks } from '../../services/notificationHooks';

// In src/schema/tournament/model.ts (if you have tournament player registration):
// import { NotificationHooks } from '../../services/notificationHooks';

/**
 * Then call the appropriate hooks in your save/update methods:
 */

// After customer registration:
// await NotificationHooks.onCustomerRegistered(savedCustomer);

// After table booking:
// await NotificationHooks.onTableBooked({ customer, table, categoryPrice, session });

// After session start:
// await NotificationHooks.onTableSessionStarted({ customer, table, session });

// After tournament registration:
// await NotificationHooks.onTournamentRegistration({ customer, tournament });

// ============================================================================
// 7. ENVIRONMENT VARIABLES NEEDED
// ============================================================================

/**
 * Make sure these are set in your .env file:
 * 
 * GUPSHUP_API_KEY=laxj4iwpd84ltxjwqnnp5lhibcc605qa
 * GUPSHUP_APP_NAME=LUDOROYALCLUB
 * GUPSHUP_SOURCE=917834811114
 * GUPSHUP_API_URL=https://api.gupshup.io/wa/api/v1
 * 
 * REDIS_ENABLE=true (for message queuing)
 * REDIS_HOST=127.0.0.1
 * REDIS_PORT=6379
 */

// ============================================================================
// 8. TESTING YOUR INTEGRATION
// ============================================================================

export async function testIntegration() {
    console.log('🧪 Testing WhatsApp notification integration...\n');

    // Test 1: Send a test message
    try {
        const success = await whatsappNotificationService.sendPromotionalMessage(
            [{ phoneNumber: '923072577808', firstName: 'Test', lastName: 'User' }],
            '🧪 Integration test successful! Your WhatsApp notifications are working.'
        );
        console.log('✅ Test message sent:', success > 0);
    } catch (error) {
        console.error('❌ Test message failed:', error);
    }

    // Test 2: Check scheduler status
    const schedulerStatus = notificationScheduler.getStatus();
    console.log('✅ Scheduler status:', schedulerStatus);

    // Test 3: Send scheduler test notification
    try {
        const testResult = await notificationScheduler.sendTestNotification('923072577808');
        console.log('✅ Scheduler test:', testResult);
    } catch (error) {
        console.error('❌ Scheduler test failed:', error);
    }

    console.log('\n🎉 Integration test completed!');
}

// Run test if this file is executed directly
if (require.main === module) {
    testIntegration().catch(console.error);
}