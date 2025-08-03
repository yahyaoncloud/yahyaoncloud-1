import React, { useState } from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Camera,
  Edit3,
  Save,
  X,
  Shield,
  Bell,
  Lock,
  Globe,
  Calendar,
  Award,
  BookOpen,
  TrendingUp,
  Users,
} from "lucide-react";

type UserProfile = {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  bio: string;
  avatar: string;
  role: string;
  joinDate: string;
  lastActive: string;
  preferences: {
    emailNotifications: boolean;
    pushNotifications: boolean;
    publicProfile: boolean;
    analyticsSharing: boolean;
  };
  stats: {
    totalPosts: number;
    totalViews: number;
    followers: number;
    following: number;
  };
  socialLinks: {
    twitter: string;
    linkedin: string;
    github: string;
    website: string;
  };
};

const mockProfile: UserProfile = {
  id: "admin_001",
  name: "Alex Johnson",
  email: "alex.johnson@blogsite.com",
  phone: "+1 (555) 123-4567",
  location: "San Francisco, CA",
  bio: "Passionate blogger and tech enthusiast. I write about web development, design trends, and digital marketing. Always learning something new!",
  avatar: "/api/placeholder/120/120",
  role: "Admin",
  joinDate: "2022-03-15",
  lastActive: "2 hours ago",
  preferences: {
    emailNotifications: true,
    pushNotifications: false,
    publicProfile: true,
    analyticsSharing: false,
  },
  stats: {
    totalPosts: 47,
    totalViews: 28500,
    followers: 1240,
    following: 186,
  },
  socialLinks: {
    twitter: "@alexjohnson",
    linkedin: "alexjohnson",
    github: "alexjohnson-dev",
    website: "alexjohnson.blog",
  },
};

const ProfileCard: React.FC<{
  title: string;
  children: React.ReactNode;
  icon: React.ReactNode;
  className?: string;
}> = ({ title, children, icon, className = "" }) => (
  <div
    className={`bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20 ${className}`}
  >
    <div className="flex items-center gap-3 mb-4">
      <div className="p-2 bg-white/20 rounded-lg">{icon}</div>
      <h3 className="text-xl font-semibold text-white">{title}</h3>
    </div>
    {children}
  </div>
);

const StatCard: React.FC<{
  label: string;
  value: string | number;
  icon: React.ReactNode;
  gradient: string;
}> = ({ label, value, icon, gradient }) => (
  <div
    className="p-4 rounded-xl text-white relative overflow-hidden"
    style={{ background: `linear-gradient(135deg, ${gradient})` }}
  >
    <div className="absolute top-0 right-0 w-16 h-16 opacity-20">
      <div className="absolute inset-0 bg-white rounded-full transform translate-x-8 -translate-y-8"></div>
    </div>
    <div className="relative z-10">
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 bg-white/20 rounded-lg">{icon}</div>
      </div>
      <div className="text-2xl font-bold mb-1">{value}</div>
      <div className="text-white/80 text-sm">{label}</div>
    </div>
  </div>
);

const ToggleSwitch: React.FC<{
  checked: boolean;
  onChange: (checked: boolean) => void;
  label: string;
  description: string;
}> = ({ checked, onChange, label, description }) => (
  <div className="flex items-center justify-between p-4 bg-white/5 rounded-lg">
    <div>
      <div className="text-white font-medium">{label}</div>
      <div className="text-white/70 text-sm">{description}</div>
    </div>
    <button
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
        checked ? "bg-purple-600" : "bg-gray-600"
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

export default function AdminProfile() {
  const [profile, setProfile] = useState<UserProfile>(mockProfile);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(mockProfile);

  const handleSave = () => {
    setProfile(editedProfile);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditedProfile(profile);
    setIsEditing(false);
  };

  const updatePreference = (
    key: keyof UserProfile["preferences"],
    value: boolean
  ) => {
    setProfile((prev) => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value,
      },
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Profile Settings
            </h1>
            <p className="text-white/70">
              Manage your account settings and preferences
            </p>
          </div>

          <div className="flex gap-3">
            {!isEditing ? (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white transition-colors"
              >
                <Edit3 className="w-4 h-4" />
                Edit Profile
              </button>
            ) : (
              <div className="flex gap-2">
                <button
                  onClick={handleSave}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded-lg text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                  Cancel
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Profile Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Info */}
          <ProfileCard
            title="Profile Information"
            icon={<User className="w-5 h-5 text-white" />}
          >
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold">
                  {profile.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <button className="absolute -bottom-2 -right-2 p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                  <Camera className="w-4 h-4 text-white" />
                </button>
              </div>

              {/* Profile Details */}
              <div className="flex-1 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">
                      Full Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editedProfile.name}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            name: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    ) : (
                      <div className="text-white font-medium">
                        {profile.name}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm mb-2">
                      Role
                    </label>
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-purple-400" />
                      <span className="text-white font-medium">
                        {profile.role}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-white/80 text-sm mb-2">
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        value={editedProfile.email}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            email: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-white/60" />
                        <span className="text-white">{profile.email}</span>
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-white/80 text-sm mb-2">
                      Phone
                    </label>
                    {isEditing ? (
                      <input
                        type="tel"
                        value={editedProfile.phone}
                        onChange={(e) =>
                          setEditedProfile({
                            ...editedProfile,
                            phone: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      />
                    ) : (
                      <div className="flex items-center gap-2">
                        <Phone className="w-4 h-4 text-white/60" />
                        <span className="text-white">{profile.phone}</span>
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    Location
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editedProfile.location}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          location: e.target.value,
                        })
                      }
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  ) : (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-white/60" />
                      <span className="text-white">{profile.location}</span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-white/80 text-sm mb-2">
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editedProfile.bio}
                      onChange={(e) =>
                        setEditedProfile({
                          ...editedProfile,
                          bio: e.target.value,
                        })
                      }
                      rows={3}
                      className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
                    />
                  ) : (
                    <div className="text-white/90">{profile.bio}</div>
                  )}
                </div>
              </div>
            </div>
          </ProfileCard>

          {/* Social Links */}
          <ProfileCard
            title="Social Links"
            icon={<Globe className="w-5 h-5 text-white" />}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-white/80 text-sm mb-2">
                  Twitter
                </label>
                <input
                  type="text"
                  value={profile.socialLinks.twitter}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="@username"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm mb-2">
                  LinkedIn
                </label>
                <input
                  type="text"
                  value={profile.socialLinks.linkedin}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="username"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm mb-2">
                  GitHub
                </label>
                <input
                  type="text"
                  value={profile.socialLinks.github}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="username"
                />
              </div>
              <div>
                <label className="block text-white/80 text-sm mb-2">
                  Website
                </label>
                <input
                  type="text"
                  value={profile.socialLinks.website}
                  className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="yoursite.com"
                />
              </div>
            </div>
          </ProfileCard>

          {/* Preferences */}
          <ProfileCard
            title="Preferences"
            icon={<Bell className="w-5 h-5 text-white" />}
          >
            <div className="space-y-4">
              <ToggleSwitch
                checked={profile.preferences.emailNotifications}
                onChange={(checked) =>
                  updatePreference("emailNotifications", checked)
                }
                label="Email Notifications"
                description="Receive email updates about your blog activity"
              />
              <ToggleSwitch
                checked={profile.preferences.pushNotifications}
                onChange={(checked) =>
                  updatePreference("pushNotifications", checked)
                }
                label="Push Notifications"
                description="Get browser notifications for important updates"
              />
              <ToggleSwitch
                checked={profile.preferences.publicProfile}
                onChange={(checked) =>
                  updatePreference("publicProfile", checked)
                }
                label="Public Profile"
                description="Make your profile visible to other users"
              />
              <ToggleSwitch
                checked={profile.preferences.analyticsSharing}
                onChange={(checked) =>
                  updatePreference("analyticsSharing", checked)
                }
                label="Analytics Sharing"
                description="Share anonymous usage data to improve the platform"
              />
            </div>
          </ProfileCard>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <ProfileCard
            title="Quick Stats"
            icon={<TrendingUp className="w-5 h-5 text-white" />}
          >
            <div className="grid grid-cols-2 gap-4">
              <StatCard
                label="Total Posts"
                value={profile.stats.totalPosts}
                icon={<BookOpen className="w-4 h-4" />}
                gradient="rgba(59, 130, 246, 0.8), rgba(99, 102, 241, 0.8)"
              />
              <StatCard
                label="Total Views"
                value={`${(profile.stats.totalViews / 1000).toFixed(1)}k`}
                icon={<TrendingUp className="w-4 h-4" />}
                gradient="rgba(16, 185, 129, 0.8), rgba(5, 150, 105, 0.8)"
              />
              <StatCard
                label="Followers"
                value={profile.stats.followers}
                icon={<Users className="w-4 h-4" />}
                gradient="rgba(245, 158, 11, 0.8), rgba(217, 119, 6, 0.8)"
              />
              <StatCard
                label="Following"
                value={profile.stats.following}
                icon={<User className="w-4 h-4" />}
                gradient="rgba(139, 92, 246, 0.8), rgba(124, 58, 237, 0.8)"
              />
            </div>
          </ProfileCard>

          {/* Account Info */}
          <ProfileCard
            title="Account Info"
            icon={<Calendar className="w-5 h-5 text-white" />}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-white/80">Member since</span>
                <span className="text-white font-medium">
                  {new Date(profile.joinDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Last active</span>
                <span className="text-white font-medium">
                  {profile.lastActive}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-white/80">Account ID</span>
                <span className="text-white font-mono text-sm">
                  {profile.id}
                </span>
              </div>
            </div>
          </ProfileCard>

          {/* Security */}
          <ProfileCard
            title="Security"
            icon={<Lock className="w-5 h-5 text-white" />}
          >
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-left transition-colors">
                Change Password
              </button>
              <button className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-left transition-colors">
                Two-Factor Authentication
              </button>
              <button className="w-full px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-white text-left transition-colors">
                Active Sessions
              </button>
              <button className="w-full px-4 py-2 bg-red-600/20 hover:bg-red-600/30 rounded-lg text-red-300 text-left transition-colors">
                Delete Account
              </button>
            </div>
          </ProfileCard>
        </div>
      </div>
    </div>
  );
}
