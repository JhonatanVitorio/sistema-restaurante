import express from 'express';
import cors from 'cors';
import orderRoutes from './routes/orderRoutes';
import path from "path";
import reportRoutes from "./routes/reportRoutes";

const app = express();

const PORT = process.env.PORT ?? 3000;


const frontendPath = path.join(__dirname, "../../frontend/dist");

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => res.json({ ok: true }));
app.get("*", (_req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
});

app.use('/api', orderRoutes);
app.use("/api/relatorios", reportRoutes);
app.use(express.static(frontendPath));

app.use((req, res) => {
    res.status(404).json({ error: "Rota não encontrada", path: req.originalUrl });
});

app.listen(3000, () => {
    console.log(`🚀 Server running at http://localhost:${PORT} or ${PORT}`);
});
