import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCredentials } from '../redux/slices/authSlice';
import { getProfile, updateProfile } from '../services/profileService';
import toast from 'react-hot-toast';
import LoadingSpinner from '../components/LoadingSpinner';
import { FaSave, FaCreditCard, FaLock, FaMobileAlt, FaEye, FaEyeSlash } from 'react-icons/fa';

const PaymentOptionsPage = () => {
  const dispatch = useDispatch();
  const { userInfo } = useSelector((state) => state.auth);
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  
  // Need entire profile to send back to updateProfile
  const [profile, setProfile] = useState({});
  const [paymentOptions, setPaymentOptions] = useState({
    upiId: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const profileData = await getProfile();
      setProfile(profileData);
      
      if (profileData.paymentOptions) {
        setPaymentOptions({
          upiId: profileData.paymentOptions.upiId || '',
          cardNumber: profileData.paymentOptions.cardNumber || '',
          expiryDate: profileData.paymentOptions.expiryDate || '',
          cvv: profileData.paymentOptions.cvv || '',
        });
      }
    } catch (error) {
      toast.error('Failed to load payment options');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setPaymentOptions({
      ...paymentOptions,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      
      // Merge with main profile to avoid erasing other fields
      const updatedData = {
        ...profile,
        paymentOptions
      };

      const updatedProfile = await updateProfile(updatedData);
      
      // Update Redux just in case
      dispatch(setCredentials({
        ...userInfo,
        name: updatedProfile.name,
        email: updatedProfile.email,
        paymentOptions: updatedProfile.paymentOptions
      }));
      
      toast.success('Payment options saved successfully');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update payment options');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <LoadingSpinner size="large" text="Loading Payment Options..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
              <FaCreditCard className="text-red-600" /> Payment Options
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-2">
              Save your payment methods securely. These will be auto-filled during checkout for faster booking.
            </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 md:p-8">
            <form onSubmit={handleSubmit} className="space-y-8" autoComplete="off">
                {/* UPI Section */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                        <FaMobileAlt className="text-blue-500" /> UPI ID
                    </h2>
                    <div className="max-w-md">
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Saved UPI ID
                        </label>
                        <input
                            type="text"
                            name="upiId"
                            value={paymentOptions.upiId}
                            onChange={handleChange}
                            placeholder="username@upi"
                            autoComplete="off"
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        />
                    </div>
                </div>

                {/* Card Section */}
                <div className="space-y-4 pt-4">
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2 border-b border-gray-100 dark:border-gray-700 pb-2">
                        <FaCreditCard className="text-blue-500" /> Credit / Debit Card
                    </h2>
                    
                    <div className="max-w-md space-y-5">
                      <div>
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              Card Number
                          </label>
                          <input
                              type="text"
                              name="cardNumber"
                              value={paymentOptions.cardNumber}
                              onChange={handleChange}
                              placeholder="XXXX XXXX XXXX XXXX"
                              maxLength="19"
                              autoComplete="off"
                              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all tracking-widest font-mono"
                          />
                      </div>

                      <div className="flex gap-4">
                        <div className="flex-1">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              Expiry Date
                          </label>
                          <input
                              type="text"
                              name="expiryDate"
                              value={paymentOptions.expiryDate}
                              onChange={handleChange}
                              placeholder="MM/YY"
                              maxLength="5"
                              autoComplete="off"
                              className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all text-center"
                          />
                        </div>
                        <div className="flex-1">
                          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                              CVV
                          </label>
                          <div className="relative">
                            <input
                                type={showCvv ? "text" : "password"}
                                name="cvv"
                                value={paymentOptions.cvv}
                                onChange={handleChange}
                                placeholder="***"
                                maxLength="4"
                                autoComplete="new-password"
                                className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all tracking-widest text-center font-mono"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCvv(!showCvv)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                            >
                                {showCvv ? <FaEyeSlash /> : <FaEye />}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                </div>

                <div className="flex items-center gap-4 pt-8">
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-8 py-3.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-all shadow-lg hover:-translate-y-0.5 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-red-600/30"
                  >
                    <FaLock className={saving ? 'animate-pulse' : ''} />
                    {saving ? 'Saving Securely...' : 'Save Securely'}
                  </button>
                </div>
            </form>
        </div>
      </div>
    </div>
  );
};

export default PaymentOptionsPage;
