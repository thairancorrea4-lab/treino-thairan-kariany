import { initializeApp } from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  push
} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-database.js";

import { firebaseConfig, databasePath } from "./firebase-config.js";

const usuarios = ["Thairan Gostosão ", "Kariany"];

const diasSemana = [
  "Domingo",
  "Segunda-feira",
  "Terça-feira",
  "Quarta-feira",
  "Quinta-feira",
  "Sexta-feira",
  "Sábado"
];

let usuarioAtivo = "Thairan Gostosão ";
let exerciciosForm = [];
let treinos = [];
let usandoFirebase = false;
let treinosRef = null;

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
  busca: document.getElementById("busca"),
  historico: document.getElementById("historico"),
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
    const database = getDatabase(app);
    treinosRef = ref(database, `${databasePath}/treinos`);

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

function trocarUsuario(usuario) {
  usuarioAtivo = usuario;

  elementos.tabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.usuario === usuarioAtivo);
  });

  elementos.busca.value = "";
  limparFormulario();
  renderizarTudo();
}

function limparFormulario() {
  elementos.dataTreino.value = hojeISO();
  elementos.diaSemana.value = getDiaSemana(elementos.dataTreino.value);
  elementos.tipoTreino.value = "";
  elementos.observacoes.value = "";
  exerciciosForm = [];
  elementos.listaExercicios.innerHTML = "";
  adicionarExercicio();
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
    criadoEm: new Date().toISOString()
  };

  try {
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

    limparFormulario();
  } catch (erro) {
    alert("Não foi possível salvar. Verifique a configuração do Firebase.");
    console.error(erro);
  }
}

function getTreinosUsuario(usuario) {
  return treinos.filter((treino) => treino.usuario === usuario);
}

function renderizarTudo() {
  renderizarTopo();
  renderizarHistorico();
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
}

function renderizarDisputa() {
  const inicioSemana = dataParaISO(getInicioSemana());
  const fimSemana = dataParaISO(getFimSemana());

  elementos.periodoSemana.textContent = `Semana atual: ${formatarDataBR(inicioSemana)} até ${formatarDataBR(fimSemana)}.`;

  const dados = usuarios.map((usuario) => {
    const treinosUsuario = getTreinosUsuario(usuario);
    const treinosSemana = treinosUsuario.filter((treino) => treinoNaSemanaAtual(treino.data));

    return {
      usuario,
      total: treinosUsuario.length,
      semana: treinosSemana.length
    };
  });

  const thairan = dados.find((item) => item.usuario === "Thairan");
  const kariany = dados.find((item) => item.usuario === "Kariany");

  elementos.totalThairan.textContent = thairan.total;
  elementos.totalKariany.textContent = kariany.total;

  elementos.semanaThairan.textContent = `${thairan.semana}x na semana`;
  elementos.semanaKariany.textContent = `${kariany.semana}x na semana`;

  elementos.semanaThairanNumero.textContent = thairan.semana;
  elementos.semanaKarianyNumero.textContent = kariany.semana;

  const maiorSemana = Math.max(...dados.map((item) => item.semana));
  const vencedores = dados.filter((item) => item.semana === maiorSemana);

  if (maiorSemana === 0) {
    elementos.resultadoSemana.textContent = "Ninguém treinou ainda esta semana";
    elementos.subtituloResultado.textContent = "Assim que alguém salvar um treino, a disputa começa.";
    return;
  }

  if (vencedores.length === 1) {
    const vencedor = vencedores[0];
    elementos.resultadoSemana.textContent = `${vencedor.usuario} ganhou a semana até agora`;
    elementos.subtituloResultado.textContent = `${vencedor.usuario} está na frente com ${vencedor.semana} ida${vencedor.semana > 1 ? "s" : ""}.`;
    return;
  }

  elementos.resultadoSemana.textContent = "Empate na semana";
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
  link.download = `treinos-${usuarioAtivo.toLowerCase()}.csv`;
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
