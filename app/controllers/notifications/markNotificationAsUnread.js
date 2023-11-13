const { notifications } = require("../../models");

async function markNotificationAsUnread (req, res) {
    try {
        const { id: notification_id } = req.params;
        const { user_id } = req.decoded;

        const notification = await notifications.findById(notification_id);

        if (!notification) {
            return res.status(404).send({
                success: false,
                error: "Notification not found",
                message: "Notification update failed"
            })
        }

        if (notification.customer_id !== user_id) {
            return res.status(403).send({
                success: false,
                error: "Action not permitted to this user",
                message: "Forbidden"
            })
        }

        await notifications.findByIdAndUpdate(notification_id, {
            status: "unread"
        })

        return res.status(200).send({
            success: false,
            message: "Notification marked as unread successfully"
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

module.exports = markNotificationAsUnread;