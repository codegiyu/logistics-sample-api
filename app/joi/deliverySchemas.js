const Joi = require("joi");

const requestDeliverySchema = Joi.object({
    address: Joi.string().required().messages({
        "any.string": "address should be a string",
        "any.required": "'address' field is required"
    }),
    destination_address: Joi.string().required().messages({
        "any.string": "destination_address should be a string",
        "any.required": "'address' field is required"
    }),
    item_weight: Joi.number().required().messages({
        "any.number": "'item_weight' should be a number",
        "any.required": "'item_weight' field is required"
    })
})

const deliverySchemas = {
    requestDeliverySchema
}

module.exports = deliverySchemas;