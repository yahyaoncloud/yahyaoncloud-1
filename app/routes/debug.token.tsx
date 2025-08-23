// routes/debug.token.tsx (temporary route for debugging)
import { ActionFunction, json } from "@remix-run/node";

export const action: ActionFunction = async ({ request }) => {
  try {
    const { idToken } = await request.json();
    
    console.log("Received token for debugging:", idToken?.substring(0, 50) + "...");
    
    // Just return success for now without verification
    return json({ 
      received: true, 
      tokenLength: idToken?.length,
      message: "Token received successfully (not verified)" 
    });
    
  } catch (error) {
    console.error("Debug token error:", error);
    return json({ error: "Debug failed" }, { status: 500 });
  }
};