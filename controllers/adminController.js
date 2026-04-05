const User = require('../models/User');

exports.getUsers = async (req, res) => {
  // console.log("test1");
  try {
    const users = await User.find({}, 'name email tokens createdAt');

    const userData = users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      tokens: u.tokens,
      createdAt: u.createdAt
    }));

    res.json(userData);
  } catch (error) {
    console.log("err");
    res.status(500).json({ error: 'Failed to fetch admin users data' });
  }
};

exports.updateUserTokens = async (req, res) => {
  try {
    const { tokens } = req.body;
    if (typeof tokens !== 'number' || tokens < 0) {
      return res.status(400).json({ error: 'Invalid tokens value' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { tokens },
      { new: true }
    );

    if (!user) return res.status(404).json({ error: 'User not found' });

    res.json({ message: 'Tokens updated successfully', tokens: user.tokens });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update tokens' });
  }
};