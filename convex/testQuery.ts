import { internalQuery } from "./_generated/server";

export const getStuff = internalQuery(async (ctx) => {
    const conversations = await ctx.db.query("conversations").order("desc").take(5);
    const contacts = await ctx.db.query("contacts").order("desc").take(5);

    return {
        conversations: conversations.map(c => ({
            id: c._id,
            name: c.visitorName,
            email: c.visitorEmail,
            phone: c.visitorPhone,
        })),
        contacts: contacts.map(c => ({
            id: c._id,
            name: c.name,
            email: c.email,
            phone: c.phone,
        }))
    };
});
