const API = "/api/orders";
const dishes = [
    "Virado Paulista",
    "Macarrão A Bolonhesa",
    "Costelinha Suína Ao Molho Barbecue",
    "Dobradinha",
    "Feijoada P",
    "Feijoada M",
    "Feijoada G",
    "Vaca Atolada",
    "Strogonoff De Frango",
    "Filé De Merluza",
    "Rabada",
    "Baiäo de dois",
    "Feijäo tropeiro",
    "Omelete",
    "Calabresa Acelbolada",
    "Filé De Frango",
    "Frango Ao Molho",
    "Bisteca",
    "Picadinho",
    "Contra Filé",
    "Parmegiana De Frango",
    "Parmegiana De Carne"
];
const drinks = [
    "Coca Cola 2L",
    "Coca Cola 1L",
    "Coca Cola 600",
    "Coca Cola Lata",
    "Coca Cola Mini",
    "Refrigerante Lata",
    "Refrigerante 600",
    "Sukita 2L",
    "Dolly 2L",
    "H2O",
    "Suco Ponchito",
    "Guaraviton",
    "Agua 1.5L",
    "Agua Sem Gás",
    "Agua Com Gás",
    "Aguá Tônica",
    "Refrigerantes Mini",
    "Heineken 600",
    "Skol 600",
    "Original 600",
    "Brahma 600",
    "Spaten 600",
    "Stella 600",
    "Itaipava 600",
    "Amstel 600",
    "Petra 600",
    "Antartica 600",
    "imperio 600",
    "Skol Litrao",
    "Original Litrao",
    "Itaipava Litrao",
    "51",
    "Velho",
    "Pitu",
    "Dreher",
    "Vodka Balalaika",
    "Vodka Smirnoff",
    "São Francisco",
    "Kariri",
    "Boazinha",
    "Montila",
    "Salinas",
    "Seleta",
    "Maria Mole",
    "Bomberinho",
    "Paratudo",
    "Presidente",
    "Ypioca",
    "São João",
    "Canelinha",
    "Gin",
    "Jurubeba(dose)"
];
window.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("order-form");
    const message = document.getElementById("message");
    const dishList = document.getElementById("dish-list");
    const drinkList = document.getElementById("drink-list");
    function criarSelectPratoComObservacao(onChange) {
        const wrapper = document.createElement("div");
        wrapper.classList.add("dish-entry");
        // Select de prato
        const select = document.createElement("select");
        select.name = "dish";
        const optionPadrao = document.createElement("option");
        optionPadrao.value = "";
        optionPadrao.textContent = "Selecione um prato (Opcional)";
        select.appendChild(optionPadrao);
        dishes.forEach((item) => {
            const option = document.createElement("option");
            option.value = item;
            option.textContent = item;
            select.appendChild(option);
        });
        // Select de tipo (PF ou Comercial)
        const typeSelect = document.createElement("select");
        typeSelect.name = "type";
        const pfOption = document.createElement("option");
        pfOption.value = "pf";
        pfOption.textContent = "PF";
        const comercialOption = document.createElement("option");
        comercialOption.value = "comercial";
        comercialOption.textContent = "Comercial";
        const marmitexOption = document.createElement("option");
        marmitexOption.value = "marmitex";
        marmitexOption.textContent = "Marmitex";
        typeSelect.appendChild(pfOption);
        typeSelect.appendChild(comercialOption);
        typeSelect.appendChild(marmitexOption);
        // Campo de observação individual do prato
        const textarea = document.createElement("textarea");
        textarea.placeholder = "Observação para este prato (ex: sem cebola)";
        textarea.rows = 1;
        textarea.classList.add("dish-note");
        // Adiciona evento para gerar novo campo ao selecionar prato
        select.addEventListener("change", () => {
            const selAll = dishList.querySelectorAll("select[name='dish']");
            const ultimo = selAll[selAll.length - 1];
            if (select.value && select === ultimo) {
                onChange();
            }
        });
        wrapper.appendChild(select);
        wrapper.appendChild(typeSelect);
        wrapper.appendChild(textarea);
        return wrapper;
    }
    function criarSelectBebida(onChange) {
        const select = document.createElement("select");
        select.name = "drink";
        const optionPadrao = document.createElement("option");
        optionPadrao.value = "";
        optionPadrao.textContent = "Selecione uma bebida (Opcional)";
        select.appendChild(optionPadrao);
        drinks.forEach((item) => {
            const option = document.createElement("option");
            option.value = item;
            option.textContent = item;
            select.appendChild(option);
        });
        select.addEventListener("change", () => {
            const selAll = drinkList.querySelectorAll("select");
            const ultimo = selAll[selAll.length - 1];
            if (select.value && select === ultimo) {
                onChange();
            }
        });
        return select;
    }
    // Inicialização dos campos
    function adicionarCampoPrato() {
        const entry = criarSelectPratoComObservacao(adicionarCampoPrato);
        dishList.appendChild(entry);
    }
    function adicionarCampoBebida() {
        const select = criarSelectBebida(adicionarCampoBebida);
        drinkList.appendChild(select);
    }
    adicionarCampoPrato();
    adicionarCampoBebida();
    form.addEventListener("submit", async (e) => {
        var _a, _b, _c;
        e.preventDefault();
        const mesa = document.getElementById("table").value.trim();
        if (!mesa) {
            exibirMensagem("Por favor, preencha o número da mesa.", true);
            return;
        }
        // PRATOS + OBSERVAÇÃO
        const selectedDishes = Array.from(dishList.querySelectorAll(".dish-entry"))
            .map((entryDiv) => {
            const select = entryDiv.querySelector("select[name='dish']");
            const typeSelect = entryDiv.querySelector("select[name='type']");
            const note = entryDiv.querySelector(".dish-note");
            return {
                item: select.value ? select.value : undefined,
                type: (typeSelect === null || typeSelect === void 0 ? void 0 : typeSelect.value) || "pf", // padrão PF
                note: note.value ? note.value : undefined
            };
        })
            .filter((obj) => obj.item);
        // BEBIDAS (sem observação vinculada)
        const selectedDrinks = Array.from(drinkList.querySelectorAll("select"))
            .map((select) => select.value ? select.value : undefined)
            .filter((v) => v);
        // Cria array para enviar pedidos (emparelha pratos+observação e bebida por índice)
        const maxLength = Math.max(selectedDishes.length, selectedDrinks.length);
        const itensParaEnviar = [];
        for (let i = 0; i < maxLength; i++) {
            itensParaEnviar.push({
                item: (_a = selectedDishes[i]) === null || _a === void 0 ? void 0 : _a.item,
                drink: selectedDrinks[i],
                note: (_b = selectedDishes[i]) === null || _b === void 0 ? void 0 : _b.note,
                type: (_c = selectedDishes[i]) === null || _c === void 0 ? void 0 : _c.type // Aqui vem PF ou Comercial
            });
        }
        // Se nenhum prato ou bebida selecionado, aborta e avisa
        if (itensParaEnviar.length === 0) {
            exibirMensagem("Adicione pelo menos um prato ou bebida.", true);
            return;
        }
        try {
            for (const itemData of itensParaEnviar) {
                // Não envia campos vazios desnecessariamente
                if (!itemData.item && !itemData.drink)
                    continue;
                await fetch(API, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        table: mesa,
                        item: itemData.item,
                        drink: itemData.drink,
                        note: itemData.note,
                        type: itemData.type || "pf"
                    })
                });
            }
            exibirMensagem(`Pedido enviado para a mesa ${mesa}! ✅`);
            form.reset();
            dishList.innerHTML = "";
            drinkList.innerHTML = "";
            adicionarCampoPrato();
            adicionarCampoBebida();
        }
        catch (error) {
            console.error(error);
            exibirMensagem("Erro ao enviar pedido! Tente novamente.", true);
        }
    });
    function exibirMensagem(msg, isErro = false) {
        if (!message)
            return;
        message.textContent = msg;
        message.style.color = isErro ? "#b3261e" : "#1b5e20";
        message.style.marginTop = "12px";
    }
});
export {};
