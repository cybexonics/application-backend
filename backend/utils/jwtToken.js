import jwt from "jsonwebtoken"

// Generate JWT token
export const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE,
  })
}

// Send token response with cookie
export const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = generateToken(user._id)

  // Cookie options
  const options = {
    expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
  }

  // Remove password from response
  user.password = undefined

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
    user,
  })
}
