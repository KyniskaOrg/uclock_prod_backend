const { User } = require("../models");
const { comparePassword, generateAuthToken } = require("../utils/auth");

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email
    const user = await User.findOne({
      where: { email },
    });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Compare the provided password with the stored hashed password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid credentials." });
    }

    // Generate a JWT token for the user
    const token = generateAuthToken(user.user_id, user.role);

    return res.status(200).json({
      message: "Login successful",
      token, // Send the token in the response
      user: {
        email: user.email,
        role: user.role,
        username: user.username,
        user_id: user.user_id,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error." });
  }
};

module.exports = { loginUser };
