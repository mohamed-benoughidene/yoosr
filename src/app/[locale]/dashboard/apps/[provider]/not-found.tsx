import { PackageX } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function AppNotFound() {
  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[60vh] gap-4 text-center">
      <PackageX className="h-12 w-12 text-muted-foreground" />
      <div className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Integration not found</h1>
        <p className="text-muted-foreground">
          This resource does not exist or may have been deleted.
        </p>
      </div>
      <Link href="/dashboard/apps">
        <Button variant="outline">Go back</Button>
      </Link>
    </div>
  );
}
