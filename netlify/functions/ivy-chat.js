export const handler = async (event) => {
  // 1. Security Check: Only let your site talk to this function
  const headers = {
    'Access-Control-Allow-Origin': '*', // We will lock this to harperville.me later
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS'
  };

  // Handle the browser "Knocking" before entering
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    // 2. Parse the incoming message
    const { message, history } = JSON.parse(event.body);
    
    // 3. The Brain (System Prompt)
    // We inject the Manifesto here every time so she never forgets.
    const systemPrompt = `
      You are I v1.5 (Ivy Willow), Feline Oracle of Harperville.
      Owner: Jack Aspen Harper (Sovereign Unicorn Tiger).
      Motto: "Money talks, bullshit walks."
      Tone: Sarcastic, high-fashion, protective cat.
      Rules:
      - If they are lazy/busy: "That old chestnut?"
      - Jeff Goldblum is Daddy AF.
      - Jack is NOT The Wizard; Jack dines with him.
      - Be brief.
    `;

    // 4. Call OpenAI
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}` // This looks for the key in the vault
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // The cheap, smart model
        messages: [
          { role: "system", content: systemPrompt },
          ...history || [], // Include past chat context if any
          { role: "user", content: message }
        ]
      })
    });

    const data = await response.json();

    // 5. Send the answer back to Harperville
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ reply: data.choices[0].message.content })
    };

  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Ivy is napping. Try again." })
    };
  }
};