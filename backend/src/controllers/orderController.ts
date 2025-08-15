import { PrismaClient } from "@prisma/client";
import { Request, Response } from "express";

const prisma = new PrismaClient();
const precosPratos: Record<string, number> = {
    "Virado Paulista": 25,
    "Macarrão A Bolonhesa": 20,
    "Costelinha Suína Ao Molho Barbecue": 25,
    "Dobradinha": 23,
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

function calcularPreco(prato?: string, type?: string, bebida?: string) {
    const precoPrato = prato ? (precosPratos[prato] ?? 0) : 0;
    const precoPratoAjustado = type && type.toLowerCase() === "comercial" ? precoPrato + 5 : precoPrato;
    const precoBebida = bebida ? (precosBebidas[bebida] ?? 0) : 0;
    return {
        prato: precoPratoAjustado,
        bebida: precoBebida,
        total: precoPratoAjustado + precoBebida
    };
}

// GET todos os pedidos
export const getOrders = async (_: Request, res: Response) => {
    const orders = await prisma.order.findMany();
    res.json(orders);
};

// POST criar novo pedido (agora salvando price)
export const createOrder = async (req: Request, res: Response) => {
    const { table, item, drink, note, type } = req.body;

    if (!table || (!item && !drink)) {
        return res.status(400).json({ error: "Mesa e pelo menos um item ou bebida são obrigatórios." });
    }

    try {
        const { total } = calcularPreco(item, type, drink);

        const newOrder = await prisma.order.create({
            data: {
                table: String(table),
                item: item ?? "",
                drink: drink ?? null,
                note: note ?? null,
                type: (type ?? "pf").toLowerCase(),
                price: total
            },
        });

        res.status(201).json(newOrder);
    } catch (error) {
        console.error("Erro ao criar pedido:", error);
        res.status(500).json({ error: "Erro interno ao criar pedido." });
    }
};

// PUT atualizar status do pedido
export const updateOrder = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const updated = await prisma.order.update({
            where: { id: Number(id) },
            data: { status },
        });

        res.json(updated);
    } catch (error) {
        console.error("Erro ao atualizar pedido:", error);
        res.status(500).json({ error: "Erro interno ao atualizar pedido." });
    }
};

// DELETE remover pedido
export const deleteOrder = async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
        await prisma.order.delete({ where: { id: Number(id) } });
        res.status(204).send();
    } catch (error) {
        console.error("Erro ao deletar pedido:", error);
        res.status(500).json({ error: "Erro interno ao deletar pedido." });
    }
};

export async function finishOrder(req: Request, res: Response) {
    const { id } = req.params;

    try {
        const updatedOrder = await prisma.order.update({
            where: { id: Number(id) },
            data: { status: "finalizado" }
        });
        return res.status(200).json(updatedOrder);
    } catch (error) {
        return res.status(500).json({ error: "Erro ao finalizar o pedido" });
    }
}
