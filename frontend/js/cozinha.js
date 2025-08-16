const API = "/api/orders";
const lista = document.getElementById('cozinha-pedidos');
function fmtTipo(t) {
    // padrão PF; deixa bonitinho em maiúsculas
    return (t !== null && t !== void 0 ? t : "pf").toUpperCase();
}
async function carregarCozinha() {
    try {
        const pedidos = await fetch(API).then(res => res.json());
        lista.innerHTML = "";
        const pedidosPendentes = pedidos.filter(p => p.status === "pendente");
        const grouped = new Map();
        pedidosPendentes.forEach(pedido => {
            if (!grouped.has(pedido.table))
                grouped.set(pedido.table, []);
            grouped.get(pedido.table).push(pedido);
        });
        grouped.forEach((items, mesa) => {
            const liMesa = document.createElement('li');
            liMesa.classList.add('pedido-mesa-container');
            const headerMesa = document.createElement('h3');
            headerMesa.textContent = `Mesa ${mesa}`;
            liMesa.appendChild(headerMesa);
            const ulItens = document.createElement('ul');
            ulItens.classList.add('itens-da-mesa');
            liMesa.appendChild(ulItens);
            items.forEach(itemOrder => {
                const liItem = document.createElement('li');
                liItem.classList.add('item-do-pedido');
                liItem.dataset.orderId = itemOrder.id.toString();
                const itemDetails = document.createElement('div');
                itemDetails.classList.add('item-details');
                // 👇 inclui o tipo ao lado do prato
                itemDetails.innerHTML = `
          <span><strong>Prato:</strong> ${itemOrder.item} <span class="badge-tipo">${fmtTipo(itemOrder.type)}</span></span>
          ${itemOrder.note ? `<br><em><strong>Obs:</strong></em> ${itemOrder.note}` : ""}
        `;
                liItem.appendChild(itemDetails);
                ulItens.appendChild(liItem);
            });
            const mainProntoButton = document.createElement('button');
            mainProntoButton.textContent = `Pronto`;
            mainProntoButton.classList.add('main-pronto-button');
            mainProntoButton.disabled = false;
            mainProntoButton.onclick = async () => {
                mainProntoButton.disabled = true;
                mainProntoButton.textContent = "Enviando...";
                try {
                    await Promise.all(items.map((itemOrder) => fetch(`${API}/${itemOrder.id}`, {
                        method: "PUT",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ status: "pronto" }),
                    }).then(r => { if (!r.ok)
                        throw new Error(); })));
                    carregarCozinha();
                }
                catch (_a) {
                    alert("Erro ao finalizar pedido. Tente novamente.");
                    mainProntoButton.disabled = false;
                    mainProntoButton.textContent = `Pronto`;
                }
            };
            liMesa.appendChild(mainProntoButton);
            lista.appendChild(liMesa);
        });
    }
    catch (err) {
        console.error("Erro ao carregar pedidos da cozinha:", err);
    }
}
window.addEventListener('DOMContentLoaded', carregarCozinha);
setInterval(carregarCozinha, 5000);
export {};
