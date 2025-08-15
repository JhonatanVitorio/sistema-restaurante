import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const precosPratos: Record<string, number> = {
    "Virado Paulista": 25,
    "Macarrão A Bolonhesa": 20,
    // ...complete
};
const precosBebidas: Record<string, number> = {
    "Coca Cola 2L": 15,
    "Coca Cola 1L": 12,
    // ...complete
};

function calcularPrecoComponentes(item?: string, type?: string, drink?: string) {
    const precoPrato = item ? (precosPratos[item] ?? 0) : 0;
    const precoPratoAjustado = type && type.toLowerCase() === "comercial" ? precoPrato + 5 : precoPrato;
    const precoBebida = drink ? (precosBebidas[drink] ?? 0) : 0;
    return { prato: precoPratoAjustado, bebida: precoBebida, total: precoPratoAjustado + precoBebida };
}

export async function getResumoMensal(req: Request, res: Response) {
    try {
        const { month, year, startDate, endDate } = req.query;

        let start: Date;
        let end: Date;

        if (startDate && endDate) {
            start = new Date(String(startDate));
            end = new Date(String(endDate));
            // garantir que o final inclua todo o dia
            end.setHours(23, 59, 59, 999);
        } else if (month) {
            const m = Number(month);
            const y = year ? Number(year) : new Date().getFullYear();
            start = new Date(y, m - 1, 1, 0, 0, 0);
            end = new Date(y, m, 1, 0, 0, 0); // início do mês seguinte
        } else {
            // padrão: mês atual
            const now = new Date();
            start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
            end = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);
        }

        // Buscar pedidos no intervalo — consideramos apenas pedidos finalizados para faturamento
        const orders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: start,
                    lt: end
                },
                status: "finalizado"
            }
        });

        let faturamentoTotal = 0;
        let somaPratos = 0;
        let somaBebidas = 0;
        let pratosVendidos = 0;
        let bebidasVendidas = 0;

        type ResumoPorItem = { qtd: number; total: number };
        const resumoPratos: Record<string, ResumoPorItem> = {};
        const resumoBebidas: Record<string, ResumoPorItem> = {};

        for (const order of orders) {
            const comps = calcularPrecoComponentes(order.item || undefined, order.type || undefined, order.drink || undefined);

            faturamentoTotal += comps.total;

            if (order.item && comps.prato > 0) {
                pratosVendidos += 1;
                somaPratos += comps.prato;
                const key = order.item;
                if (!resumoPratos[key]) resumoPratos[key] = { qtd: 0, total: 0 };
                resumoPratos[key].qtd += 1;
                resumoPratos[key].total += comps.prato;
            }

            if (order.drink && comps.bebida > 0) {
                bebidasVendidas += 1;
                somaBebidas += comps.bebida;
                const key = order.drink;
                if (!resumoBebidas[key]) resumoBebidas[key] = { qtd: 0, total: 0 };
                resumoBebidas[key].qtd += 1;
                resumoBebidas[key].total += comps.bebida;
            }
        }

        res.status(200).json({
            faturamentoTotal,
            somaPratos,
            somaBebidas,
            pratosVendidos,
            bebidasVendidas,
            resumoPratos,
            resumoBebidas,
            requestedPeriod: { start, end }
        });

    } catch (error) {
        console.error("Erro ao gerar resumo mensal:", error);
        res.status(500).json({ error: "Erro ao gerar relatório." });
    }
}


export async function getResumoPedidos(req: Request, res: Response) {
    try {
        // Datas do mês atual
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0);
        const end = new Date(now.getFullYear(), now.getMonth() + 1, 1, 0, 0, 0);

        // Busca todos pedidos do mês
        const orders = await prisma.order.findMany({
            where: {
                createdAt: {
                    gte: start,
                    lt: end
                }
            }
        });

        // Resumo por prato e bebida
        let somaPratos = 0;
        let somaBebidas = 0;
        let faturamentoTotal = 0;
        let pratosVendidos = 0;
        let bebidasVendidas = 0;

        for (const order of orders) {
            // Considera pedidos com DRINK como bebida e o restante como prato
            if (order.drink) {
                bebidasVendidas += 1;
                somaBebidas += Number(order.price) || 0;
            } else {
                pratosVendidos += 1;
                somaPratos += Number(order.price) || 0;
            }
            faturamentoTotal += Number(order.price) || 0;
        }

        // Resumo antigo para o gráfico (Vem do seu código anterior, se houver)
        type ResumoPorItem = { qtd: number, total: number };
        const resumo: { [item: string]: ResumoPorItem } = {};
        for (const order of orders) {
            const item = order.item || "Outro";
            if (!resumo[item]) resumo[item] = { qtd: 0, total: 0 };
            resumo[item].qtd += 1;
            resumo[item].total += Number(order.price) || 0;
        }

        res.status(200).json({
            resumo,
            faturamentoTotal,
            pratosVendidos,
            bebidasVendidas,
            somaPratos,
            somaBebidas
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao gerar relatório." });
    }
}