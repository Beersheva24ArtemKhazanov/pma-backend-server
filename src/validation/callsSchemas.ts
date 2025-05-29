import Joi from "joi";
import { id } from "./commonFields.js";

const drug = Joi.string().regex(/^[A-Za-z0-9\s,.]+$/);
const route = Joi.string().valid("IV", "PO", "IM");
const dosing = Joi.string().regex(/^[0-9]+\s?(mg|ml|g|tab)?$/);
const interval = Joi.number().max(24);

export const schemaRecommendation = Joi.object({
    id: id,
    approvalId: id.required(),
    drug: drug.required(),
    route: route.required(),
    dosing: dosing.required(),
    interval: interval.required()
})
