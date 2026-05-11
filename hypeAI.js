/**
 * HypeAI.js - Engine de Extração Independente
 * Desenvolvido para rodar em ambientes estáticos (GitHub Pages)
 */

const terminal = document.getElementById('terminal');
const resultsTable = document.getElementById('resultsTable');

// Lógica de Log no Estilo Terminal
function log(msg, color = 'text-zinc-400') {
    const p = document.createElement('p');
    p.className = color;
    p.innerHTML = `> [${new Date().toLocaleTimeString()}] ${msg}`;
    terminal.appendChild(p);
    terminal.scrollTop = terminal.scrollHeight;
}

// O Motor de Mineração
async function startMining() {
    const nicho = document.getElementById('nicho').value;
    const local = document.getElementById('local').value;

    if (!nicho || !local) {
        log('ERRO: Parâmetros de busca ausentes.', 'text-red-500');
        return;
    }

    // Reset de UI
    resultsTable.innerHTML = '';
    log(`Iniciando protocolo de mineração para: ${nicho} em ${local}...`, 'text-green-500');
    document.getElementById('btnStart').classList.add('scanning');

    // Montando a Query "Dork" Avançada (Hardcoded)
    // Buscamos no Instagram e Facebook onde os emails ficam expostos
    const query = encodeURIComponent(`site:instagram.com "${nicho}" "${local}" "@gmail.com" OR "@hotmail.com"`);
    const searchUrl = `https://www.google.com/search?q=${query}`;
    
    // Proxy AllOrigins para burlar o CORS
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(searchUrl)}`;

    try {
        log('Conectando ao túnel de busca via AllOrigins...');
        const response = await fetch(proxyUrl);
        const data = await response.json();
        
        log('Resposta recebida. Decodificando HTML bruto...');
        
        // Usando Regex para capturar e-mails direto do texto bruto do Google
        // Essa é a parte "Hardcoded" onde não usamos API de IA para extrair
        const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
        const rawContent = data.contents;
        
        // Encontrando todos os emails
        const foundEmails = rawContent.match(emailRegex) || [];
        
        // Removendo emails genéricos do próprio Google para limpar a lista
        const filteredEmails = [...new Set(foundEmails)].filter(email => 
            !email.includes('google') && !email.includes('sentry') && !email.includes('schema')
        );

        if (filteredEmails.length > 0) {
            log(`${filteredEmails.length} Leads detectados com sucesso!`, 'text-green-400');
            
            filteredEmails.forEach(email => {
                const row = `
                    <tr class="border-t border-zinc-800 hover:bg-zinc-800 transition-colors">
                        <td class="p-3 text-zinc-500 italic">Google Snippet Scan</td>
                        <td class="p-3 text-green-400 font-bold">${email}</td>
                    </tr>
                `;
                resultsTable.innerHTML += row;
            });
        } else {
            log('Nenhum dado legível encontrado nesta camada. Tente outro nicho.', 'text-yellow-500');
        }

    } catch (error) {
        log(`ERRO CRÍTICO: ${error.message}`, 'text-red-500');
    } finally {
        document.getElementById('btnStart').classList.remove('scanning');
        log('Protocolo finalizado.', 'text-zinc-600');
    }
}
