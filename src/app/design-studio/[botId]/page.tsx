import type { Metadata } from "next";
import { BotEditorClient } from "./BotEditorClient";

export async function generateMetadata({ params }: { params: Promise<{ botId: string }> }): Promise<Metadata> {
    return {
        title: "Design Studio — Yoosr",
        description: "Build and configure your bot flows visually."
    }
}

export default function BotEditorPage() {
    return <BotEditorClient />;
}

