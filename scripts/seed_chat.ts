
import { createClient } from "@supabase/supabase-js"
import dotenv from "dotenv"

dotenv.config({ path: ".env.local" })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function seed() {
    console.log("Seeding chat data...")

    // 1. Get a project
    const { data: projects, error: projectsError } = await supabase
        .from("projects")
        .select("id, owner_id")
        .limit(1)

    if (projectsError || !projects || projects.length === 0) {
        console.error("No projects found. Please create a project first via the UI.")
        return
    }

    const project = projects[0]
    console.log(`Found project: ${project.id}`)

    // 2. Create a conversation
    const { data: conversation, error: convError } = await supabase
        .from("conversations")
        .insert({
            project_id: project.id,
            visitor_name: "Seed Visitor",
            last_message: "Hello from seed script!",
            status: "open",
            unread_count: 1
        })
        .select()
        .single()

    if (convError) {
        console.error("Error creating conversation:", convError)
        return
    }

    console.log(`Created conversation: ${conversation.id}`)

    // 3. Create a message
    const { error: msgError } = await supabase
        .from("messages")
        .insert({
            conversation_id: conversation.id,
            content: "Hello from seed script!",
            sender_type: "visitor"
        })

    if (msgError) {
        console.error("Error creating message:", msgError)
        return
    }

    console.log("Created message. Seed complete.")
}

seed()
