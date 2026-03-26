import express, { Request, Response, NextFunction } from "express";
import cors from "cors";
import {
    fetchSimpleDirection,
    fetchSimpleStop,
    fetchSimpleTimes
} from "./ctaService";
import {
    fetchTrainStops,
    fetchTrainTimes
} from "./trainService";

const PORT = Number(process.env.PORT) || 8080;
const app = express();

app.use(cors());
app.use(express.json());

// health probe
app.get("/api/healthz", (_req: Request, res: Response) => {
    res.json({ ok: true });
});

// CTA BUS ENDPOINTS

// GET /api/bus/directions?routeId=20
app.get("/api/bus/directions", async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
        // Extract and validate routeId
        const routeIdParam = req.query.routeId;
        if (!routeIdParam) {
            return res.status(400).json({ error: "missing routeId" });
        }

        // Convert to string
        const routeId: string = String(routeIdParam);

        const directions = await fetchSimpleDirection(routeId);
        res.json(directions);
    } catch (err) {
        next(err);
    }
});

// GET /api/bus/stops?routeId=20&direction=Northbound
app.get("/api/bus/stops", async (req: Request, res: Response, next: NextFunction):Promise<any> => {
    try {
        // Extract and validate parameters
        const routeIdParam = req.query.routeId;
        const directionParam = req.query.direction;

        if (!routeIdParam) {
            return res.status(400).json({ error: "missing routeId" });
        }
        if (!directionParam) {
            return res.status(400).json({ error: "missing direction" });
        }

        // Convert to proper types
        const routeId: string = String(routeIdParam);
        const direction: string = String(directionParam);

        const stops = await fetchSimpleStop(routeId, direction);
        res.json(stops);
    } catch (err) {
        next(err);
    }
});

// GET /api/bus/times?routeId=20&direction=Northbound&stopId=1234
app.get("/api/bus/times", async (req: Request, res: Response, next: NextFunction):Promise<any> => {
    try {
        // Extract and validate parameters
        const routeIdParam = req.query.routeId;
        const directionParam = req.query.direction;
        const stopIdParam = req.query.stopId;
        const maxResultsParam = req.query.maxResults;

        if (!routeIdParam) {
            return res.status(400).json({ error: "missing routeId" });
        }
        if (!directionParam) {
            return res.status(400).json({ error: "missing direction" });
        }
        if (!stopIdParam) {
            return res.status(400).json({ error: "missing stopId" });
        }

        // Convert to proper types
        const routeId: string = String(routeIdParam);
        const direction: string = String(directionParam);
        const stopId: string = String(stopIdParam);
        const maxResults: number = maxResultsParam ? parseInt(String(maxResultsParam), 10) : 3;

        const times = await fetchSimpleTimes(routeId, direction, stopId, maxResults);
        res.json(times);
    } catch (err) {
        next(err);
    }
});

// CTA TRAIN ENDPOINTS
// GET /api/train/stops?routeId=Red&direction=Northbound
app.get("/api/train/stops", async (req: Request, res: Response, next: NextFunction):Promise<any> => {
    try {
        // Extract and validate parameters
        const routeIdParam = req.query.routeId;
        const directionParam = req.query.direction;

        console.log("routeId:",req.query.routeId);
        console.log("routeId:",req.query.direction);

        if (!routeIdParam) {
            return res.status(400).json({ error: "missing routeId" });
        }
        if (!directionParam) {
            return res.status(400).json({ error: "missing direction" });
        }

        // Convert to proper types
        const routeId: string = String(routeIdParam);
        const direction: string = String(directionParam);

        console.log("routeId:",routeId);

        const stops = await fetchTrainStops(routeId, direction);

        console.log("should show train stops:", stops);

        res.json(stops);
    } catch (err) {
        next(err);
    }
});

// GET /api/train/times?stopId=30119
app.get("/api/train/times", async (req: Request, res: Response, next: NextFunction):Promise<any> => {
    try {
        // Extract and validate parameters
        const stopIdParam = req.query.stopId;
        const routeIdParam = req.query.routeId;

        if (!stopIdParam) {
            return res.status(400).json({ error: "missing stopId" });
        }

        // Convert to proper type
        const stopId: string = String(stopIdParam);

        const routeId: string = String(routeIdParam)

        const times = await fetchTrainTimes(stopId, routeId);

        console.log("times should be here", times)

        res.json(times);
    } catch (err) {
        next(err);
    }
});

// centralised error handler (or Express will crash on Promise rejections)
app.use((err: unknown, _req: Request, res: Response, _next: NextFunction) => {
    console.error(err);
    res.status(500).json({ error: "internal-server-error" });
});

Bun.serve({
    port: PORT,
    hostname: "0.0.0.0",
    fetch: app.fetch,
});
console.log(`🚂  Backend running at http://0.0.0.0:${PORT}`);

