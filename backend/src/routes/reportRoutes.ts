import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const router = Router();
const prisma = new PrismaClient();

// Tabela de preços (ajuste os nomes se seus itens no banco forem diferentes)
const precosPratos: Record<string, number> = {
    "Virado Paulista": 25,
    "Macarrão A Bolonhesa": 20,
    "Costelinha Suína Ao Molho Barbecue": 25,
    "Dobradinha": 23,
    "Feijoada PF": 25,
    "Feijoada P": 40,
    "Feijoada M": 60,
    "Feijoada G": 80,
    "Vaca Atolada": 23,
    "Strogonoff De Frango": 20,
    "Filé De Merluza": 23,
    "Rabada": 25,
    "Baiäo de dois": 30,
    "Feijäo tropeiro": 30,
    "Omelete": 18,
    "Calabresa Acelbolada": 19,
    "Filé De Frango": 19,
    "Frango Ao Molho": 19,
    "Bisteca": 19,
    "Picadinho": 23,
    "Contra Filé": 25,
    "Parmegiana De Frango": 25,
    "Parmegiana De Carne": 30
};

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

// Recalcula preços por componente, evitando duplicidade
function calcularPrecoComponentes(item?: string, type?: string, drink?: string) {
    const precoPratoBase = item ? (precosPratos[item] ?? 0) : 0;
    // Exemplo: se type === "comercial" adiciona 5 (ajuste conforme sua regra real)
    const precoPrato = type && type.toLowerCase() === "comercial" ? precoPratoBase + 5 : precoPratoBase;
    const precoBebida = drink ? (precosBebidas[drink] ?? 0) : 0;
    return { prato: precoPrato, bebida: precoBebida, total: precoPrato + precoBebida };
}

router.get("/resumo", async (req, res) => {
    try {
        const monthParam = (req.query.month as string) || ""; // 1-12 ou ""
        const typeFilter = (req.query.type as string) || ""; // "", "prato", "drink"
        const startDateParam = (req.query.startDate as string) || ""; // YYYY-MM-DD
        const endDateParam = (req.query.endDate as string) || "";   // YYYY-MM-DD

        let start: Date;
        let end: Date;

        if (startDateParam && endDateParam) {
            start = new Date(startDateParam);
            end = new Date(endDateParam);
            end.setHours(23, 59, 59, 999);
        } else if (monthParam) {
            const m = Number(monthParam);
            const now = new Date();
            const y = now.getFullYear();
            if (!Number.isFinite(m) || m < 1 || m > 12) {
                return res.status(400).json({ error: "Parâmetro 'month' inválido. Use 1-12." });
            }
            start = new Date(y, m - 1, 1, 0, 0, 0, 0);
            end = new Date(y, m, 0, 23, 59, 59, 999);
        } else {
            const now = new Date();
            start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
        }

        // Busca somente pedidos finalizados no intervalo
        const orders = await prisma.order.findMany({
            where: {
                createdAt: { gte: start, lte: end },
                status: "finalizado"
            }
        });

        let faturamentoPratos = 0;
        let faturamentoBebidas = 0;
        let totalPratosVendidos = 0;
        let totalBebidasVendidas = 0;

        type Agg = { quantidade: number; valorTotal: number };
        const pratosAgg: Record<string, Agg> = {};
        const bebidasAgg: Record<string, Agg> = {};

        for (const order of orders) {
            const comps = calcularPrecoComponentes(order.item || undefined, order.type || undefined, order.drink || undefined);

            const incluiPrato = order.item && (typeFilter === "" || typeFilter === "todos" || typeFilter === "prato");
            const incluiBebida = order.drink && (typeFilter === "" || typeFilter === "todos" || typeFilter === "drink");

            if (incluiPrato) {
                faturamentoPratos += comps.prato;
                totalPratosVendidos += 1;
                const nome = order.item as string;
                if (!pratosAgg[nome]) pratosAgg[nome] = { quantidade: 0, valorTotal: 0 };
                pratosAgg[nome].quantidade += 1;
                pratosAgg[nome].valorTotal += comps.prato;
            }

            if (incluiBebida) {
                faturamentoBebidas += comps.bebida;
                totalBebidasVendidas += 1;
                const nome = order.drink as string;
                if (!bebidasAgg[nome]) bebidasAgg[nome] = { quantidade: 0, valorTotal: 0 };
                bebidasAgg[nome].quantidade += 1;
                bebidasAgg[nome].valorTotal += comps.bebida;
            }
        }

        const faturamentoTotal = faturamentoPratos + faturamentoBebidas;

        const pratosMaisVendidos = Object.keys(pratosAgg)
            .map((nome) => ({
                nome,
                quantidade: pratosAgg[nome].quantidade,
                valor: pratosAgg[nome].valorTotal
            }))
            .sort((a, b) => b.quantidade - a.quantidade);

        const bebidasMaisVendidas = Object.keys(bebidasAgg)
            .map((nome) => ({
                nome,
                quantidade: bebidasAgg[nome].quantidade,
                valor: bebidasAgg[nome].valorTotal
            }))
            .sort((a, b) => b.quantidade - a.quantidade);

        return res.json({
            faturamentoPratos,
            faturamentoBebidas,
            faturamentoTotal,
            totalPratosVendidos,
            totalBebidasVendidas,
            pratosMaisVendidos,
            bebidasMaisVendidas
        });
    } catch (err) {
        console.error("Erro em GET /api/relatorios/resumo:", err);
        return res.status(500).json({ error: "Erro ao gerar relatório" });
    }
});

export default router;