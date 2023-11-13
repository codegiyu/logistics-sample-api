const config = require("../config/auth.config");
const jwt = require("jsonwebtoken");

const isLoggedIn = (req, res, next) => {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
        return res.status(401).send({
            error: "No authorization header"
        })
    }

    const [authType, token] = authorizationHeader.split(" ");

    if (authType !== "Bearer") {
        return res.status(401).send({
            error: "User unauthorized!"
        })
    }

    const decoded = jwt.verify(token, config.secret);
    req.decoded = decoded;
    next();
}

module.exports = isLoggedIn;