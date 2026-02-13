import {
    MessageSquare,
    Bot,
    Sparkles,
    Smartphone,
    Mail
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
        id: 'telegram',
        name: 'Telegram',
        description: 'Connect your Telegram Bot to handle support conversations.',
        category: 'channel',
        icon: MessageSquare,
    },
    {
        id: 'whatsapp',
        name: 'WhatsApp',
        description: 'Official WhatsApp Business API integration.',
        category: 'channel',
        icon: Smartphone,
        isPro: true
    },
    {
        id: 'messenger',
        name: 'Facebook Messenger',
        description: 'Connect your Facebook Page to receive messages.',
        category: 'channel',
        icon: MessageSquare,
        isPro: true
    },
    {
        id: 'openai',
        name: 'OpenAI',
        description: 'Use GPT-4 to power your AI Agents.',
        category: 'ai',
        icon: Sparkles
    },
    {
        id: 'email',
        name: 'Email Relay',
        description: 'Forward emails to your project inbox.',
        category: 'channel',
        icon: Mail,
        isComingSoon: true
    }
];
