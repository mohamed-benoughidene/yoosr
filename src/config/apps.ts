import {
    MessageSquare,
    Sparkles,
    Instagram,
    Send,
} from "lucide-react";

export interface AppDefinition {
    id: string;
    name: string;
    description: string;
    category: 'channel' | 'ai' | 'utility';
    icon: any; // Lucide icon
    isPro?: boolean;
    isComingSoon?: boolean;
}

export const AVAILABLE_APPS: AppDefinition[] = [
    {
        id: 'openrouter',
        name: 'OpenRouter',
        description: 'Unified API for 100+ AI models.',
        category: 'ai',
        icon: Sparkles
    },
    {
        id: 'telegram',
        name: 'Telegram',
        description: 'Connect your Telegram Bot to handle support conversations.',
        category: 'channel',
        icon: Send,
    },
    {
        id: 'messenger',
        name: 'Facebook Messenger',
        description: 'Connect your Facebook Page to receive messages.',
        category: 'channel',
        icon: MessageSquare,
        isPro: false
    },
    {
        id: 'instagram',
        name: 'Instagram',
        description: 'Connect your Instagram Professional account for DMs.',
        category: 'channel',
        icon: Instagram,
    }
];
