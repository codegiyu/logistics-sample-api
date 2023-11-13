const { deliveries } = require("../../models");

async function getAllRiderDeliveries (req, res) {
    try {
        const { user_id } = req.decoded;

        if (!user_id) {
            return res.status(400).send({
                success: false,
                error: "User id not found",
            })
        }

        const data = deliveries.find({ rider_id: user_id.toString() }).sort({ createdAt: -1 });

        if (!data) {
            return res.status(404).send({
                success: false,
                error: "No deliveries found for this user"
            })
        }

        res.status(200).send({
            success: true,
            data: {
                data
            },
            message: "Deliveries fetched successfully"
        })
        
    } catch (error) {
        console.log(error);
        res.status(500).send({
            success: false,
            error: error.message,
            message: "Request failed unexpectedly!",
        });
    }
}

module.exports = getAllRiderDeliveries;