//O principal objetivo deste desafio é fortalecer suas habilidades em lógica de programação. Aqui você deverá desenvolver a lógica para resolver o problema.

// Array para armazenar os nomes dos amigos
let amigos = [];

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
    
    // Adiciona cada amigo como um item da lista
    for (let i = 0; i < amigos.length; i++) {
        const itemLista = document.createElement('li');
        itemLista.textContent = amigos[i];
        lista.appendChild(itemLista);
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
    
    // Gera um índice aleatório
    const indiceAleatorio = Math.floor(Math.random() * amigos.length);
    
    // Obtém o amigo sorteado
    const amigoSorteado = amigos[indiceAleatorio];
    
    // Exibe o resultado
    resultado.innerHTML = `<li>🎉 ${amigoSorteado} foi sorteado(a)! 🎉</li>`;
}

// Adiciona evento para pressionar Enter no campo de entrada
document.getElementById('amigo').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        adicionarAmigo();
    }
});
