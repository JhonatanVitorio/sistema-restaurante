"use strict";
// frontend/ts/relatorio.ts
const API_BASE = "http://localhost:3000";
let pratosChartInstance = null;
let bebidasChartInstance = null;
const el = {
    faturamentoTotal: document.getElementById("faturamentoTotal"),
    pratosVendidos: document.getElementById("pratosVendidos"),
    somaPratos: document.getElementById("somaPratos"),
    bebidasVendidas: document.getElementById("bebidasVendidas"),
    somaBebidas: document.getElementById("somaBebidas"),
    month: document.getElementById("month"),
    type: document.getElementById("type"),
    startDate: document.getElementById("startDate"),
    endDate: document.getElementById("endDate"),
    applyFilters: document.getElementById("applyFilters"),
    pratosChart: document.getElementById("pratosChart"),
    bebidasChart: document.getElementById("bebidasChart"),
};
function formatCurrency(v) {
    const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : NaN;
    return Number.isFinite(n)
        ? n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        : String(v !== null && v !== void 0 ? v : "");
}
function buildQuery() {
    var _a, _b, _c, _d;
    const params = new URLSearchParams();
    const m = ((_a = el.month) === null || _a === void 0 ? void 0 : _a.value) || "";
    const t = ((_b = el.type) === null || _b === void 0 ? void 0 : _b.value) || "";
    const d1 = ((_c = el.startDate) === null || _c === void 0 ? void 0 : _c.value) || "";
    const d2 = ((_d = el.endDate) === null || _d === void 0 ? void 0 : _d.value) || "";
    if (m)
        params.set("month", m);
    if (t)
        params.set("type", t);
    if (d1)
        params.set("startDate", d1);
    if (d2)
        params.set("endDate", d2);
    return params.toString() ? `?${params.toString()}` : "";
}
async function fetchResumo() {
    const url = `${API_BASE}/api/relatorios/resumo${buildQuery()}`;
    const resp = await fetch(url);
    if (!resp.ok) {
        const raw = await resp.text().catch(() => "");
        throw new Error(`HTTP ${resp.status} ${resp.statusText} - ${raw || "sem corpo"}`);
    }
    return (await resp.json());
}
function updateSummaryDisplay(data) {
    var _a, _b, _c, _d, _e;
    if (el.faturamentoTotal)
        el.faturamentoTotal.textContent = formatCurrency((_a = data.faturamentoTotal) !== null && _a !== void 0 ? _a : 0);
    if (el.pratosVendidos)
        el.pratosVendidos.textContent = String((_b = data.totalPratosVendidos) !== null && _b !== void 0 ? _b : 0);
    if (el.somaPratos)
        el.somaPratos.textContent = formatCurrency((_c = data.faturamentoPratos) !== null && _c !== void 0 ? _c : 0);
    if (el.bebidasVendidas)
        el.bebidasVendidas.textContent = String((_d = data.totalBebidasVendidas) !== null && _d !== void 0 ? _d : 0);
    if (el.somaBebidas)
        el.somaBebidas.textContent = formatCurrency((_e = data.faturamentoBebidas) !== null && _e !== void 0 ? _e : 0);
}
function renderBarChart(canvas, labels, values, title, color) {
    // @ts-ignore Chart via CDN
    const ctx = canvas.getContext("2d");
    if (!ctx)
        return null;
    // @ts-ignore
    return new Chart(ctx, {
        type: "bar",
        data: {
            labels,
            datasets: [{ label: title, data: values, backgroundColor: color, borderColor: color, borderWidth: 1 }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, ticks: { precision: 0 }, title: { display: true, text: "Quantidade Vendida" } },
                x: { title: { display: true, text: "Itens" } },
            },
            plugins: {
                legend: { display: false },
                title: { display: true, text: title },
                tooltip: { callbacks: { label: (ctx) => `Qtd: ${ctx.parsed.y}` } },
            },
        },
    });
}
function updateCharts(data) {
    if (pratosChartInstance) {
        pratosChartInstance.destroy();
        pratosChartInstance = null;
    }
    if (bebidasChartInstance) {
        bebidasChartInstance.destroy();
        bebidasChartInstance = null;
    }
    const pratos = Array.isArray(data.pratosMaisVendidos) ? data.pratosMaisVendidos : [];
    const pratosLabels = pratos.map(i => i.nome);
    const pratosValues = pratos.map(i => i.quantidade);
    if (el.pratosChart) {
        if (pratosLabels.length > 0) {
            pratosChartInstance = renderBarChart(el.pratosChart, pratosLabels, pratosValues, "Pratos Mais Vendidos", "rgba(54,162,235,0.7)");
        }
        else {
            const ctx = el.pratosChart.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, el.pratosChart.width, el.pratosChart.height);
                ctx.font = "16px Arial";
                ctx.textAlign = "center";
                ctx.fillStyle = "#888";
                ctx.fillText("Nenhum prato vendido neste período.", el.pratosChart.width / 2, el.pratosChart.height / 2);
            }
        }
    }
    const bebidas = Array.isArray(data.bebidasMaisVendidas) ? data.bebidasMaisVendidas : [];
    const bebidasLabels = bebidas.map(i => i.nome);
    const bebidasValues = bebidas.map(i => i.quantidade);
    if (el.bebidasChart) {
        if (bebidasLabels.length > 0) {
            bebidasChartInstance = renderBarChart(el.bebidasChart, bebidasLabels, bebidasValues, "Bebidas Mais Vendidas", "rgba(255,159,64,0.7)");
        }
        else {
            const ctx = el.bebidasChart.getContext("2d");
            if (ctx) {
                ctx.clearRect(0, 0, el.bebidasChart.width, el.bebidasChart.height);
                ctx.font = "16px Arial";
                ctx.textAlign = "center";
                ctx.fillStyle = "#888";
                ctx.fillText("Nenhuma bebida vendida neste período.", el.bebidasChart.width / 2, el.bebidasChart.height / 2);
            }
        }
    }
}
async function carregar() {
    var _a, _b;
    try {
        const data = await fetchResumo();
        updateSummaryDisplay(data);
        updateCharts(data);
    }
    catch (error) {
        console.error("Erro ao carregar relatório:", error);
        if (el.faturamentoTotal)
            el.faturamentoTotal.textContent = "Erro!";
        if (el.pratosVendidos)
            el.pratosVendidos.textContent = "Erro!";
        if (el.somaPratos)
            el.somaPratos.textContent = "Erro!";
        if (el.bebidasVendidas)
            el.bebidasVendidas.textContent = "Erro!";
        if (el.somaBebidas)
            el.somaBebidas.textContent = "Erro!";
        if (pratosChartInstance) {
            pratosChartInstance.destroy();
            pratosChartInstance = null;
        }
        if (bebidasChartInstance) {
            bebidasChartInstance.destroy();
            bebidasChartInstance = null;
        }
        if (el.pratosChart)
            (_a = el.pratosChart.getContext("2d")) === null || _a === void 0 ? void 0 : _a.clearRect(0, 0, el.pratosChart.width, el.pratosChart.height);
        if (el.bebidasChart)
            (_b = el.bebidasChart.getContext("2d")) === null || _b === void 0 ? void 0 : _b.clearRect(0, 0, el.bebidasChart.width, el.bebidasChart.height);
    }
}
document.addEventListener("DOMContentLoaded", () => {
    if (el.applyFilters) {
        el.applyFilters.addEventListener("click", (e) => {
            e.preventDefault();
            void carregar();
        });
    }
    void carregar();
});
