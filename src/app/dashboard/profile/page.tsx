'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, Award, Save, Edit2, MessageSquare, Star, Upload, Image } from 'lucide-react';
import { toast } from 'sonner';
import Cookies from 'js-cookie';
import { fetchApi, api } from '@/lib/api';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  profileImage?: string;
  bio?: string;
  createdAt: string;
}

export default function ProfilePage() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [myReviews, setMyReviews] = useState<any[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingImageFile, setPendingImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    profileImage: '',
  });

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Always fetch fresh profile from server so latest profileImage (after Cloudinary upload) is loaded
        const res = await fetchApi(`${api.users}/profile`);
        const freshUser = res?.data;
        if (freshUser) {
          Cookies.set('user', JSON.stringify(freshUser), { expires: 7 });
          setUser(freshUser);
          setFormData({
            name: freshUser.name || '',
            bio: freshUser.bio || '',
            profileImage: freshUser.profileImage || '',
          });
          console.log('✅ [PROFILE] Loaded fresh user profile (image):', freshUser.profileImage);
        } else {
          // fallback to cookie
          const userData = Cookies.get('user');
          if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setFormData({
              name: parsedUser.name || '',
              bio: parsedUser.bio || '',
              profileImage: parsedUser.profileImage || '',
            });
          }
        }
      } catch (error) {
        console.warn('Could not fetch fresh profile, using cookie fallback');
        // fallback to cookie
        const userData = Cookies.get('user');
        if (userData) {
          try {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setFormData({
              name: parsedUser.name || '',
              bio: parsedUser.bio || '',
              profileImage: parsedUser.profileImage || '',
            });
          } catch (e) {
            console.error('Failed to parse user data from cookie');
          }
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
    fetchMyReviews();
  }, []);

  const fetchMyReviews = async () => {
    try {
      const res = await fetchApi(`${api.reviews}/user/my-reviews`);
      setMyReviews(res?.data?.reviews || []);
    } catch (e) {
      console.error('Failed to fetch reviews');
    }
  };

  // Helper: convert selected file to base64 data URL (sent inside the normal profile PATCH)
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleSave = async () => {
    if (!user) return;

    try {
      setUploadingImage(true);

      let imagePayload = formData.profileImage;
      const hadNewPhoto = !!pendingImageFile;

      // If a new photo was chosen, convert it to base64.
      // Backend will detect the data: URL, upload to Cloudinary, and save the final URL.
      if (pendingImageFile) {
        console.log('📸 [FRONTEND] New profile photo selected — converting to base64 for Cloudinary upload...');
        imagePayload = await fileToBase64(pendingImageFile);
        console.log('📦 [FRONTEND] Base64 ready (length:', imagePayload.length, 'chars) — sending inside PATCH /profile');
      }

      // Single API call - the normal profile update (no extra upload-image fetch)
      console.log('🚀 [FRONTEND] Saving profile (with possible image) to backend...');
      const res = await fetchApi(`${api.users}/profile`, {
        method: 'PATCH',
        body: JSON.stringify({
          name: formData.name,
          bio: formData.bio,
          profileImage: imagePayload,
        }),
      });

      const saved = res?.data;
      const updatedUser = saved || {
        ...user,
        name: formData.name,
        bio: formData.bio,
        profileImage: imagePayload,
      };

      console.log('✅ [FRONTEND] Profile saved! Final image URL from backend (Cloudinary):', updatedUser.profileImage);

      Cookies.set('user', JSON.stringify(updatedUser), { expires: 7 });
      setUser(updatedUser);

      // cleanup local preview
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
      setPendingImageFile(null);
      setPreviewUrl(null);
      setIsEditing(false);

      // Notify Navbar, Sidebar, DashboardLayout etc. to refresh their user state from updated cookie
      window.dispatchEvent(new CustomEvent('userProfileUpdated'));

      toast.success(hadNewPhoto 
        ? 'Profile + Photo uploaded to Cloudinary successfully!' 
        : 'Profile updated successfully!');

      if (hadNewPhoto && updatedUser.profileImage) {
        console.log('%c[VERIFY] Open this Cloudinary URL in new tab to confirm upload:', 'color: green', updatedUser.profileImage);
      }
    } catch (error: any) {
      console.error('Failed to save profile - full error:', error);
      const msg = error?.message || 'Failed to save profile';
      toast.error(msg, { duration: 6000 });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        profileImage: user.profileImage || '',
      });
    }

    // Cleanup pending image and preview
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPendingImageFile(null);
    setPreviewUrl(null);
    setIsEditing(false);
  };

  const handleProfileImageUpload = (file: File) => {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    // Store file locally. On Save we will convert to base64 and send inside the single profile PATCH call.
    setPendingImageFile(file);

    // Local preview only (no API call)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    const newPreview = URL.createObjectURL(file);
    setPreviewUrl(newPreview);

    // We keep formData.profileImage empty until save (backend will return final Cloudinary URL)
    setFormData(prev => ({ ...prev, profileImage: '' }));
  };

  const triggerImageUpload = () => {
    fileInputRef.current?.click();
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProfileImageUpload(file);
    }
    // Reset the input so the same file can be selected again if needed
    e.target.value = '';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return <div>User not found</div>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">My Profile</h1>
          <p className="text-gray-600 mt-1">Manage your account information</p>
        </div>
        {!isEditing ? (
          <Button onClick={() => setIsEditing(true)} className="gap-2">
            <Edit2 className="w-4 h-4" /> Edit Profile
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleSave} disabled={uploadingImage} className="gap-2">
               {uploadingImage ? (
                 <>
                   <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent" />
                   Uploading to Cloudinary...
                 </>
               ) : (
                 <>
                   <Save className="w-4 h-4" /> Save Changes
                 </>
               )}
             </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
               <Avatar 
                 className={`w-24 h-24 mb-4 relative ${isEditing ? 'cursor-pointer' : ''} ${uploadingImage ? 'opacity-50' : ''}`}
                 onClick={() => {
                   if (isEditing && !uploadingImage) {
                     triggerImageUpload();
                   }
                 }}
               >
                   <AvatarImage key={previewUrl || user.profileImage} src={previewUrl || user.profileImage} />
        <AvatarFallback className="text-2xl">
          {user.name && user.name.length > 0 ? user.name.charAt(0).toUpperCase() : 'U'}
        </AvatarFallback>
                 {isEditing && (
                   <div className="absolute bottom-0 right-0 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs z-10">
                     {uploadingImage ? (
                       <div className="animate-spin rounded-full h-3 w-3 border-2 border-white border-t-transparent" />
                     ) : (
                       <Upload className="w-3 h-3" />
                     )}
                   </div>
                 )}
                </Avatar>

                {/* Hidden file input for profile image upload */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileSelect}
                />
 
               <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>

               <Badge className="mt-3" variant={user.role === 'ADMIN' ? 'destructive' : 'default'}>
                 {user.role}
               </Badge>

               {/* Visual proof that the photo is hosted on Cloudinary */}
               {user.profileImage && user.profileImage.includes('cloudinary.com') && (
                 <div className="mt-2 flex flex-col items-center gap-1">
                   <div className="flex items-center justify-center gap-2 text-xs text-green-600 bg-green-50 px-3 py-1 rounded-full">
                     <span>☁️ Hosted on Cloudinary</span>
                     <a 
                       href={user.profileImage} 
                       target="_blank" 
                       rel="noopener noreferrer"
                       className="underline font-medium hover:text-green-700"
                     >
                       View photo
                     </a>
                   </div>
                   <div className="text-[10px] text-gray-400 font-mono break-all max-w-[180px] text-center">
                     {user.profileImage}
                   </div>
                 </div>
               )}

               <div className="mt-6 pt-6 border-t w-full">
                <div className="flex items-center justify-center gap-2 text-sm text-gray-600">
                  <Calendar className="w-4 h-4" />
                  <span>Joined {new Date(user.createdAt || Date.now()).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Edit Form */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              {isEditing ? (
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter your full name"
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md text-gray-900">{user.name}</div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-md">
                <Mail className="w-4 h-4 text-gray-500" />
                <span className="text-gray-900">{user.email}</span>
                <Badge variant="outline" className="ml-auto text-xs">Verified</Badge>
              </div>
              <p className="text-xs text-gray-500">Email cannot be changed. Contact support if needed.</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              {isEditing ? (
                <Textarea
                  id="bio"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-md text-gray-700 min-h-[100px]">
                  {user.bio || 'No bio added yet.'}
                </div>
              )}
            </div>

            {isEditing && (
              <div className="space-y-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={triggerImageUpload}
                  disabled={uploadingImage}
                  className="gap-2 w-full"
                >
                  {uploadingImage ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-gray-400 border-t-transparent" />
                      Saving Photo...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4" />
                      Change Profile Photo
                    </>
                  )}
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  Select a photo here or click the avatar. It will be uploaded to Cloudinary when you click Save Changes.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

   
    </div>
  );
}
