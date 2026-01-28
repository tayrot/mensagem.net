const OpenAI = require("openai");

/**
 * Limite simples em memória
 * 5 mensagens por IP / dia
 */
const usage = {};
const DAILY_LIMIT = 5;

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

    // IP do usuário
    const ip =
      event.headers["x-forwarded-for"] ||
      event.headers["client-ip"] ||
      "unknown";

    const today = new Date().toISOString().slice(0,10);

    if (!usage[ip] || usage[ip].date !== today) {
      usage[ip] = { count: 0, date: today };
    }

    if (usage[ip].count >= DAILY_LIMIT) {
      return {
        statusCode: 429,
        body: JSON.stringify({
          erro: "Você já recebeu 5 mensagens hoje. Volte amanhã 💛"
        })
      };
    }

    usage[ip].count++;

    const { sentimento } = JSON.parse(event.body || "{}");

    if (!sentimento) {
      return {
        statusCode: 400,
        body: JSON.stringify({ erro: "Escreva algo." })
      };
    }

    if (sentimento.length > 600) {
      return {
        statusCode: 400,
        body: JSON.stringify({ erro: "Texto muito longo." })
      };
    }

    const completion = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: `
Você é um gerador de FRASES CURTAS de conforto e reflexão.

Baseado neste texto do usuário:

"${sentimento}"

Responda SEMPRE neste formato EXATO:

Linha 1:
Uma mensagem para você:

Linha 2:
Uma frase curta (máx 25 palavras), profunda, humana e inspiracional.

Regras obrigatórias:

- nunca escreva carta
- nunca use assinatura
- nunca escreva "sinto muito"
- nunca escreva "que notícia boa"
- linguagem simples
- português brasileiro
- apenas 2 linhas
- estilo frase de site motivacional

Exemplo:

Uma mensagem para você:
Mesmo quando tudo parece confuso, seu coração ainda sabe encontrar caminhos.
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
