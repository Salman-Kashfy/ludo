import { whatsappService, WhatsAppProvider } from '../lib/whatsappService';

/**
 * Example usage of Gupshup WhatsApp integration
 * Make sure to set the following environment variables:
 * - GUPSHUP_API_KEY
 * - GUPSHUP_APP_NAME
 * - GUPSHUP_SOURCE (optional)
 */

export async function sendTextExample() {
    try {
        const result = await whatsappService.sendTextMessage(
            '919876543210', // recipient phone number with country code
            'Hello from Gupshup! This is a test message.',
            WhatsAppProvider.GUPSHUP
        );
        console.log('Text message sent:', result);
        return result;
    } catch (error) {
        console.error('Failed to send text message:', error);
        throw error;
    }
}

export async function sendTemplateExample() {
    try {
        const result = await whatsappService.sendTemplateMessage(
            '919876543210',
            'welcome_template', // Your approved template ID
            ['John Doe', 'CloudFitnest'], // Template parameters
            undefined, // language (not used for Gupshup)
            WhatsAppProvider.GUPSHUP
        );
        console.log('Template message sent:', result);
        return result;
    } catch (error) {
        console.error('Failed to send template message:', error);
        throw error;
    }
}

export async function sendImageExample() {
    try {
        const result = await whatsappService.sendMediaMessage(
            '919876543210',
            'https://example.com/image.jpg',
            'image',
            'Check out this image!', // caption
            undefined, // filename (not needed for images)
            WhatsAppProvider.GUPSHUP
        );
        console.log('Image sent:', result);
        return result;
    } catch (error) {
        console.error('Failed to send image:', error);
        throw error;
    }
}

export async function sendDocumentExample() {
    try {
        const result = await whatsappService.sendMediaMessage(
            '919876543210',
            'https://example.com/document.pdf',
            'document',
            'Here is your requested document',
            'invoice.pdf', // filename
            WhatsAppProvider.GUPSHUP
        );
        console.log('Document sent:', result);
        return result;
    } catch (error) {
        console.error('Failed to send document:', error);
        throw error;
    }
}

export async function sendInteractiveButtonExample() {
    try {
        const interactiveMessage = {
            type: 'button',
            header: {
                type: 'text',
                text: 'Choose an option'
            },
            body: {
                text: 'Please select one of the following options:'
            },
            footer: {
                text: 'CloudFitnest Support'
            },
            action: {
                buttons: [
                    {
                        type: 'reply',
                        reply: {
                            id: 'option_1',
                            title: 'Option 1'
                        }
                    },
                    {
                        type: 'reply',
                        reply: {
                            id: 'option_2',
                            title: 'Option 2'
                        }
                    }
                ]
            }
        };

        const result = await whatsappService.sendInteractiveMessage(
            '919876543210',
            interactiveMessage,
            WhatsAppProvider.GUPSHUP
        );
        console.log('Interactive message sent:', result);
        return result;
    } catch (error) {
        console.error('Failed to send interactive message:', error);
        throw error;
    }
}

export async function sendInteractiveListExample() {
    try {
        const interactiveMessage = {
            type: 'list',
            header: {
                type: 'text',
                text: 'Our Services'
            },
            body: {
                text: 'Choose a service you are interested in:'
            },
            footer: {
                text: 'CloudFitnest'
            },
            action: {
                button: 'View Services',
                sections: [
                    {
                        title: 'Fitness Services',
                        rows: [
                            {
                                id: 'personal_training',
                                title: 'Personal Training',
                                description: 'One-on-one fitness coaching'
                            },
                            {
                                id: 'group_classes',
                                title: 'Group Classes',
                                description: 'Join our group fitness sessions'
                            }
                        ]
                    },
                    {
                        title: 'Nutrition Services',
                        rows: [
                            {
                                id: 'meal_planning',
                                title: 'Meal Planning',
                                description: 'Customized nutrition plans'
                            }
                        ]
                    }
                ]
            }
        };

        const result = await whatsappService.sendInteractiveMessage(
            '919876543210',
            interactiveMessage,
            WhatsAppProvider.GUPSHUP
        );
        console.log('Interactive list sent:', result);
        return result;
    } catch (error) {
        console.error('Failed to send interactive list:', error);
        throw error;
    }
}

export async function optInUserExample() {
    try {
        const result = await whatsappService.optInUser('919876543210');
        console.log('User opted in:', result);
        return result;
    } catch (error) {
        console.error('Failed to opt in user:', error);
        throw error;
    }
}

export async function optOutUserExample() {
    try {
        const result = await whatsappService.optOutUser('919876543210');
        console.log('User opted out:', result);
        return result;
    } catch (error) {
        console.error('Failed to opt out user:', error);
        throw error;
    }
}

export async function getMessageStatusExample(messageId: string) {
    try {
        const result = await whatsappService.getMessageStatus(messageId);
        console.log('Message status:', result);
        return result;
    } catch (error) {
        console.error('Failed to get message status:', error);
        throw error;
    }
}

export async function checkProviderAvailability() {
    try {
        const availableProviders = whatsappService.getAvailableProviders();
        const currentProvider = whatsappService.getCurrentProvider();
        
        console.log('Available providers:', availableProviders);
        console.log('Current default provider:', currentProvider);
        
        return {
            availableProviders,
            currentProvider
        };
    } catch (error) {
        console.error('Failed to check provider availability:', error);
        throw error;
    }
}

// Example of using fallback functionality
export async function sendWithFallbackExample() {
    try {
        // This will try Gupshup first, then fallback to Facebook if Gupshup fails
        const result = await whatsappService.sendTextMessage(
            '919876543210',
            'This message will use fallback if primary provider fails'
        );
        console.log('Message sent with potential fallback:', result);
        return result;
    } catch (error) {
        console.error('All providers failed:', error);
        throw error;
    }
}