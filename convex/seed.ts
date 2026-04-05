import { internalMutation } from "./_generated/server";
import { v } from "convex/values";

export const seedDemoData = internalMutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, { projectId }) => {

    for (const label of [
      { name: "Billing", color: "#f59e0b" },
      { name: "Technical", color: "#3b82f6" },
      { name: "Urgent", color: "#ef4444" },
      { name: "Sales", color: "#10b981" },
    ]) {
      await ctx.db.insert("labels", { projectId, ...label });
    }

    const supportDept = await ctx.db.insert("departments", {
      projectId, name: "Support", tags: ["ar", "en"],
    });
    const salesDept = await ctx.db.insert("departments", {
      projectId, name: "Sales", tags: ["en"],
    });

    const now = Date.now();

    const convDefs = [
      {
        visitorName: "أحمد بن علي", visitorEmail: "ahmed@example.com",
        status: 100 as const, priority: "urgent" as const,
        channel: "widget" as const,
        lastMessage: "الموقع لا يعمل عندي منذ الصباح",
        departmentId: supportDept,
        msgs: [
          { sender: "visitor", content: "السلام عليكم", isInternal: false },
          { sender: "bot",     content: "وعليكم السلام، كيف يمكنني مساعدتك اليوم؟", isInternal: false },
          { sender: "visitor", content: "الموقع لا يعمل عندي منذ الصباح", isInternal: false },
          { sender: "bot",     content: "عذراً على الإزعاج، هل يمكنك إخباري بالمتصفح الذي تستخدمه؟", isInternal: false },
          { sender: "visitor", content: "أستخدم Chrome على الموبايل", isInternal: false },
          { sender: "agent",   content: "مرحباً، أنا سأتولى مساعدتك الآن", isInternal: false },
          { sender: "visitor", content: "شكراً، المشكلة ما زالت موجودة", isInternal: false },
          { sender: "agent",   content: "هل يمكنك إرسال screenshot للخطأ؟", isInternal: false },
          { sender: "agent",   content: "Customer on mobile Chrome v120, possible cache issue", isInternal: true },
        ],
      },
      {
        visitorName: "Fatima Zahra", visitorEmail: "fatima@example.com",
        status: 100 as const, priority: "high" as const,
        channel: "widget" as const,
        lastMessage: "I was charged twice this month",
        departmentId: supportDept,
        msgs: [
          { sender: "visitor", content: "Hi, I was charged twice this month", isInternal: false },
          { sender: "bot",     content: "I'm sorry to hear that. Can you share the email address on your account?", isInternal: false },
          { sender: "visitor", content: "fatima@example.com", isInternal: false },
          { sender: "bot",     content: "Thank you. I'm looking into this now, please hold on.", isInternal: false },
          { sender: "agent",   content: "Hi Fatima, I can see two charges on the 3rd and 4th. I'll escalate this to billing.", isInternal: false },
          { sender: "visitor", content: "Thank you, I hope it gets resolved soon", isInternal: false },
          { sender: "agent",   content: "Duplicate charge confirmed — refund to be issued within 3 business days", isInternal: true },
        ],
      },
      {
        visitorName: "كريم مرسي", visitorEmail: "karim@example.com",
        status: 200 as const, priority: "normal" as const,
        channel: "messenger" as const,
        lastMessage: "شكراً سنتواصل معك قريباً",
        departmentId: salesDept,
        msgs: [
          { sender: "visitor", content: "أريد الاستفسار عن الباقات المتاحة", isInternal: false },
          { sender: "bot",     content: "يسعدنا مساعدتك! لدينا ثلاث باقات: Starter وPro وEnterprise", isInternal: false },
          { sender: "visitor", content: "ما الفرق بين Pro و Enterprise؟", isInternal: false },
          { sender: "agent",   content: "مرحباً كريم، باقة Pro تشمل 5 مقاعد و5000 محادثة شهرياً، أما Enterprise فغير محدودة مع دعم مخصص", isInternal: false },
          { sender: "visitor", content: "هل يوجد خصم للدفع السنوي؟", isInternal: false },
          { sender: "agent",   content: "نعم، خصم 20% عند الدفع السنوي", isInternal: false },
          { sender: "visitor", content: "ممتاز، سأفكر في الأمر", isInternal: false },
          { sender: "agent",   content: "شكراً سنتواصل معك قريباً", isInternal: false },
        ],
      },
      {
        visitorName: "Sara Benali", visitorEmail: "sara@example.com",
        status: 200 as const, priority: "normal" as const,
        channel: "widget" as const,
        lastMessage: "Please check your email for the reset link",
        departmentId: supportDept,
        msgs: [
          { sender: "visitor", content: "How do I reset my password?", isInternal: false },
          { sender: "bot",     content: "Sure! Go to the login page and click 'Forgot Password'", isInternal: false },
          { sender: "visitor", content: "I did that but I didn't receive any email", isInternal: false },
          { sender: "agent",   content: "Hi Sara, can you check your spam folder?", isInternal: false },
          { sender: "visitor", content: "Nothing there either", isInternal: false },
          { sender: "agent",   content: "I'll send a manual reset link to your email now", isInternal: false },
          { sender: "visitor", content: "Got it, thank you!", isInternal: false },
          { sender: "agent",   content: "Please check your email for the reset link", isInternal: false },
        ],
      },
      {
        visitorName: "يوسف الإدريسي", visitorEmail: "youssef@example.com",
        status: 1000 as const, priority: "low" as const,
        channel: "telegram" as const,
        lastMessage: "تم حل المشكلة، شكراً",
        departmentId: supportDept,
        msgs: [
          { sender: "visitor", content: "السلام، متى يتجدد اشتراكي؟", isInternal: false },
          { sender: "bot",     content: "يتجدد اشتراكك تلقائياً في نفس تاريخ الاشتراك كل شهر", isInternal: false },
          { sender: "visitor", content: "أريد إلغاء التجديد التلقائي", isInternal: false },
          { sender: "agent",   content: "بإمكانك إلغاء التجديد من Settings → Billing → Cancel Subscription", isInternal: false },
          { sender: "visitor", content: "تم، شكراً جزيلاً", isInternal: false },
          { sender: "agent",   content: "تم حل المشكلة، شكراً", isInternal: false },
        ],
      },
      {
        visitorName: "Nadia Mansouri", visitorEmail: "nadia@example.com",
        status: 100 as const, priority: "high" as const,
        channel: "whatsapp" as const,
        lastMessage: "Do you offer annual plans?",
        departmentId: salesDept,
        msgs: [
          { sender: "visitor", content: "Hello, do you offer annual plans?", isInternal: false },
          { sender: "bot",     content: "Yes we do! Annual plans come with a 20% discount compared to monthly billing.", isInternal: false },
          { sender: "visitor", content: "Great, what's included in the Pro annual plan?", isInternal: false },
          { sender: "bot",     content: "Pro annual includes 5 agent seats, unlimited bots, 5000 conversations/month, and priority support.", isInternal: false },
          { sender: "visitor", content: "Can I get a demo first?", isInternal: false },
          { sender: "agent",   content: "Hi Nadia! Absolutely, I can schedule a 30-minute demo for you. What time works best?", isInternal: false },
          { sender: "visitor", content: "Do you offer annual plans?", isInternal: false },
        ],
      },
      {
        visitorName: "David Thompson", visitorEmail: "david@example.com",
        status: 100 as const, priority: "normal" as const,
        channel: "widget" as const,
        lastMessage: "Integration with Slack not working",
        departmentId: supportDept,
        msgs: [
          { sender: "visitor", content: "Hi, my Slack integration stopped working", isInternal: false },
          { sender: "bot",     content: "I'm sorry to hear that. Can you tell me more about the issue?", isInternal: false },
          { sender: "visitor", content: "I'm not receiving any notifications in Slack", isInternal: false },
          { sender: "agent",   content: "Hi David, let me check your integration settings", isInternal: false },
          { sender: "agent",   content: "Slack webhook appears invalid — needs re-auth", isInternal: true },
        ],
      },
      {
        visitorName: "Steve Wilson", visitorEmail: "steve@example.com",
        status: 200 as const, priority: "high" as const,
        channel: "messenger" as const,
        lastMessage: "Invoice sent to steve@example.com",
        departmentId: supportDept,
        msgs: [
          { sender: "visitor", content: "I need an invoice for last month's payment", isInternal: false },
          { sender: "bot",     content: "I can help with that. What's the email address on your account?", isInternal: false },
          { sender: "visitor", content: "steve@example.com", isInternal: false },
          { sender: "agent",   content: "Hi Steve, I've just sent the invoice to your email", isInternal: false },
          { sender: "visitor", content: "Got it, thanks!", isInternal: false },
          { sender: "agent",   content: "Invoice sent to steve@example.com", isInternal: false },
        ],
      },
      {
        visitorName: "Emily Chen", visitorEmail: "emily@example.com",
        status: 100 as const, priority: "normal" as const,
        channel: "widget" as const,
        lastMessage: "Looking for enterprise pricing",
        departmentId: salesDept,
        msgs: [
          { sender: "visitor", content: "Hi, I'm looking for enterprise pricing information", isInternal: false },
          { sender: "bot",     content: "Welcome! Our Enterprise plan includes unlimited everything. Can I get your company name?", isInternal: false },
          { sender: "visitor", content: "TechCorp Inc., we have about 50 agents", isInternal: false },
          { sender: "agent",   content: "Hi Emily! For 50 agents, I'd recommend our Enterprise plan with volume discount", isInternal: false },
        ],
      },
      {
        visitorName: "Michael Brown", visitorEmail: "michael@example.com",
        status: 1000 as const, priority: "low" as const,
        channel: "telegram" as const,
        lastMessage: "Issue resolved — bot flow was paused",
        departmentId: supportDept,
        msgs: [
          { sender: "visitor", content: "My bot stopped responding to customers", isInternal: false },
          { sender: "bot",     content: "I'm here to help! Can you tell me which bot is affected?", isInternal: false },
          { sender: "visitor", content: "The welcome bot on our main site", isInternal: false },
          { sender: "agent",   content: "I see the issue — the bot flow was accidentally paused", isInternal: false },
          { sender: "agent",   content: "Re-enabled the bot flow", isInternal: true },
          { sender: "visitor", content: "It's working now, thanks!", isInternal: false },
          { sender: "agent",   content: "Issue resolved — bot flow was paused", isInternal: false },
        ],
      },
    ];

    for (let c = 0; c < convDefs.length; c++) {
      const def = convDefs[c];
      const convId = await ctx.db.insert("conversations", {
        projectId,
        visitorName: def.visitorName,
        visitorEmail: def.visitorEmail,
        status: def.status,
        priority: def.priority,
        channel: def.channel,
        lastMessage: def.lastMessage,
        departmentId: def.departmentId,
        updatedAt: now - Math.floor(Math.random() * 3600000),
        unreadCount: def.status === 100 ? Math.floor(Math.random() * 5) + 1 : 0,
      });

      await ctx.db.insert("contacts", {
        projectId,
        name: def.visitorName,
        email: def.visitorEmail,
        conversationId: convId,
      });

      for (let i = 0; i < def.msgs.length; i++) {
        const m = def.msgs[i];
        await ctx.db.insert("messages", {
          projectId,
          conversationId: convId,
          senderType: m.sender,
          content: m.content,
          type: m.isInternal ? "internal" : "text",
        });
      }
    }

    for (const order of [
      { contactName: "أحمد بن علي",    product: "باقة Pro شهرية",     status: "confirmed" as const, phone: "+213550001111" },
      { contactName: "Fatima Zahra",   product: "Enterprise Plan",     status: "new" as const,       phone: "+212600112233" },
      { contactName: "كريم مرسي",      product: "باقة Starter سنوية", status: "new" as const,       phone: "+213770223344" },
      { contactName: "Sara Benali",    product: "Pro Plan - Annual",   status: "confirmed" as const, phone: "+21361334455"  },
      { contactName: "Nadia Mansouri", product: "Team Plan",           status: "cancelled" as const, phone: "+212698445566" },
      { contactName: "David Thompson", product: "Enterprise Monthly",  status: "confirmed" as const, phone: "+14155551234" },
      { contactName: "Steve Wilson",   product: "Pro Plan - Monthly",  status: "new" as const,       phone: "+14155555678" },
      { contactName: "Emily Chen",     product: "Enterprise Annual",   status: "new" as const,       phone: "+14155559012" },
      { contactName: "Michael Brown",  product: "Starter Plan",        status: "confirmed" as const, phone: "+14155553456" },
    ]) {
      await ctx.db.insert("orders", {
        projectId,
        contactName: order.contactName,
        product: order.product,
        status: order.status,
        phone: order.phone,
        createdAt: now - Math.floor(Math.random() * 86400000),
      });
    }

    return { success: true, conversations: convDefs.length };
  },
});
