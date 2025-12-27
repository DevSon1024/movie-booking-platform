import SystemSetting from '../models/SystemSetting.js';

// @desc    Get Global Settings
// @route   GET /api/settings
// @access  Public
const getSettings = async (req, res) => {
  let settings = await SystemSetting.findOne();
  
  // Auto-seed if missing
  if (!settings) {
    settings = await SystemSetting.create({
      siteName: 'MovieDeck',
      currencySymbol: '$',
      currencyCode: 'USD'
    });
  }
  
  res.json(settings);
};

// @desc    Update Global Settings
// @route   PUT /api/settings
// @access  Private/Admin
const updateSettings = async (req, res) => {
  const { siteName, currencySymbol, currencyCode } = req.body;
  
  let settings = await SystemSetting.findOne();
  
  if (settings) {
    settings.siteName = siteName || settings.siteName;
    settings.currencySymbol = currencySymbol || settings.currencySymbol;
    settings.currencyCode = currencyCode || settings.currencyCode;
    
    const updatedSettings = await settings.save();
    res.json(updatedSettings);
  } else {
    // Should not happen due to auto-seed in GET, but safe fallback
    const newSettings = await SystemSetting.create({
      siteName,
      currencySymbol,
      currencyCode
    });
    res.json(newSettings);
  }
};

export { getSettings, updateSettings };