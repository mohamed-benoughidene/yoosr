import { ConvexHttpClient } from "convex/browser";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL);
async function run() {
    console.log("Projects:", await client.query("projects:list", {}));
}
run();
