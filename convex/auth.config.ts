import { AuthConfig } from "convex/server";

const clerkIssuerDomain = process.env.CLERK_JWT_ISSUER_DOMAIN;
if (!clerkIssuerDomain) {
    throw new Error(
        "CLERK_JWT_ISSUER_DOMAIN environment variable is required. " +
        "Set it to your Clerk issuer domain (e.g., 'https://your-domain.clerk.accounts.dev')."
    );
}

export default {
    providers: [
        {
            domain: clerkIssuerDomain,
            applicationID: "convex",
        },
    ],
} satisfies AuthConfig;
