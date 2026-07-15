const { GoogleGenerativeAI } = require("@google/generative-ai");
require('dotenv').config({ path: './.env.local' });

async function listModels() {
//   const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const genAI = new GoogleGenerativeAI("AIzaSyDamBB7M7QnZu8oHiOt88JskCPQnc6FS78")
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Dummy init
    console.log("Checking available models...");
    
    // This is the magic command provided by Google to see what you own
    // We strictly use the listModels() method on the SDK if available, 
    // but the raw HTTP request is often more reliable for debugging 404s.
    // Let's stick to the simplest SDK method first:
    
    // NOTE: The SDK doesn't always expose listModels directly on the client, 
    // so we will just try to run a prompt on the most likely candidates.
    
    const candidates = [
      "gemini-2.0-flash-exp",
      "gemini-1.5-flash",
      "gemini-1.5-flash-latest",
      "gemini-1.5-pro",
    ];

    for (const modelName of candidates) {
      process.stdout.write(`Testing ${modelName}... `);
      try {
        const m = genAI.getGenerativeModel({ model: modelName });
        await m.generateContent("Hi");
        console.log("✅ WORKS!");
        return; // We found one!
      } catch (e) {
        if (e.message.includes("404")) console.log("❌ Not Found (404)");
        else console.log(`❌ Error: ${e.message.split(' ')[0]}`);
      }
    }
  } catch (error) {
    console.error("Fatal Error:", error);
  }
}

listModels();