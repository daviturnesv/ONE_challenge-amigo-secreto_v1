# Amigo Secreto - Aplicativo para Sorteio de Amigos Secretos

![Logo do Amigo Secreto](assets/amigo-secreto.png)

[![Vercel](https://img.shields.io/badge/Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://one-challenge-amigo-secreto-v1.vercel.app/)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://one-challenge-amigo-secreto-v1.vercel.app/)
[![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)](https://one-challenge-amigo-secreto-v1.vercel.app/)

## 📋 Sumário

- Sobre o Projeto
- Demonstração Online
- Principais Recursos
- Como Usar
- Segurança e Privacidade
- Detalhes Técnicos
- Responsividade
- Instalação Local

## 🎁 Sobre o Projeto

**Amigo Secreto** é uma aplicação web que simplifica a organização de sorteios de amigo secreto. Desenvolvida com JavaScript puro, a aplicação não depende de frameworks ou bibliotecas externas, garantindo carregamento rápido e compatibilidade com a maioria dos navegadores.

A aplicação resolve os problemas clássicos de sorteios de amigo secreto:
- **Transparência**: Garante que o sorteio seja justo e aleatório
- **Privacidade**: Cada participante vê apenas seu próprio amigo sorteado
- **Facilidade**: Elimina a necessidade de papéis ou métodos manuais
- **Acessibilidade**: Funciona em qualquer dispositivo com acesso à internet

**![image](https://github.com/user-attachments/assets/b8b34ddf-d95a-43ef-839e-e3216c0c3844)**

## 🌐 Demonstração Online

Experimente a aplicação agora mesmo:

🔗 **[https://one-challenge-amigo-secreto-v1.vercel.app/](https://one-challenge-amigo-secreto-v1.vercel.app/)**

## ✨ Principais Recursos

### Gerenciamento de Participantes
- **Adição intuitiva**: Interface simples para adicionar nomes à lista
- **Validação automática**: Evita duplicação de nomes e entradas vazias
- **Animações suaves**: Feedback visual ao adicionar/remover participantes

![adicao_e_remocao_participantes](https://github.com/user-attachments/assets/9781724d-e6cd-415e-a1f4-15748618d2ad)

### Sistema de Sorteio Flexível

#### 1. Sorteio Individual
Perfeito quando os participantes estão reunidos e querem manter o suspense:

```javascript
// Trecho do código que garante que ninguém sorteie a si mesmo
const amigosDisponiveis = amigos.filter(amigo => 
    amigo.toLowerCase() !== nomeSorteador.toLowerCase() && 
    !amigosSorteados.includes(amigo)
);

// Sorteio aleatório
const indiceAleatorio = Math.floor(Math.random() * amigosDisponiveis.length);
const amigoSorteado = amigosDisponiveis[indiceAleatorio];
```
 **Exemplo:**
![sorteioUnico](https://github.com/user-attachments/assets/087419bd-8d90-46e3-98b4-ab42f71fb6a0)

#### 2. Sorteio Coletivo
Ideal para grupos que não estão no mesmo local:

```javascript
// Algoritmo de embaralhamento (Fisher-Yates)
const sorteaveis = [...amigos];
for (let i = sorteaveis.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [sorteaveis[i], sorteaveis[j]] = [sorteaveis[j], sorteaveis[i]];
}
```
**Exemplo:**
![sorteioGeral](https://github.com/user-attachments/assets/3074bc45-e284-4599-98e2-0e390a4b3a12)

### Proteção por Senha e Criptografia

Todas as informações são protegidas:
- Senhas armazenadas com hash e salt
- Dados criptografados no armazenamento local
- Proteção contra tentativas de força bruta

### Interface Responsiva e Intuitiva
- Adapta-se perfeitamente a qualquer tamanho de tela
- Design pensado para desktop e dispositivos móveis
- Animações e feedback visual

## 🚀 Como Usar

### 1. Adicionando Participantes

1. Digite o nome do participante no campo indicado
2. Clique em "Adicionar" ou pressione Enter
3. Veja a lista de participantes crescer automaticamente

### 2. Realizando o Sorteio

#### Sorteio Individual
1. Clique no botão "Sortear amigo"
2. Digite seu nome quando solicitado
3. Crie uma senha para acessar seu resultado
4. Veja quem você tirou com efeito de confete!

#### Sorteio Coletivo
1. Clique no botão "Sortear todos de uma vez"
2. Cada participante acessa o próprio resultado clicando no botão ao lado de seu nome
3. Senhas são geradas automaticamente para cada participante

### 3. Consulta Posterior

Esqueceu quem você tirou? Sem problemas:

1. Clique em "Consultar Meu Amigo Secreto"
2. Digite seu nome e senha
3. Veja seu amigo secreto novamente!

## 🔒 Segurança e Privacidade

### Criptografia de Ponta a Ponta

Todos os dados sensíveis são protegidos:

```javascript
function criptografarDados(dados) {
    // Converte o objeto para string
    const dadosString = JSON.stringify(dados);
    
    // Implementação de XOR para criptografia
    let resultado = '';
    for (let i = 0; i < dadosString.length; i++) {
        const charCode = dadosString.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
        resultado += String.fromCharCode(charCode);
    }
    
    // Converte para Base64
    return btoa(resultado);
}
```

### Senhas Protegidas com Hash e Salt

```javascript
async function hashSenha(senha, salt) {
    // Combina senha com salt único
    const dadosParaHash = senha + salt;
    
    // Gera hash SHA-256
    const hashBuffer = await crypto.subtle.digest('SHA-256', 
        new TextEncoder().encode(dadosParaHash));
    
    // Converte para string hexadecimal
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}
```

### Proteção Contra Acesso Não Autorizado

O sistema implementa proteção contra múltiplas tentativas:
- Bloqueia o acesso após 5 tentativas incorretas
- Timeout de 60 segundos para novas tentativas
- Interface não revela informações sensíveis

## 🔧 Detalhes Técnicos

### Algoritmo de Sorteio

O algoritmo garante que:
1. Ninguém tire a si mesmo
2. Todos os participantes sejam sorteados
3. Não ocorram situações impossíveis (deadlocks)

```javascript
// Verificação de deadlock no sorteio
function verificarPossibilidadeDeDeadlock() {
    const participantesRestantes = amigos.filter(amigo => 
        !sorteiosSenha.some(s => s.sorteador === amigo)
    );
    
    const amigosSorteaveis = amigos.filter(amigo => 
        !amigosSorteados.includes(amigo)
    );
    
    // Se só resta uma pessoa para sortear e ela só pode tirar a si mesma
    if (participantesRestantes.length === 1 && 
        amigosSorteaveis.length === 1 && 
        participantesRestantes[0] === amigosSorteaveis[0]) {
        // Reorganiza o sorteio automaticamente
        // ...
    }
}
```

### Sistema de Notificações

Feedback visual para todas as ações:

```javascript
function mostrarNotificacao(mensagem, tipo = 'info') {
    // Define ícones para cada tipo de notificação
    const icones = {
        sucesso: '✅',
        erro: '❌',
        aviso: '⚠️',
        info: 'ℹ️'
    };
    
    // Cria a estrutura da notificação
    const notificacao = document.createElement('div');
    notificacao.className = `notificacao notificacao-${tipo}`;
    notificacao.innerHTML = `
        <div class="notificacao-icone">${icones[tipo] || '📝'}</div>
        <div class="notificacao-conteudo">
            <p>${mensagem}</p>
        </div>
        <button class="notificacao-fechar">&times;</button>
    `;
    
    // Exibe e anima a notificação
    // ...
}
```

### Persistência de Dados

Dados salvo automaticamente usando LocalStorage criptografado:
- Lista de participantes
- Histórico de sorteios
- Configurações pessoais

### Controles do Sorteio

AS etapas do sorteio podem ser manipuladas de forma rápida e separada

**Exemplo:**
![controles_de_dados](https://github.com/user-attachments/assets/bd54c731-5771-49b3-ba8d-22d40b284aaf)


## 📱 Responsividade

A interface se adapta perfeitamente a qualquer dispositivo:

```javascript
function ajustarResponsividade() {
    const larguraTela = window.innerWidth;
    const alturaTela = window.innerHeight;
    const orientacao = larguraTela > alturaTela ? 'landscape' : 'portrait';
    
    // Ajuste para orientação paisagem em dispositivos pequenos
    if (alturaTela < 500 && orientacao === 'landscape') {
        mainContent.style.flexDirection = 'row';
        headerBanner.style.flex = '0 0 30%';
        inputSection.style.flex = '0 0 70%';
    } else {
        // Layout padrão para outros dispositivos
        // ...
    }
}
```

## 💻 Instalação Local

Para executar o projeto localmente:

1. Clone o repositório:
```bash
git clone https://github.com/seu-usuario/amigo-secreto.git
```

2. Abra o arquivo index.html em seu navegador ou use um servidor local:
```bash
# Usando Python
python -m http.server 8000

# Usando Node.js com http-server
npx http-server
```

3. Acesse `http://localhost:8000` em seu navegador

---

Desenvolvido com ❤️ por [Davi](https://github.com/daviturnesv) usando JavaScript puro, HTML5 e CSS3.
