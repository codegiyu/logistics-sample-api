const bcrypt = require("bcryptjs");
const { users } = require("../../models");

async function registerCustomer(req, res) {
    try {
        const { email, full_name, password } = req.body;

        const existingEmail = await users.findOne({ email });

        if (existingEmail) {
            return res.status(409).send({
                success: false,
                error: "Email already exists",
                message: "Sign up failed!"
            })
        }

        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(password, salt);

        await users.create({
            email,
            full_name,
            password: hashedPassword,
            role: "customer"
        })

        res.status(201).send({
            success: true,
            message: "Customer account created successfully!"
        })
    } catch (err) {
        console.log(err);
        return res.status(500).send({
            success: false,
            error: err.message,
            message: "Sign up failed unexpectedly!"
        })
    }
}

module.exports = registerCustomer;