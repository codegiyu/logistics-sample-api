const isCustomer = (req, res, next) => {
    if (req.decoded.role === "customer") {
        next();
    } else {
        res.status(403).send({
            success: false,
            error: "Action not allowed to user with this role!"
        })
    }
}

module.exports = isCustomer;