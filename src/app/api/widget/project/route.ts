import { NextResponse } from "next/server";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
        return NextResponse.json({ error: "projectId is required" }, {
            status: 400,
            headers: corsHeaders()
        });
    }

    const convexSiteUrl = process.env.NEXT_PUBLIC_CONVEX_SITE_URL;
    if (!convexSiteUrl) {
        return NextResponse.json({ error: "Server configuration missing" }, {
            status: 500,
            headers: corsHeaders()
        });
    }

    try {
        const res = await fetch(`${convexSiteUrl}/widget/project?projectId=${encodeURIComponent(projectId)}`, {
            // we don't need credentials for public widget endpoints
            next: { revalidate: 60 } // Cache for 60 seconds to avoid N+1 spam!
        });

        if (!res.ok) {
            return NextResponse.json({ error: "Failed to fetch project" }, {
                status: res.status,
                headers: corsHeaders()
            });
        }

        const data = await res.json();

        return NextResponse.json(data, {
            status: 200,
            headers: corsHeaders()
        });

    } catch {
        return NextResponse.json({ error: "Internal server error" }, {
            status: 500,
            headers: corsHeaders()
        });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: corsHeaders()
    });
}

function corsHeaders() {
    return {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };
}
