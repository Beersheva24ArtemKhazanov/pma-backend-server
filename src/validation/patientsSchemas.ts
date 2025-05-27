import Joi from "joi";


const id = Joi.string().id();

export const schemaId = Joi.object({
    id: id.required()
});