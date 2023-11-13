const isRider = (req, res, next) => {
    if (req.decoded.role === "rider") {
        next();
    } else {
        res.status(403).send({
            success: false,
            error: "Action not allowed to user with this role!"
        })
    }
}

module.exports = isRider;