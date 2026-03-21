import { BotOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function BotNotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-screen gap-4 text-center">
      <BotOff className="h-12 w-12 text-muted-foreground" />
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Bot not found</h1>
        <p className="text-muted-foreground">
          This bot does not exist or you do not have access to it.
        </p>
      </div>
      <Link href="/dashboard/bots">
        <Button variant="outline">Back to bots</Button>
      </Link>
    </div>
  );
}
