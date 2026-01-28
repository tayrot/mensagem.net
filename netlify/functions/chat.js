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
Você é um assistente emocional empático.

Baseado neste sentimento do usuário:

"${sentimento}"

Responda neste formato EXATO:

Primeira linha:
"Sinto muito pelo que você está passando."

Segunda linha:
"Uma mensagem para você:"

Terceira linha:
Uma frase curta (máx 25 palavras), profunda, humana e inspiracional.

Regras:
- nunca escreva carta
- nunca use assinatura
- linguagem simples
- tom de esperança
- português brasileiro
- resposta total com no máximo 3 linhas

Exemplo:

Sinto muito pelo que você está passando.
Uma mensagem para você:
Mesmo nas despedidas mais dolorosas, o coração encontra força para recomeçar.
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
