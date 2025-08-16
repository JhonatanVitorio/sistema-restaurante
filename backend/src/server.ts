import express from "express";
import cors from "cors";
import path from "path";
import orderRoutes from "./routes/orderRoutes";
import reportRoutes from "./routes/reportRoutes";

const app = express();
const PORT = process.env.PORT ?? 3000;

// 1) Middlewares base
app.use(cors());
app.use(express.json());

// 2) Rotas de API primeiro
app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.use("/api", orderRoutes);
app.use("/api/relatorios", reportRoutes);

// 3) Servir o FRONTEND (a sua raiz do frontend, pois o build gera /js)
const frontendRoot = path.join(__dirname, "../../frontend");
app.use(express.static(frontendRoot));

// 4) 404 apenas para API (opcional mas recomendado)
app.use("/api/*", (_req, res) => {
    res.status(404).json({ error: "Rota de API não encontrada" });
});

// 5) Fallback para SPA / index.html (depois de TUDO acima)
app.get("*", (_req, res) => {
    res.sendFile(path.join(frontendRoot, "index.html"));
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});