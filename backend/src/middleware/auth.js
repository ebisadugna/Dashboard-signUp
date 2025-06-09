import jwt from "jsonwebtoken"
import User from "../models/User.js"

export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"]
  const token = authHeader && authHeader.split(" ")[1]

  if (token == null) {
    return res.sendStatus(401)
  }

  jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret", async (err, user) => {
    if (err) {
      return res.sendStatus(403)
    }

    try {
      const foundUser = await User.findById(user.userId)
      if (!foundUser) {
        return res.sendStatus(403)
      }
      req.user = foundUser
      next()
    } catch (error) {
      console.error("Error finding user:", error)
      return res.sendStatus(500)
    }
  })
}

export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next()
  } else {
    return res.sendStatus(403)
  }
}
