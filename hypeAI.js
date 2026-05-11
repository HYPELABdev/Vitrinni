/**
 * HypeAI.js - Engine de Extração Independente v1.1
 * Método: DuckDuckGo HTML Stealth Scan
 */

const terminal = document.getElementById('terminal');
const resultsTable = document.getElementById('resultsTable');

// Lógica de Log no Estilo Terminal
function log(msg, color = 'text-zinc-400') {
    const p = document.createElement('p');
    p.className = color;
    p.innerHTML = `> [${new Date().toLocaleTimeString()}] ${msg}`;
    terminal.appendChild(p);
    terminal.scrollTop = terminal.scrollHeight; // Auto-scroll
}

async function startMining() {
    const nicho = document.getElementById('nicho').value;
    const local = document.getElementById('local').value;
    const btn = document.getElementById('btnStart');

    if (!nicho || !local) {
        log('ERRO: Defina o nicho e a localização.', 'text-red-500');
        return;
    }

    // Reset de UI e Feedback Visual
    resultsTable.innerHTML = '';
    btn.disabled = true;
    btn.innerHTML = "ESCANEANDO...";
    btn.classList.add('scanning');
    
    log(`Iniciando HypeAI Engine...`, 'text-green-500');
    log(`Alvo: ${nicho} em ${local}`);

    /**
     * ESTRATÉGIA: DuckDuckGo HTML
     * O Google bloqueia o Proxy AllOrigins quase instantaneamente.
     * O DuckDuckGo permite a leitura do HTML sem JavaScript (versão /html/).
     */
    const query = encodeURIComponent(`"${nicho}" "${local}" email contato "@gmail.com"`);
    const targetUrl = `https://duckduckgo.com/html/?q=${query}`;
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(targetUrl)}`;

    try {
        log('Enviando requisição via túnel Proxy...');
        const response = await fetch(proxyUrl);
        
        if (!response.ok) throw new Error('O servidor Proxy não respondeu.');

        const data = await response.json();
        const htmlBruto = data.contents;

        log(`Analisando pacotes recebidos (${htmlBruto.length} bytes)...`);

        // REGEX HARDCODED - Captura e-mails
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const foundEmails = htmlBruto.match(emailRegex) || [];

        // FILTRAGEM - Remove lixo técnico
        const blacklist = ['duckduckgo', 'sentry', 'w3.org', 'apple-touch', 'favicon'];
        const uniqueEmails = [...new Set(foundEmails)].filter(email => {
            return !blacklist.some(word => email.toLowerCase().includes(word));
        });

        if (uniqueEmails.length > 0) {
            log(`SUCESSO: ${uniqueEmails.length} leads identificados!`, 'text-green-400');
            
            uniqueEmails.forEach(email => {
                const row = `
                    <tr class="border-t border-zinc-800 hover:bg-zinc-900 transition-colors">
                        <td class="p-3 text-zinc-500 italic font-mono text-[10px]">DuckScan_Output</td>
                        <td class="p-3 text-green-400 font-bold">${email}</td>
                    </tr>
                `;
                resultsTable.innerHTML += row;
            });
        } else {
            log('FALHA: Nenhum lead encontrado no HTML retornado.', 'text-yellow-500');
            log('DICA: O motor pode ter retornado um desafio (Bot Check). Tente em 1 minuto.', 'text-zinc-500');
            
            // Debug: Se falhar, vamos ver o que o HTML trouxe (primeiros 200 caracteres)
            console.log("HTML Recebido:", htmlBruto.substring(0, 500));
        }

    } catch (error) {
        log(`ERRO DE CONEXÃO: ${error.message}`, 'text-red-500');
        console.error(error);
    } finally {
        btn.disabled = false;
        btn.innerHTML = "INICIAR VARREDURA";
        btn.classList.remove('scanning');
        log('Sessão finalizada.', 'text-zinc-600');
    }
}
