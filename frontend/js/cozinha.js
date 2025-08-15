const API = "http://localhost:3000/api/orders";
const lista = document.getElementById('cozinha-pedidos');
async function carregarCozinha() {
    try {
        const pedidos = await fetch(API).then(res => res.json());
        lista.innerHTML = "";
        // 1. Filtrar apenas pedidos pendentes
        const pedidosPendentes = pedidos.filter(p => p.status === "pendente");
        // 2. Agrupar por mesa
        const grouped = new Map();
        pedidosPendentes.forEach(pedido => {
            if (!grouped.has(pedido.table)) {
                grouped.set(pedido.table, []);
            }
            grouped.get(pedido.table).push(pedido);
        });
        // 3. Renderizar somente mesas que ainda têm pedidos pendentes
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
                itemDetails.innerHTML = `
                    <span><strong>Prato: </strong>${itemOrder.item}</span>
                    ${itemOrder.note ? `<em><strong>Obs:</strong></em> ${itemOrder.note}` : ""}
                `;
                liItem.appendChild(itemDetails);
                ulItens.appendChild(liItem);
            });
            // Botão para marcar TODOS como prontos
            const mainProntoButton = document.createElement('button');
            mainProntoButton.textContent = `Pronto`;
            mainProntoButton.classList.add('main-pronto-button');
            mainProntoButton.disabled = false;
            mainProntoButton.onclick = async () => {
                mainProntoButton.disabled = true;
                mainProntoButton.textContent = "Enviando...";
                try {
                    const updatePromises = items.map(async (itemOrder) => {
                        const res = await fetch(`${API}/${itemOrder.id}`, {
                            method: "PUT",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ status: "pronto" }),
                        });
                        if (!res.ok)
                            throw new Error(`Falha ao marcar item ${itemOrder.id}`);
                    });
                    await Promise.all(updatePromises);
                    carregarCozinha();
                }
                catch (error) {
                    console.error("Erro ao finalizar pedido da mesa:", error);
                    alert("Erro ao finalizar pedido. Tente novamente.");
                    mainProntoButton.disabled = false;
                    mainProntoButton.textContent = `Marcar Pedido da Mesa ${mesa} como Pronto`;
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
