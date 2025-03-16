//O principal objetivo deste desafio é fortalecer suas habilidades em lógica de programação. Aqui você deverá desenvolver a lógica para resolver o problema.

// Array para armazenar os nomes dos amigos
let amigos = [];
// Array para rastrear amigos já sorteados
let amigosSorteados = [];
// Array para histórico de sorteios
let historicoSorteios = [];
// Configuração de som
let somAtivado = true;
// Array para armazenar sorteios com senha
let sorteiosSenha = [];
// Array para armazenar tentativas de acesso
let tentativasAcesso = [];

/**
 * Chave para criptografar os dados no localStorage
 * Na prática, isso deveria ser armazenado de forma segura
 */
const ENCRYPTION_KEY = "amigoSecreto_2023_chave_segura";

/**
 * Criptografa dados antes de salvar no localStorage
 * Implementa uma criptografia simples usando XOR com uma chave e codificação Base64
 * para proteger os dados armazenados no localStorage.
 * 
 * @param {object} dados - Dados a serem criptografados
 * @returns {string} - Dados criptografados em formato Base64
 */
function criptografarDados(dados) {
    try {
        // Converte o objeto para string JSON
        const dadosString = JSON.stringify(dados);
        
        // Implementação simples de XOR para criptografia
        let resultado = '';
        for (let i = 0; i < dadosString.length; i++) {
            // A cada caractere, aplica XOR com o caractere correspondente da chave
            const charCode = dadosString.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
            resultado += String.fromCharCode(charCode);
        }
        
        // Converte para Base64 para armazenamento seguro
        return btoa(resultado);
    } catch (e) {
        console.error("Erro ao criptografar dados:", e);
        return JSON.stringify(dados); // Fallback em caso de erro
    }
}

/**
 * Descriptografa dados do localStorage
 * Reverte o processo de criptografia, decodificando de Base64 e aplicando XOR
 * com a mesma chave para recuperar os dados originais.
 * 
 * @param {string} dadosCriptografados - Dados criptografados
 * @returns {object} - Dados descriptografados como objeto JavaScript
 */
function descriptografarDados(dadosCriptografados) {
    try {
        // Decodifica de Base64
        const dadosEncriptados = atob(dadosCriptografados);
        
        // Reverte o XOR com a mesma chave
        let resultado = '';
        for (let i = 0; i < dadosEncriptados.length; i++) {
            // Aplica XOR com o mesmo padrão usado na criptografia
            const charCode = dadosEncriptados.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
            resultado += String.fromCharCode(charCode);
        }
        
        // Parse do JSON para recuperar o objeto
        return JSON.parse(resultado);
    } catch (e) {
        console.error("Erro ao descriptografar dados:", e);
        return JSON.parse(dadosCriptografados); // Fallback em caso de erro
    }
}

// Carrega dados salvos no localStorage, se existirem
function carregarDadosSalvos() {
    try {
        const dadosCriptografados = localStorage.getItem('amigoSecreto');
        if (dadosCriptografados) {
            // Descriptografa os dados
            const dados = descriptografarDados(dadosCriptografados);
            
            // Verificação de integridade de dados
            if (!dados || typeof dados !== 'object') {
                throw new Error("Dados corrompidos");
            }
            
            amigos = Array.isArray(dados.amigos) ? dados.amigos : [];
            amigosSorteados = Array.isArray(dados.amigosSorteados) ? dados.amigosSorteados : [];
            historicoSorteios = Array.isArray(dados.historicoSorteios) ? dados.historicoSorteios : [];
            sorteiosSenha = Array.isArray(dados.sorteiosSenha) ? dados.sorteiosSenha : [];
            
            // Validação cruzada - verifica consistência entre os arrays
            const sorteadosValidos = amigosSorteados.every(sorteado => amigos.includes(sorteado));
            if (!sorteadosValidos) {
                console.warn("Inconsistência detectada entre amigos sorteados e lista de amigos");
                amigosSorteados = amigosSorteados.filter(sorteado => amigos.includes(sorteado));
            }
            
            atualizarListaAmigos();
            atualizarHistorico();
        }
    } catch (e) {
        console.error("Erro crítico ao carregar dados:", e);
        mostrarNotificacao('Erro ao carregar dados salvos. Aplicação resetada.', 'erro');
        // Auto-correção - reseta tudo em caso de erro grave
        resetarLocalStorage();
    }
}

/**
 * Reseta apenas o localStorage em caso de erro
 */
function resetarLocalStorage() {
    localStorage.removeItem('amigoSecreto');
    amigos = [];
    amigosSorteados = [];
    historicoSorteios = [];
    sorteiosSenha = [];
    tentativasAcesso = [];
    atualizarListaAmigos();
}

// Salva dados no localStorage
function salvarDados() {
    const dados = {
        amigos,
        amigosSorteados,
        historicoSorteios,
        sorteiosSenha
    };
    
    // Criptografa antes de salvar
    const dadosCriptografados = criptografarDados(dados);
    localStorage.setItem('amigoSecreto', dadosCriptografados);
}

/**
 * Sanitiza strings para evitar injeção de código
 * @param {string} str - String a ser sanitizada
 * @returns {string} - String sanitizada
 */
function sanitizarString(str) {
    if (!str) return '';
    
    // Remove potenciais tags HTML e script
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

/**
 * Adiciona um amigo à lista
 */
function adicionarAmigo() {
    // Captura e sanitiza o valor do campo de entrada
    const inputAmigo = document.getElementById('amigo');
    const nomeRaw = inputAmigo.value.trim();
    const nome = sanitizarString(nomeRaw);
    
    // Valida a entrada
    if (nome === '') {
        mostrarNotificacao('Por favor, insira um nome.', 'erro');
        return;
    }
    
    // Verifica se o nome já existe na lista (case insensitive)
    if (amigos.some(amigo => amigo.toLowerCase() === nome.toLowerCase())) {
        mostrarNotificacao(`O nome "${nome}" já está na lista!`, 'aviso');
        inputAmigo.value = '';
        inputAmigo.focus();
        return;
    }
    
    // Adiciona o nome ao array
    amigos.push(nome);
    
    // Limpa o campo de entrada
    inputAmigo.value = '';
    
    // Atualiza a lista de amigos na interface
    atualizarListaAmigos();
    
    // Foca novamente no campo de entrada para facilitar adição de mais nomes
    inputAmigo.focus();
    
    // Reproduz som e mostra notificação
    tocarSom('adicionar');
    mostrarNotificacao(`${nome} foi adicionado à lista!`, 'sucesso');
    
    // Salva os dados
    salvarDados();
}

/**
 * Atualiza a lista de amigos na interface
 * Esta função recria toda a lista de amigos na interface do usuário,
 * adicionando os botões de remoção necessários para cada item.
 * Os botões de remoção usam delegação de eventos através do document.addEventListener
 * ao invés de manipuladores onclick diretos, para melhor performance e manutenção.
 */
function atualizarListaAmigos() {
    const lista = document.getElementById('listaAmigos');
    
    // Limpa a lista atual
    lista.innerHTML = '';
    
    // Verifica se a lista está vazia
    if (amigos.length === 0) {
        lista.innerHTML = '<li class="lista-vazia">Ainda não há nomes na lista</li>';
        return;
    }
    
    // Adiciona cada amigo como um item da lista
    amigos.forEach((amigo, i) => {
        const itemLista = document.createElement('li');
        itemLista.className = 'amigo-item';
        itemLista.dataset.indice = i; // Adiciona o índice como atributo data
        
        // Cria o texto principal com o nome do amigo
        const spanNome = document.createElement('span');
        spanNome.textContent = amigo;
        itemLista.appendChild(spanNome);
        
        // Cria o container para os botões
        const botoesContainer = document.createElement('div');
        botoesContainer.className = 'botoes-item';
        
        // Adiciona um botão de remover
        const botaoRemover = document.createElement('button');
        botaoRemover.textContent = '❌';
        botaoRemover.className = 'botao-remover';
        botaoRemover.title = `Remover ${amigo} da lista`;
        
        botoesContainer.appendChild(botaoRemover);
        
        // Adiciona o container de botões ao item da lista
        itemLista.appendChild(botoesContainer);
        
        // Adiciona efeitos de entrada
        itemLista.style.opacity = '0';
        itemLista.style.transform = 'translateY(20px)';
        
        lista.appendChild(itemLista);
        
        // Anima a entrada do item
        setTimeout(() => {
            itemLista.style.transition = 'opacity 0.5s, transform 0.5s';
            itemLista.style.opacity = '1';
            itemLista.style.transform = 'translateY(0)';
        }, i * 50);
    });
    
    // Atualiza o contador de amigos
    atualizarContador();
}

/**
 * Atualiza o contador de amigos
 */
function atualizarContador() {
    const contadorElemento = document.getElementById('contador') || criarContador();
    contadorElemento.textContent = `${amigos.length} amigo(s) na lista • ${amigosSorteados.length} sorteado(s)`;
}

/**
 * Cria o elemento contador se ele não existir
 */
function criarContador() {
    const inputSection = document.querySelector('.input-section');
    const listaAmigos = document.getElementById('listaAmigos');
    
    const contador = document.createElement('div');
    contador.id = 'contador';
    contador.className = 'contador';
    
    inputSection.insertBefore(contador, listaAmigos);
    return contador;
}

/**
 * Remove um amigo específico da lista
 * @param {number} indice - O índice do amigo a ser removido
 */
function removerAmigo(indice) {
    if (indice >= 0 && indice < amigos.length) {
        // Obtém o nome ANTES de fazer qualquer operação
        const nomeRemovido = amigos[indice];
        
        // Verifica se o amigo já fez um sorteio
        const jaFezSorteio = sorteiosSenha.some(s => 
            s.sorteador && s.sorteador.toLowerCase() === nomeRemovido.toLowerCase()
        );
        
        if (jaFezSorteio) {
            mostrarNotificacao(`Não é possível remover ${nomeRemovido} porque já realizou um sorteio.`, 'erro');
            return;
        }
        
        // Verifica se o amigo já foi sorteado
        const foiSorteado = sorteiosSenha.some(s => 
            s.sorteado && s.sorteado.toLowerCase() === nomeRemovido.toLowerCase()
        );
        
        if (foiSorteado) {
            mostrarNotificacao(`Não é possível remover ${nomeRemovido} porque já foi sorteado por alguém.`, 'erro');
            return;
        }
        
        // Remove o nome do array principal
        amigos.splice(indice, 1);
        
        // Remove o nome do array de sorteados, se estiver lá
        const indiceSorteado = amigosSorteados.indexOf(nomeRemovido);
        if (indiceSorteado !== -1) {
            amigosSorteados.splice(indiceSorteado, 1);
        }
        
        // Reproduz som e exibe mensagem
        tocarSom('remover');
        mostrarNotificacao(`${nomeRemovido} foi removido(a) da lista`, 'aviso');
        
        // IMPORTANTE: Salva os dados ANTES de atualizar a interface
        salvarDados();
        
        // IMPORTANTE: Atualiza a interface explicitamente
        setTimeout(() => {
            atualizarListaAmigos();
            sincronizarInterfaceComDados();
        }, 10);
    }
}

/**
 * Limpa toda a lista de amigos
 */
function limparLista() {
    // Verifica se há amigos na lista
    if (amigos.length === 0) {
        mostrarNotificacao('A lista já está vazia.', 'info');
        return;
    }
    
    // Verifica se já existem sorteios realizados
    if (sorteiosSenha.length > 0) {
        if (confirm('Existem sorteios já realizados. Deseja apagar TUDO (lista de amigos e sorteios)?')) {
            return resetarAplicacao(); // Chama a função de reset total
        }
        return;
    }
    
    // Confirmação para limpar a lista
    if (confirm('Tem certeza que deseja limpar toda a lista de amigos?')) {
        amigos = [];
        amigosSorteados = [];
        // Limpa o resultado na interface
        document.getElementById('resultado').innerHTML = '';
        tocarSom('limpar');
        mostrarNotificacao('Lista limpa com sucesso!', 'sucesso');
        
        // Atualiza a interface
        atualizarListaAmigos();
        
        // Salva os dados
        salvarDados();
    }
}

/**
 * Mostra uma modal para entrada de dados
 * @param {string} titulo - Título da modal
 * @param {string} mensagem - Mensagem para o usuário
 * @param {string} tipo - Tipo de entrada (text, password)
 * @param {function} callback - Função a ser chamada com o valor inserido
 */
function mostrarModalInput(titulo, mensagem, tipo = 'text', callback) {
    // Remove qualquer modal existente
    const modalAnterior = document.querySelector('.modal-input');
    if (modalAnterior) modalAnterior.remove();

    // Cria a modal
    const modal = document.createElement('div');
    modal.className = 'modal-input';

    // Conteúdo da modal
    modal.innerHTML = `
        <div class="modal-content modal-pequena">
            <span class="close-button">&times;</span>
            <h3>${titulo}</h3>
            <div class="modal-body">
                <p>${mensagem}</p>
                <div class="input-group">
                    <input type="${tipo}" id="modal-input-valor" class="input-modal" ${tipo === 'password' ? 'autocomplete="new-password"' : ''}>
                </div>
                <div class="button-group">
                    <button class="button-cancelar">Cancelar</button>
                    <button class="button-confirmar">Confirmar</button>
                </div>
            </div>
        </div>
    `;

    // Adiciona a modal ao corpo do documento
    document.body.appendChild(modal);

    // Foca no input
    const input = modal.querySelector('#modal-input-valor');
    setTimeout(() => input.focus(), 100);

    // Adiciona evento para confirmar ao pressionar Enter
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            confirmar();
        }
    });

    // Função para confirmar
    const confirmar = () => {
        const valor = input.value.trim();
        fecharModal();
        callback(valor);
    };

    // Função para fechar modal
    const fecharModal = () => {
        modal.classList.add('fechando');
        setTimeout(() => modal.remove(), 300);
    };

    // Adiciona eventos
    modal.querySelector('.close-button').addEventListener('click', () => callback(null));
    modal.querySelector('.button-cancelar').addEventListener('click', () => callback(null));
    modal.querySelector('.button-confirmar').addEventListener('click', confirmar);

    // Fechar ao clicar fora
    modal.addEventListener('click', (e) => {
        if (e.target === modal) callback(null);
    });

    // Anima a entrada da modal
    setTimeout(() => modal.classList.add('ativa'), 10);
}

/**
 * Versão modificada e corrigida do sortearAmigo
 */
function sortearAmigo() {
    // Verifica se há amigos suficientes na lista
    if (amigos.length < 2) {
        mostrarNotificacao('É necessário ter pelo menos 2 amigos para realizar o sorteio.', 'erro');
        return;
    }
    
    // Primeiro modal - nome do sorteador
    mostrarModalInput('Iniciar Sorteio', 'Digite seu nome para iniciar o sorteio:', 'text', function(nomeSorteador) {
        if (!nomeSorteador) {
            mostrarNotificacao('Sorteio cancelado.', 'aviso');
            return;
        }
        
        // Verifica se o sorteador está na lista
        if (!amigos.some(amigo => amigo.toLowerCase() === nomeSorteador.toLowerCase())) {
            mostrarNotificacao('Você precisa estar na lista de amigos para participar do sorteio.', 'erro');
            return;
        }
        
        // Verifica se todos os amigos já foram sorteados
        if (amigosSorteados.length >= amigos.length) {
            if (confirm('Todos os amigos já foram sorteados. Deseja reiniciar o sorteio?')) {
                amigosSorteados = [];
                historicoSorteios = [];
                sorteiosSenha = [];
                salvarDados();
            } else {
                return;
            }
        }
        
        // Verifica se o sorteador já fez seu sorteio
        const jaFezSorteio = sorteiosSenha.some(s => 
            s.sorteador.toLowerCase() === nomeSorteador.toLowerCase()
        );
        
        if (jaFezSorteio) {
            mostrarNotificacao(`${nomeSorteador}, você já realizou seu sorteio!`, 'aviso');
            return;
        }
        
        // Reproduz som de sorteio
        tocarSom('sortear-inicio');
        
        // Filtra amigos disponíveis
        const amigosDisponiveis = amigos.filter(amigo => 
            amigo.toLowerCase() !== nomeSorteador.toLowerCase() && 
            !amigosSorteados.includes(amigo)
        );
        
        // Se não houver amigos disponíveis para sorteio
        if (amigosDisponiveis.length === 0) {
            mostrarNotificacao('Não há mais amigos disponíveis para sorteio.', 'erro');
            return;
        }
        
        // Verificação de possibilidade de deadlock no sorteio
        if (verificarPossibilidadeDeDeadlock()) {
            return;
        }
        
        // Sorteia um amigo aleatoriamente dentre os disponíveis
        const indiceAleatorio = Math.floor(Math.random() * amigosDisponiveis.length);
        const amigoSorteado = amigosDisponiveis[indiceAleatorio];
        
        // Adiciona o amigo sorteado à lista de sorteados
        amigosSorteados.push(amigoSorteado);
        
        // Exibe o resultado com animação
        const resultado = document.getElementById('resultado');
        resultado.innerHTML = '<li class="sorteando">Sorteando<span class="dots">...</span></li>';
        
        // CORREÇÃO: Armazena a referência do intervalo para poder interrompê-lo depois
        let intervalSorteio = null;
        let tempoSorteio = 0;

        // Limpe qualquer intervalo existente (para evitar duplicação)
        if (intervalSorteio) clearInterval(intervalSorteio);

        // Inicia o intervalo de forma segura
        intervalSorteio = setInterval(() => {
            // Usa ícones diferentes para simular um sorteio sem revelar nomes
            const icones = ["🎁", "🎲", "🎯", "🎪", "🎨", "🎭", "🎰"];
            const iconeAleatorio = icones[Math.floor(Math.random() * icones.length)];
            
            // Alterna entre diferentes emojis para dar sensação de sorteio
            resultado.innerHTML = `<li class="sorteando"><span class="icone-girando">${iconeAleatorio}</span> Sorteando...</li>`;
            tempoSorteio += 100;
            
            if (tempoSorteio > 1500) {
                // IMPORTANTE: Limpa o intervalo para não continuar rodando em segundo plano
                clearInterval(intervalSorteio);
                intervalSorteio = null;
                
                // IMPORTANTE: Certifique-se de que não há múltiplas chamadas simultâneas
                intervalSorteio = null;
                
                // Aguarda um tempo para solicitar a senha
                setTimeout(() => {
                    // IMPORTANTE: Gera o ID apenas uma vez e usa o mesmo ID em todo o processo
                    const sorteioId = crypto.randomUUID ? 
                        crypto.randomUUID() : 
                        `id_${Date.now().toString(16)}_${Math.random().toString(16).substring(2)}`;
                    
                    // Pede a senha usando modal
                    mostrarModalInput(`Criar Senha - ${nomeSorteador}`, 'Crie uma senha para acessar seu amigo secreto posteriormente:', 'password', async function(senha) {
                        if (!senha) {
                            mostrarNotificacao('É necessário criar uma senha para visualizar seu amigo secreto.', 'aviso');
                            // Remove o amigo da lista de sorteados se cancelar
                            amigosSorteados.pop();
                            return;
                        }
                        
                        // Valida a força da senha
                        const validacao = validarSenha(senha);
                        if (!validacao.valida) {
                            mostrarNotificacao(validacao.mensagem, 'aviso');
                            // Remove o amigo da lista de sorteados em caso de erro
                            amigosSorteados.pop();
                            return;
                        }
                        
                        try {
                            // Adiciona ao histórico normal
                            const dataHora = new Date();
                            const dataStr = dataHora.toLocaleDateString();
                            const horaStr = dataHora.toLocaleTimeString();
                            
                            historicoSorteios.push({
                                nome: amigoSorteado,
                                sorteador: nomeSorteador,
                                data: dataStr,
                                hora: horaStr
                            });
                            
                            // Gera um salt e aplica hash na senha
                            const salt = gerarSalt();
                            const senhaHashed = await hashSenha(senha, salt);
                            
                            // Adiciona ao histórico protegido por senha
                            const novoSorteio = {
                                id: sorteioId,
                                sorteador: nomeSorteador,
                                sorteado: amigoSorteado,
                                senhaHash: senhaHashed,
                                salt: salt,
                                data: dataStr,
                                hora: horaStr
                            };
                            
                            // Adiciona ao array global
                            sorteiosSenha.push(novoSorteio);
                            
                            // IMPORTANTE: Salva os dados ANTES de mostrar a modal
                            salvarDados();
                            
                            // CORREÇÃO: Aguarda um pequeno tempo para garantir que os dados foram salvos
                            setTimeout(() => {
                                try {
                                    // Mostra imediatamente o amigo secreto
                                    mostrarModalAmigoSecreto(novoSorteio);
                                    
                                    // Atualiza a interface
                                    resultado.innerHTML = `
                                        <li class="sorteado">
                                            🎉 O sorteio foi realizado com sucesso! 🎉
                                            <div class="contador-sorteio">
                                                (${amigosSorteados.length}/${amigos.length} sorteados)
                                            </div>
                                        </li>
                                    `;
                                    
                                    // CORREÇÃO: Garante que todos os efeitos ocorram
                                    tocarSom('sortear-fim');
                                    setTimeout(() => {
                                        criarConfete();
                                        atualizarListaAmigos();
                                        atualizarHistorico();
                                        sincronizarInterfaceComDados();
                                    }, 100);
                                } catch (err) {
                                    console.error("Erro ao mostrar resultado:", err);
                                    mostrarNotificacao("Erro ao exibir resultado. Recarregue a página.", "erro");
                                }
                            }, 100);
                        } catch (error) {
                            console.error("Erro ao processar o sorteio:", error);
                            mostrarNotificacao("Ocorreu um erro ao processar o sorteio. Tente novamente.", "erro");
                            // CORREÇÃO: Remove o amigo da lista de sorteados em caso de erro
                            amigosSorteados.pop();
                        }
                    });
                }, 500); // Pequeno intervalo para garantir que a animação seja vista
            }
        }, 120);
    });
}

/**
 * Verificação de possibilidade de deadlock no sorteio
 * Esta função detecta uma situação de "deadlock" onde a última pessoa só poderia 
 * sortear a si mesma, o que não é permitido nas regras do amigo secreto.
 * Quando detectado, desfaz o último sorteio para permitir uma nova configuração.
 * @returns {boolean} - True se um deadlock foi detectado e corrigido
 */
function verificarPossibilidadeDeDeadlock() {
    // Identifica participantes que ainda não sortearam
    const participantesRestantes = amigos.filter(amigo => 
        !sorteiosSenha.some(s => s.sorteador === amigo)
    );
    
    // Identifica amigos que ainda não foram sorteados
    const amigosSorteaveis = amigos.filter(amigo => 
        !amigosSorteados.includes(amigo)
    );
    
    // Condição de deadlock: só resta uma pessoa para sortear e ela só pode tirar a si mesma
    if (participantesRestantes.length === 1 && 
        amigosSorteaveis.length === 1 && 
        participantesRestantes[0] === amigosSorteaveis[0]) {

        if (sorteiosSenha.length > 0) {
            // Desfaz o último sorteio para permitir novas configurações
            sorteiosSenha.pop();
            amigosSorteados.pop();
            historicoSorteios.pop();
            
            mostrarNotificacao("Sorteio reorganizado para evitar situação impossível", "info");
            return true;
        }
    }
    
    return false;
}

/**
 * Versão modificada do verificarSenhaSorteio que usa modal em vez de prompt
 */
function verificarSenhaSorteioModal(sorteioId) {
    // Encontra o sorteio pelo ID
    const sorteio = sorteiosSenha.find(s => s.id === sorteioId);
    
    if (!sorteio) {
        mostrarNotificacao('Sorteio não encontrado.', 'erro');
        return;
    }
    
    // Verifica se o acesso está bloqueado
    if (verificarBloqueio(sorteioId)) {
        return;
    }
    
    // Pede a senha usando modal em vez de prompt
    mostrarModalInput(`Verificar Senha - ${sorteio.sorteador}`, 'Digite sua senha para visualizar seu amigo secreto:', 'password', async function(senhaDigitada) {
        if (!senhaDigitada) {
            mostrarNotificacao('Verificação cancelada.', 'info');
            return;
        }
        
        try {
            // Gera hash da senha digitada com o mesmo salt armazenado
            const senhaHash = await hashSenha(senhaDigitada, sorteio.salt);
            
            // Compara os hashes em vez das senhas em texto puro
            if (senhaHash === sorteio.senhaHash) {
                // Exibe uma modal com o amigo secreto
                mostrarModalAmigoSecreto(sorteio);
            } else {
                // Implementação de contador de tentativas
                incrementarTentativasIncorretas(sorteio.id);
                mostrarNotificacao('Senha incorreta!', 'erro');
            }
        } catch (error) {
            console.error("Erro ao verificar senha:", error);
            mostrarNotificacao("Erro ao verificar senha. Tente novamente.", "erro");
        }
    });
}

function ajustarResponsividade() {
    const larguraTela = window.innerWidth;
    const alturaTela = window.innerHeight;
    const orientacao = larguraTela > alturaTela ? 'landscape' : 'portrait';
    
    // Ajustar tamanho das notificações
    const notificacoes = document.querySelector('#notificacoes-container');
    if (notificacoes) {
        notificacoes.style.maxWidth = larguraTela < 768 ? '90%' : '500px';
    }
    
    // Ajustar tamanho dos modais
    const modais = document.querySelectorAll('.modal-content');
    modais.forEach(modal => {
        if (larguraTela < 480) {
            modal.style.width = '95%';
            modal.style.padding = '15px';
        } else {
            modal.style.width = '90%';
            modal.style.maxWidth = '500px';
            modal.style.padding = '30px';
        }
    });
    
    // Ajustar layout para orientação paisagem em dispositivos pequenos
    const mainContent = document.querySelector('.main-content');
    const headerBanner = document.querySelector('.header-banner');
    const inputSection = document.querySelector('.input-section');
    
    if (alturaTela < 500 && orientacao === 'landscape') {
        mainContent.style.flexDirection = 'row';
        headerBanner.style.flex = '0 0 30%';
        inputSection.style.flex = '0 0 70%';
        inputSection.style.borderRadius = '40px 0 0 0';
    } else {
        mainContent.style.flexDirection = 'column';
        headerBanner.style.flex = '1';
        inputSection.style.flex = '2';
        inputSection.style.borderRadius = larguraTela < 768 ? '30px 30px 0 0' : '64px 64px 0 0';
    }
}

window.addEventListener('resize', ajustarResponsividade);
window.addEventListener('orientationchange', ajustarResponsividade);

const originalLoadEvent = window.onload;
window.onload = function() {
    if (originalLoadEvent) {
        originalLoadEvent();
    }

    ajustarResponsividade();
    
    // Suporte a Touch para botões (aumenta o tamanho)
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) {
        document.querySelectorAll('button').forEach(button => {
            button.style.padding = '12px 20px';
        });
    }
};

/**
 * Mostra a modal com o amigo secreto
 */
function mostrarModalAmigoSecreto(sorteio) {
        console.log("Mostrando modal com sorteio:", sorteio); // DEBUG
    
    try {
        // Verificação robusta dos dados do sorteio
        if (!sorteio) {
            mostrarNotificacao("Dados do sorteio inválidos.", "erro");
            return;
        }
        
        if (!sorteio.sorteador || !sorteio.sorteado) {
            mostrarNotificacao("Dados do sorteio incompletos.", "erro");
            console.error("Dados inválidos:", sorteio);
            return;
        }
        
        // Remove qualquer modal existente
        const modalExistente = document.querySelector('.modal-amigo-secreto');
        if (modalExistente) {
            modalExistente.remove();
        }
        
        // Cria a modal
        const modal = document.createElement('div');
        modal.className = 'modal-amigo-secreto';
        
        // Conteúdo da modal
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-button">&times;</span>
                <h3>Seu Amigo Secreto</h3>
                <div class="amigo-secreto-info">
                    <p class="sorteador-info">Você: ${sorteio.sorteador}</p>
                    <p class="amigo-secreto-nome">🎁 Deverá presentear: ${sorteio.sorteado} 🎁</p>
                    <p class="amigo-secreto-data">Sorteado em ${sorteio.data || 'data desconhecida'} às ${sorteio.hora || 'hora desconhecida'}</p>
                </div>
                <div class="modal-footer">
                    <button class="button-fechar">Fechar</button>
                </div>
            </div>
        `;
        
        // Adiciona a modal ao corpo do documento
        document.body.appendChild(modal);
        
        // Efeito de confete ao mostrar o amigo secreto
        setTimeout(() => {
            criarConfete();
            tocarSom('sortear-fim');
        }, 100);
        
        // Fecha a modal quando clicar no botão fechar ou no X
        const fecharModal = () => {
            modal.classList.add('fechando');
            setTimeout(() => {
                modal.remove();
            }, 300);
        };
        
        modal.querySelector('.close-button').addEventListener('click', fecharModal);
        modal.querySelector('.button-fechar').addEventListener('click', fecharModal);
        
        // Fecha a modal quando clicar fora dela
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                fecharModal();
            }
        });
        
        // Anima a entrada da modal
        setTimeout(() => {
            modal.classList.add('ativa');
        }, 10);
    } catch (err) {
        console.error("Erro ao mostrar modal do amigo secreto:", err);
        mostrarNotificacao("Erro ao exibir seu amigo secreto. Por favor, tente novamente.", "erro");
    }

    setTimeout(() => {
        ajustarResponsividade();
    }, 100);
}

/**
 * Mostra a modal com o amigo secreto e a senha gerada
 */
function mostrarModalAmigoSecretoComSenha(sorteio, senha) {
    try {
        // Verificação robusta dos dados do sorteio
        if (!sorteio) {
            mostrarNotificacao("Dados do sorteio inválidos.", "erro");
            return;
        }
        
        if (!sorteio.sorteador || !sorteio.sorteado) {
            mostrarNotificacao("Dados do sorteio incompletos.", "erro");
            console.error("Dados inválidos:", sorteio);
            return;
        }
        
        // Remove qualquer modal existente
        const modalExistente = document.querySelector('.modal-amigo-secreto');
        if (modalExistente) {
            modalExistente.remove();
        }
        
        // Cria a modal
        const modal = document.createElement('div');
        modal.className = 'modal-amigo-secreto';
        
        // Conteúdo da modal com a senha
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-button">&times;</span>
                <h3>Seu Amigo Secreto</h3>
                <div class="amigo-secreto-info">
                    <p class="sorteador-info">Você: ${sorteio.sorteador}</p>
                    <p class="amigo-secreto-nome">🎁 Deverá presentear: ${sorteio.sorteado} 🎁</p>
                    <p class="amigo-secreto-data">Sorteado em ${sorteio.data || 'data desconhecida'} às ${sorteio.hora || 'hora desconhecida'}</p>
                </div>
                <div class="senha-container" style="margin-top: 15px; padding: 10px; background-color: #f0f0f0; border-radius: 8px;">
                    <p style="font-weight: bold; margin-bottom: 5px;">Sua senha para consultas futuras:</p>
                    <p style="font-family: monospace; font-size: 18px; padding: 8px; background-color: #fff; border-radius: 4px;">${senha}</p>
                    <p style="color: #666; font-size: 12px; margin-top: 5px;">Guarde esta senha! Você precisará dela para consultar seu amigo secreto novamente.</p>
                </div>
                <div class="modal-footer">
                    <button class="button-fechar">Fechar</button>
                </div>
            </div>
        `;
        
        // Adiciona a modal ao corpo do documento
        document.body.appendChild(modal);
        
        // Efeito de confete ao mostrar o amigo secreto
        setTimeout(() => {
            criarConfete();
            tocarSom('sortear-fim');
        }, 100);
        
        // Fecha a modal quando clicar no botão fechar ou no X
        const fecharModal = () => {
            modal.classList.add('fechando');
            setTimeout(() => {
                modal.remove();
            }, 300);
        };
        
        modal.querySelector('.close-button').addEventListener('click', fecharModal);
        modal.querySelector('.button-fechar').addEventListener('click', fecharModal);
        
        // Fecha a modal quando clicar fora dela
        modal.addEventListener('click', function(event) {
            if (event.target === modal) {
                fecharModal();
            }
        });
        
        // Anima a entrada da modal
        setTimeout(() => {
            modal.classList.add('ativa');
        }, 10);
    } catch (err) {
        console.error("Erro ao mostrar modal do amigo secreto:", err);
        mostrarNotificacao("Erro ao exibir seu amigo secreto. Por favor, tente novamente.", "erro");
    }
}

/**
 * Exibe a tela de histórico de sorteios com verificação de senha
 */
function mostrarHistoricoSorteios() {
    if (sorteiosSenha.length === 0) {
        mostrarNotificacao('Ainda não há sorteios registrados.', 'info');
        return;
    }
    
    // Remove qualquer modal existente
    const modalExistente = document.querySelector('.modal-historico');
    if (modalExistente) {
        modalExistente.remove();
    }
    
    // Cria a modal
    const modal = document.createElement('div');
    modal.className = 'modal-historico';
    
    // Conteúdo da modal
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-button">&times;</span>
            <h3>Histórico de Sorteios</h3>
            <div class="historico-form">
                <div class="input-group">
                    <label for="nome-sorteador">Seu nome:</label>
                    <input type="text" id="nome-sorteador" placeholder="Seu nome">
                </div>
                <div class="input-group">
                    <label for="senha-sorteio">Sua senha:</label>
                    <input type="password" id="senha-sorteio" placeholder="Senha do sorteio">
                </div>
                <button class="button-buscar-sorteio">Buscar</button>
            </div>
            <div class="historico-resultados"></div>
            <div class="modal-footer">
                <button class="button-fechar">Fechar</button>
            </div>
        </div>
    `;
    
    // Adiciona a modal ao corpo do documento
    document.body.appendChild(modal);
    
    // Fecha a modal quando clicar no botão fechar ou no X
    const fecharModal = () => {
        modal.classList.add('fechando');
        setTimeout(() => {
            modal.remove();
        }, 300);
    };
    
    modal.querySelector('.close-button').addEventListener('click', fecharModal);
    modal.querySelector('.button-fechar').addEventListener('click', fecharModal);
    
    // Fecha a modal quando clicar fora dela
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            fecharModal();
        }
    });
    
    // Adiciona evento para o botão buscar
    modal.querySelector('.button-buscar-sorteio').addEventListener('click', async function() {
        const nomeSorteador = document.getElementById('nome-sorteador').value.trim();
        const senhaSorteio = document.getElementById('senha-sorteio').value.trim();
        const resultadosDiv = document.querySelector('.historico-resultados');
        
        if (!nomeSorteador || !senhaSorteio) {
            resultadosDiv.innerHTML = `
                <div class="sorteio-nao-encontrado">
                    <p>Por favor, insira seu nome e senha.</p>
                </div>
            `;
            return;
        }
        
        // Busca o sorteio correspondente
        const sorteio = sorteiosSenha.find(s => 
            s.sorteador.toLowerCase() === nomeSorteador.toLowerCase()
        );
        
        if (sorteio) {
            // Verifica a senha - MODIFICADO para lidar com ambos os formatos
            let senhaCorreta = false;
            
            // Caso 1: Verifica se a senha está armazenada diretamente (sortearTodos)
            if (sorteio.senha && sorteio.senha === senhaSorteio) {
                senhaCorreta = true;
            } 
            // Caso 2: Verifica hash da senha (sortearAmigo)
            else if (sorteio.senhaHash && sorteio.salt) {
                const senhaHash = await hashSenha(senhaSorteio, sorteio.salt);
                senhaCorreta = (senhaHash === sorteio.senhaHash);
            }
            
            if (senhaCorreta) {
                resultadosDiv.innerHTML = `
                    <div class="sorteio-encontrado">
                        <h4>Seu Amigo Secreto é:</h4>
                        <p class="amigo-secreto-nome">🎁 ${sorteio.sorteado} 🎁</p>
                        <p class="amigo-secreto-data">Sorteado em ${sorteio.data} às ${sorteio.hora}</p>
                    </div>
                `;
                criarConfete();
                tocarSom('sortear-fim');
            } else {
                resultadosDiv.innerHTML = `
                    <div class="sorteio-nao-encontrado">
                        <p>Senha incorreta. Tente novamente.</p>
                    </div>
                `;
                tocarSom('remover');
            }
        } else {
            resultadosDiv.innerHTML = `
                <div class="sorteio-nao-encontrado">
                    <p>Nenhum sorteio encontrado com esse nome e senha.</p>
                </div>
            `;
            tocarSom('remover');
        }
    });
    
    // Anima a entrada da modal
    setTimeout(() => {
        modal.classList.add('ativa');
    }, 10);
}

/**
 * Carrega o script de confetti e retorna uma Promise
 */
function adicionarScriptConfetti() {
    return new Promise((resolve, reject) => {
        try {
            // Se o script já estiver carregado
            if (window.confetti) {
                resolve();
                return;
            }
            
            // Cria o elemento script
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
            
            // Manipuladores de eventos
            script.onload = () => {
                console.log("Script de confetti carregado com sucesso");
                resolve();
            };
            
            script.onerror = (erro) => {
                console.error("Falha ao carregar script de confetti:", erro);
                reject(new Error("Falha ao carregar confetti"));
            };
            
            document.head.appendChild(script);
        } catch (error) {
            console.error("Erro ao adicionar script confetti:", error);
            reject(error);
        }
    });
}

/**
 * Cria um efeito de confete na tela com tratamento de erros melhorado
 */
async function criarConfete() {
    try {
        // Verificação simples sem tentativa de carregamento dinâmico
        if (typeof confetti === 'function') {
            confetti({
                particleCount: 100,
                spread: 70,
                origin: { y: 0.6 },
                colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff']
            });
            console.log("Confete criado com sucesso!");
        } else {
            console.warn("Confetti não está disponível");
        }
    } catch (erro) {
        console.error("Não foi possível criar o efeito de confete:", erro);
    }
}

/**
 * Reinicia os sorteios, permitindo que todos os nomes sejam sorteados novamente
 */
function reiniciarSorteios() {
    // Confirmação antes de reiniciar
    if (confirm('Tem certeza que deseja reiniciar todos os sorteios? Isso apagará todo o histórico de quem já sortou.')) {
        // Limpa os arrays de sorteios
        amigosSorteados = [];
        historicoSorteios = [];
        sorteiosSenha = [];
        
        // Limpa o resultado e o histórico na interface
        document.getElementById('resultado').innerHTML = '';
        const historicoContainer = document.getElementById('historico');
        if (historicoContainer) {
            historicoContainer.innerHTML = '<p class="historico-vazio">Nenhum sorteio realizado</p>';
        }
        
        // Feedback sonoro e visual
        tocarSom('reiniciar');
        mostrarNotificacao('Todos os sorteios foram reiniciados! Qualquer participante pode sortear novamente.', 'sucesso');
        
        // Atualiza a interface
        atualizarListaAmigos();
        
        // Salva os dados atualizados
        salvarDados();
        
        // Forçar uma atualização completa das referências
        setTimeout(() => {
            atualizarListaAmigos();
            atualizarHistorico();
        }, 100);
    }
}

/**
 * Exibe o histórico de sorteios
 */
function atualizarHistorico() {
    const historicoContainer = document.getElementById('historico') || criarHistorico();
    
    if (historicoSorteios.length === 0) {
        historicoContainer.innerHTML = '<p class="historico-vazio">Nenhum sorteio realizado</p>';
        return;
    }
    
    historicoContainer.innerHTML = '<h3 class="historico-titulo">Participantes que já sortearam</h3>';
    const lista = document.createElement('ul');
    lista.className = 'historico-lista';
    
    // Exibe apenas os últimos sorteios
    const sorteiosRecentes = [...historicoSorteios].reverse().slice(0, 5);
    
    sorteiosRecentes.forEach(item => {
        const itemLista = document.createElement('li');
        itemLista.className = 'historico-item-li';
        itemLista.innerHTML = `
            <div class="historico-item">
                <div class="historico-sorteador">
                    <span class="badge">✓</span> ${item.sorteador}
                </div>
                <div class="historico-data">
                    <span>${item.data} às ${item.hora}</span>
                </div>
            </div>
        `;
        lista.appendChild(itemLista);
    });
    
    historicoContainer.appendChild(lista);
}

/**
 * Cria o elemento de histórico se ele não existir
 */
function criarHistorico() {
    const inputSection = document.querySelector('.input-section');
    const historico = document.createElement('div');
    historico.id = 'historico';
    historico.className = 'historico';
    
    // Encontra onde inserir o histórico (após o resultado)
    const resultado = document.getElementById('resultado');
    inputSection.insertBefore(historico, resultado.nextSibling);
    
    return historico;
}

/**
 * Exibe uma notificação temporária melhorada
 * @param {string} mensagem - A mensagem a ser exibida
 * @param {string} tipo - O tipo de notificação (sucesso, erro, info, aviso)
 */
function mostrarNotificacao(mensagem, tipo = 'info') {
    // Cria o elemento de notificação
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao notificacao-${tipo}`;
    
    // Define os ícones para cada tipo de notificação
    const icones = {
        sucesso: '✅',
        erro: '❌',
        aviso: '⚠️',
        info: 'ℹ️'
    };
    
    // Criando estrutura da notificação
    notificacao.innerHTML = `
        <div class="notificacao-icone">${icones[tipo] || '📝'}</div>
        <div class="notificacao-conteudo">
            <p>${mensagem}</p>
        </div>
        <button class="notificacao-fechar">&times;</button>
    `;
    
    // Adiciona ao container de notificações (cria se não existir)
    let container = document.getElementById('notificacoes-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'notificacoes-container';
        document.body.appendChild(container);
    }
    
    container.appendChild(notificacao);
    
    // Adiciona evento para fechar ao clicar no X
    const botaoFechar = notificacao.querySelector('.notificacao-fechar');
    botaoFechar.addEventListener('click', () => fecharNotificacao(notificacao));
    
    // Anima a entrada
    setTimeout(() => {
        notificacao.classList.add('ativa');
    }, 10);
    
    // Remove após um tempo
    const tempoExibicao = tipo === 'sucesso' ? 3000 : 4500;
    setTimeout(() => {
        fecharNotificacao(notificacao);
    }, tempoExibicao);
    
    // Função para fechar a notificação com animação
    function fecharNotificacao(elemento) {
        elemento.classList.add('fechando');
        
        setTimeout(() => {
            elemento.remove();
            
            // Remove o container se não houver mais notificações
            if (container.children.length === 0) {
                container.remove();
            }
        }, 500);
    }
}

/**
 * Sistema de som melhorado com cache e tratamento de erros
 */
// Objeto para armazenar áudios pré-carregados
const audioCache = {};

// Sons em formato base64 (pequenos e compatíveis)
const sonsBase64 = {
    'adicionar': 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==',
    'remover': 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==',
    'sortear-inicio': 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==',
    'sortear-fim': 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==',
    'limpar': 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA==', 
    'reiniciar': 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQQAAAAAAA=='
};

/**
 * Pré-carrega os sons em formato base64
 */
function preCarregarSons() {
    // Para cada som, pré-carrega
    for (const [acao, url] of Object.entries(sonsBase64)) {
        audioCache[acao] = new Audio(url);
        audioCache[acao].volume = 0.5;
        audioCache[acao].load();
    }
    
    console.log("Sons pré-carregados com Base64");
}

/**
 * Reproduz um som para a ação especificada
 */
function tocarSom() {
    // Retorna imediatamente se o som estiver desativado
    if (!somAtivado) { 
        return; 
    }
    
    try {
        // Usa um áudio simples e confiável em formato base64
        const beepAudio = new Audio("data:audio/wav;base64,UklGRggBAABXQVZFZm10IBIAAAABAAEARKwAABCxAgAEABAAZGF0YeQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAf/9/AH//fwB//38Af/9/AH//fwB//38AAAAAAAAAAAAAAAAAAAAAAAAAAACZAGYAmQBmAJkAZgCZAGYAmQBmAJkAZgA=");
        beepAudio.volume = 0.2;
        
        // Obtém a Promise retornada pelo método play()
        const playPromise = beepAudio.play();
        
        // Trata a Promise para evitar erros não capturados
        if (playPromise !== undefined) {
            playPromise.catch(() => {
                // Silenciosamente ignora erros de reprodução (comum em navegadores que bloqueiam autoplay)
                console.log("Reprodução de áudio suprimida pelo navegador");
            });
        }
    } catch (erro) {
        // Apenas registra o erro, sem mostrá-lo ao usuário
        console.log("Erro tratado de áudio:", erro.message);
    }
}

/**
 * Alterna o som ligado/desligado
 */
function alternarSom() {
    somAtivado = !somAtivado;
    const botaoSom = document.getElementById('botao-som');
    
    if (somAtivado) {
        botaoSom.textContent = '🔊 Som: Ativado';
        botaoSom.title = 'Desativar som';
        mostrarNotificacao('Som ativado', 'info');
    } else {
        botaoSom.textContent = '🔇 Som: Desativado';
        botaoSom.title = 'Ativar som';
        mostrarNotificacao('Som desativado', 'info');
    }
}

/**
 * Exporta a lista de amigos como arquivo JSON
 */
function exportarLista() {
    if (amigos.length === 0) {
        mostrarNotificacao('Não há amigos para exportar', 'erro');
        return;
    }
    
    const dados = {
        amigos,
        amigosSorteados,
        historicoSorteios,
        sorteiosSenha,
        dataExportacao: new Date().toISOString()
    };
    
    const json = JSON.stringify(dados, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'amigo-secreto.json';
    a.click();
    
    URL.revokeObjectURL(url);
    mostrarNotificacao('Lista exportada com sucesso!', 'sucesso');
}

/**
 * Importa a lista de amigos de um arquivo JSON
 */
function importarLista() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(event) {
            try {
                const dados = JSON.parse(event.target.result);
                
                if (dados.amigos && Array.isArray(dados.amigos)) {
                    amigos = dados.amigos;
                    amigosSorteados = dados.amigosSorteados || [];
                    historicoSorteios = dados.historicoSorteios || [];
                    sorteiosSenha = dados.sorteiosSenha || [];
                    
                    atualizarListaAmigos();
                    atualizarHistorico();
                    salvarDados();
                    
                    const drawsMsg = sorteiosSenha.length > 0 ? 
                        ` (incluindo ${sorteiosSenha.length} sorteios protegidos)` : '';
                        mostrarNotificacao(`Lista importada com sucesso!${drawsMsg}`, 'sucesso');
                } else {
                    mostrarNotificacao('Arquivo inválido', 'erro');
                }
            } catch (err) {
                mostrarNotificacao('Erro ao importar arquivo', 'erro');
                console.error(err);
            }
        };
        reader.readAsText(file);
    };
    
    input.click();
}

/**
 * Aplica uma função hash simples (não criptográfica) a uma string
 * Esta é uma função de hash usada apenas para gerar identificadores simples
 * e não para segurança criptográfica.
 * 
 * @param {string} texto - Texto a ser aplicado o hash
 * @returns {string} - Hash em formato hexadecimal
 */
function aplicarHash(texto) {
    let hash = 0;
    if (texto.length === 0) return hash.toString();
    
    // Implementação do algoritmo djb2
    for (let i = 0; i < texto.length; i++) {
        const char = texto.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Converte para um inteiro de 32 bits
    }
    
    return Math.abs(hash).toString(16);
}

// Adiciona evento para pressionar Enter no campo de entrada
document.getElementById('amigo').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        adicionarAmigo();
    }
});

// Função para criar botões auxiliares
function criarBotoesAuxiliares() {
    const botaoSortear = document.querySelector('.button-draw');
    const container = document.querySelector('.button-container');
    
    // Criar novo botão de sortear todos com o mesmo estilo do botão principal
    const botaoSortearTodos = document.createElement('button');
    botaoSortearTodos.className = 'button-draw';  // Usando a mesma classe
    botaoSortearTodos.onclick = sortearTodos;
    botaoSortearTodos.setAttribute('aria-label', 'Sortear todos de uma vez');
    
    // Criar estrutura interna igual ao botão principal
    botaoSortearTodos.innerHTML = `
        <img src="assets/play_circle_outline.png" alt="Ícone para sortear todos">
        Sortear todos de uma vez
    `;
    
    // Adicionar o botão ao container, ficará logo abaixo do botão original
    container.appendChild(botaoSortearTodos);
    
    // Ajustar espaçamento entre os botões
    botaoSortearTodos.style.marginTop = '15px';
    
    // Div para os botões de controle (mantidos na interface principal)
    const botoesControle = document.createElement('div');
    botoesControle.className = 'botoes-controle';

    // Botão de histórico
    const botaoHistorico = document.createElement('button');
    botaoHistorico.textContent = '🔍 Consultar Meu Amigo Secreto';
    botaoHistorico.onclick = mostrarHistoricoSorteios;
    botaoHistorico.className = 'button-control historico';
    
    botoesControle.appendChild(botaoHistorico);
    
    // Adiciona o container de botões de controle à interface
    const inputSection = document.querySelector('.input-section');
    inputSection.appendChild(botoesControle);
    
    // Cria o botão de configurações
    const botaoConfiguracao = document.createElement('button');
    botaoConfiguracao.className = 'botao-configuracoes';
    botaoConfiguracao.innerHTML = '⚙️';
    botaoConfiguracao.title = 'Configurações e ferramentas adicionais';
    botaoConfiguracao.onclick = mostrarConfiguracoes;
    document.body.appendChild(botaoConfiguracao);
    
    // Cria a modal de configurações (inicialmente oculta)
    criarModalConfiguracoes();
}

// Função para criar a modal de configurações
function criarModalConfiguracoes() {
    // Remove modal existente, se houver
    const modalExistente = document.querySelector('.modal-configuracoes');
    if (modalExistente) modalExistente.remove();
    
    // Cria a modal
    const modal = document.createElement('div');
    modal.className = 'modal-configuracoes';
    
    // Conteúdo da modal
    modal.innerHTML = `
        <div class="configuracoes-content">
            <span class="close-button">&times;</span>
            <h3>Configurações e Ferramentas</h3>
            <div class="configuracoes-body">
                <div class="configuracoes-section">
                    <h4>Gerenciamento de Dados</h4>
                    <div class="configuracoes-buttons">
                        <button id="btn-exportar" class="button-control">💾 Exportar Lista</button>
                        <button id="btn-importar" class="button-control">📂 Importar Lista</button>
                        <button id="btn-reset" class="button-control resetar-tudo">🗑️ Resetar Completamente</button>
                    </div>
                </div>
                <div class="configuracoes-section">
                    <h4>Preferências</h4>
                    <div class="configuracoes-buttons">
                        <button id="btn-som" class="button-control">🔊 Som</button>
                    </div>
                </div>
                <div class="configuracoes-section">
                    <h4>Ferramentas</h4>
                    <div class="configuracoes-buttons">
                        <button id="btn-diagnostico" class="button-control">🔧 Diagnóstico</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Adiciona a modal ao corpo do documento
    document.body.appendChild(modal);
    
    // Adiciona eventos aos botões
    modal.querySelector('#btn-exportar').onclick = exportarLista;
    modal.querySelector('#btn-importar').onclick = importarLista;
    modal.querySelector('#btn-reset').onclick = resetarAplicacao;
    
    const botaoSom = modal.querySelector('#btn-som');
    botaoSom.textContent = somAtivado ? '🔊 Som Ativado' : '🔇 Som Desativado';
    botaoSom.onclick = () => {
        alternarSom();
        botaoSom.textContent = somAtivado ? '🔊 Som Ativado' : '🔇 Som Desativado';
    };
    
    modal.querySelector('#btn-diagnostico').onclick = diagnosticarProblemas;
    
    // Evento para fechar a modal
    modal.querySelector('.close-button').onclick = fecharModalConfiguracoes;
    
    // Fechar ao clicar fora da modal
    modal.addEventListener('click', function(event) {
        if (event.target === modal) {
            fecharModalConfiguracoes();
        }
    });
}

// Função para mostrar a modal de configurações
function mostrarConfiguracoes() {
    const modal = document.querySelector('.modal-configuracoes');
    modal.classList.add('ativa');
}

// Função para fechar a modal de configurações
function fecharModalConfiguracoes() {
    const modal = document.querySelector('.modal-configuracoes');
    modal.classList.remove('ativa');
}

// Script para confetti
function adicionarScriptConfetti() {
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.5.1/dist/confetti.browser.min.js';
    document.head.appendChild(script);
}

/**
 * Realiza o sorteio completo de todos os amigos de uma vez
 * Implementa o algoritmo de Fisher-Yates para embaralhar os amigos e garantir
 * que ninguém sorteie a si mesmo, verificando e recomeçando se necessário.
 * Cria uma interface para cada participante acessar seu próprio sorteio.
 */
function sortearTodos() {
    if (amigos.length < 2) {
        mostrarNotificacao('É necessário ter pelo menos 2 amigos para realizar o sorteio.', 'erro');
        return;
    }
    
    // Algoritmo de embaralhamento (Fisher-Yates)
    const sorteaveis = [...amigos];
    for (let i = sorteaveis.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [sorteaveis[i], sorteaveis[j]] = [sorteaveis[j], sorteaveis[i]];
    }
    
    // Garante que ninguém sorteie a si mesmo
    let precisaReorganizar = false;
    for (let i = 0; i < amigos.length; i++) {
        if (amigos[i] === sorteaveis[i]) {
            precisaReorganizar = true;
            break;
        }
    }
    
    // Se houver alguém sorteando a si mesmo, executa novamente o algoritmo
    if (precisaReorganizar) {
        return sortearTodos(); // Recursão para tentar novamente
    }
    
    mostrarNotificacao("Sorteio automático realizado com sucesso!", "sucesso");
    
    // Cria interface para visualização dos resultados
    const resultado = document.getElementById('resultado');
    resultado.innerHTML = '<li class="sorteado">Sorteio automático completo! Cada participante pode consultar quem tirou:</li>';
    
    const listaParticipantes = document.createElement('ul');
    listaParticipantes.className = 'lista-participantes-sorteio';
    
    // Para cada amigo, gera uma senha única e armazena o sorteio
    amigos.forEach((amigo, index) => {
        const senha = aplicarHash(amigo + "salt" + Date.now());
        const sorteioId = Date.now().toString(16) + '_' + Math.random().toString(16).substring(2);
        
        // Armazena o resultado do sorteio com a senha
        sorteiosSenha.push({
            id: sorteioId,
            sorteador: amigo,
            sorteado: sorteaveis[index],
            senha: senha,
            data: new Date().toLocaleDateString(),
            hora: new Date().toLocaleTimeString()
        });
        
        // Cria item na lista com botão para visualização
        const itemLista = document.createElement('li');
        itemLista.innerHTML = `
            <div class="participante-sorteio">
                <span>${amigo}</span>
                <button class="button-ver-sorteado mini" data-id="${sorteioId}" data-senha="${senha}" id="btn-sorteio-${sorteioId}">
                    👁️ Ver sorteio
                </button>
            </div>
        `;
        listaParticipantes.appendChild(itemLista);
    });

    resultado.appendChild(listaParticipantes);
    
    // Configura os eventos para os botões de visualização
    document.querySelectorAll('.button-ver-sorteado.mini').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            const senha = this.getAttribute('data-senha');
            
            // Busca o sorteio correspondente
            const sorteio = sorteiosSenha.find(s => s.id === id);
            if (sorteio) {
                // Armazena a senha gerada e registra a visualização
                sorteio.senhaExibida = senha;
                
                // Adiciona ao histórico para estatísticas
                const dataHora = new Date();
                const dataStr = dataHora.toLocaleDateString();
                const horaStr = dataHora.toLocaleTimeString();
                
                historicoSorteios.push({
                    nome: sorteio.sorteado,
                    sorteador: sorteio.sorteador,
                    data: dataStr,
                    hora: horaStr
                });
                
                // Atualiza o visual do botão
                this.innerHTML = '✓ Visualizado';
                this.style.backgroundColor = '#4CAF50';
                this.style.color = 'white';
                this.disabled = true;
                
                // Salva os dados
                salvarDados();
                
                // Mostra a modal com o amigo secreto e a senha
                mostrarModalAmigoSecretoComSenha(sorteio, senha);
                
                // Atualiza o histórico na interface
                setTimeout(() => atualizarHistorico(), 100);
            }
        });
    });
    
    // Finaliza o sorteio
    salvarDados();
    amigosSorteados = [...sorteaveis]; // Marca todos como sorteados
}

/**
 * Função para aplicar hash em senhas usando SHA-256
 * Implementa hashing criptográfico seguro usando a Web Crypto API,
 * combinando a senha com um valor salt único para aumentar a segurança.
 * 
 * @param {string} senha - Senha em texto puro
 * @param {string} salt - Valor único para aumentar a segurança
 * @returns {Promise<string>} - Hash hexadecimal da senha com salt
 */
async function hashSenha(senha, salt) {
    // Combina a senha com o salt para evitar ataques de tabela rainbow
    const dadosParaHash = senha + salt;
    
    // Converte para formato ArrayBuffer para usar com a Web Crypto API
    const encoder = new TextEncoder();
    const data = encoder.encode(dadosParaHash);
    
    // Gera o hash usando SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    
    // Converte o ArrayBuffer para string hexadecimal
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return hashHex;
}

/**
 * Gera um valor salt aleatório
 * @returns {string} - Salt aleatório
 */
function gerarSalt() {
    const randomBytes = new Uint8Array(16);
    crypto.getRandomValues(randomBytes);
    return Array.from(randomBytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Valida a força da senha
 * @param {string} senha - Senha a ser validada
 * @returns {object} - Resultado da validação {valida: boolean, mensagem: string}
 */
function validarSenha(senha) {
    if (!senha) {
        return { valida: false, mensagem: 'É necessário criar uma senha.' };
    }
    
    if (senha.length < 4) {
        return { valida: false, mensagem: 'A senha deve ter pelo menos 4 caracteres.' };
    }
    
    return { valida: true, mensagem: 'Senha válida.' };
}

/**
 * Incrementa contador de tentativas incorretas
 * @param {string} sorteioId - ID do sorteio
 */
function incrementarTentativasIncorretas(sorteioId) {
    if (!tentativasAcesso[sorteioId]) {
        tentativasAcesso[sorteioId] = 1;
    } else {
        tentativasAcesso[sorteioId]++;
    }
    
    // Se atingir o limite de tentativas, bloqueia por um tempo
    if (tentativasAcesso[sorteioId] >= 5) {
        bloquearAcessoTemporario(sorteioId);
    }
}

/**
 * Bloqueia acesso temporariamente
 * @param {string} sorteioId - ID do sorteio
 */
function bloquearAcessoTemporario(sorteioId) {
    // Armazena o timestamp do bloqueio
    const bloqueio = {
        timestamp: Date.now(),
        duracao: 60000 // 1 minuto de bloqueio
    };
    
    localStorage.setItem(`bloqueio_${sorteioId}`, JSON.stringify(bloqueio));
    mostrarNotificacao('Muitas tentativas incorretas. Acesso bloqueado por 1 minuto.', 'erro');
}

/**
 * Verifica se o acesso está bloqueado
 * @param {string} sorteioId - ID do sorteio
 * @returns {boolean} - True se estiver bloqueado
 */
function verificarBloqueio(sorteioId) {
    const bloqueioStr = localStorage.getItem(`bloqueio_${sorteioId}`);
    if (!bloqueioStr) return false;
    
    const bloqueio = JSON.parse(bloqueioStr);
    const agora = Date.now();
    
    // Verifica se o bloqueio ainda está ativo
    if (agora - bloqueio.timestamp < bloqueio.duracao) {
        const segundosRestantes = Math.ceil((bloqueio.timestamp + bloqueio.duracao - agora) / 1000);
        mostrarNotificacao(`Acesso bloqueado. Tente novamente em ${segundosRestantes} segundos.`, 'erro');
        return true;
    }
    
    // Remove o bloqueio se já expirou
    localStorage.removeItem(`bloqueio_${sorteioId}`);
    return false;
}

/**
 * Reseta completamente a aplicação, removendo todos os dados
 */
function resetarAplicacao() {
    if (confirm('ATENÇÃO! Isso apagará TODOS os dados da aplicação (lista de amigos, sorteios, senhas). Você tem certeza?')) {
        // Limpa todos os arrays
        amigos = [];
        amigosSorteados = [];
        historicoSorteios = [];
        sorteiosSenha = [];
        tentativasAcesso = [];
        
        // Limpa localstorage completamente
        localStorage.removeItem('amigoSecreto');
        
        // Remove quaisquer bloqueios de acesso
        const chaves = [];
        for (let i = 0; i < localStorage.length; i++) {
            const chave = localStorage.key(i);
            if (chave.startsWith('bloqueio_')) {
                chaves.push(chave);
            }
        }
        chaves.forEach(chave => localStorage.removeItem(chave));
        
        // Limpa a interface
        document.getElementById('resultado').innerHTML = '';
        
        const historicoContainer = document.getElementById('historico');
        if (historicoContainer) {
            historicoContainer.innerHTML = '<p class="historico-vazio">Nenhum sorteio realizado</p>';
        }
        
        // Feedback
        tocarSom('reiniciar');
        mostrarNotificacao('Aplicação completamente resetada! Todos os dados foram apagados.', 'sucesso');
        
        // Atualiza a interface
        atualizarListaAmigos();
    }
}

/**
 * Sincroniza a interface com os dados atuais
 */
function sincronizarInterfaceComDados() {
    // Salva os dados primeiro
    salvarDados();
    
    // Atualiza todos os elementos da interface
    atualizarListaAmigos();
    atualizarHistorico();
    atualizarContador();
    
    // Atualiza o resultado se necessário
    const resultado = document.getElementById('resultado');
    if (amigosSorteados.length > 0) {
        resultado.innerHTML = `
            <li class="sorteado">
                ${amigosSorteados.length} de ${amigos.length} amigos já foram sorteados
            </li>
        `;
    } else {
        resultado.innerHTML = '';
    }
}

/**
 * Recupera o último estado salvo em caso de problemas
 */
function verificarEstadoSalvo() {
    console.log("Verificando estado da aplicação...");
    
    // Última verificação de integridade de interface/dados
    if (amigos.length !== document.querySelectorAll('#listaAmigos > li').length) {
        console.warn("Detectada inconsistência na lista de amigos. Forçando atualização.");
        atualizarListaAmigos();
    }
    
    if (historicoSorteios.length > 0 && !document.querySelector('#historico')) {
        console.warn("Histórico não está visível apesar de haver dados. Forçando atualização.");
        atualizarHistorico();
    }
    
    // Verifica se há sorteios sem UI correspondente
    if (sorteiosSenha.length > 0 && document.getElementById('resultado').innerHTML === '') {
        console.warn("Há sorteios realizados, mas sem informação na interface. Corrigindo.");
        document.getElementById('resultado').innerHTML = `
            <li class="sorteado">
                ${amigosSorteados.length} de ${amigos.length} amigos já foram sorteados
            </li>
        `;
    }
}

/**
 * Sistema de delegação de eventos para os botões de remover
 * Usa o padrão de delegação de eventos para lidar com cliques em botões de remover,
 * o que é mais eficiente que adicionar event listeners separados para cada botão.
 */
document.addEventListener('click', function(event) {
    const botaoRemover = event.target.closest('.botao-remover');
    if (botaoRemover) {
        const listItem = botaoRemover.closest('li');
        if (listItem && listItem.dataset.indice) {
            const indice = parseInt(listItem.dataset.indice);
            removerAmigo(indice);
        }
    }
});

// Adiciona eventos aos botões
document.querySelectorAll('.button-ver-sorteado.mini').forEach(btn => {
    btn.addEventListener('click', function() {
        const id = this.getAttribute('data-id');
        const senha = this.getAttribute('data-senha');
        
        // Busca o sorteio
        const sorteio = sorteiosSenha.find(s => s.id === id);
        if (sorteio) {
            // Armazena a senha gerada no sorteio
            sorteio.senhaExibida = senha;
            
            // Adiciona ao histórico normal para exibição
            const dataHora = new Date();
            const dataStr = dataHora.toLocaleDateString();
            const horaStr = dataHora.toLocaleTimeString();
            
            historicoSorteios.push({
                nome: sorteio.sorteado,
                sorteador: sorteio.sorteador,
                data: dataStr,
                hora: horaStr
            });
            
            // Salva os dados
            salvarDados();
            
            // Mostra a modal com o amigo secreto e a senha
            mostrarModalAmigoSecretoComSenha(sorteio, senha);
            
            // Atualiza o histórico na interface
            setTimeout(() => atualizarHistorico(), 100);
        }
    });
});

// Adicione esta função para garantir permissão de áudio
function garantirPermissaoAudio() {
    // Tenta garantir que o navegador permite áudio
    document.addEventListener('click', function iniciarAudio() {
        // Cria e reproduz um som silencioso
        const audio = new Audio();
        audio.volume = 0.01;
        audio.play().then(() => {
            console.log("Permissão de áudio concedida pelo navegador");
            document.removeEventListener('click', iniciarAudio);
        }).catch(e => {
            console.warn("Navegador ainda bloqueia áudio:", e);
        });
    }, { once: false });
}

/**
 * Função integrada de diagnóstico para identificar problemas
 */
function diagnosticarProblemas() {
    console.log("🔍 Iniciando diagnóstico do aplicativo");
    
    // Verifica estado do cache de áudio
    console.log("✓ Cache de áudio:", Object.keys(audioCache));
    
    // Verifica se algum timer está ativo
    const timers = Object.keys(window).filter(key => key.includes("Timer") || key.includes("Interval"));
    console.log("✓ Timers ativos:", timers.length);
    
    // Verifica consistência dos dados
    console.log("✓ Amigos:", amigos.length);
    console.log("✓ Amigos sorteados:", amigosSorteados.length);
    console.log("✓ Histórico:", historicoSorteios.length);
    console.log("✓ Sorteios com senha:", sorteiosSenha.length);
    
    // Verifica elementos da interface
    console.log("✓ Elementos na lista:", document.querySelectorAll('#listaAmigos > li').length);
    
    // Verifica armazenamento local
    console.log("✓ Tamanho localStorage:", localStorage.length);
    
    // Tenta fazer um teste de áudio
    try {
        const testeAudio = new Audio("data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA");
        testeAudio.volume = 0.1;
        testeAudio.play()
            .then(() => console.log("✅ Áudio: Reprodução funcionando"))
            .catch(e => console.error("❌ Áudio: Erro na reprodução", e));
    } catch (e) {
        console.error("❌ Áudio: Erro crítico", e);
    }
    
    console.log("🔍 Diagnóstico concluído");
}

// Adicione um botão para diagnóstico
function criarBotaoDiagnostico() {
    console.log("Botão de diagnóstico agora disponível nas configurações");
}

/**
 * Cria o botão de configurações e a modal
 */
function criarBotaoConfiguracoes() {
    // Cria o botão de configurações
    const botaoConfiguracoes = document.createElement('button');
    botaoConfiguracoes.id = 'configuracoes-btn';
    botaoConfiguracoes.className = 'botao-configuracoes';
    botaoConfiguracoes.innerHTML = '⚙️';
    botaoConfiguracoes.ariaLabel = 'Configurações';
    document.body.appendChild(botaoConfiguracoes);
    
    // Cria a modal de configurações
    const modalConfiguracoes = document.createElement('div');
    modalConfiguracoes.id = 'configuracoes-modal';
    modalConfiguracoes.className = 'modal-configuracoes';
    
    modalConfiguracoes.innerHTML = `
        <div class="configuracoes-content">
            <span class="close-button">&times;</span>
            <h3>Configurações do Sistema</h3>
            <div class="configuracoes-body">
                <div class="configuracoes-section">
                    <h4>Gerenciamento de Dados</h4>
                    <div class="configuracoes-buttons" id="dados-buttons"></div>
                </div>
                
                <div class="configuracoes-section">
                    <h4>Controles do Sorteio</h4>
                    <div class="configuracoes-buttons" id="sorteio-buttons"></div>
                </div>
                
                <div class="configuracoes-section">
                    <h4>Sistema</h4>
                    <div class="configuracoes-buttons" id="sistema-buttons"></div>
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modalConfiguracoes);
    
    // Adiciona eventos para abrir e fechar a modal
    botaoConfiguracoes.addEventListener('click', () => {
        modalConfiguracoes.classList.add('ativa');
    });
    
    modalConfiguracoes.querySelector('.close-button').addEventListener('click', () => {
        modalConfiguracoes.classList.remove('ativa');
    });
    
    // Fecha ao clicar fora da modal
    modalConfiguracoes.addEventListener('click', (e) => {
        if (e.target === modalConfiguracoes) {
            modalConfiguracoes.classList.remove('ativa');
        }
    });
    
    return modalConfiguracoes;
}

/**
 * Move os botões do sistema para a modal de configurações
 */
function moverBotoesParaConfiguracoes() {
    const modalConfiguracoes = document.getElementById('configuracoes-modal') || criarBotaoConfiguracoes();
    
    // Seção de dados
    const dadosButtons = modalConfiguracoes.querySelector('#dados-buttons');
    
    // Botão para exportar
    const botaoExportar = document.createElement('button');
    botaoExportar.textContent = '💾 Exportar';
    botaoExportar.onclick = exportarLista;
    botaoExportar.className = 'button-control';
    botaoExportar.title = 'Exportar lista de amigos';
    dadosButtons.appendChild(botaoExportar);
    
    // Botão para importar
    const botaoImportar = document.createElement('button');
    botaoImportar.textContent = '📂 Importar';
    botaoImportar.onclick = importarLista;
    botaoImportar.className = 'button-control';
    botaoImportar.title = 'Importar lista de amigos';
    dadosButtons.appendChild(botaoImportar);
    
    // Seção de sorteio
    const sorteioButtons = modalConfiguracoes.querySelector('#sorteio-buttons');
    
    // Botão para reiniciar sorteios
    const botaoReiniciar = document.createElement('button');
    botaoReiniciar.textContent = '🔄 Reiniciar Sorteios';
    botaoReiniciar.onclick = reiniciarSorteios;
    botaoReiniciar.className = 'button-control reiniciar';
    sorteioButtons.appendChild(botaoReiniciar);
    
    // Botão para limpar lista
    const botaoLimpar = document.createElement('button');
    botaoLimpar.textContent = '🗑️ Limpar Lista';
    botaoLimpar.onclick = limparLista;
    botaoLimpar.className = 'button-control limpar';
    sorteioButtons.appendChild(botaoLimpar);
    
    // Seção de sistema
    const sistemaButtons = modalConfiguracoes.querySelector('#sistema-buttons');
    
    // Botão para som
    const botaoSom = document.createElement('button');
    botaoSom.textContent = somAtivado ? '🔊 Som: Ativado' : '🔇 Som: Desativado';
    botaoSom.id = 'botao-som';
    botaoSom.onclick = function() {
        alternarSom();
        this.textContent = somAtivado ? '🔊 Som: Ativado' : '🔇 Som: Desativado';
    };
    botaoSom.className = 'button-control';
    sistemaButtons.appendChild(botaoSom);
    
    // Botão de diagnóstico
    const botaoDiagnostico = document.createElement('button');
    botaoDiagnostico.textContent = '🔧 Diagnóstico';
    botaoDiagnostico.id = 'botao-diagnostico'; 
    botaoDiagnostico.onclick = diagnosticarProblemas;
    botaoDiagnostico.className = 'button-control';
    sistemaButtons.appendChild(botaoDiagnostico);
    
    // Botão para resetar tudo
    const botaoResetarTudo = document.createElement('button');
    botaoResetarTudo.textContent = '⚠️ Resetar Completamente';
    botaoResetarTudo.onclick = resetarAplicacao;
    botaoResetarTudo.className = 'button-control resetar-tudo';
    botaoResetarTudo.style.backgroundColor = '#b71c1c';
    botaoResetarTudo.style.color = 'white';
    botaoResetarTudo.title = 'Apaga TODOS os dados da aplicação (use em caso de problemas)';
    sistemaButtons.appendChild(botaoResetarTudo);
}

// Inicialização com tratamentos de erros
window.addEventListener('load', function() {
    console.log("Inicializando aplicação Amigo Secreto");
    
    // Execute as funções básicas individualmente com tratamento de erros
    try {
        criarBotoesAuxiliares();
        console.log("✓ Botões auxiliares criados");
    } catch (e) {
        console.error("✗ Erro ao criar botões auxiliares:", e);
    }
    
    try {
        preCarregarSons();
        console.log("✓ Sons pré-carregados");
    } catch (e) {
        console.error("✗ Erro ao pré-carregar sons:", e);
    }
    
    // Cria botão de diagnóstico primeiro (prioridade)
    try {
        criarBotaoDiagnostico();
        console.log("✓ Botão de diagnóstico criado");
    } catch (e) {
        console.error("✗ Erro ao criar botão de diagnóstico:", e);
    }

    // Cria botão de Painel de configurações
    try {
        moverBotoesParaConfiguracoes();
        console.log("✓ Painel de configurações criado");
    } catch (e) {
        console.error("✗ Erro ao criar painel de configurações:", e);
    }
    
    // Carrega o script do confetti sem esperar pela promessa
    try {
        const scriptConfetti = document.createElement('script');
        scriptConfetti.src = 'https://cdn.jsdelivr.net/npm/canvas-confetti@1.6.0/dist/confetti.browser.min.js';
        document.head.appendChild(scriptConfetti);
        console.log("✓ Script de confetti adicionado");
    } catch (e) {
        console.error("✗ Erro ao adicionar script de confetti:", e);
    }
    
    // Continua com outras inicializações
    try {
        carregarDadosSalvos();
        console.log("✓ Dados carregados");
    } catch (e) {
        console.error("✗ Erro ao carregar dados:", e);
    }
    
    // Garante permissão de áudio
    try {
        garantirPermissaoAudio();
        console.log("✓ Permissão de áudio solicitada");
    } catch (e) {
        console.error("✗ Erro ao solicitar permissão de áudio:", e);
    }
    
    // Sincroniza interface
    try {
        setTimeout(() => {
            sincronizarInterfaceComDados();
            console.log("✓ Interface sincronizada");
        }, 500);
    } catch (e) {
        console.error("✗ Erro ao sincronizar interface:", e);
    }
    
    // Configura verificações periódicas
    try {
        setInterval(verificarEstadoSalvo, 5000);
        console.log("✓ Verificações periódicas configuradas");
    } catch (e) {
        console.error("✗ Erro ao configurar verificações periódicas:", e);
    }
    
    // Mensagem de boas-vindas após toda inicialização
    setTimeout(() => {
        try {
            mostrarNotificacao('Bem-vindo ao Amigo Secreto!', 'info');
            console.log("✓ Notificação de boas-vindas exibida");
        } catch (e) {
            console.error("✗ Erro ao exibir notificação de boas-vindas:", e);
        }
    }, 1000);
});
