import { ConvexHttpClient } from "convex/browser";
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);
client.action("bot:executeNextBlock" as any, { conversationId: "jh73cmfhfeshjh2h12qswc7s05826a3h", incomingMessage: "sales" })
  .then(res => console.log("Success:", res))
  .catch(err => console.error("FULL ERROR:", err.message, err.stack));
