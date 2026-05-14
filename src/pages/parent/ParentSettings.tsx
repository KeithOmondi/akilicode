// frontend/src/components/parent/ParentSettings.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  FiUser,
  FiMail,
  FiPhone,
  FiLock,
  FiSave,
  FiTrash2,
  FiShield,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
} from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { updatePassword, resetAuthState } from '../../store/slices/authSlice';
import {
  updateParentProfile,
  requestAccountDeletion,
  enableTwoFactor,
  disableTwoFactor,
  clearAuthMessage,
  clearAuthError,
} from '../../store/slices/userSlice';
import type { User } from '../../interfaces/auth.interface';

// Extends the shared User type with the 2FA flag that the backend returns
// but that hasn't been added to the shared interface yet.
// TODO: move two_factor_enabled into the shared User interface and remove this.
type ParentUser = User & { two_factor_enabled?: boolean };

const ParentSettings: React.FC = () => {
  const dispatch = useAppDispatch();

  // ─── Selectors ──────────────────────────────────────────────────────────────
  // The logged-in user is hydrated into authSlice on login/refresh — use it
  // directly so profile fields are always populated without an extra fetch.
  const { user: rawUser, loading: authLoading } = useAppSelector((state) => state.auth);
  const user = rawUser as ParentUser | null;

  // userSlice owns mutation feedback (profile update, 2FA, deletion)
  const {
    loading: userLoading,
    message,
    error,
  } = useAppSelector((state) => state.user.auth);

  const loading = authLoading || userLoading;

  // ─── Profile state ──────────────────────────────────────────────────────────
  const [profileForm, setProfileForm] = useState(() => ({
    name: user?.name ?? '',
    phone: user?.phone ?? '',
  }));
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  // ─── Password state ─────────────────────────────────────────────────────────
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // ─── 2FA state ──────────────────────────────────────────────────────────────
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = useState(
    () => user?.two_factor_enabled ?? false,
  );
  const [twoFactorPassword, setTwoFactorPassword] = useState('');
  const [showTwoFactorDialog, setShowTwoFactorDialog] = useState(false);

  // ─── Delete state ───────────────────────────────────────────────────────────
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState('');

  // ─── Snackbar ───────────────────────────────────────────────────────────────
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    type: 'success' as 'success' | 'error',
  });

  const showError = (msg: string) =>
    setSnackbar({ open: true, message: msg, type: 'error' });

  // ─── Sync form when authSlice user reference changes (post-save refresh) ────
  const prevUserRef = useRef<ParentUser | null>(user);
  useEffect(() => {
    if (user && user !== prevUserRef.current) {
      prevUserRef.current = user;
      setProfileForm({ name: user.name ?? '', phone: user.phone ?? '' });
      setIsTwoFactorEnabled(user.two_factor_enabled ?? false);
    }
  }, [user]);

  // ─── Snackbar from userSlice mutation feedback ───────────────────────────────
  const lastMessageRef = useRef<string | null>(null);
  useEffect(() => {
    if (message && message !== lastMessageRef.current) {
      lastMessageRef.current = message;
      setSnackbar({ open: true, message, type: 'success' });
      dispatch(clearAuthMessage());
    }
  }, [message, dispatch]);

  const lastErrorRef = useRef<string | null>(null);
  useEffect(() => {
    if (error && error !== lastErrorRef.current) {
      lastErrorRef.current = error;
      setSnackbar({ open: true, message: error, type: 'error' });
      dispatch(clearAuthError());
    }
  }, [error, dispatch]);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setProfileForm({ ...profileForm, [e.target.name]: e.target.value });

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });

  const handleUpdateProfile = async () => {
    try {
      await dispatch(updateParentProfile(profileForm)).unwrap();
      setIsEditingProfile(false);
    } catch {
      // surfaced via userSlice error → snackbar
    }
  };

  const handleChangePassword = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      showError('New passwords do not match');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      showError('Password must be at least 6 characters');
      return;
    }
    try {
      await dispatch(
        updatePassword({
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
        }),
      ).unwrap();
      setSnackbar({ open: true, message: 'Password updated successfully', type: 'success' });
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      dispatch(resetAuthState());
    } catch {
      setSnackbar({
        open: true,
        message: 'Failed to update password. Check your current password and try again.',
        type: 'error',
      });
    }
  };

  const handleToggleTwoFactor = async () => {
    if (isTwoFactorEnabled) {
      setShowTwoFactorDialog(true);
    } else {
      try {
        await dispatch(enableTwoFactor()).unwrap();
        setIsTwoFactorEnabled(true);
      } catch {
        // surfaced via userSlice error → snackbar
      }
    }
  };

  const handleDisableTwoFactor = async () => {
    if (!twoFactorPassword) {
      showError('Please enter your password to disable 2FA');
      return;
    }
    try {
      await dispatch(disableTwoFactor({ password: twoFactorPassword })).unwrap();
      setIsTwoFactorEnabled(false);
      setShowTwoFactorDialog(false);
      setTwoFactorPassword('');
    } catch {
      // surfaced via userSlice error → snackbar
    }
  };

  const handleRequestDeletion = async () => {
    if (deleteConfirmation !== 'DELETE') {
      showError('Please type DELETE to confirm account deletion');
      return;
    }
    try {
      await dispatch(requestAccountDeletion()).unwrap();
      setShowDeleteDialog(false);
      setDeleteConfirmation('');
    } catch {
      // surfaced via userSlice error → snackbar
    }
  };

  // ─── Render ─────────────────────────────────────────────────────────────────

  if (authLoading && !user) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Parent Settings</h1>
      <p className="text-gray-600 mb-8">
        Manage your account settings, security preferences, and privacy options
      </p>

      {/* ── Profile Information ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-900">Profile Information</h2>
          {!isEditingProfile && (
            <button
              onClick={() => setIsEditingProfile(true)}
              className="px-4 py-2 text-sm font-medium text-primary-600 border border-primary-600 rounded-lg hover:bg-primary-50 transition-colors"
            >
              Edit Profile
            </button>
          )}
        </div>
        <div className="border-t border-gray-200 mb-4"></div>

        {isEditingProfile ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiUser className="inline mr-2" />
                Name
              </label>
              <input
                type="text"
                name="name"
                value={profileForm.name}
                onChange={handleProfileChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiMail className="inline mr-2" />
                Email
              </label>
              <input
                type="email"
                value={user?.email ?? ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FiPhone className="inline mr-2" />
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={profileForm.phone}
                onChange={handleProfileChange}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-100"
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setIsEditingProfile(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateProfile}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <FiSave />
                )}
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600 mb-1">Name</p>
              <p className="text-base font-medium text-gray-900">{user?.name || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Email</p>
              <p className="text-base font-medium text-gray-900">{user?.email || '—'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Phone</p>
              <p className="text-base font-medium text-gray-900">{user?.phone || 'Not set'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Account Created</p>
              <p className="text-base font-medium text-gray-900">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Security Settings ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Security Settings</h2>
        <div className="border-t border-gray-200 mb-4"></div>

        {/* Change Password */}
        <div className="border border-gray-200 rounded-lg p-5 mb-5">
          <div className="flex items-center gap-2 mb-4">
            <FiLock className="text-primary-600 text-xl" />
            <h3 className="text-lg font-semibold text-gray-900">Change Password</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrentPassword ? 'text' : 'password'}
                  name="currentPassword"
                  value={passwordForm.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNewPassword ? 'text' : 'password'}
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Confirm New Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
              </div>
            </div>
            <div>
              <button
                onClick={handleChangePassword}
                disabled={loading || !passwordForm.currentPassword || !passwordForm.newPassword}
                className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
              >
                Update Password
              </button>
            </div>
          </div>
        </div>

        {/* Two-Factor Authentication */}
        <div className="border border-gray-200 rounded-lg p-5">
          <div className="flex items-center gap-2 mb-4">
            <FiShield className="text-primary-600 text-xl" />
            <h3 className="text-lg font-semibold text-gray-900">Two-Factor Authentication</h3>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">
                  {isTwoFactorEnabled ? 'Enabled' : 'Disabled'}
                </span>
                <button
                  onClick={handleToggleTwoFactor}
                  disabled={loading}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 ${
                    isTwoFactorEnabled ? 'bg-primary-600' : 'bg-gray-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isTwoFactorEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <p className="text-sm text-gray-600 mt-2">
                {isTwoFactorEnabled
                  ? 'Two-factor authentication adds an extra layer of security to your account.'
                  : 'Enable two-factor authentication to add an extra layer of security to your account.'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Danger Zone ─────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-lg shadow-sm border-2 border-red-200 p-6">
        <h2 className="text-xl font-semibold text-red-600 mb-4">Danger Zone</h2>
        <div className="border-t border-red-200 mb-4"></div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Delete Account</h3>
          <p className="text-gray-600 mb-4">
            Once you delete your account, there is no going back. This action is irreversible and
            will permanently delete all your data, including your kids' accounts and all associated
            information.
          </p>
          <button
            onClick={() => setShowDeleteDialog(true)}
            className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition-colors flex items-center gap-2"
          >
            <FiTrash2 />
            Request Account Deletion
          </button>
        </div>
      </div>

      {/* ── 2FA Disable Dialog ──────────────────────────────────────────────── */}
      {showTwoFactorDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setShowTwoFactorDialog(false)}
            ></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Disable Two-Factor Authentication
              </h3>
              <p className="text-gray-600 mb-4">
                To disable two-factor authentication, please enter your password to confirm your
                identity.
              </p>
              <input
                type="password"
                placeholder="Enter your password"
                value={twoFactorPassword}
                onChange={(e) => setTwoFactorPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent mb-4"
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowTwoFactorDialog(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDisableTwoFactor}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Disable 2FA
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Account Dialog ───────────────────────────────────────────── */}
      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div
              className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
              onClick={() => setShowDeleteDialog(false)}
            ></div>
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <h3 className="text-xl font-semibold text-red-600 mb-4">Delete Account</h3>
              <p className="text-gray-600 mb-4">
                This action is <strong>irreversible</strong>. Please read carefully:
              </p>
              <ul className="list-disc list-inside text-gray-600 mb-4 space-y-1">
                <li>All your personal data will be permanently deleted</li>
                <li>All kid accounts under your supervision will be deleted</li>
                <li>All activity data and consent records will be removed</li>
                <li>You will lose access to all associated services</li>
              </ul>
              <p className="text-gray-600 mb-2">
                Type <strong className="font-bold">DELETE</strong> in the field below to confirm:
              </p>
              <input
                type="text"
                placeholder="DELETE"
                value={deleteConfirmation}
                onChange={(e) => setDeleteConfirmation(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent mb-4"
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setShowDeleteDialog(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRequestDeletion}
                  className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700"
                >
                  Permanently Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Snackbar ────────────────────────────────────────────────────────── */}
      {snackbar.open && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
          <div
            className={`flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg ${
              snackbar.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            <FiAlertCircle
              className={snackbar.type === 'success' ? 'text-green-500' : 'text-red-500'}
            />
            <span>{snackbar.message}</span>
            <button
              onClick={() => setSnackbar((s) => ({ ...s, open: false }))}
              className="ml-4 text-gray-500 hover:text-gray-700"
            >
              ×
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentSettings;