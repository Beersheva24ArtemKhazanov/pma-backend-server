import express from "express"
import asyncHandler from "express-async-handler";
import { checkAuthentication } from "../middleware/auth";
import { valitator } from "../middleware/validation";
import { schemaId } from "../validation/patientsSchemas";
import patientsPaths from "../paths/patientsPaths";
import patientsService from "../service/patientsService";

const patientsRouter = express.Router();

patientsRouter.get("/:id", valitator(schemaId, "params"), checkAuthentication(patientsPaths), asyncHandler(async (req, res) => {
    res.send(await patientsService.getPatient(Number(req.params.id)));
}));

export default patientsRouter;
