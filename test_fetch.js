const fetch = require('node-fetch'); // wait, built-in node fetch is available in bun/node>=18
async function run() {
    try {
        const response = await fetch("https://www.sendcloud.com/en_uk/how-to-write-a-return-policy/", {
            headers: { "User-Agent": "Mozilla/5.0 (compatible; YoosrBot/1.0)" },
            signal: AbortSignal.timeout(10000)
        });
        const htmlText = await response.text();
        console.log("Status:", response.status);
        console.log("HTML length:", htmlText.length);
        
        // Let's test the regex
        let cleanedText = htmlText.replace(/<[^>]*>/g, " ");
        cleanedText = cleanedText.replace(/\s+/g, " ");
        cleanedText = cleanedText.trim();
        console.log("Cleaned text length:", cleanedText.length);
        console.log("Preview:", cleanedText.slice(0, 100));
    } catch(e) {
        console.error("Error:", e.message);
    }
}
run();
