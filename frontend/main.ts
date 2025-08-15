const pratos = [
    "Arroz",
    "Feijão",
    "Bife",
    "Arroz, Feijão e Carne"
];

let pedidoSelecionado: string = "";

function renderizarPratos() {
    const div = document.getElementById('buttons');
    if (!div) return;
    div.innerHTML = pratos
        .map(
            (p) => `<button class="prato-btn" data-prato="${p}">${p}</button>`
        )
        .join("");
    document.querySelectorAll('.prato-btn').forEach(btn => {
        btn.addEventListener('click', (evt) => {
            pedidoSelecionado = (evt.target as HTMLElement).dataset.prato!;
            document.querySelectorAll('.prato-btn').forEach(b => b.classList.remove('selected'));
            (evt.target as HTMLElement).classList.add('selected');
            mostrarPedido();
        });
    });
}

function mostrarPedido() {
    const pedidoDiv = document.getElementById('pedido');
    if (pedidoDiv) {
        pedidoDiv.innerHTML = pedidoSelecionado
            ? `<p>Pedido selecionado: <strong>${pedidoSelecionado}</strong></p>`
            : "";
    }
}

document.addEventListener('DOMContentLoaded', () => {
    renderizarPratos();
});