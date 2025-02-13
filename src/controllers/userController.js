const { User } = require('../models');
const { hashPassword } = require('../utils/auth');

const registerUser = async (req, res) => {
  const { username, email, password, role } = req.body;

  // Check if email or username already exists
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    return res.status(400).json({ message: 'Email already in use.' });
  }

  const hashedPassword = await hashPassword(password);

  try {
     await User.create({
      username,
      email,
      password: hashedPassword,
      role: role || 'user', // Default role to 'user'
    });

    return res.status(201).json({ message: 'User created successfully.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Server error.' });
  }
};

module.exports = { registerUser };
