const botaoTreino = document.getElementById('btnTreino');
botaoTreino.addEventListener('click', exibirDataTreinos);

const botaoFeito = document.getElementById('btnFeito');
botaoFeito.addEventListener('click', marcarComoFeito);
botaoFeito.disabled = true; // Botão inicia desabilitado

const botaoHistorico = document.getElementById('btnHistorico');
botaoHistorico.addEventListener('click', exibirHistorico);

const botaoLimparHistorico = document.getElementById('btnLimparHistorico');
botaoLimparHistorico.addEventListener('click', limparHistorico);
botaoLimparHistorico.disabled = true; // Botão inicia desabilitado

const diasDaSemana = ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'];

function retornaDiaDaSemana() {

    let data = new Date();
    let dia = data.getDay();
    let diaSemana = diasDaSemana[dia];

    return diaSemana;
}

function treinosLucas() {

    let treino = '';

    switch (retornaDiaDaSemana()) {

        case 'Segunda-feira':
            treino = 'Praticar 50 abdominais!';
            break;
        case 'Terça-feira':
            treino = 'Praticar 50 flexões!';
            break;
        case 'Quarta-feira':
            treino = 'Praticar 50 polichinelos!';
            break;
        case 'Quinta-feira':
            treino = 'Praticar 50 agaxamentos!';
            break;
        case 'Sexta-feira':
            treino = 'Praticar 25 abdominais e 25 flexões!';
            break;
        case 'Sábado':
            treino = 'Dia de folga!';
            break;
        case 'Domingo':
            treino = 'Dia de folga!';
            break;

        default:
            treino = 'Caso inválido!';
            break;
    }

    return treino;
}

function exibirDataTreinos() {

    let exibeData = document.getElementById('data-atual');
    let exibeTreino = document.getElementById('exibe-treino');

    exibeData.innerHTML = `Hoje é ${retornaDiaDaSemana()}`;
    exibeTreino.innerHTML = `Você deve ${treinosLucas()}`;

    botaoFeito.disabled = false;
    botaoFeito.style.backgroundColor = 'green';
}

function limpar() {

    let exibeData = document.getElementById('data-atual');
    let exibeTreino = document.getElementById('exibe-treino');

    exibeData.innerHTML = ``;
    exibeTreino.innerHTML = ``;
}

function limparTelaHistorico() {

    let exibeHistorico = document.getElementById('exibe-historico');
    let exibeHistoricoFeito = document.getElementById('exibe-historico-feito');

    exibeHistorico.innerHTML = '';
    exibeHistoricoFeito.innerHTML = '';
}

async function marcarComoFeito() {
    // Salva o treino atual no histórico
    await salvarHistorico(retornaDiaDaSemana(), treinosLucas());

    // Limpa a exibição
    limpar();

    botaoFeito.disabled = true;
    botaoFeito.style.backgroundColor = '#474747';
}

/*
// Versão local
function salvarHistorico(dia, treino) {
    let historico = JSON.parse(localStorage.getItem('historicoTreinos')) || [];
    let dataAtual = new Date().toLocaleDateString('pt-BR');

    // Verifica se já existe uma entrada para o dia atual
    let jaSalvo = historico.some(item => item.data === dataAtual);

    if (!jaSalvo) {
        historico.push({ data: dataAtual, dia: dia, treino: treino });
        localStorage.setItem('historicoTreinos', JSON.stringify(historico));
        alert('Treino salvo no histórico!');
    } else {
        alert('Treino de hoje já foi salvo!');
    }
}
*/

// Versão para Supabase (uso na nuvem):
async function salvarHistorico(dia, treino) {
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    const { error } = await window.supabase.from('historicoTreinos').insert([{ data: dataAtual, dia, treino }]);
    if (error) {
        alert('Erro ao salvar: ' + error.message);
    } else {
        alert('Treino salvo no histórico!');
    }
}

/*
// Versão local
function exibirHistorico() {
    let historico = JSON.parse(localStorage.getItem('historicoTreinos')) || [];
    let exibeHistorico = document.getElementById('exibe-historico');
    let exibeHistoricoFeito = document.getElementById('exibe-historico-feito');

    if (historico.length === 0) {
        alert('Histórico vazio');
        return;
    } else if (historico.length > 0) {
        botaoLimparHistorico.disabled = false;
    }

    exibeHistorico.innerHTML = 'Histórico de Treinos:';
    exibeHistoricoFeito.innerHTML = historico.map(item => `${item.data} (${item.dia}): ${item.treino} - OK!`).join('<br>');
}
*/

async function limparHistorico() {
    if (confirm('Tem certeza que deseja limpar todo o histórico de treinos?')) {
        const { error } = await window.supabase.from('historicoTreinos').delete().neq('id', 0); // Deleta todos os registros
        if (error) {
            alert('Erro ao limpar histórico: ' + error.message);
        } else {
            alert('Histórico limpo!');
            limparTelaHistorico(); // Limpa a tela também
            botaoLimparHistorico.disabled = true;
        }
    }
}

// Versão para Supabase (uso na nuvem):
async function exibirHistorico() {
    const { data: historico, error } = await window.supabase.from('historicoTreinos').select('*');
    if (error) {
        alert('Erro ao carregar histórico: ' + error.message);
        return;
    }

    let exibeHistorico = document.getElementById('exibe-historico');
    let exibeHistoricoFeito = document.getElementById('exibe-historico-feito');

    if (!historico || historico.length === 0) {
        exibeHistorico.innerHTML = 'Histórico vazio';
        exibeHistoricoFeito.innerHTML = 'Nenhum treino marcado como feito ainda.';
        return;
    }

    exibeHistorico.innerHTML = 'Histórico de Treinos:';
    exibeHistoricoFeito.innerHTML = historico.map(item => `${item.data} (${item.dia}): ${item.treino} - OK!`).join('<br>');
}