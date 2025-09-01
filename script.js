// 1. Seleção de elementos HTML
const opcoesJogoDiv = document.getElementById('opcoes-jogo');
const opcoesDificuldadeDiv = document.getElementById('opcoes-dificuldade');
const jogoDiv = document.getElementById('jogo');
const tabuleiro = document.getElementById('tabuleiro');
const celulas = document.querySelectorAll('.celula');
const mensagemStatus = document.getElementById('mensagem-status');
const btnReiniciar = document.getElementById('btn-reiniciar');
const btnMaquina = document.getElementById('btn-maquina');
const btnJogador = document.getElementById('btn-jogador');
const btnFacil = document.getElementById('btn-facil');
const btnMedio = document.getElementById('btn-medio');
const btnDificil = document.getElementById('btn-dificil');
const placarXSpan = document.getElementById('placar-x');
const placarOSpan = document.getElementById('placar-o');

// 2. Variáveis de estado do jogo
let tabuleiroEstado = ['', '', '', '', '', '', '', '', ''];
let jogadorAtual = ''; // Vamos decidir quem começa aleatoriamente
let jogoAtivo = true;
let modoDeJogo = ''; // 'maquina' ou 'jogador'
let dificuldade = ''; // 'facil', 'medio' ou 'dificil'
let placarX = 0; // Novo
let placarO = 0; // Novo

// 3. Funções auxiliares
const condicoesVitoria = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8], // Linhas
    [0, 3, 6], [1, 4, 7], [2, 5, 8], // Colunas
    [0, 4, 8], [2, 4, 6]            // Diagonais
];

const verificarVitoria = () => {
    for (const condicao of condicoesVitoria) {
        const [a, b, c] = condicao;
        if (tabuleiroEstado[a] && tabuleiroEstado[a] === tabuleiroEstado[b] && tabuleiroEstado[a] === tabuleiroEstado[c]) {
            jogoAtivo = false;
            mensagemStatus.textContent = `${tabuleiroEstado[a]} Venceu!`;
            
            // Lógica para atualizar o placar
            if (tabuleiroEstado[a] === 'X') {
                placarX++;
            } else {
                placarO++;
            }
            atualizarPlacar();
            return true;
        }
    }
    return false;
};

const verificarEmpate = () => {
    if (!tabuleiroEstado.includes('')) {
        jogoAtivo = false;
        mensagemStatus.textContent = 'Empate!';
        return true;
    }
    return false;
};

const reiniciarJogo = () => {
    tabuleiroEstado = ['', '', '', '', '', '', '', '', ''];
    jogadorAtual = 'X';
    jogoAtivo = true;
    mensagemStatus.textContent = "Vez do 'X'";
    celulas.forEach(celula => {
        celula.textContent = '';
        celula.classList.remove('x', 'o');
    });
};

const alternarJogador = () => {
    jogadorAtual = jogadorAtual === 'X' ? 'O' : 'X';
    if (jogoAtivo) {
        mensagemStatus.textContent = `Vez do '${jogadorAtual}'`;
    }
};

const fazerJogada = (indice, jogador) => {
    if (tabuleiroEstado[indice] === '' && jogoAtivo) {
        tabuleiroEstado[indice] = jogador;
        celulas[indice].textContent = jogador;
        celulas[indice].classList.add(jogador.toLowerCase());
        return true;
    }
    return false;
};

const atualizarPlacar = () => {
    placarXSpan.textContent = placarX;
    placarOSpan.textContent = placarO;
};

// 4. Lógica da IA (Inteligência Artificial)
const jogadaAleatoria = () => {
    const celulasVazias = tabuleiroEstado.map((celula, i) => celula === '' ? i : null).filter(val => val !== null);
    if (celulasVazias.length > 0) {
        return celulasVazias[Math.floor(Math.random() * celulasVazias.length)];
    }
    return undefined;
};

const jogadaMedia = () => {
    let jogadaVitoria = verificarEstrategia('O');
    if (jogadaVitoria !== undefined) {
        return jogadaVitoria;
    }

    let jogadaBloqueio = verificarEstrategia('X');
    if (jogadaBloqueio !== undefined) {
        return jogadaBloqueio;
    }

    if (tabuleiroEstado[4] === '') {
        return 4;
    }

    const cantos = [0, 2, 6, 8];
    const cantoVazio = cantos.find(canto => tabuleiroEstado[canto] === '');
    if (cantoVazio !== undefined) {
        return cantoVazio;
    }

    return jogadaAleatoria();
};

const verificarEstrategia = (jogador) => {
    for (const condicao of condicoesVitoria) {
        const [a, b, c] = condicao;
        const linha = [tabuleiroEstado[a], tabuleiroEstado[b], tabuleiroEstado[c]];
        
        if (linha.filter(x => x === jogador).length === 2 && linha.includes('')) {
            const indiceVazio = condicao[linha.indexOf('')];
            return indiceVazio;
        }
    }
    return undefined;
};

const jogadaDificil = () => {
    return melhorJogadaMinimax(tabuleiroEstado, 'O').indice;
};

const melhorJogadaMinimax = (novoTabuleiro, jogador) => {
    const celulasVazias = novoTabuleiro.map((celula, i) => celula === '' ? i : null).filter(val => val !== null);
    
    if (verificarVitoriaMinimax(novoTabuleiro, 'X')) {
        return { score: -10 };
    } else if (verificarVitoriaMinimax(novoTabuleiro, 'O')) {
        return { score: 10 };
    } else if (celulasVazias.length === 0) {
        return { score: 0 };
    }

    const jogadas = [];
    for (let i = 0; i < celulasVazias.length; i++) {
        const jogada = {};
        jogada.indice = celulasVazias[i];
        
        novoTabuleiro[jogada.indice] = jogador;
        
        if (jogador === 'O') {
            const resultado = melhorJogadaMinimax(novoTabuleiro, 'X');
            jogada.score = resultado.score;
        } else {
            const resultado = melhorJogadaMinimax(novoTabuleiro, 'O');
            jogada.score = resultado.score;
        }

        novoTabuleiro[jogada.indice] = '';
        jogadas.push(jogada);
    }

    let melhorJogada;
    if (jogador === 'O') {
        let melhorScore = -Infinity;
        for (let i = 0; i < jogadas.length; i++) {
            if (jogadas[i].score > melhorScore) {
                melhorScore = jogadas[i].score;
                melhorJogada = i;
            }
        }
    } else {
        let melhorScore = +Infinity;
        for (let i = 0; i < jogadas.length; i++) {
            if (jogadas[i].score < melhorScore) {
                melhorScore = jogadas[i].score;
                melhorJogada = i;
            }
        }
    }
    return jogadas[melhorJogada];
};

const verificarVitoriaMinimax = (tabuleiro, jogador) => {
    return condicoesVitoria.some(condicao => {
        const [a, b, c] = condicao;
        return tabuleiro[a] === jogador && tabuleiro[b] === jogador && tabuleiro[c] === jogador;
    });
};

const vezDaMaquina = () => {
    if (jogoAtivo && modoDeJogo === 'maquina' && jogadorAtual === 'O') {
        setTimeout(() => {
            let jogada;
            if (dificuldade === 'facil') {
                jogada = jogadaAleatoria();
            } else if (dificuldade === 'medio') {
                jogada = jogadaMedia();
            } else if (dificuldade === 'dificil') {
                jogada = jogadaDificil();
            }

            if (jogada !== undefined) {
                fazerJogada(jogada, 'O');
                if (!verificarVitoria() && !verificarEmpate()) {
                    alternarJogador();
                }
            }
        }, 500);
    }
};

// 5. Eventos e fluxo do jogo
const lidarComClique = (e) => {
    const indice = e.target.dataset.celulaIndice;

    if (fazerJogada(indice, jogadorAtual)) {
        if (verificarVitoria()) {
            return;
        }
        if (verificarEmpate()) {
            return;
        }
        
        alternarJogador();
        vezDaMaquina();
    }
};

const iniciarPartida = () => {
    reiniciarJogo();
    // Decide aleatoriamente quem começa
    jogadorAtual = Math.random() < 0.5 ? 'X' : 'O';
    mensagemStatus.textContent = `Vez do '${jogadorAtual}'`;
    
    // Mostra o jogo e adiciona event listeners
    opcoesJogoDiv.classList.add('hidden');
    opcoesDificuldadeDiv.classList.add('hidden');
    jogoDiv.classList.remove('hidden');
    celulas.forEach(celula => celula.addEventListener('click', lidarComClique));

    // Se a máquina começar, faz a primeira jogada
    if (modoDeJogo === 'maquina' && jogadorAtual === 'O') {
        vezDaMaquina();
    }
};

// Event listeners para a transição de telas e botões
btnMaquina.addEventListener('click', () => {
    modoDeJogo = 'maquina';
    opcoesJogoDiv.classList.add('hidden');
    opcoesDificuldadeDiv.classList.remove('hidden');
});

btnJogador.addEventListener('click', () => {
    modoDeJogo = 'jogador';
    iniciarPartida();
});

btnFacil.addEventListener('click', () => {
    dificuldade = 'facil';
    iniciarPartida();
});

btnMedio.addEventListener('click', () => {
    dificuldade = 'medio';
    iniciarPartida();
});

btnDificil.addEventListener('click', () => {
    dificuldade = 'dificil';
    iniciarPartida();
});

btnReiniciar.addEventListener('click', () => {
    // Altera a lógica do reiniciar
    reiniciarJogo();
    jogoDiv.classList.add('hidden');
    opcoesJogoDiv.classList.remove('hidden');
    celulas.forEach(celula => celula.removeEventListener('click', lidarComClique));
});

// A primeira jogada da máquina agora é chamada dentro de iniciarPartida()