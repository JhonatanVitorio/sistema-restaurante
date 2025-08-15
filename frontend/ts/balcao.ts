export { };

const API = "http://localhost:3000/api/orders";

type Order = {
    id: number;
    table: string;
    item: string;
    note?: string;
    drink?: string;
    status: string;
    type?: string;
    createdAt: string; // ISO string
};

// Preços dos pratos
const precosPratos: Record<string, number> = {
    "Virado Paulista": 25,
    "Macarrão A Bolonhesa": 20,
    "Costelinha Suína Ao Molho Barbecue": 25,
    "Dobradinha": 23,
    "Feijoada PF": 25,
    "Feijoada P": 40,
    "Feijoada M": 60,
    "Feijoada G": 80,
    "Vaca Atolada":23 ,
    "Strogonoff De Frango": 20,
    "Filé De Merluza": 23,
    "Rabada": 25,
    "Baiäo de dois": 30,
    "Feijäo tropeiro": 30,
    "Omelete": 18,
    "Calabresa Acelbolada:": 19,
    "Filé De Frango": 19,
    "Frango Ao Molho": 19,
    "Bisteca": 19,
    "Picadinho": 23,
    "Contra Filé": 25,
    "Parmegiana De Frango": 25,
    "Parmegiana De Carne": 30
};

// Preços das bebidas
const precosBebidas: Record<string, number> = {
    "Coca Cola 2L": 15,
    "Coca Cola 1L": 12,
    "Coca Cola 600": 9,
    "Coca Cola Lata": 6,
    "Coca Cola Mini": 3,
    "Refrigerante Lata": 5,
    "Refrigerante 600": 8,
    "Sukita 2L": 12,
    "Dolly 2L": 10,
    "H2O": 6,
    "Suco Ponchito": 5,
    "Guaraviton": 5,
    "Agua 1.5L": 5,
    "Agua Sem Gás": 3,
    "Agua Com Gás": 4,
    "Aguá Tônica": 5,
    "Refrigerantes Mini": 3,
    "Heineken 600": 16,
    "Skol 600": 12,
    "Original 600": 13,
    "Brahma 600": 12,
    "Spaten 600": 13,
    "Stella 600": 15,
    "Itaipava 600": 10,
    "Amstel 600": 12,
    "Petra 600": 19, 
    "Antartica 600": 11,
    "imperio 600": 10,
    "Skol Litrao": 15,
    "Original Litrao": 15,
    "Itaipava Litrao": 15,
    "51": 4,
    "Velho": 4,
    "Pitu": 4,
    "Dreher": 5,
    "Vodka Balalaika": 5,
    "Vodka Smirnoff": 8,
    "São Francisco": 6,
    "Kariri": 6,
    "Boazinha": 7,
    "Montila": 10,
    "Salinas": 10,
    "Seleta": 10,
    "Maria Mole": 6,
    "Bomberinho": 5,
    "Paratudo": 5,
    "Presidente": 6,
    "Ypioca": 8,
    "São João": 5,
    "Canelinha": 5,
    "Gin": 12,
    "Jurubeba(dose)": 7
};

function getGroupKey(pedido: Order) {
    const data = new Date(pedido.createdAt);
    return `Mesa:${pedido.table}|${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, "0")}-${String(data.getDate()).padStart(2, "0")} ${String(data.getHours()).padStart(2, "0")}:${String(data.getMinutes()).padStart(2, "0")}`;
}

function agruparPedidosMesmoMomento(pedidos: Order[]): Record<string, Order[]> {
    const agrupados: Record<string, Order[]> = {};
    for (const pedido of pedidos) {
        const key = getGroupKey(pedido);
        if (!agrupados[key]) agrupados[key] = [];
        agrupados[key].push(pedido);
    }
    return agrupados;
}

function calcularPreco(prato: string, type?: string, bebida?: string) {
    const precoPF = precosPratos[prato] ?? 0;
    const precoTipo = type === "comercial" ? precoPF + 5 : precoPF;
    const precoBebida = bebida ? (precosBebidas[bebida] ?? 0) : 0;
    return { total: precoTipo + precoBebida, prato: precoTipo, bebida: precoBebida };
}

async function carregarBalcao() {
    const balcaoPedidos = document.getElementById("balcao-pedidos");
    const historicoPedidos = document.getElementById("historico-pedidos");

    if (balcaoPedidos) balcaoPedidos.innerHTML = "<li>Carregando pedidos...</li>";
    if (historicoPedidos) historicoPedidos.innerHTML = "<li>Carregando histórico...</li>";

    try {
        const response = await fetch(API);
        if (!response.ok) throw new Error("Erro ao buscar pedidos!");

        const pedidos: Order[] = await response.json();

        const pedidosProntos = pedidos.filter(p => p.status === "pronto");
        const pedidosFinalizados = pedidos.filter(p => p.status === "finalizado");

        const agrupadosProntos = agruparPedidosMesmoMomento(pedidosProntos);
        const agrupadosFinalizados = agruparPedidosMesmoMomento(pedidosFinalizados);

        renderPedidosAgrupados("balcao-pedidos", agrupadosProntos, true);
        renderPedidosAgrupados("historico-pedidos", agrupadosFinalizados, false);

    } catch (err) {
        if (balcaoPedidos) balcaoPedidos.innerHTML = `<li style="color:red;">Erro ao carregar pedidos.</li>`;
        if (historicoPedidos) historicoPedidos.innerHTML = `<li style="color:red;">Erro ao carregar pedidos.</li>`;
    }
}

function renderPedidosAgrupados(elementId: string, pedidosAgrupados: Record<string, Order[]>, podeFinalizar: boolean) {
    const container = document.getElementById(elementId);
    if (!container) return;

    container.innerHTML = "";

    const chaves = Object.keys(pedidosAgrupados);
    if (chaves.length === 0) {
        container.innerHTML = `<li>Nenhum pedido para exibir.</li>`;
        return;
    }

    chaves.forEach((groupKey) => {
        const grupo = pedidosAgrupados[groupKey];
        const exemplo = grupo[0];

        let totalGrupo = 0;
        const pedidosHtml = grupo.map(p => {
            const { total, prato, bebida } = calcularPreco(p.item, p.type, p.drink);
            totalGrupo += total;
            const tipoFormatado = (p.type || "pf").toUpperCase();

            return `<li>
                ${p.item} <strong>(${tipoFormatado})</strong>
                <br>
                Preço Prato: R$ ${prato.toFixed(2)}
                ${p.drink ? `<br>Bebida: ${p.drink} | R$ ${bebida.toFixed(2)}` : ""}
                ${p.note ? `<br><em>Obs: ${p.note}</em>` : ""}
                <br><span style="color:#555;"><strong>Total Item:</strong> R\$ ${total.toFixed(2)}</span>
            </li>`;
        }).join("");

        const li = document.createElement("li");
        li.innerHTML = `
            <div>
                <strong>Mesa ${exemplo.table} | ${new Date(exemplo.createdAt).toLocaleString("pt-BR", { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit' })}</strong>
            </div>
            <ul style="margin: 4px 0;">
                ${pedidosHtml}
            </ul>
            <div style="margin-top:4px;"><strong>Total do Pedido:</strong> R\$ ${totalGrupo.toFixed(2)}</div>
            ${podeFinalizar
                ? `<button onclick="finalizarPedidoGrupo('${JSON.stringify(grupo.map(p => p.id))}')">Finalizar Pedido</button>`
                : ""
            }
        `;
        container.appendChild(li);
    });
}

(window as any).finalizarPedidoGrupo = async (ids: any) => {
    if (typeof ids === "string") {
        try {
            ids = JSON.parse(ids);
        } catch {
            ids = ids.split(",").map((id: string) => Number(id.trim()));
        }
    }
    if (!Array.isArray(ids)) ids = [ids];

    try {
        await Promise.all(ids.map((id: number) =>
            fetch(`${API}/${id}/finish`, { method: "POST" })
        ));
        carregarBalcao();
    } catch (err) {
        alert("Erro ao finalizar pedido!");
        carregarBalcao();
    }
};

window.addEventListener('DOMContentLoaded', carregarBalcao);
setInterval(carregarBalcao, 5000);
