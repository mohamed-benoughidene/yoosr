# 🤖 Design Studio — Blocks Guide

> Everything you need to know about each block in the bot builder.
> No tech speak, just plain English.

---

## 📨 Reply `[reply]`

**What it does:** Sends a message to the customer — like handing them a note. You type what you want the bot to say, and it says it.

**What the customer sees:** A chat bubble appears with your message. It can include text, buttons they can click, or even images.

**Settings:**
- Message text (supports `{{variables}}` to personalize, e.g. "Hi {{name}}!")
- Buttons (optional — give the customer clickable choices)

---

## 🎲 Random Reply `[reply with variations]`

**What it does:** Same as Reply, but the bot picks a random message from a list you provide — like rolling a dice to choose what to say. This makes the bot feel more human and less robotic.

**What the customer sees:** A normal chat message, but it's different each time — the bot doesn't sound like a broken record.

**Settings:**
- Multiple message variations (the bot randomly picks one each time)

---

## 🙋 Agent Handoff `[hitlHandoff]`

**What it does:** Passes the conversation to a real human agent — like a receptionist transferring your call. The bot steps aside and a person takes over.

**What the customer sees:** A message like "Connecting you with a team member..." and then a real person starts replying.

**Settings:**
- Handoff message (what the bot says before handing off)
- Department (optional — route to a specific team)

---

## 🕐 If Operating Hours `[if_operating_hours]`

**What it does:** Checks if your business is currently open — like looking at the "Open/Closed" sign on a shop door. If open, go one way. If closed, go another.

**What the customer sees:** If it's business hours, they get the normal experience. If it's after hours, the bot can say "We're closed right now" and offer alternatives.

**Settings:**
- Two paths: ✅ Open → one flow | ❌ Closed → another flow

---

## 👥 If Online Agent `[if_online_agent]`

**What it does:** Checks if any human agents are available right now — like peeking into the office to see if someone's at their desk.

**What the customer sees:** If agents are online, they might get transferred. If nobody's available, the bot handles it differently (e.g. "Leave a message").

**Settings:**
- Two paths: ✅ Agent online → one flow | ❌ Nobody available → another flow

---

## 🔀 Condition `[condition]`

**What it does:** Makes a yes-or-no decision based on information — like a fork in the road. "Did the customer say 'pricing'? Go left. Anything else? Go right."

**What the customer sees:** Nothing visible — the bot silently routes the conversation based on what the customer said or what data was collected.

**Settings:**
- Which variable to check (e.g. `gpt_reply`, `user_input`)
- What to compare it to (equals, contains, greater than, etc.)

---

## 💾 Set Attributes `[setAttribute]`

**What it does:** Saves a piece of information for later — like writing a sticky note and putting it on the fridge. Other blocks can read this note later.

**What the customer sees:** Nothing — this happens silently in the background.

**Settings:**
- Variable name (the label on the sticky note)
- Value (what you write on it)

---

## ✋ Capture User Reply `[capture_user_reply]`

**What it does:** Pauses the bot and waits for the customer to type something — like asking a question and waiting for the answer. Whatever they say gets saved.

**What the customer sees:** The bot asks a question (from a Reply block before this one), then waits for them to respond.

**Settings:**
- Save reply to variable (where to store what the customer typed, e.g. `email_address`)

---

## 🔄 Replace Bot `[replace_bot]`

**What it does:** Swaps the current bot for a different one — like passing the baton in a relay race. The new bot picks up where the old one left off, with all the customer's info intact.

**What the customer sees:** The conversation continues smoothly. They don't notice the switch — it just feels like the bot got smarter.

**Settings:**
- Bot slug (the name of the bot to switch to)

---

## 🏢 Change Department `[change_department]`

**What it does:** Moves the conversation to a different team — like being redirected from "Sales" to "Support" when you call a company.

**What the customer sees:** The conversation gets picked up by the right team. No repeated questions — the new team sees everything.

**Settings:**
- Department (pick from a dropdown of your departments)

---

## ⏳ Wait `[wait]`

**What it does:** Pauses the bot for a few seconds — like taking a breath before speaking. Useful for making the bot feel more natural or giving time for something to process.

**What the customer sees:** A small pause before the next message, making the conversation feel more human-paced.

**Settings:**
- Delay in seconds (how long to wait)

---

## 🌐 Web Request `[webRequest]`

**What it does:** Calls an external website or service to get or send data — like the bot making a phone call to another system to look something up.

**What the customer sees:** The bot retrieves real-time information (like order status, weather, or account details) and shares it instantly.

**Settings:**
- URL (the address to call)
- Method (GET to fetch data, POST to send data)

---

## 📚 Ask Knowledge Base `[ask_kb]`

**What it does:** Searches your uploaded documents to find an answer — like a librarian flipping through books to answer your question.

**What the customer sees:** The bot gives a smart, accurate answer based on your company's own documents — not made-up information.

**Settings:**
- Search query (usually what the customer just asked)
- Save answer to variable (where to store the answer)

---

## ✨ AI Task `[aiTask]`

**What it does:** Sends a prompt to an AI brain to analyze, classify, or extract information — like hiring a smart assistant to read something and give you a summary.

**What the customer sees:** The bot understands complex requests, extracts details (like names, emails, intentions), and responds intelligently.

**Settings:**
- System prompt (instructions for the AI)
- User input variable (what to analyze, usually `{{lastUserText}}`)
- Model (default: `mistralai/mistral-7b-instruct`)
- Output variable (where to save the AI's answer)

---

## 🧠 AI Assistant `[ai_assistant]`

**What it does:** Hands the entire conversation over to an AI that can think across multiple messages — like bringing in an expert advisor who reads the whole conversation and takes over.

**What the customer sees:** A deeply intelligent conversation where the AI reasons, asks follow-up questions, and provides expert-level help.

**Settings:**
- System prompt (define the AI's personality and guardrails)
- Model (default: `meta-llama/llama-3.1-8b-instruct`)
- Max turns (how many back-and-forth rounds the AI can do, 1–10)
- Output variable (where to save the AI's final answer)

---

## 💻 Code Action `[code_action]`

**What it does:** Runs a small calculation or logic behind the scenes — like a calculator that can do math with the information collected so far.

**What the customer sees:** Nothing visible — but the bot becomes smarter (e.g. counting how many times a customer asked something).

**Settings:**
- Expression (the calculation or logic to run)
- Save result to variable

---

## 🧹 Clear Transcript `[clear_transcript]`

**What it does:** Wipes the bot's memory clean — like erasing a whiteboard. The bot forgets everything that was saved so far and starts fresh.

**What the customer sees:** A clean slate. The bot won't reference old topics or get confused by previous conversation context.

**Settings:**
- None — just drag it into your flow where you want a fresh start.

---

---

# 🌍 Real World Examples

## Example 1: Customer Asking About Their Order Status

> 💬 "Where is my order?"

```
📨 Reply: "Hi there! I'd be happy to help you track your order."

✋ Capture User Reply: "What's your order number?"
   → saves to {{order_number}}

🌐 Web Request: calls your order system with {{order_number}}
   → saves shipping status to {{order_status}}

🔀 Condition: Is {{order_status}} equal to "delivered"?
   ✅ Yes → 📨 Reply: "Great news! Your order was delivered! 🎉"
   ❌ No  → 📨 Reply: "Your order is currently: {{order_status}}. Hang tight!"
```

**What the customer experiences:** They ask about their order, give their order number, and get an instant, accurate update — no waiting on hold.

---

## Example 2: Customer Asking Outside Business Hours

> 💬 "Can I talk to someone?" (at 11 PM)

```
🕐 If Operating Hours: Is the shop open?
   ✅ Open  → 👥 If Online Agent: Anyone at their desk?
                ✅ Yes → 🙋 Agent Handoff: "Connecting you now!"
                ❌ No  → 📨 Reply: "Our team is busy. Leave a message!"
   
   ❌ Closed → 📨 Reply: "We're closed right now. Our hours are 9 AM – 6 PM."
              ✋ Capture User Reply: "Leave your email and we'll get back to you!"
                 → saves to {{customer_email}}
              📨 Reply: "Thanks! We'll reach out first thing tomorrow. 😊"
```

**What the customer experiences:** Instead of hitting a dead end, they always get a helpful response — whether it's being connected to someone or being told when to expect a reply.

---

## Example 3: Customer Being Handed Off to a Human Agent

> 💬 "I have a billing issue and your bot can't help."

```
✋ Capture User Reply: "Could you describe your billing issue?"
   → saves to {{billing_issue}}

✨ AI Task: "Classify this issue: {{billing_issue}}. 
             Reply with: refund, overcharge, or other."
   → saves classification to {{issue_type}}

🏢 Change Department: Routes to "Billing Support"

🙋 Agent Handoff: "I'm connecting you with our billing team. 
                    They'll have all the details from our conversation!"
```

**What the customer experiences:** They explain their problem once, the AI understands it, and they're seamlessly connected to the right human expert — who already knows what the issue is. No repeating themselves. 🎯

---

> 💡 **Tip:** You can combine any blocks together like building with LEGO® — each block does one simple thing, but together they create powerful, intelligent conversations.
