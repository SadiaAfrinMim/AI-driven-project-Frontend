'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { User, Mail, Calendar, Award, Save, Edit2, MessageSquare, Star } from 'lucide-react';
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
  const [formData, setFormData] = useState({
    name: '',
    bio: '',
    profileImage: '',
  });

  useEffect(() => {
    const loadUser = () => {
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
        } catch (error) {
          console.error('Failed to parse user data');
        }
      }
      setLoading(false);
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

  const handleSave = () => {
    if (!user) return;

    const updatedUser = {
      ...user,
      name: formData.name,
      bio: formData.bio,
      profileImage: formData.profileImage,
    };

    // Update cookie
    Cookies.set('user', JSON.stringify(updatedUser), { expires: 7 });

    // Update local state
    setUser(updatedUser);
    setIsEditing(false);

    toast.success('Profile updated successfully!');
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || '',
        bio: user.bio || '',
        profileImage: user.profileImage || '',
      });
    }
    setIsEditing(false);
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
            <Button onClick={handleSave} className="gap-2">
              <Save className="w-4 h-4" /> Save Changes
            </Button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="lg:col-span-1">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <Avatar className="w-24 h-24 mb-4">
                <AvatarImage src={user.profileImage} />
                <AvatarFallback className="text-2xl">
                  {user.name?.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <h2 className="text-2xl font-bold">{user.name}</h2>
              <p className="text-gray-600">{user.email}</p>

              <Badge className="mt-3" variant={user.role === 'ADMIN' ? 'destructive' : 'default'}>
                {user.role}
              </Badge>

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
                <Label htmlFor="profileImage">Profile Image URL</Label>
                <Input
                  id="profileImage"
                  value={formData.profileImage}
                  onChange={(e) => setFormData({ ...formData, profileImage: e.target.value })}
                  placeholder="https://example.com/your-photo.jpg"
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Account Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 w-5" /> Account Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-3xl font-bold text-blue-600">12</div>
              <div className="text-sm text-gray-600 mt-1">Products Listed</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-xl">
              <div className="text-3xl font-bold text-green-600">{myReviews.length}</div>
              <div className="text-sm text-gray-600 mt-1">Reviews Written</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-3xl font-bold text-purple-600">156</div>
              <div className="text-sm text-gray-600 mt-1">AI Interactions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* My Reviews Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 w-5" /> My Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          {myReviews.length > 0 ? (
            <div className="space-y-4">
              {myReviews.slice(0, 5).map((review: any, index: number) => (
                <div key={index} className="p-4 border rounded-xl bg-gray-50 dark:bg-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-medium">{review.item?.title || 'Product'}</div>
                    <div className="flex items-center text-yellow-500">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star key={i} className={`w-4 h-4 ${i < review.rating ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-300">{review.comment}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    {new Date(review.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              You haven't written any reviews yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
