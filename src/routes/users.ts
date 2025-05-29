import express from "express"
import asyncHandler from "express-async-handler";
import { checkAuthentication } from "../middleware/auth";
import { validator } from "../middleware/validation";
import { schemaEmail, schemaEmailPassword, schemaEmailRole, schemaEmailNamePassword, schemaEmailNameRolePassword } from "../validation/usersSchemas";
import usersPaths from "../paths/usersPaths";
import usersService from "../service/usersService";

const usersRouter = express.Router();

usersRouter.post("/admin", validator(schemaEmailNamePassword, "body"), checkAuthentication(usersPaths), asyncHandler(async (req, res) => {
    await usersService.addAdminAccount(req.body);
    res.status(201).send("admin account added");
}));
usersRouter.post("/user", validator(schemaEmailNameRolePassword, "body"), checkAuthentication(usersPaths), asyncHandler(async (req, res) => {
    await usersService.addAccount(req.body, req.body.role);
    res.status(201).send("user account added");
}));
usersRouter.put("/role", validator(schemaEmailRole, "body"), checkAuthentication(usersPaths), asyncHandler(async (req, res) => {
    res.send(await usersService.setRole(req.body.email, req.body.role));
}));
usersRouter.put("/password", validator(schemaEmailPassword, "body"), checkAuthentication(usersPaths), asyncHandler(async (req, res) => {
    await usersService.updatePassword(req.body.email, req.body.password);
    res.send("password updated");
}));
usersRouter.get("/:email", validator(schemaEmail, "params"), checkAuthentication(usersPaths), asyncHandler(async (req, res) => {
    res.send(await usersService.getAccount(req.params.email));
}));
usersRouter.post("/login", asyncHandler(async (req, res) => { 
    res.send(await usersService.login(req.body.email, req.body.password));
}));
usersRouter.delete("/:email", validator(schemaEmail, "params"), checkAuthentication(usersPaths), asyncHandler(async (req, res) => {
    await usersService.deleteAccount(req.params.email);
    res.send("account deleted");
}));
export default usersRouter;