import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getProfile } from '../services/profileService';
import toast from 'react-hot-toast';
import { FaExclamationCircle, FaTimes } from 'react-icons/fa';

const ProfileCompletionPrompt = () => {
  const { userInfo } = useSelector((state) => state.auth);
  const [showPrompt, setShowPrompt] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (!userInfo) return;

    const checkProfileCompletion = async () => {
      try {
        const profile = await getProfile();
        
        // Check if profile is incomplete
        if (!profile.isProfileComplete && !dismissed) {
          setShowPrompt(true);
        }
      } catch (error) {
        console.error('Error checking profile completion:', error);
      }
    };

    checkProfileCompletion();
  }, [userInfo, dismissed]);

  const handleDismiss = () => {
    setDismissed(true);
    setShowPrompt(false);
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md animate-slide-up">
      <div className="bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg shadow-2xl p-4 flex items-start gap-3">
        <FaExclamationCircle className="text-2xl flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-bold text-lg mb-1">Complete Your Profile</h3>
          <p className="text-sm text-white/90 mb-3">
            Please add your city and phone number to complete your profile and enjoy a better experience.
          </p>
          <div className="flex items-center gap-2">
            <Link
              to="/profile"
              className="px-4 py-2 bg-white text-red-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors text-sm"
              onClick={() => setShowPrompt(false)}
            >
              Complete Profile
            </Link>
            <button
              onClick={handleDismiss}
              className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white font-semibold rounded-lg transition-colors text-sm"
            >
              Later
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-white/80 hover:text-white transition-colors flex-shrink-0"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default ProfileCompletionPrompt;
