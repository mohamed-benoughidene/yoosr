const CONVEX_SITE_URL = "https://blessed-albatross-148.eu-west-1.convex.site";

async function apiPost(endpoint, body) {
    const res = await fetch(`${CONVEX_SITE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
    })
    return res.json()
}

async function apiGet(endpoint, params) {
    const url = new URL(`${CONVEX_SITE_URL}${endpoint}`)
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
    const res = await fetch(url.toString())
    return res.json()
}

async function test() {
  const projectId = "kh7812j360g8e6y1w1hf75rb1s81gdyv"; 
  const visitorId = "test_vis_" + Date.now();
  
  console.log("1. Creating conversation + sending 'hello' as initialMessage...");
  const convResult = await apiPost("/widget/conversations", {
      projectId,
      visitorName: "Test Visitor",
      visitorId,
      initialMessage: "hello"
  });
  console.log("CreateResult: ", convResult);
  const convId = convResult.conversationId;

  console.log("Waiting 4 seconds for bot logic to finish...");
  await new Promise(r => setTimeout(r, 4000));
  
  console.log("3. Sending 'Support'...");
  await apiPost("/widget/messages", {
      conversationId: convId,
      content: "Support",
      visitorId
  });

  console.log("Waiting 4 seconds for bot logic to finish...");
  await new Promise(r => setTimeout(r, 4000));
  
  console.log("Fetching transcript...");
  let messages = await apiGet("/widget/messages", {
      conversationId: convId
  });
  
  messages.forEach(m => {
      console.log(`[${m.senderType}]: ${m.content}`);
  });
}
test().catch(console.error);
