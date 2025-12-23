import express, { Request, Response } from "express";
import { positions } from "./data/positions.json";

const app = express();
const port = 3001;

app.get("/positions", (req: Request, res: Response) => {
    res.status(200).json(positions);
});

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`);
});
