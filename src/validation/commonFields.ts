import Joi from "joi";
import config from "config"

export const email = Joi.string().email();
export const id = Joi.string().hex();
export const text = Joi.string().min(config.get("validation.text_min_length"));
export const schemaIdText = Joi.object({
    id: id.required(),
    text: text.required()
})

export const schemaId = Joi.object({
    id: id.required()
});