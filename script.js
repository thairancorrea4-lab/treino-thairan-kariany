import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  push,
  update
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

import { firebaseConfig, databasePath } from "./firebase-config.js";

const usuarios = ["Thairan Gostosão ", "Kariany"];

const treinosProntosKariany = {
  "dia-1": {
    nome: "Dia 1 - Pernas e Glúteos | Ênfase em Quadríceps",
    exercicios: [
      { nome: "Agachamento livre", series: "4", repeticoes: "8-10", observacao: "Aumentar a carga progressivamente" },
      { nome: "Leg press 45º", series: "4", repeticoes: "12", observacao: "Última série drop set" },
      { nome: "Afundo búlgaro com halteres", series: "3", repeticoes: "10 cada perna", observacao: "" },
      { nome: "Cadeira extensora", series: "3", repeticoes: "12-15", observacao: "" },
      { nome: "Agachamento hack", series: "3", repeticoes: "12-15", observacao: "" },
      { nome: "Panturrilha no Smith", series: "4", repeticoes: "15-20", observacao: "" },
      { nome: "Esteira", series: "1", repeticoes: "15 min", observacao: "Finalização" }
    ]
  },
  "dia-2": {
    nome: "Dia 2 - Superiores | Ênfase em Costas e Ombros",
    exercicios: [
      { nome: "Barra fixa ou puxador frontal", series: "4", repeticoes: "8-10", observacao: "" },
      { nome: "Remada curvada com barra", series: "3", repeticoes: "12", observacao: "" },
      { nome: "Desenvolvimento militar com halteres", series: "4", repeticoes: "10", observacao: "" },
      { nome: "Elevação lateral + frontal", series: "3", repeticoes: "12 cada", observacao: "Bi-set" },
      { nome: "Crucifixo com halteres", series: "3", repeticoes: "12-15", observacao: "" },
      { nome: "Tríceps francês halteres", series: "3", repeticoes: "12-15", observacao: "" },
      { nome: "Esteira", series: "1", repeticoes: "15 min", observacao: "Finalização" }
    ]
  },
  "dia-3": {
    nome: "Dia 3 - Pernas e Glúteos | Ênfase em Posterior e Glúteos",
    exercicios: [
      { nome: "Glúteo na máquina ou elevação pélvica", series: "4", repeticoes: "10-12", observacao: "Última série drop set" },
      { nome: "Cadeira flexora", series: "3", repeticoes: "12-15", observacao: "" },
      { nome: "Passada longa com halteres", series: "3", repeticoes: "10 cada perna", observacao: "" },
      { nome: "Mesa flexora", series: "4", repeticoes: "10-12", observacao: "Última série drop set" },
      { nome: "Stiff com halteres", series: "", repeticoes: "", observacao: "Progressão de carga" },
      { nome: "Cadeira abdutora", series: "4", repeticoes: "10", observacao: "" },
      { nome: "Panturrilha sentado", series: "4", repeticoes: "15-20", observacao: "" },
      { nome: "Abdominal infra com caneleira", series: "4", repeticoes: "12", observacao: "" },
      { nome: "Bike", series: "1", repeticoes: "15 min", observacao: "Alta intensidade" }
    ]
  },
  "dia-4": {
    nome: "Dia 4 - Superiores | Ênfase em Braços e Ombros",
    exercicios: [
      { nome: "Supino reto com halteres", series: "4", repeticoes: "10", observacao: "" },
      { nome: "Rosca martelo com halteres", series: "3", repeticoes: "12", observacao: "" },
      { nome: "Tríceps testa com barra W", series: "3", repeticoes: "12", observacao: "" },
      { nome: "Crucifixo invertido", series: "3", repeticoes: "12-15", observacao: "" },
      { nome: "Mergulho no banco", series: "3", repeticoes: "10-12", observacao: "Tríceps" },
      { nome: "Desenvolvimento com halteres", series: "3", repeticoes: "10", observacao: "" },
      { nome: "Rosca direta no Cross Over", series: "3", repeticoes: "10", observacao: "" },
      { nome: "Abdominal oblíquo solo com anilha", series: "3", repeticoes: "12", observacao: "" },
      { nome: "HIIT", series: "1", repeticoes: "15 min", observacao: "Bike ou escada" }
    ]
  },
  "dia-5": {
    nome: "Dia 5 - Pernas e Glúteos | Treino Completo",
    exercicios: [
      { nome: "Agachamento sumô com halteres", series: "4", repeticoes: "12", observacao: "" },
      { nome: "Stiff com barra", series: "3", repeticoes: "12", observacao: "" },
      { nome: "Cadeira extensora + mesa flexora", series: "3", repeticoes: "12 cada", observacao: "Bi-set" },
      { nome: "Elevação pélvica máquina", series: "4", repeticoes: "8-10", observacao: "Máxima carga possível" },
      { nome: "Cadeira adutora", series: "4", repeticoes: "10", observacao: "" },
      { nome: "Levantamento terra sumô", series: "4", repeticoes: "10-12", observacao: "Tronco inclinado à frente, projetando glúteo para trás" },
      { nome: "Panturrilha no Smith", series: "3", repeticoes: "15", observacao: "" }
    ]
  }
};


const diasSemana = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado"
];

const diasSemanaCurtos = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

let usuarioAtivo = "Thairan Gostosão ";
let exerciciosForm = [];
let treinos = [];
let usandoFirebase = false;
let treinosRef = null;
let databaseGlobal = null;
let editandoId = null;

const elementos = {
  statusFirebase: document.getElementById("statusFirebase"),
  tabs: document.querySelectorAll(".tab"),
  exportarCsv: document.getElementById("exportarCsv"),
  nomeCard: document.getElementById("nomeCard"),
  totalTreinos: document.getElementById("totalTreinos"),
  diasTreinados: document.getElementById("diasTreinados"),
  totalExercicios: document.getElementById("totalExercicios"),
  usuarioFormulario: document.getElementById("usuarioFormulario"),
  tituloHistorico: document.getElementById("tituloHistorico"),
  formTreino: document.getElementById("formTreino"),
  dataTreino: document.getElementById("dataTreino"),
  diaSemana: document.getElementById("diaSemana"),
  tipoTreino: document.getElementById("tipoTreino"),
  observacoes: document.getElementById("observacoes"),
  listaExercicios: document.getElementById("listaExercicios"),
  adicionarExercicio: document.getElementById("adicionarExercicio"),
  botaoSalvarTreino: document.getElementById("botaoSalvarTreino"),
  busca: document.getElementById("busca"),
  historico: document.getElementById("historico"),
  calendarioFrequencia: document.getElementById("calendarioFrequencia"),
  buscaEvolucao: document.getElementById("buscaEvolucao"),
  graficoEvolucao: document.getElementById("graficoEvolucao"),
  periodoSemana: document.getElementById("periodoSemana"),
  resultadoSemana: document.getElementById("resultadoSemana"),
  subtituloResultado: document.getElementById("subtituloResultado"),
  totalThairan: document.getElementById("totalThairan"),
  totalKariany: document.getElementById("totalKariany"),
  semanaThairan: document.getElementById("semanaThairan"),
  semanaKariany: document.getElementById("semanaKariany"),
  semanaThairanNumero: document.getElementById("semanaThairanNumero"),
  semanaKarianyNumero: document.getElementById("semanaKarianyNumero")
};

iniciar();

function iniciar() {
  elementos.dataTreino.value = hojeISO();
  elementos.diaSemana.value = getDiaSemana(elementos.dataTreino.value);
  adicionarExercicio();

  elementos.tabs.forEach((tab) => {
    tab.addEventListener("click", () => trocarUsuario(tab.dataset.usuario));
  });

  elementos.dataTreino.addEventListener("change", () => {
    elementos.diaSemana.value = getDiaSemana(elementos.dataTreino.value);
  });

  elementos.adicionarExercicio.addEventListener("click", adicionarExercicio);
  elementos.formTreino.addEventListener("submit", salvarTreino);
  elementos.busca.addEventListener("input", renderizarTudo);
  elementos.exportarCsv.addEventListener("click", exportarCSV);

  criarCampoTreinoProntoKariany();

  if (elementos.buscaEvolucao) {
    elementos.buscaEvolucao.addEventListener("input", renderizarGraficoEvolucao);
  }

  conectarFirebase();
}

function firebaseFoiConfigurado() {
  return (
    firebaseConfig &&
    firebaseConfig.apiKey &&
    !firebaseConfig.apiKey.includes("COLE_") &&
    firebaseConfig.databaseURL &&
    !firebaseConfig.databaseURL.includes("COLE_")
  );
}

function conectarFirebase() {
  if (!firebaseFoiConfigurado()) {
    usandoFirebase = false;
    elementos.statusFirebase.textContent = "Firebase não configurado: usando modo local neste navegador";
    elementos.statusFirebase.classList.add("local");
    treinos = carregarTreinosLocais();
    renderizarTudo();
    return;
  }

  try {
    const app = initializeApp(firebaseConfig);
    databaseGlobal = getDatabase(app);
    treinosRef = ref(databaseGlobal, `${databasePath}/treinos`);

    usandoFirebase = true;
    elementos.statusFirebase.textContent = "Conectado em tempo real";
    elementos.statusFirebase.classList.remove("local", "erro");

    onValue(
      treinosRef,
      (snapshot) => {
        const dados = snapshot.val() || {};

        treinos = Object.entries(dados).map(([id, treino]) => ({
          id,
          ...treino
        }));

        renderizarTudo();
      },
      (erro) => {
        usandoFirebase = false;
        elementos.statusFirebase.textContent = "Erro ao conectar no Firebase. Verifique as regras e a configuração.";
        elementos.statusFirebase.classList.add("erro");
        console.error(erro);
        treinos = carregarTreinosLocais();
        renderizarTudo();
      }
    );
  } catch (erro) {
    usandoFirebase = false;
    elementos.statusFirebase.textContent = "Erro na configuração do Firebase. Confira o arquivo firebase-config.js";
    elementos.statusFirebase.classList.add("erro");
    console.error(erro);
    treinos = carregarTreinosLocais();
    renderizarTudo();
  }
}

function carregarTreinosLocais() {
  try {
    const salvos = localStorage.getItem("controle-treinos-thairan-kariany");
    return salvos ? JSON.parse(salvos) : [];
  } catch {
    return [];
  }
}

function salvarTreinosLocais() {
  localStorage.setItem("controle-treinos-thairan-kariany", JSON.stringify(treinos));
}

function criarId() {
  if (window.crypto && crypto.randomUUID) {
    return crypto.randomUUID();
  }

  return String(Date.now()) + String(Math.random()).replace(".", "");
}

function hojeISO() {
  const data = new Date();
  return dataParaISO(data);
}

function getDataLocal(dataISO) {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

function getDiaSemana(dataISO) {
  if (!dataISO) return "";
  return diasSemana[getDataLocal(dataISO).getDay()];
}

function formatarDataBR(dataISO) {
  if (!dataISO) return "";
  return dataISO.split("-").reverse().join("/");
}

function dataParaISO(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function getInicioSemana(data = new Date()) {
  const copia = new Date(data.getFullYear(), data.getMonth(), data.getDate());
  const dia = copia.getDay();
  const diferenca = dia === 0 ? -6 : 1 - dia;
  copia.setDate(copia.getDate() + diferenca);
  return copia;
}

function getFimSemana(data = new Date()) {
  const inicio = getInicioSemana(data);
  const fim = new Date(inicio);
  fim.setDate(inicio.getDate() + 6);
  return fim;
}

function treinoNaSemanaAtual(dataTreino) {
  const data = getDataLocal(dataTreino);
  const inicio = getInicioSemana();
  const fim = getFimSemana();
  return data >= inicio && data <= fim;
}

function normalizarTexto(texto) {
  return String(texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function extrairNumero(valor) {
  const match = String(valor || "").replace(",", ".").match(/[\d.]+/);
  return match ? Number(match[0]) : 0;
}

function trocarUsuario(usuario) {
  usuarioAtivo = usuario;

  elementos.tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.usuario === usuarioAtivo);
  });

  elementos.busca.value = "";
  limparFormulario();
  atualizarCampoTreinoProntoKariany();
  renderizarTudo();
}

function limparFormulario() {
  editandoId = null;
  elementos.dataTreino.value = hojeISO();
  elementos.diaSemana.value = getDiaSemana(elementos.dataTreino.value);
  elementos.tipoTreino.value = "";
  const treinoProntoKariany = document.getElementById("treinoProntoKariany");
  if (treinoProntoKariany) treinoProntoKariany.value = "";
  elementos.observacoes.value = "";
  exerciciosForm = [];
  elementos.listaExercicios.innerHTML = "";
  adicionarExercicio();

  if (elementos.botaoSalvarTreino) {
    elementos.botaoSalvarTreino.textContent = `Salvar treino`;
  }

  const cancelar = document.getElementById("cancelarEdicao");
  if (cancelar) {
    cancelar.remove();
  }
}


function criarCampoTreinoProntoKariany() {
  if (document.getElementById("grupoTreinoProntoKariany")) {
    atualizarCampoTreinoProntoKariany();
    return;
  }

  const labelTipoTreino = elementos.tipoTreino?.closest("label");
  if (!labelTipoTreino) return;

  const grupo = document.createElement("label");
  grupo.id = "grupoTreinoProntoKariany";
  grupo.innerHTML = `
    Selecionar treino da Kariany
    <select id="treinoProntoKariany">
      <option value="">Selecionar dia do treino...</option>
      <option value="dia-1">Dia 1 - Pernas e Glúteos | Quadríceps</option>
      <option value="dia-2">Dia 2 - Superiores | Costas e Ombros</option>
      <option value="dia-3">Dia 3 - Pernas e Glúteos | Posterior e Glúteos</option>
      <option value="dia-4">Dia 4 - Superiores | Braços e Ombros</option>
      <option value="dia-5">Dia 5 - Pernas e Glúteos | Completo</option>
    </select>
  `;

  labelTipoTreino.insertAdjacentElement("afterend", grupo);

  const select = document.getElementById("treinoProntoKariany");
  select.addEventListener("change", aplicarTreinoProntoKariany);

  adicionarEstiloTreinoProntoKariany();
  atualizarCampoTreinoProntoKariany();
}

function atualizarCampoTreinoProntoKariany() {
  const grupo = document.getElementById("grupoTreinoProntoKariany");
  const select = document.getElementById("treinoProntoKariany");
  if (!grupo) return;

  const mostrar = usuarioAtivo === "Kariany";
  grupo.style.display = mostrar ? "block" : "none";

  if (!mostrar && select) {
    select.value = "";
  }
}

function adicionarEstiloTreinoProntoKariany() {
  if (document.getElementById("estiloTreinoProntoKariany")) return;

  const style = document.createElement("style");
  style.id = "estiloTreinoProntoKariany";
  style.textContent = `
    #grupoTreinoProntoKariany select {
      width: 100%;
      margin-top: 8px;
      border: 1px solid #3f3f46;
      outline: none;
      border-radius: 16px;
      background: #050505;
      color: #fff;
      padding: 14px;
      transition: 0.2s ease;
      appearance: none;
      background-image:
        linear-gradient(45deg, transparent 50%, #a3a3a3 50%),
        linear-gradient(135deg, #a3a3a3 50%, transparent 50%);
      background-position:
        calc(100% - 20px) calc(50% - 3px),
        calc(100% - 14px) calc(50% - 3px);
      background-size: 6px 6px, 6px 6px;
      background-repeat: no-repeat;
      padding-right: 44px;
    }

    #grupoTreinoProntoKariany select:focus {
      border-color: #a3e635;
    }

    .aviso-treino-pronto {
      margin-top: 10px;
      color: #a3e635;
      font-size: 13px;
      font-weight: 700;
    }
  `;

  document.head.appendChild(style);
}

function aplicarTreinoProntoKariany() {
  const select = document.getElementById("treinoProntoKariany");
  const chave = select?.value;
  if (!chave || !treinosProntosKariany[chave]) return;

  const modelo = treinosProntosKariany[chave];

  elementos.tipoTreino.value = modelo.nome;

  exerciciosForm = modelo.exercicios.map((exercicio) => ({
    id: criarId(),
    nome: exercicio.nome,
    carga: "",
    series: exercicio.series,
    repeticoes: exercicio.repeticoes,
    observacao: exercicio.observacao
  }));

  renderizarExerciciosFormulario();

  const avisoAntigo = document.getElementById("avisoTreinoProntoKariany");
  if (avisoAntigo) avisoAntigo.remove();

  const aviso = document.createElement("p");
  aviso.id = "avisoTreinoProntoKariany";
  aviso.className = "aviso-treino-pronto";
  aviso.textContent = "Treino carregado. Agora é só preencher carga, ajustar repetições se precisar e salvar.";
  elementos.listaExercicios.insertAdjacentElement("beforebegin", aviso);

  setTimeout(() => {
    const avisoAtual = document.getElementById("avisoTreinoProntoKariany");
    if (avisoAtual) avisoAtual.remove();
  }, 4000);
}


function adicionarExercicio() {
  exerciciosForm.push({
    id: criarId(),
    nome: "",
    carga: "",
    series: "",
    repeticoes: "",
    observacao: ""
  });

  renderizarExerciciosFormulario();
}

function removerExercicio(id) {
  if (exerciciosForm.length === 1) return;
  exerciciosForm = exerciciosForm.filter((exercicio) => exercicio.id !== id);
  renderizarExerciciosFormulario();
}

function atualizarExercicio(id, campo, valor) {
  exerciciosForm = exerciciosForm.map((exercicio) => {
    if (exercicio.id === id) {
      return {
        ...exercicio,
        [campo]: valor
      };
    }

    return exercicio;
  });
}

function renderizarExerciciosFormulario() {
  elementos.listaExercicios.innerHTML = "";

  exerciciosForm.forEach((exercicio, index) => {
    const box = document.createElement("div");
    box.className = "exercicio-box";

    box.innerHTML = `
      <div class="exercicio-top">
        <strong>Exercício ${index + 1}</strong>
        <button type="button" class="btn-remover">Remover</button>
      </div>

      <div class="exercicio-grid">
        <input type="text" placeholder="Nome do exercício" data-campo="nome" value="${escaparHTML(exercicio.nome)}" />
        <input type="text" placeholder="Carga / peso" data-campo="carga" value="${escaparHTML(exercicio.carga)}" />
        <input type="text" placeholder="Séries" data-campo="series" value="${escaparHTML(exercicio.series)}" />
        <input type="text" placeholder="Repetições" data-campo="repeticoes" value="${escaparHTML(exercicio.repeticoes)}" />
        <input type="text" placeholder="Observação" data-campo="observacao" value="${escaparHTML(exercicio.observacao)}" />
      </div>
    `;

    box.querySelector(".btn-remover").addEventListener("click", () => removerExercicio(exercicio.id));

    box.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", (event) => {
        atualizarExercicio(exercicio.id, event.target.dataset.campo, event.target.value);
      });
    });

    elementos.listaExercicios.appendChild(box);
  });
}

async function salvarTreino(event) {
  event.preventDefault();

  const exerciciosValidos = exerciciosForm.filter((exercicio) => exercicio.nome.trim() !== "");

  if (!elementos.dataTreino.value || exerciciosValidos.length === 0) {
    alert("Preencha a data e pelo menos um exercício.");
    return;
  }

  const treino = {
    usuario: usuarioAtivo,
    data: elementos.dataTreino.value,
    tipoTreino: elementos.tipoTreino.value.trim(),
    observacoes: elementos.observacoes.value.trim(),
    exercicios: exerciciosValidos,
    atualizadoEm: new Date().toISOString()
  };

  try {
    if (editandoId) {
      if (usandoFirebase && databaseGlobal) {
        await update(ref(databaseGlobal, `${databasePath}/treinos/${editandoId}`), treino);
      } else {
        treinos = treinos.map((item) => item.id === editandoId ? { id: editandoId, ...treino } : item);
        salvarTreinosLocais();
        renderizarTudo();
      }
    } else {
      treino.criadoEm = new Date().toISOString();

      if (usandoFirebase && treinosRef) {
        await push(treinosRef, treino);
      } else {
        treinos.unshift({
          id: criarId(),
          ...treino
        });
        salvarTreinosLocais();
        renderizarTudo();
      }
    }

    limparFormulario();
  } catch (erro) {
    alert("Não foi possível salvar. Verifique a configuração do Firebase.");
    console.error(erro);
  }
}

function editarTreino(id) {
  const treino = treinos.find((item) => item.id === id);
  if (!treino) return;

  editandoId = id;
  usuarioAtivo = treino.usuario;

  elementos.tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.usuario === usuarioAtivo);
  });

  elementos.dataTreino.value = treino.data || hojeISO();
  elementos.diaSemana.value = getDiaSemana(elementos.dataTreino.value);
  elementos.tipoTreino.value = treino.tipoTreino || "";
  const treinoProntoKariany = document.getElementById("treinoProntoKariany");
  if (treinoProntoKariany) treinoProntoKariany.value = "";
  elementos.observacoes.value = treino.observacoes || "";
  exerciciosForm = (treino.exercicios || []).map((exercicio) => ({
    id: exercicio.id || criarId(),
    nome: exercicio.nome || "",
    carga: exercicio.carga || "",
    series: exercicio.series || "",
    repeticoes: exercicio.repeticoes || "",
    observacao: exercicio.observacao || ""
  }));

  if (exerciciosForm.length === 0) {
    exerciciosForm = [{
      id: criarId(),
      nome: "",
      carga: "",
      series: "",
      repeticoes: "",
      observacao: ""
    }];
  }

  renderizarExerciciosFormulario();
  atualizarCampoTreinoProntoKariany();
  renderizarTudo();

  if (elementos.botaoSalvarTreino) {
    elementos.botaoSalvarTreino.textContent = "Atualizar treino";
  }

  if (!document.getElementById("cancelarEdicao")) {
    const cancelar = document.createElement("button");
    cancelar.type = "button";
    cancelar.id = "cancelarEdicao";
    cancelar.className = "btn-cancelar";
    cancelar.textContent = "Cancelar edição";
    cancelar.addEventListener("click", limparFormulario);
    elementos.botaoSalvarTreino.insertAdjacentElement("afterend", cancelar);
  }

  elementos.formTreino.scrollIntoView({ behavior: "smooth", block: "start" });
}

function getTreinosUsuario(usuario) {
  return treinos.filter((treino) => treino.usuario === usuario);
}

function renderizarTudo() {
  renderizarTopo();
  renderizarHistorico();
  renderizarCalendario();
  renderizarGraficoEvolucao();
  renderizarDisputa();
}

function renderizarTopo() {
  const treinosUsuario = getTreinosUsuario(usuarioAtivo);
  const diasUnicos = new Set(treinosUsuario.map((treino) => treino.data)).size;
  const totalExercicios = treinosUsuario.reduce((total, treino) => total + treino.exercicios.length, 0);

  elementos.nomeCard.textContent = usuarioAtivo;
  elementos.usuarioFormulario.textContent = usuarioAtivo;
  elementos.tituloHistorico.textContent = `Histórico de ${usuarioAtivo}`;
  elementos.totalTreinos.textContent = treinosUsuario.length;
  elementos.diasTreinados.textContent = diasUnicos;
  elementos.totalExercicios.textContent = totalExercicios;

  elementos.exportarCsv.textContent = `Exportar CSV de ${usuarioAtivo}`;
  elementos.exportarCsv.disabled = treinosUsuario.length === 0;
}

function renderizarHistorico() {
  const busca = elementos.busca.value.toLowerCase().trim();

  const treinosFiltrados = getTreinosUsuario(usuarioAtivo)
    .filter((treino) => {
      const texto = [
        treino.data,
        treino.tipoTreino,
        treino.observacoes,
        ...treino.exercicios.map((exercicio) => `${exercicio.nome} ${exercicio.carga} ${exercicio.series} ${exercicio.repeticoes}`)
      ]
        .join(" ")
        .toLowerCase();

      return texto.includes(busca);
    })
    .sort((a, b) => b.data.localeCompare(a.data));

  if (treinosFiltrados.length === 0) {
    elementos.historico.className = "historico-vazio";
    elementos.historico.innerHTML = `Nenhum treino registrado para ${usuarioAtivo} ainda.`;
    return;
  }

  elementos.historico.className = "";

  elementos.historico.innerHTML = treinosFiltrados
    .map((treino) => {
      const linhas = treino.exercicios
        .map(
          (exercicio) => `
            <tr>
              <td>
                <strong>${escaparHTML(exercicio.nome)}</strong>
                ${exercicio.observacao ? `<small>${escaparHTML(exercicio.observacao)}</small>` : ""}
              </td>
              <td>${escaparHTML(exercicio.carga || "-")}</td>
              <td>${escaparHTML(exercicio.series || "-")}</td>
              <td>${escaparHTML(exercicio.repeticoes || "-")}</td>
            </tr>
          `
        )
        .join("");

      return `
        <article class="treino-card">
          <div class="treino-head">
            <div>
              <div class="dia">${getDiaSemana(treino.data)}</div>
              <h3>${formatarDataBR(treino.data)}</h3>
              ${treino.tipoTreino ? `<p>${escaparHTML(treino.tipoTreino)}</p>` : ""}
            </div>

            <button class="btn-edit" data-id="${treino.id}">Editar</button>
          </div>

          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Exercício</th>
                  <th>Carga</th>
                  <th>Séries</th>
                  <th>Reps</th>
                </tr>
              </thead>
              <tbody>${linhas}</tbody>
            </table>
          </div>

          ${treino.observacoes ? `<p class="obs">${escaparHTML(treino.observacoes)}</p>` : ""}
        </article>
      `;
    })
    .join("");

  elementos.historico.querySelectorAll(".btn-edit").forEach((botao) => {
    botao.addEventListener("click", () => editarTreino(botao.dataset.id));
  });
}

function renderizarCalendario() {
  if (!elementos.calendarioFrequencia) return;

  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = hoje.getMonth();
  const totalDias = new Date(ano, mes + 1, 0).getDate();
  const primeiroDia = new Date(ano, mes, 1).getDay();
  const espacosInicio = primeiroDia === 0 ? 6 : primeiroDia - 1;

  elementos.calendarioFrequencia.innerHTML = usuarios.map((usuario) => {
    const treinosUsuario = getTreinosUsuario(usuario);
    const diasTreinados = new Set(
      treinosUsuario
        .filter((treino) => {
          const data = getDataLocal(treino.data);
          return data.getFullYear() === ano && data.getMonth() === mes;
        })
        .map((treino) => getDataLocal(treino.data).getDate())
    );

    const labels = diasSemanaCurtos.map((dia) => `<div class="dia-semana-label">${dia}</div>`).join("");
    const vazios = Array.from({ length: espacosInicio }, () => `<div class="dia-calendario vazio"></div>`).join("");
    const dias = Array.from({ length: totalDias }, (_, i) => {
      const dia = i + 1;
      const treinado = diasTreinados.has(dia);
      return `<div class="dia-calendario ${treinado ? "treinado" : ""}">${treinado ? "✓ " : ""}${dia}</div>`;
    }).join("");

    return `
      <div class="calendario-pessoa">
        <div class="calendario-head">
          <h3>${escaparHTML(usuario)}</h3>
          <span>${diasTreinados.size} dia${diasTreinados.size === 1 ? "" : "s"} treinado${diasTreinados.size === 1 ? "" : "s"} no mês</span>
        </div>
        <div class="calendario-grid">
          ${labels}
          ${vazios}
          ${dias}
        </div>
      </div>
    `;
  }).join("");
}

function renderizarGraficoEvolucao() {
  if (!elementos.graficoEvolucao) return;

  const termo = normalizarTexto(elementos.buscaEvolucao?.value || "");
  const treinosUsuario = getTreinosUsuario(usuarioAtivo);

  if (!termo) {
    elementos.graficoEvolucao.innerHTML = `<div class="grafico-vazio">Digite o nome de um exercício para ver a evolução de carga de ${escaparHTML(usuarioAtivo)}.</div>`;
    return;
  }

  const registros = [];

  treinosUsuario.forEach((treino) => {
    treino.exercicios.forEach((exercicio) => {
      const nome = normalizarTexto(exercicio.nome);
      const carga = extrairNumero(exercicio.carga);

      if (nome.includes(termo) && carga > 0) {
        registros.push({
          data: treino.data,
          nome: exercicio.nome,
          carga
        });
      }
    });
  });

  registros.sort((a, b) => a.data.localeCompare(b.data));

  if (registros.length === 0) {
    elementos.graficoEvolucao.innerHTML = `<div class="grafico-vazio">Nenhum registro encontrado para este exercício.</div>`;
    return;
  }

  const maiorCarga = Math.max(...registros.map((item) => item.carga));
  const primeiraCarga = registros[0].carga;
  const ultimaCarga = registros[registros.length - 1].carga;
  const diferenca = ultimaCarga - primeiraCarga;

  const barras = registros.map((item) => {
    const largura = Math.max(8, (item.carga / maiorCarga) * 100);

    return `
      <div class="barra-item">
        <div class="barra-data">${formatarDataBR(item.data)}</div>
        <div class="barra-fundo">
          <div class="barra-preenchida" style="width:${largura}%"></div>
        </div>
        <div class="barra-carga">${item.carga} kg</div>
      </div>
    `;
  }).join("");

  elementos.graficoEvolucao.innerHTML = `
    <div class="grafico-linha">
      <div class="grafico-info">
        <strong>${escaparHTML(usuarioAtivo)}</strong>
        <span>${registros.length} registro${registros.length === 1 ? "" : "s"} | Evolução: ${diferenca >= 0 ? "+" : ""}${diferenca} kg</span>
      </div>
      <div class="barras">${barras}</div>
    </div>
  `;
}

function renderizarDisputa() {
  const inicioSemana = dataParaISO(getInicioSemana());
  const fimSemana = dataParaISO(getFimSemana());

  if (elementos.periodoSemana) {
    elementos.periodoSemana.textContent = `Semana atual: ${formatarDataBR(inicioSemana)} até ${formatarDataBR(fimSemana)}.`;
  }

  const dados = usuarios.map((usuario) => {
    const treinosUsuario = getTreinosUsuario(usuario);
    const treinosSemana = treinosUsuario.filter((treino) => treinoNaSemanaAtual(treino.data));

    return {
      usuario,
      total: treinosUsuario.length,
      semana: treinosSemana.length
    };
  });

  const usuario1 = dados[0] || { usuario: usuarios[0], total: 0, semana: 0 };
  const usuario2 = dados[1] || { usuario: usuarios[1], total: 0, semana: 0 };

  if (elementos.totalThairan) elementos.totalThairan.textContent = usuario1.total;
  if (elementos.totalKariany) elementos.totalKariany.textContent = usuario2.total;

  if (elementos.semanaThairan) elementos.semanaThairan.textContent = `${usuario1.semana}x na semana`;
  if (elementos.semanaKariany) elementos.semanaKariany.textContent = `${usuario2.semana}x na semana`;

  if (elementos.semanaThairanNumero) elementos.semanaThairanNumero.textContent = usuario1.semana;
  if (elementos.semanaKarianyNumero) elementos.semanaKarianyNumero.textContent = usuario2.semana;

  const maiorSemana = Math.max(...dados.map((item) => item.semana));
  const vencedores = dados.filter((item) => item.semana === maiorSemana);

  document.querySelectorAll(".ranking-card").forEach((card) => card.classList.remove("lider"));

  if (maiorSemana === 0) {
    elementos.resultadoSemana.textContent = "Ninguém treinou ainda esta semana";
    elementos.subtituloResultado.textContent = "Assim que alguém salvar um treino, a disputa começa.";
    return;
  }

  if (vencedores.length === 1) {
    const vencedor = vencedores[0];
    elementos.resultadoSemana.textContent = `🏆 ${vencedor.usuario} ganhou a semana até agora`;
    elementos.subtituloResultado.textContent = `${vencedor.usuario} está na frente com ${vencedor.semana} ida${vencedor.semana > 1 ? "s" : ""}.`;

    const indexVencedor = dados.findIndex((item) => item.usuario === vencedor.usuario);
    const cards = document.querySelectorAll(".ranking-card");
    if (cards[indexVencedor]) cards[indexVencedor].classList.add("lider");

    return;
  }

  elementos.resultadoSemana.textContent = "🔥 Empate na semana";
  elementos.subtituloResultado.textContent = `Cada um foi ${maiorSemana} vez${maiorSemana > 1 ? "es" : ""} nesta semana.`;
}

function exportarCSV() {
  const treinosUsuario = getTreinosUsuario(usuarioAtivo);

  const linhas = [
    [
      "Pessoa",
      "Data",
      "Dia da semana",
      "Treino",
      "Exercício",
      "Carga",
      "Séries",
      "Repetições",
      "Observação do exercício",
      "Observações do treino"
    ],
    ...treinosUsuario.flatMap((treino) =>
      treino.exercicios.map((exercicio) => [
        treino.usuario,
        treino.data,
        getDiaSemana(treino.data),
        treino.tipoTreino,
        exercicio.nome,
        exercicio.carga,
        exercicio.series,
        exercicio.repeticoes,
        exercicio.observacao,
        treino.observacoes
      ])
    )
  ];

  const csv = linhas
    .map((linha) =>
      linha
        .map((campo) => `"${String(campo ?? "").replace(/"/g, '""')}"`)
        .join(";")
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = `treinos-${normalizarTexto(usuarioAtivo).replaceAll(" ", "-")}.csv`;
  link.click();

  URL.revokeObjectURL(url);
}

function escaparHTML(texto) {
  return String(texto ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
