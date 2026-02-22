import { ChatArea } from "@/components/chat/ChatArea"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export default function ChatPage() {
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
