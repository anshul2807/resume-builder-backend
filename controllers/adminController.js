const User = require('../models/User');
const EnhanceUsage = require('../models/EnhanceUsage');

exports.getUsers = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const users = await User.find({}, 'name email dailyLimit');
    const usages = await EnhanceUsage.find({ date: today });
    
    const usageMap = usages.reduce((acc, usage) => {
      acc[usage.userId.toString()] = usage.count;
      return acc;
    }, {});

    const userData = users.map(u => ({
      id: u._id,
      name: u.name,
      email: u.email,
      dailyLimit: u.dailyLimit,
      usedToday: usageMap[u._id.toString()] || 0
    }));

    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch admin users data' });
  }
};

exports.updateUserLimit = async (req, res) => {
  try {
    const { dailyLimit } = req.body;
    if (typeof dailyLimit !== 'number' || dailyLimit < 0) {
      return res.status(400).json({ error: 'Invalid daily limit' });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id, 
      { dailyLimit }, 
      { new: true }
    );
    
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    res.json({ message: 'Limit updated successfully', dailyLimit: user.dailyLimit });
  } catch (error) {
    res.status(500).json({ error: 'Failed to update limit' });
  }
};