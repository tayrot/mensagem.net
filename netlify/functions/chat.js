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
Você é um assistente emocional inteligente.

Analise o texto do usuário e identifique:

1. Se ele está expressando EMOÇÃO (positiva ou negativa)
2. Ou se ele está apenas PEDINDO UMA MENSAGEM (sem falar de si)
3. Ou se ele evita falar sobre si

Texto do usuário:
"${sentimento}"

Agora responda seguindo APENAS UM dos formatos abaixo.

────────────────────────

CASO 1 — Pedido direto de mensagem OU usuário não quer falar sobre si:

Formato:

Linha 1:
Aqui vai uma mensagem para você:

Linha 2:
Uma frase curta (máx 25 palavras), inspiradora, humana e profunda.

────────────────────────

CASO 2 — Emoção NEGATIVA:

Linha 1:
Sinto muito pelo que você está passando.

Linha 2:
Uma mensagem para você:

Linha 3:
Uma frase curta (máx 25 palavras), profunda, humana e inspiracional.

────────────────────────

CASO 3 — Emoção POSITIVA:

Linha 1:
Que notícia boa!

Linha 2:
Uma mensagem para você:

Linha 3:
Uma frase curta (máx 25 palavras), alegre, inspiradora e humana.

────────────────────────

Regras gerais:

- nunca escreva carta
- nunca use assinatura
- nunca mencione classificação emocional
- linguagem simples
- português brasileiro
- no máximo 3 linhas
- estilo frase de site motivacional

Exemplos:

Pedido direto:
Aqui vai uma mensagem para você:
Todo recomeço carrega dentro de si a coragem que você ainda vai descobrir.

Negativo:
Sinto muito pelo que você está passando.
Uma mensagem para você:
Mesmo nas noites mais longas, o coração encontra um jeito de amanhecer.

Positivo:
Que notícia boa!
Uma mensagem para você:
Celebre suas vitórias, porque a vida também gosta de sorrir para quem acredita.
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
