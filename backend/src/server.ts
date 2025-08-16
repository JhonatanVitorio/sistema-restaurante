import express from "express";
import cors from "cors";
import path from "path";
import orderRoutes from "./routes/orderRoutes";
import reportRoutes from "./routes/reportRoutes";

const app = express();
const PORT = process.env.PORT ?? 3000;

// middlewares
app.use(cors());
app.use(express.json());

// rotas API primeiro
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api", orderRoutes);
app.use("/api/relatorios", reportRoutes);

// servir frontend (a raiz do frontend, pois o tsc gera /js)
const frontendRoot = path.join(__dirname, "../../frontend");
app.use(express.static(frontendRoot));

// 404 apenas para API (opcional)
app.use("/api/*", (_req, res) => {
    res.status(404).json({ error: "Rota de API não encontrada" });
});



app.listen(PORT, () => {
    console.log(`🚀 Server on ${PORT}`);
});
