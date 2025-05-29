import express from "express"
import asyncHandler from "express-async-handler";
import { checkAuthentication } from "../middleware/auth";
import settingsPaths from "../paths/settingsPaths";
import settingsService from "../service/settingsService";
import { schemaSettings } from "../validation/settingsSchemas";
import { validator } from "../middleware/validation";

const settingsRouter = express.Router();

settingsRouter.put("/",validator(schemaSettings, "body"), checkAuthentication(settingsPaths), asyncHandler(async (req, res) => {
    res.send(await settingsService.setSettings(req.body.intervalDoctor, req.body.intervalNurse));
}));
settingsRouter.get("/", checkAuthentication(settingsPaths), asyncHandler(async (req, res) => {
    res.send(await settingsService.getSettings());
}));

export default settingsRouter;