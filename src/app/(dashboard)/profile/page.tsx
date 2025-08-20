"use client";

import React, { useState, useRef } from 'react';
import { useAuth } from '@/contexts/auth-context';
import { 
  User, 
  Camera, 
  Save, 
  Building2, 
  Mail, 
  Phone, 
  MapPin,
  Edit3,
  Upload
} from 'lucide-react';

const centres = [
  { id: 'head_office', name: 'Head Office', code: 'HO' },
  { id: 'centre_papamoa', name: 'Papamoa Beach', code: 'CC1' },
  { id: 'centre_boulevard', name: 'The Boulevard', code: 'CC2' },
  { id: 'centre_bach', name: 'The Bach', code: 'CC3' },
  { id: 'centre_terrace', name: 'Terrace Views', code: 'CC4' },
  { id: 'centre_livingstone', name: 'Livingstone Drive', code: 'CC5' },
  { id: 'centre_westdune', name: 'West Dune', code: 'CC6' }
];

export default function ProfilePage() {
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Profile data state - initialize with user data or defaults
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.email === 'courtney@futurefocus.co.nz' ? '+64 21 123 4567' : '',
    position: user?.email === 'courtney@futurefocus.co.nz' ? 'Operations Manager' : 'Staff Member',
    centreId: user?.email === 'courtney@futurefocus.co.nz' ? 'head_office' : 'centre_papamoa',
    profileImage: null as string | null,
    bio: user?.email === 'courtney@futurefocus.co.nz' 
      ? 'Operations Manager overseeing childcare centres across Tauranga and Mount Maunganui. Passionate about early childhood education and creating safe, nurturing environments for children to learn and grow.'
      : 'Dedicated childcare professional committed to providing quality care and education for children.'
  });

  // Update profile data when user changes
  React.useEffect(() => {
    if (user) {
      setProfileData(prev => ({
        ...prev,
        name: user.name || '',
        email: user.email || '',
        phone: user.email === 'courtney@futurefocus.co.nz' ? '+64 21 123 4567' : prev.phone,
        position: user.email === 'courtney@futurefocus.co.nz' ? 'Operations Manager' : 'Staff Member',
        centreId: user.email === 'courtney@futurefocus.co.nz' ? 'head_office' : 'centre_papamoa',
        bio: user.email === 'courtney@futurefocus.co.nz' 
          ? 'Operations Manager overseeing childcare centres across Tauranga and Mount Maunganui. Passionate about early childhood education and creating safe, nurturing environments for children to learn and grow.'
          : 'Dedicated childcare professional committed to providing quality care and education for children.'
      }));
    }
  }, [user]);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setSaving] = useState(false);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setProfileData(prev => ({
          ...prev,
          profileImage: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsEditing(false);
    setSaving(false);
    // Here you would typically make an API call to save the profile data
  };

  const selectedCentre = centres.find(c => c.id === profileData.centreId);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-blue-500 to-teal-500"></div>
        <div className="relative px-6 pb-6">
          {/* Profile Image */}
          <div className="relative -mt-16 mb-4">
            <div className="relative w-32 h-32 rounded-full border-4 border-white bg-white shadow-lg overflow-hidden">
              {profileData.profileImage ? (
                <img 
                  src={profileData.profileImage} 
                  alt="Profile" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                  <User className="w-12 h-12 text-gray-400" />
                </div>
              )}
              
              {isEditing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                >
                  <Camera className="w-6 h-6 text-white" />
                </button>
              )}
            </div>
            
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </div>

          {/* Profile Header */}
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{profileData.name}</h1>
              <p className="text-lg text-gray-600">{profileData.position}</p>
              <div className="flex items-center mt-2 text-sm text-gray-500">
                <Building2 className="w-4 h-4 mr-1" />
                {selectedCentre?.name}
              </div>
            </div>
            
            <div className="flex gap-2">
              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={loading}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    Save Changes
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Contact Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.name}
                      onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <User className="w-4 h-4 mr-2 text-gray-400" />
                      {profileData.name}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <Mail className="w-4 h-4 mr-2 text-gray-400" />
                      {profileData.email}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {profileData.phone}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Position
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profileData.position}
                      onChange={(e) => setProfileData(prev => ({ ...prev, position: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                    />
                  ) : (
                    <div className="flex items-center text-gray-900">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {profileData.position}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Work Location */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Work Location</h2>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Primary Centre
              </label>
              {isEditing ? (
                <select
                  value={profileData.centreId}
                  onChange={(e) => setProfileData(prev => ({ ...prev, centreId: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium"
                >
                  {centres.map((centre) => (
                    <option key={centre.id} value={centre.id}>
                      {centre.name} {centre.code !== 'HO' ? `(${centre.code})` : ''}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="flex items-center text-gray-900">
                  <Building2 className="w-4 h-4 mr-2 text-gray-400" />
                  {selectedCentre?.name} {selectedCentre?.code !== 'HO' ? `(${selectedCentre?.code})` : ''}
                </div>
              )}
            </div>
          </div>

          {/* Bio */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
            {isEditing ? (
              <textarea
                value={profileData.bio}
                onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 font-medium resize-none"
                placeholder="Tell us about yourself..."
              />
            ) : (
              <p className="text-gray-700 leading-relaxed">{profileData.bio}</p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Stats */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Role</span>
                <span className="font-medium text-purple-600">{user?.role}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Centres Access</span>
                <span className="font-medium text-blue-600">All (6)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Member Since</span>
                <span className="font-medium text-gray-900">Aug 2025</span>
              </div>
            </div>
          </div>

          {/* Centre List */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Centre Access</h3>
            <div className="space-y-2">
              {centres.map((centre) => (
                <div 
                  key={centre.id}
                  className={`flex items-center justify-between p-2 rounded-lg ${
                    centre.id === profileData.centreId 
                      ? 'bg-blue-50 border border-blue-200' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center">
                    <Building2 className={`w-4 h-4 mr-2 ${
                      centre.id === profileData.centreId ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <span className="text-sm font-medium text-gray-900">{centre.name}</span>
                  </div>
                  {centre.id === profileData.centreId && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Primary</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
