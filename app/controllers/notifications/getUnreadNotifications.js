const { notifications } = require("../../models");

async function getUnreadNotifications (req, res) {
    try {
        const { user_id } = req.decoded;

        if (!user_id) {
            return res.status(400).send({
                success: false,
                error: "User id not found",
            })
        }

        const data = notifications.find({ customer_id: user_id, status: "unread" }).sort({ createdAt: -1 });

        if (!data) {
            return res.status(404).send({
                success: false,
                error: "No unread notifications found for this user"
            })
        }

        res.status(200).send({
            success: true,
            data: {
                data
            },
            message: "Unread notifications fetched successfully"
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

module.exports = getUnreadNotifications;