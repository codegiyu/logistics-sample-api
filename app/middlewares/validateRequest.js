const joiSchemas = require("../joi");

const supportedMethods = ["post", "put", "patch", "delete"];

const validationOptions = {
  abortEarly: false,
  allowUnknown: false,
  stripUnknown: false,
};

const validateRequest = (path) => {
    const schema = joiSchemas[path];

    return (req, res, next) => {
        try {
            if (!schema) {
                throw new Error(`Validation schema not found for path: "${path}"`)
            }

            const method = req.method.toLowerCase();

            if (!supportedMethods.includes(method)) {
                return next();
            }

            const { error: validationError, value } = schema.validate(req.body, validationOptions);

            if (validationError) {
                return res.status(422).send({
                    success: false,
                    error: validationError.details.map(item => item.message.replace(/['"]/g, ""))
                })
            }

            req.body = value;
            next();
        } catch (err) {
            console.log(err);
            res.status(500).send({
                success: false,
                error: err.message,
                message: "Request failed unexpectedly"
            })
        }
    }
}

module.exports = validateRequest;