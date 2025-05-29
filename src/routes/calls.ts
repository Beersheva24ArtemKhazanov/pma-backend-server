import express from "express"
import asyncHandler from "express-async-handler";
import { checkAuthentication } from "../middleware/auth";
import { validator } from "../middleware/validation";
import { schemaIdText, schemaId } from "../validation/commonFields";
import { schemaRole } from "../validation/usersSchemas";
import { schemaRecommendation } from "../validation/callsSchemas";
import callsPaths from "../paths/callsPaths";
import callsService from "../service/callsService";

const callsRouter = express.Router();

callsRouter.get("/approval/roles/:role", validator(schemaRole, "params"), checkAuthentication(callsPaths), asyncHandler(async (req, res) => {
    res.send(await callsService.getCallsByRole(req.params.role));
}));
callsRouter.get("/:id", validator(schemaId, "params"), checkAuthentication(callsPaths), asyncHandler(async (req, res) => {
    res.send(await callsService.getCall(req.params.id));
}));
callsRouter.put("/", validator(schemaIdText, "body"), checkAuthentication(callsPaths), asyncHandler(async (req, res) => {
    res.send(await callsService.setCure(req.body.id, req.body.text));
}));
callsRouter.get("/approval/:id", validator(schemaId, "params"), checkAuthentication(callsPaths), asyncHandler(async (req, res) => {
    res.send(await callsService.getApproval(req.params.id));
}));
callsRouter.put("/approval/:id", validator(schemaId, "params"), checkAuthentication(callsPaths), asyncHandler(async (req, res) => {
    res.send(await callsService.setApprove(req.params.id));
}));
callsRouter.get("/reject/:id", validator(schemaId, "params"), checkAuthentication(callsPaths), asyncHandler(async (req, res) => {
    res.send(await callsService.getReject(req.params.id));
}));
callsRouter.post("/reject", validator(schemaIdText, "body"), checkAuthentication(callsPaths), asyncHandler(async (req, res) => {
    res.send(await callsService.addOrUpdateReject(req.body.id, req.body.text));
}));
callsRouter.post("/recommendation", validator(schemaRecommendation, "body"), checkAuthentication(callsPaths), asyncHandler(async (req, res) => {
    res.send(await callsService.addRecommendation(req.body));
}));
callsRouter.get("/recommendation/:id", validator(schemaId, "params"), checkAuthentication(callsPaths), asyncHandler(async (req, res) => {
    res.send(await callsService.getRecommendations(req.params.id));
}));
callsRouter.put("/recommendation", validator(schemaRecommendation, "body"), checkAuthentication(callsPaths), asyncHandler(async (req, res) => {
    res.send(await callsService.updateRecommendation(req.body));
}));
callsRouter.delete("/recommendation/:id", validator(schemaId, "params"), checkAuthentication(callsPaths), asyncHandler(async (req, res) => {
    res.send(await callsService.deleteRecommendation(req.params.id));
}));

export default callsRouter;