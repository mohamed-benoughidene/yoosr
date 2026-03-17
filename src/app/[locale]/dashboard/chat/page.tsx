import { ChatArea } from "@/components/chat/ChatArea"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { setRequestLocale as unstable_setRequestLocale } from "next-intl/server"

export default async function ChatPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    unstable_setRequestLocale(locale);
    return (
        <Suspense fallback={
            <div className="flex h-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
        }>
            <ChatArea />
        </Suspense>
    )
}