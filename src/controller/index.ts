import express, { Express, Request, Response } from "express"
import { logger, loggerAuth } from "../loggers/logger.ts";
import { errorHandler } from "../errors/errors"
import usersRouter from "../routes/users";
import patientsRouter from "../routes/patients";
import { authenticate } from "../middleware/auth";
import 'dotenv/config'
import callsRouter from "../routes/calls.ts";
import settingsRouter from "../routes/settings.ts";

const app : Express = express();
const port = process.env.PORT ?? 3500;
app.use(express.json());
app.use(logger);
app.use(loggerAuth);
app.use(authenticate());
app.use("/users", usersRouter);
app.use("/patients", patientsRouter);
app.use("/calls", callsRouter);
app.use("/settings", settingsRouter);
app.use((req: Request, res: Response) => {
    const path: string = req.path
    res.status(404).send(`path ${path} is not found`)
});
app.use(errorHandler);
app.listen(port, () => console.log(`server is listening on port ${port}`));


