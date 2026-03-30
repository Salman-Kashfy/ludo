import * as admin from 'firebase-admin';
import * as path from 'path';

/**
 * Firebase Cloud Messaging Service
 * Sends push notifications to customers' devices using FCM
 */

let firebaseAdminInitialized = false;

const initializeFirebaseAdmin = () => {
    if (firebaseAdminInitialized) return;

    try {
        // Path to Firebase service account key
        const serviceAccountPath = path.join(__dirname, '../../config/firebase-service-account.json');
        
        // Check if file exists
        const fs = require('fs');
        if (!fs.existsSync(serviceAccountPath)) {
            console.warn('⚠️  Firebase service account not found at:', serviceAccountPath);
            console.warn('⚠️  FCM notifications will not work. Please download from Firebase Console.');
            return;
        }

        // Initialize Firebase Admin SDK
        const serviceAccount = require(serviceAccountPath);
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

        firebaseAdminInitialized = true;
        console.log('✅ Firebase Admin SDK initialized for FCM notifications');
    } catch (error) {
        console.error('❌ Failed to initialize Firebase Admin SDK:', error);
    }
};

export const fcmNotificationService = {
    /**
     * Send push notification to a customer's device(s)
     * @param fcmToken - FCM token of the device
     * @param title - Notification title
     * @param body - Notification body/message
     * @param data - Additional data to send
     */
    async sendToDevice(
        fcmToken: string,
        title: string,
        body: string,
        data?: Record<string, string>
    ): Promise<void> {
        initializeFirebaseAdmin();

        if (!firebaseAdminInitialized) {
            console.warn('Firebase Admin SDK not initialized. Skipping FCM notification.');
            return;
        }

        try {
            const message = {
                notification: {
                    title,
                    body
                },
                data: data || {},
                webpush: {
                    notification: {
                        title,
                        body,
                        icon: '/ludo-icon.png',
                        badge: '/ludo-badge.png',
                        tag: 'booking-notification',
                        requireInteraction: true
                    }
                }
            };

            const response = await admin.messaging().send({
                ...message,
                token: fcmToken
            });

            console.log(`✅ FCM notification sent successfully. Message ID: ${response}`);
        } catch (error: any) {
            console.error('❌ Error sending FCM notification:', error.message);
            // Don't throw - just log and continue
        }
    },

    /**
     * Send push notification to multiple devices
     * @param fcmTokens - Array of FCM tokens
     * @param title - Notification title
     * @param body - Notification body/message
     * @param data - Additional data to send
     */
    async sendToMultipleDevices(
        fcmTokens: string[],
        title: string,
        body: string,
        data?: Record<string, string>
    ): Promise<void> {
        initializeFirebaseAdmin();

        if (!firebaseAdminInitialized) {
            console.warn('Firebase Admin SDK not initialized. Skipping FCM notifications.');
            return;
        }

        if (!fcmTokens || fcmTokens.length === 0) {
            console.warn('No FCM tokens provided');
            return;
        }

        try {
            const message = {
                notification: {
                    title,
                    body
                },
                data: data || {},
                webpush: {
                    notification: {
                        title,
                        body,
                        icon: '/ludo-icon.png',
                        badge: '/ludo-badge.png',
                        tag: 'booking-notification',
                        requireInteraction: true
                    }
                }
            };

            const response = await (admin.messaging() as any).sendMulticast({
                ...message,
                tokens: fcmTokens
            });

            console.log(`✅ FCM notifications sent: ${response.successCount} succeeded, ${response.failureCount} failed`);

            // Handle failed tokens
            if (response.failureCount > 0) {
                response.responses.forEach((resp: any, idx: number) => {
                    if (!resp.success) {
                        console.warn(`Failed to send to token ${fcmTokens[idx]}:`, resp.error?.message);
                    }
                });
            }
        } catch (error: any) {
            console.error('❌ Error sending FCM notifications:', error.message);
        }
    }
};
