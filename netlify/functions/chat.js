import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function handler(event) {

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed"
    };
  }

  try {

    const { sentimento } = JSON.parse(event.body || "{}");

    if (!sentimento) {
      return {
        statusCode: 400,
        body: JSON.stringify({ erro: "Sentimento vazio" })
      };
    }

    if (sentimento.length > 600) {
      return {
        statusCode: 400,
        body: JSON.stringify({ erro: "Texto muito longo" })
      };
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Você é um assistente emocional empático.

Crie uma mensagem acolhedora, humana e reconfortante baseada neste sentimento:

"${sentimento}"

Regras:
- validar a emoção
- trazer conforto
- oferecer reflexão
- terminar com esperança
- até 200 palavras
- português brasileiro
`
        }
      ]
    });

    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        resposta: completion.choices[0].message.content
      })
    };

  } catch (err) {

    return {
      statusCode: 500,
      body: JSON.stringify({ erro: err.message })
    };

  }
}
