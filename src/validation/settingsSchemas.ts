import Joi from "joi";

const interval = Joi.number();

export const schemaSettings = Joi.object({
    intervalDoctor: interval.required(),
    intervalNurse: interval.required()
})