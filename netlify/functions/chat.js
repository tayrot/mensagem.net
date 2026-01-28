const OpenAI = require("openai");

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

exports.handler = async function(event) {

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
Você é um gerador de FRASES CURTAS de conforto emocional, estilo citação.

Baseado neste sentimento:

"${sentimento}"

Crie UMA frase curta (máx 25 palavras), profunda e poética.

Regras:
- não escreva carta
- não use "Querido amigo"
- não use assinatura
- formato de frase inspiracional
- linguagem simples
- tom de esperança
- português brasileiro

Exemplo:

"Aqueles que amamos nunca morrem, apenas partem antes de nós."
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
};
