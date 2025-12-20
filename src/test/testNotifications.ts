import { config } from 'dotenv';
config();

import { whatsappNotificationService } from '../services/whatsappNotificationService';
import { NotificationHooks } from '../services/notificationHooks';

/**
 * Test WhatsApp notifications for Ludo game events
 * Run with: node dist/test/testNotifications.js
 */

async function testNotifications() {
    console.log('🎮 Testing Ludo WhatsApp Notifications...\n');

    const testPhoneNumber = '923072577808'; // Your test number
    const testCustomer = {
        phoneCode: '92',
        phoneNumber: '3072577808',
        firstName: 'Ahmed',
        lastName: 'Khan'
    };

    // Test 1: Player Registration Welcome
    console.log('1. Testing Player Registration Welcome...');
    try {
        await NotificationHooks.onCustomerRegistered(testCustomer);
        console.log('✅ Registration welcome notification sent');
    } catch (error) {
        console.error('❌ Registration notification failed:', error);
    }

    // Wait a bit between messages
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Table Booking Confirmation
    console.log('\n2. Testing Table Booking Confirmation...');
    try {
        await NotificationHooks.onTableBooked({
            customer: testCustomer,
            table: { name: 'Table 1', uuid: 'table-1-uuid' },
            categoryPrice: { duration: 1, unit: 'hour', price: 100 },
            session: { uuid: 'session-uuid' }
        });
        console.log('✅ Table booking confirmation sent');
    } catch (error) {
        console.error('❌ Table booking notification failed:', error);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 3: Table Session Started
    console.log('\n3. Testing Table Session Started...');
    try {
        await NotificationHooks.onTableSessionStarted({
            customer: testCustomer,
            table: { name: 'Table 1' },
            session: { duration: 1, unit: 'hour', freeMins: 10 }
        });
        console.log('✅ Session started notification sent');
    } catch (error) {
        console.error('❌ Session started notification failed:', error);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 4: Tournament Registration
    console.log('\n4. Testing Tournament Registration...');
    try {
        await NotificationHooks.onTournamentRegistration({
            customer: testCustomer,
            tournament: {
                name: 'Friday Night Championship',
                date: '2025-12-20',
                startTime: '20:00',
                entryFee: 50,
                prizePool: 1000
            }
        });
        console.log('✅ Tournament registration notification sent');
    } catch (error) {
        console.error('❌ Tournament registration notification failed:', error);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 5: Tournament Start Notification
    console.log('\n5. Testing Tournament Start Notification...');
    try {
        await NotificationHooks.onTournamentStart({
            tournament: {
                name: 'Friday Night Championship',
                date: '2025-12-20',
                startTime: '20:00',
                prizePool: 1000
            },
            participants: [testCustomer]
        });
        console.log('✅ Tournament start notification sent');
    } catch (error) {
        console.error('❌ Tournament start notification failed:', error);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 6: Session Expiry Warning
    console.log('\n6. Testing Session Expiry Warning...');
    try {
        await NotificationHooks.onSessionExpiryWarning({
            customer: testCustomer,
            table: { name: 'Table 1' },
            remainingMinutes: 5
        });
        console.log('✅ Session expiry warning sent');
    } catch (error) {
        console.error('❌ Session expiry warning failed:', error);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 7: Promotional Message
    console.log('\n7. Testing Promotional Message...');
    try {
        const promoMessage = `🎮 SPECIAL WEEKEND OFFER! 🎮\n\n` +
                           `Hi {name}!\n\n` +
                           `Get 30% OFF on all table bookings this weekend!\n` +
                           `Valid Saturday & Sunday only.\n\n` +
                           `🎯 Book now at LUDO ROYAL CLUB\n` +
                           `📞 Call us: 0300-1234567`;

        const success = await whatsappNotificationService.sendPromotionalMessage(
            [testCustomer],
            promoMessage
        );
        console.log(`✅ Promotional message sent to ${success} customers`);
    } catch (error) {
        console.error('❌ Promotional message failed:', error);
    }

    console.log('\n🎉 All notification tests completed!');
    console.log('\n📱 Check your WhatsApp messages on:', testPhoneNumber);
    console.log('\n💡 Integration Tips:');
    console.log('- Customer registration: Automatically triggered when customer is saved');
    console.log('- Table booking: Automatically triggered when table session is booked');
    console.log('- Session start: Automatically triggered when session starts');
    console.log('- Tournament notifications: Call hooks manually or via API endpoints');
    console.log('- Promotional messages: Use API endpoints for bulk messaging');
}

// Run the test if this file is executed directly
if (require.main === module) {
    testNotifications()
        .then(() => {
            console.log('\n✨ Test completed successfully!');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n💥 Test failed:', error);
            process.exit(1);
        });
}

export { testNotifications };