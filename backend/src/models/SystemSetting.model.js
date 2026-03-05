import mongoose from 'mongoose';

const systemSettingSchema = new mongoose.Schema({
  siteName: {
    type: String,
    required: true,
    default: 'MovieDeck'
  },
  currencySymbol: {
    type: String,
    required: true,
    default: '$' // Default to Dollar
  },
  currencyCode: {
    type: String,
    default: 'USD'
  }
}, { timestamps: true });

const SystemSetting = mongoose.model('SystemSetting', systemSettingSchema);
export default SystemSetting;