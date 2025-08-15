var pratos = [
    "Arroz",
    "Feijão",
    "Bife",
    "Arroz, Feijão e Carne"
];
var pedidoSelecionado = "";
function renderizarPratos() {
    var div = document.getElementById('buttons');
    if (!div)
        return;
    div.innerHTML = pratos
        .map(function (p) { return "<button class=\"prato-btn\" data-prato=\"".concat(p, "\">").concat(p, "</button>"); })
        .join("");
    document.querySelectorAll('.prato-btn').forEach(function (btn) {
        btn.addEventListener('click', function (evt) {
            pedidoSelecionado = evt.target.dataset.prato;
            document.querySelectorAll('.prato-btn').forEach(function (b) { return b.classList.remove('selected'); });
            evt.target.classList.add('selected');
            mostrarPedido();
        });
    });
}
function mostrarPedido() {
    var pedidoDiv = document.getElementById('pedido');
    if (pedidoDiv) {
        pedidoDiv.innerHTML = pedidoSelecionado
            ? "<p>Pedido selecionado: <strong>".concat(pedidoSelecionado, "</strong></p>")
            : "";
    }
}
document.addEventListener('DOMContentLoaded', function () {
    renderizarPratos();
});
