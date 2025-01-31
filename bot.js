process.env.PUPPETEER_SKIP_CHROMIUM_DOWNLOAD = "true";
process.env.PUPPETEER_EXECUTABLE_PATH = "/usr/bin/chromium-browser";


const wppconnect = require('@wppconnect-team/wppconnect');
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});


// 🔹 Configuração da OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY // 🔹 Coloque sua chave aqui
});

// 🔹 Função para obter o primeiro nome do contato
function obterPrimeiroNome(nomeCompleto) {
    return nomeCompleto.split(" ")[0]; // Pega só o primeiro nome
}

// 🔹 Função para processar mensagens e evitar erro "undefined"
async function processarMensagem(message) {
    if (!message.body) {
        console.error("❌ Mensagem sem conteúdo recebida. Ignorando.");
        return null; // Se a mensagem estiver vazia, não processa
    }

    const mensagem = message.body.toLowerCase(); // Corrigido para evitar erro de 'undefined'
    const nomeCliente = obterPrimeiroNome(message.notifyName || "Cliente");

    if (mensagem.includes("torneira de cozinha")) {
        return `Olá, ${nomeCliente}! 😊 Temos torneiras de cozinha gourmet, extensíveis e convencionais. Qual modelo você gostaria?`;
    } else if (mensagem.includes("torneira de banheiro")) {
        return `Olá, ${nomeCliente}! Você prefere torneira alta ou baixa? E qual tipo de acionamento, monocomando ou apenas água fria?`;
    } else if (mensagem.includes("cuba")) {
        return `Olá, ${nomeCliente}! Temos cubas inox e cubas gourmet coloridas (preto, branco e cinza chumbo). Elas ficam lindas com torneiras gourmet da mesma cor!`;
    } else {
        // 🔹 Chama o ChatGPT para responder perguntas gerais
        return await obterRespostaOpenAI(mensagem, nomeCliente);
    }
}

// 🔹 Função para obter resposta do ChatGPT
async function obterRespostaOpenAI(mensagem, nomeCliente) {
    try {
        const respostaAI = await openai.chat.completions.create({
            model: "gpt-4o-mini",
            messages: [
                { role: "system", content: `Você é Ken, assistente virtual da Konnen Metais. Seu tom de voz é educado, amigável e descontraído, mas profissional. Dê respostas curtas e diretas, a menos que o cliente peça informações técnicas detalhadas. Sempre inicie a conversa cumprimentando o cliente pelo primeiro nome.` },
                { role: "user", content: `O cliente ${nomeCliente} perguntou: ${mensagem}` }
            ],
            temperature: 0.7,
            max_tokens: 150
        });

        return respostaAI.choices[0].message.content;
    } catch (error) {
        console.error("Erro ao chamar OpenAI:", error);
        return "Desculpe, estou com dificuldades técnicas no momento. Tente novamente mais tarde! 🙏";
    }
}

// 🔹 Conectar ao WhatsApp e responder mensagens
wppconnect.create().then((client) => {
    console.log("✅ Ken está online no WhatsApp!");

    client.onMessage(async (message) => {
        console.log(`📩 Mensagem recebida: ${message.body || "SEM CONTEÚDO"}`);

        const resposta = await processarMensagem(message);
        if (resposta) {
            await client.sendText(message.from, resposta);
        }
    });
});
