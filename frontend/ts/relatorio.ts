// frontend/ts/relatorio.ts
const API_BASE = "";

type ValueEl = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

let pratosChartInstance: any = null;
let bebidasChartInstance: any = null;

const el = {
    faturamentoTotal: document.getElementById("faturamentoTotal") as HTMLElement | null,
    pratosVendidos: document.getElementById("pratosVendidos") as HTMLElement | null,
    somaPratos: document.getElementById("somaPratos") as HTMLElement | null,
    bebidasVendidas: document.getElementById("bebidasVendidas") as HTMLElement | null,
    somaBebidas: document.getElementById("somaBebidas") as HTMLElement | null,
    month: document.getElementById("month") as ValueEl | null,
    type: document.getElementById("type") as ValueEl | null,
    startDate: document.getElementById("startDate") as ValueEl | null,
    endDate: document.getElementById("endDate") as ValueEl | null,
    applyFilters: document.getElementById("applyFilters") as HTMLButtonElement | null,
    pratosChart: document.getElementById("pratosChart") as HTMLCanvasElement | null,
    bebidasChart: document.getElementById("bebidasChart") as HTMLCanvasElement | null,
};

function formatCurrency(v: number | string | null | undefined): string {
    const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : NaN;
    return Number.isFinite(n)
        ? n.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
        : String(v ?? "");
}

function buildQuery(): string {
    const params = new URLSearchParams();
    const m = el.month?.value || "";
    const t = el.type?.value || "";
    const d1 = el.startDate?.value || "";
    const d2 = el.endDate?.value || "";

    if (m) params.set("month", m);
    if (t) params.set("type", t);
    if (d1) params.set("startDate", d1);
    if (d2) params.set("endDate", d2);

    return params.toString() ? `?${params.toString()}` : "";
}

interface ItemMaisVendido {
    nome: string;
    quantidade: number;
    valor?: number;
}
interface ResumoDTO {
    faturamentoPratos: number;
    faturamentoBebidas: number;
    faturamentoTotal: number;
    totalPratosVendidos: number;
    totalBebidasVendidas: number;
    pratosMaisVendidos: ItemMaisVendido[];
    bebidasMaisVendidas: ItemMaisVendido[];
}

async function fetchResumo(): Promise<ResumoDTO> {
    const url = `${API_BASE}/api/relatorios/resumo${buildQuery()}`;
    const resp = await fetch(url);
    if (!resp.ok) {
        const raw = await resp.text().catch(() => "");
        throw new Error(`HTTP ${resp.status} ${resp.statusText} - ${raw || "sem corpo"}`);
    }
    return (await resp.json()) as ResumoDTO;
}

function updateSummaryDisplay(data: ResumoDTO): void {
    if (el.faturamentoTotal) el.faturamentoTotal.textContent = formatCurrency(data.faturamentoTotal ?? 0);
    if (el.pratosVendidos) el.pratosVendidos.textContent = String(data.totalPratosVendidos ?? 0);
    if (el.somaPratos) el.somaPratos.textContent = formatCurrency(data.faturamentoPratos ?? 0);
    if (el.bebidasVendidas) el.bebidasVendidas.textContent = String(data.totalBebidasVendidas ?? 0);
    if (el.somaBebidas) el.somaBebidas.textContent = formatCurrency(data.faturamentoBebidas ?? 0);
}

function renderBarChart(
    canvas: HTMLCanvasElement,
    labels: string[],
    values: number[],
    title: string,
    color: string
): any {
    // @ts-ignore Chart via CDN
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
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
                tooltip: { callbacks: { label: (ctx: any) => `Qtd: ${ctx.parsed.y}` } },
            },
        },
    });
}

function updateCharts(data: ResumoDTO): void {
    if (pratosChartInstance) { pratosChartInstance.destroy(); pratosChartInstance = null; }
    if (bebidasChartInstance) { bebidasChartInstance.destroy(); bebidasChartInstance = null; }

    const pratos = Array.isArray(data.pratosMaisVendidos) ? data.pratosMaisVendidos : [];
    const pratosLabels = pratos.map(i => i.nome);
    const pratosValues = pratos.map(i => i.quantidade);

    if (el.pratosChart) {
        if (pratosLabels.length > 0) {
            pratosChartInstance = renderBarChart(el.pratosChart, pratosLabels, pratosValues, "Pratos Mais Vendidos", "rgba(54,162,235,0.7)");
        } else {
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
        } else {
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

async function carregar(): Promise<void> {
    try {
        const data = await fetchResumo();
        updateSummaryDisplay(data);
        updateCharts(data);
    } catch (error) {
        console.error("Erro ao carregar relatório:", error);
        if (el.faturamentoTotal) el.faturamentoTotal.textContent = "Erro!";
        if (el.pratosVendidos) el.pratosVendidos.textContent = "Erro!";
        if (el.somaPratos) el.somaPratos.textContent = "Erro!";
        if (el.bebidasVendidas) el.bebidasVendidas.textContent = "Erro!";
        if (el.somaBebidas) el.somaBebidas.textContent = "Erro!";
        if (pratosChartInstance) { pratosChartInstance.destroy(); pratosChartInstance = null; }
        if (bebidasChartInstance) { bebidasChartInstance.destroy(); bebidasChartInstance = null; }
        if (el.pratosChart) el.pratosChart.getContext("2d")?.clearRect(0, 0, el.pratosChart.width, el.pratosChart.height);
        if (el.bebidasChart) el.bebidasChart.getContext("2d")?.clearRect(0, 0, el.bebidasChart.width, el.bebidasChart.height);
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