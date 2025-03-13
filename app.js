//O principal objetivo deste desafio é fortalecer suas habilidades em lógica de programação. Aqui você deverá desenvolver a lógica para resolver o problema.

// Array para armazenar os nomes dos amigos
let amigos = [];
// Array para rastrear amigos já sorteados
let amigosSorteados = [];

/**
 * Adiciona um amigo à lista
 */
function adicionarAmigo() {
    // Captura o valor do campo de entrada
    const inputAmigo = document.getElementById('amigo');
    const nome = inputAmigo.value.trim();
    
    // Valida a entrada
    if (nome === '') {
        alert('Por favor, insira um nome.');
        return;
    }
    
    // Verifica se o nome já existe na lista (case insensitive)
    if (amigos.some(amigo => amigo.toLowerCase() === nome.toLowerCase())) {
        alert(`O nome "${nome}" já está na lista!`);
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
}

/**
 * Atualiza a lista de amigos na interface
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
    for (let i = 0; i < amigos.length; i++) {
        const itemLista = document.createElement('li');
        
        // Cria o texto principal com o nome do amigo
        const spanNome = document.createElement('span');
        spanNome.textContent = amigos[i];
        itemLista.appendChild(spanNome);
        
        // Adiciona um botão de remover
        const botaoRemover = document.createElement('button');
        botaoRemover.textContent = '❌';
        botaoRemover.className = 'botao-remover';
        botaoRemover.title = `Remover ${amigos[i]} da lista`;
        botaoRemover.onclick = function() { removerAmigo(i); };
        itemLista.appendChild(botaoRemover);
        
        lista.appendChild(itemLista);
    }
}

/**
 * Remove um amigo específico da lista
 * @param {number} indice - O índice do amigo a ser removido
 */
function removerAmigo(indice) {
    if (indice >= 0 && indice < amigos.length) {
        const nomeRemovido = amigos[indice];
        amigos.splice(indice, 1);
        atualizarListaAmigos();
        
        // Exibe mensagem de confirmação
        const resultado = document.getElementById('resultado');
        resultado.innerHTML = `<li class="removido">${nomeRemovido} foi removido(a) da lista</li>`;
        
        // Limpa o resultado depois de 3 segundos
        setTimeout(() => {
            if (resultado.innerHTML.includes('removido')) {
                resultado.innerHTML = '';
            }
        }, 3000);
    }
}

/**
 * Limpa toda a lista de amigos
 */
function limparLista() {
    // Verifica se há amigos na lista
    if (amigos.length === 0) {
        alert('A lista já está vazia.');
        return;
    }
    
    // Confirmação para limpar a lista
    if (confirm('Tem certeza que deseja limpar toda a lista de amigos?')) {
        amigos = [];
        amigosSorteados = [];
        atualizarListaAmigos();
        document.getElementById('resultado').innerHTML = '';
    }
}

/**
 * Sorteia um amigo aleatoriamente da lista
 */
function sortearAmigo() {
    const resultado = document.getElementById('resultado');
    
    // Verifica se há amigos na lista
    if (amigos.length === 0) {
        alert('Adicione pelo menos um amigo antes de sortear.');
        return;
    }
    
    // Verifica se todos os amigos já foram sorteados
    if (amigosSorteados.length >= amigos.length) {
        if (confirm('Todos os amigos já foram sorteados. Deseja reiniciar o sorteio?')) {
            amigosSorteados = [];
        } else {
            return;
        }
    }
    
    // Tenta encontrar um amigo que ainda não foi sorteado
    let indiceAleatorio;
    let amigoSorteado;
    let tentativas = 0;
    const maxTentativas = 100; // Evita loops infinitos em casos extremos
    
    do {
        indiceAleatorio = Math.floor(Math.random() * amigos.length);
        amigoSorteado = amigos[indiceAleatorio];
        tentativas++;
    } while (
        amigosSorteados.includes(amigoSorteado) && 
        amigosSorteados.length < amigos.length && 
        tentativas < maxTentativas
    );
    
    // Adiciona o amigo sorteado à lista de sorteados
    amigosSorteados.push(amigoSorteado);
    
    // Exibe o resultado com animação
    resultado.innerHTML = '<li class="sorteando">Sorteando...</li>';
    
    setTimeout(() => {
        resultado.innerHTML = `
            <li class="sorteado">
                🎉 ${amigoSorteado} foi sorteado(a)! 🎉
                <div class="contador-sorteio">
                    (${amigosSorteados.length}/${amigos.length} sorteados)
                </div>
            </li>
        `;
    }, 800);
}

/**
 * Reinicia os sorteios, permitindo que todos os nomes sejam sorteados novamente
 */
function reiniciarSorteios() {
    amigosSorteados = [];
    document.getElementById('resultado').innerHTML = '';
    alert('Os sorteios foram reiniciados! Todos os nomes podem ser sorteados novamente.');
}

// Adiciona evento para pressionar Enter no campo de entrada
document.getElementById('amigo').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        adicionarAmigo();
    }
});

// Adiciona botões auxiliares ao carregar a página
window.addEventListener('load', function() {
    const botaoSortear = document.querySelector('.button-draw');
    const container = botaoSortear.parentElement;
    
    const botoesControle = document.createElement('div');
    botoesControle.className = 'botoes-controle';
    
    // Botão para limpar lista
    const botaoLimpar = document.createElement('button');
    botaoLimpar.textContent = 'Limpar Lista';
    botaoLimpar.onclick = limparLista;
    botaoLimpar.className = 'button-control limpar';
    
    // Botão para reiniciar sorteios
    const botaoReiniciar = document.createElement('button');
    botaoReiniciar.textContent = 'Reiniciar Sorteios';
    botaoReiniciar.onclick = reiniciarSorteios;
    botaoReiniciar.className = 'button-control reiniciar';
    
    botoesControle.appendChild(botaoLimpar);
    botoesControle.appendChild(botaoReiniciar);
    
    container.appendChild(botoesControle);
});
