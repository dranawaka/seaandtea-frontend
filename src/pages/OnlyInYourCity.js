import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  MapPin, 
  Calendar, 
  User, 
  Heart, 
  MessageCircle, 
  Share2, 
  Plus, 
  Search, 
  Filter,
  Star,
  Clock,
  Camera,
  Tag,
  Globe,
  Mountain,
  Waves,
  Building,
  TreePine,
  X,
  Eye,
  ThumbsUp,
  Bookmark,
  Send,
  ThumbsDown,
  Edit3,
  Trash2,
  Users
} from 'lucide-react';

const OnlyInYourCity = () => {
  const { isAuthenticated, user } = useAuth();
  const [cityStories, setCityStories] = useState([]);
  const [showPostForm, setShowPostForm] = useState(false);
  const [showComments, setShowComments] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newPost, setNewPost] = useState({
    title: '',
    description: '',
    city: '',
    category: '',
    images: [],
    tags: '',
    estimatedCost: '',
    duration: '',
    bestTime: ''
  });

  // Sample data inspired by Only In Your State style
  const sampleStories = [
    {
      id: 1,
      title: "This Hidden Waterfall in Ella is So Secret, Even Most Locals Don't Know About It",
      description: "Tucked away in the misty hills of Ella, this breathtaking waterfall remains one of Sri Lanka's best-kept secrets. The journey through tea plantations and ancient forests makes the discovery even more rewarding.",
      city: "Ella",
      category: "Hidden Gems",
      author: "Sarah Johnson",
      authorAvatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"],
      tags: ["waterfalls", "hidden gems", "nature", "hiking", "ella"],
      estimatedCost: "LKR 2,000",
      duration: "4-6 hours",
      bestTime: "Early morning",
      likes: 24,
      dislikes: 2,
      comments: 8,
      views: 156,
      bookmarks: 12,
      rating: 4.7,
      totalRatings: 15,
      createdAt: "2024-01-15",
      verified: true,
      featured: true,
      commentsList: [
        {
          id: 1,
          author: "Mike Chen",
          authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          text: "Amazing find! I visited last week and it was absolutely stunning. The hike was challenging but worth every step.",
          createdAt: "2024-01-16",
          likes: 5
        },
        {
          id: 2,
          author: "Priya Fernando",
          authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
          text: "How do I get there exactly? Any specific landmarks to look for?",
          createdAt: "2024-01-17",
          likes: 2
        }
      ]
    },
    {
      id: 2,
      title: "This Street Food Stall in Colombo Serves the Most Authentic Kottu Roti You'll Ever Taste",
      description: "In the heart of Colombo's bustling Pettah market, this unassuming stall has been perfecting the art of kottu roti for over three decades. The secret family recipe will change everything you thought you knew about this Sri Lankan staple.",
      city: "Colombo",
      category: "Food & Drink",
      author: "Raj Perera",
      authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      images: ["https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop"],
      tags: ["street food", "kottu roti", "authentic", "colombo", "local cuisine"],
      estimatedCost: "LKR 1,500",
      duration: "3-4 hours",
      bestTime: "Evening",
      likes: 31,
      dislikes: 1,
      comments: 12,
      views: 203,
      bookmarks: 18,
      rating: 4.9,
      totalRatings: 22,
      createdAt: "2024-01-12",
      verified: true,
      featured: false,
      commentsList: [
        {
          id: 3,
          author: "David Silva",
          authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
          text: "Best kottu roti I've ever had! The spices are perfectly balanced. Worth the wait in line.",
          createdAt: "2024-01-13",
          likes: 8
        },
        {
          id: 4,
          author: "Lisa Wang",
          authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
          text: "What's the exact location? I want to try this place!",
          createdAt: "2024-01-14",
          likes: 3
        }
      ]
    },
    {
      id: 3,
      title: "This Secret Beach in Galle is So Pristine, It Feels Like Your Own Private Paradise",
      description: "While tourists flock to Unawatuna and Mirissa, this hidden cove just outside Galle offers crystal-clear waters and golden sand without the crowds. Perfect for a romantic sunset or peaceful day of relaxation.",
      city: "Galle",
      category: "Beaches",
      author: "Maya Silva",
      authorAvatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      images: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop"],
      tags: ["secret beach", "pristine", "galle", "sunset", "romantic"],
      estimatedCost: "LKR 500",
      duration: "2-3 hours",
      bestTime: "Evening",
      likes: 18,
      dislikes: 0,
      comments: 5,
      views: 89,
      bookmarks: 7,
      rating: 4.2,
      totalRatings: 8,
      createdAt: "2024-01-10",
      verified: false,
      featured: false,
      commentsList: [
        {
          id: 5,
          author: "Alex Kumar",
          authorAvatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
          text: "Perfect spot for a quiet day! The water is crystal clear and there's barely anyone there.",
          createdAt: "2024-01-11",
          likes: 4
        }
      ]
    },
    {
      id: 4,
      title: "This Ancient Temple in Kandy Holds a Secret That Will Amaze You",
      description: "Beyond the famous Temple of the Tooth, this lesser-known temple houses an incredible collection of ancient artifacts and offers a spiritual experience that few tourists ever discover. The peaceful atmosphere and stunning architecture make it a must-visit.",
      city: "Kandy",
      category: "Culture & History",
      author: "David Chen",
      authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"],
      tags: ["ancient temple", "culture", "history", "kandy", "spiritual"],
      estimatedCost: "LKR 3,000",
      duration: "Full day",
      bestTime: "Morning",
      likes: 27,
      dislikes: 1,
      comments: 9,
      views: 134,
      bookmarks: 15,
      rating: 4.6,
      totalRatings: 12,
      createdAt: "2024-01-08",
      verified: true,
      featured: false,
      commentsList: [
        {
          id: 6,
          author: "Nimal Perera",
          authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
          text: "The architecture is absolutely stunning. Very peaceful and spiritual place.",
          createdAt: "2024-01-09",
          likes: 6
        }
      ]
    },
    {
      id: 5,
      title: "This Mountain View in Nuwara Eliya is So Breathtaking, It Looks Like a Postcard",
      description: "High in the central highlands, this viewpoint offers panoramic views of rolling tea plantations and misty mountains that stretch as far as the eye can see. The early morning light creates a magical atmosphere that photographers dream of.",
      city: "Nuwara Eliya",
      category: "Scenic Views",
      author: "Priya Fernando",
      authorAvatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
      images: ["https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800&h=600&fit=crop"],
      tags: ["mountain views", "tea plantations", "scenic", "photography", "nuwara eliya"],
      estimatedCost: "LKR 1,000",
      duration: "2-3 hours",
      bestTime: "Early morning",
      likes: 35,
      dislikes: 0,
      comments: 14,
      views: 267,
      bookmarks: 22,
      rating: 4.8,
      totalRatings: 18,
      createdAt: "2024-01-05",
      verified: true,
      featured: true,
      commentsList: [
        {
          id: 7,
          author: "Tom Wilson",
          authorAvatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
          text: "Incredible views! Got some amazing photos here. The sunrise is absolutely magical.",
          createdAt: "2024-01-06",
          likes: 9
        }
      ]
    }
  ];

  const cities = ["Colombo", "Kandy", "Galle", "Ella", "Nuwara Eliya", "Anuradhapura", "Polonnaruwa", "Sigiriya", "Negombo", "Bentota", "Mirissa", "Arugam Bay", "Jaffna", "Trincomalee", "Batticaloa"];
  const categories = ["Hidden Gems", "Food & Drink", "Culture & History", "Beaches", "Scenic Views", "Adventure", "Nature", "Photography", "Shopping", "Nightlife", "Wellness", "Family Fun"];

  useEffect(() => {
    setCityStories(sampleStories);
  }, []);

  const handleSubmitPost = (e) => {
    e.preventDefault();
    const newStory = {
      id: Date.now(),
      ...newPost,
      author: user?.firstName + ' ' + user?.lastName || 'Anonymous',
      authorAvatar: user?.profilePictureUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      likes: 0,
      dislikes: 0,
      comments: 0,
      views: 0,
      bookmarks: 0,
      rating: 0,
      totalRatings: 0,
      createdAt: new Date().toISOString().split('T')[0],
      verified: user?.role === 'GUIDE',
      featured: false,
      commentsList: []
    };
    
    setCityStories([newStory, ...cityStories]);
    setNewPost({
      title: '',
      description: '',
      city: '',
      category: '',
      images: [],
      tags: '',
      estimatedCost: '',
      duration: '',
      bestTime: ''
    });
    setShowPostForm(false);
  };

  const handleLike = (storyId) => {
    setCityStories(stories => 
      stories.map(story => 
        story.id === storyId 
          ? { ...story, likes: story.likes + 1 }
          : story
      )
    );
  };

  const handleDislike = (storyId) => {
    setCityStories(stories => 
      stories.map(story => 
        story.id === storyId 
          ? { ...story, dislikes: story.dislikes + 1 }
          : story
      )
    );
  };

  const handleBookmark = (storyId) => {
    setCityStories(stories => 
      stories.map(story => 
        story.id === storyId 
          ? { ...story, bookmarks: story.bookmarks + 1 }
          : story
      )
    );
  };

  const handleAddComment = (storyId) => {
    if (!newComment.trim()) return;
    
    const comment = {
      id: Date.now(),
      author: user?.firstName + ' ' + user?.lastName || 'Anonymous',
      authorAvatar: user?.profilePictureUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      text: newComment,
      createdAt: new Date().toISOString().split('T')[0],
      likes: 0
    };

    setCityStories(stories => 
      stories.map(story => 
        story.id === storyId 
          ? { 
              ...story, 
              comments: story.comments + 1,
              commentsList: [...story.commentsList, comment]
            }
          : story
      )
    );
    
    setNewComment('');
  };

  const handleRate = (storyId, rating) => {
    setCityStories(stories => 
      stories.map(story => 
        story.id === storyId 
          ? { 
              ...story, 
              totalRatings: story.totalRatings + 1,
              rating: ((story.rating * story.totalRatings) + rating) / (story.totalRatings + 1)
            }
          : story
      )
    );
  };

  const filteredStories = cityStories.filter(story => {
    const matchesSearch = story.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         story.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCity = !selectedCity || story.city === selectedCity;
    const matchesCategory = !selectedCategory || story.category === selectedCategory;
    
    return matchesSearch && matchesCity && matchesCategory;
  });

  const getCategoryIcon = (category) => {
    switch(category) {
      case 'Hidden Gems': return <Eye className="h-5 w-5" />;
      case 'Food & Drink': return <Tag className="h-5 w-5" />;
      case 'Culture & History': return <Building className="h-5 w-5" />;
      case 'Beaches': return <Waves className="h-5 w-5" />;
      case 'Scenic Views': return <Camera className="h-5 w-5" />;
      case 'Adventure': return <Mountain className="h-5 w-5" />;
      case 'Nature': return <TreePine className="h-5 w-5" />;
      default: return <Globe className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary-600 to-primary-800 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center mb-4">
              <Users className="h-8 w-8 mr-3" />
              <span className="text-lg font-semibold bg-white bg-opacity-20 px-4 py-2 rounded-full">
                FREE COMMUNITY POSTS
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Only in Your City
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto">
              Discover the hidden gems, secret spots, and unique experiences that make each Sri Lankan city special. 
              <strong> Share your local discoveries for FREE</strong> and inspire others to explore beyond the tourist trails.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {isAuthenticated ? (
                <button
                  onClick={() => setShowPostForm(true)}
                  className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200 flex items-center"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Share Your Discovery (FREE)
                </button>
              ) : (
                <div className="text-center">
                  <p className="text-lg mb-4">Join our community to share your discoveries!</p>
                  <div className="flex gap-4 justify-center">
                    <a href="/register" className="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                      Sign Up (FREE)
                    </a>
                    <a href="/login" className="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-lg transition-colors duration-200">
                      Login
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Section */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search for hidden gems, secret spots, local favorites..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* City Filter */}
            <div className="md:w-48">
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            {/* Category Filter */}
            <div className="md:w-48">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full py-3 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Featured Stories Section */}
      {filteredStories.filter(story => story.featured).length > 0 && (
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              🌟 Featured Discoveries
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStories.filter(story => story.featured).map((story) => (
                <div key={story.id} className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border-2 border-yellow-200">
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={story.images[0]}
                      alt={story.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-4 right-4 flex items-center space-x-2">
                      <div className="bg-yellow-500 text-white rounded-full px-3 py-1 text-sm font-bold">
                        FEATURED
                      </div>
                      <div className="bg-white rounded-full px-3 py-1 text-sm font-medium text-gray-900">
                        {story.category}
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center mb-2">
                      <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                      <span className="text-sm text-gray-600">{story.city}</span>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">
                      {story.title}
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3 text-sm">
                      {story.description}
                    </p>
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="flex items-center">
                          <Heart className="h-4 w-4 mr-1" />
                          {story.likes}
                        </span>
                        <span className="flex items-center">
                          <Eye className="h-4 w-4 mr-1" />
                          {story.views}
                        </span>
                        <span className="flex items-center">
                          <Bookmark className="h-4 w-4 mr-1" />
                          {story.bookmarks}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* All Stories Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          All Discoveries
        </h2>
        <div className="space-y-8">
          {filteredStories.map((story) => (
            <div key={story.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
              {/* Image */}
              <div className="relative h-48 overflow-hidden">
                <img
                  src={story.images[0]}
                  alt={story.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-4 right-4 flex items-center space-x-2">
                  <div className="bg-white rounded-full px-3 py-1 text-sm font-medium text-gray-900">
                    {story.category}
                  </div>
                  {story.verified && (
                    <div className="bg-primary-600 rounded-full p-1">
                      <Star className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                <div className="flex items-center mb-2">
                  <MapPin className="h-4 w-4 text-gray-500 mr-1" />
                  <span className="text-sm text-gray-600">{story.city}</span>
                </div>

                <h3 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                  {story.title}
                </h3>

                <p className="text-gray-600 mb-4 line-clamp-3">
                  {story.description}
                </p>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {story.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-100 text-gray-700 text-xs px-2 py-1 rounded-full"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                {/* Details */}
                <div className="space-y-2 mb-4 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{story.duration}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>Best time: {story.bestTime}</span>
                  </div>
                  <div className="flex items-center">
                    <Tag className="h-4 w-4 mr-2" />
                    <span className="font-medium text-primary-600">{story.estimatedCost}</span>
                  </div>
                </div>

                {/* Author */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center">
                    <img
                      src={story.authorAvatar}
                      alt={story.author}
                      className="h-8 w-8 rounded-full object-cover mr-3"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{story.author}</p>
                      <p className="text-xs text-gray-500">{story.createdAt}</p>
                    </div>
                  </div>
                </div>

                {/* Rating */}
                {story.rating > 0 && (
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`h-4 w-4 ${
                            star <= Math.round(story.rating)
                              ? 'text-yellow-400 fill-current'
                              : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-gray-600">
                      {story.rating.toFixed(1)} ({story.totalRatings} ratings)
                    </span>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={() => handleLike(story.id)}
                      className="flex items-center text-gray-500 hover:text-red-500 transition-colors"
                    >
                      <ThumbsUp className="h-5 w-5 mr-1" />
                      <span className="text-sm">{story.likes}</span>
                    </button>
                    <button 
                      onClick={() => handleDislike(story.id)}
                      className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                    >
                      <ThumbsDown className="h-5 w-5 mr-1" />
                      <span className="text-sm">{story.dislikes}</span>
                    </button>
                    <button 
                      onClick={() => setShowComments(showComments === story.id ? null : story.id)}
                      className="flex items-center text-gray-500 hover:text-blue-500 transition-colors"
                    >
                      <MessageCircle className="h-5 w-5 mr-1" />
                      <span className="text-sm">{story.comments}</span>
                    </button>
                    <button 
                      onClick={() => handleBookmark(story.id)}
                      className="flex items-center text-gray-500 hover:text-green-500 transition-colors"
                    >
                      <Bookmark className="h-5 w-5 mr-1" />
                      <span className="text-sm">{story.bookmarks}</span>
                    </button>
                    <button className="flex items-center text-gray-500 hover:text-purple-500 transition-colors">
                      <Share2 className="h-5 w-5" />
                    </button>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getCategoryIcon(story.category)}
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRate(story.id, star)}
                          className="text-gray-300 hover:text-yellow-400 transition-colors"
                        >
                          <Star className="h-4 w-4" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Comments Section */}
              {showComments === story.id && (
                <div className="bg-gray-50 border-t border-gray-200 p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Comments ({story.comments})
                  </h4>
                  
                  {/* Existing Comments */}
                  <div className="space-y-4 mb-6">
                    {story.commentsList.map((comment) => (
                      <div key={comment.id} className="flex space-x-3">
                        <img
                          src={comment.authorAvatar}
                          alt={comment.author}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                        <div className="flex-1">
                          <div className="bg-white rounded-lg p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-gray-900">
                                {comment.author}
                              </span>
                              <span className="text-xs text-gray-500">
                                {comment.createdAt}
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm">{comment.text}</p>
                            <div className="flex items-center mt-2">
                              <button className="flex items-center text-gray-500 hover:text-red-500 transition-colors">
                                <Heart className="h-4 w-4 mr-1" />
                                <span className="text-xs">{comment.likes}</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Add Comment */}
                  {isAuthenticated ? (
                    <div className="flex space-x-3">
                      <img
                        src={user?.profilePictureUrl || "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"}
                        alt="Your avatar"
                        className="h-8 w-8 rounded-full object-cover"
                      />
                      <div className="flex-1 flex space-x-2">
                        <input
                          type="text"
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Add a comment..."
                          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          onKeyPress={(e) => e.key === 'Enter' && handleAddComment(story.id)}
                        />
                        <button
                          onClick={() => handleAddComment(story.id)}
                          className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors flex items-center"
                        >
                          <Send className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-gray-600 mb-2">Please login to comment</p>
                      <div className="flex gap-2 justify-center">
                        <a href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
                          Login
                        </a>
                        <span className="text-gray-400">|</span>
                        <a href="/register" className="text-primary-600 hover:text-primary-700 font-medium">
                          Sign Up
                        </a>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {filteredStories.length === 0 && (
          <div className="text-center py-12">
            <Globe className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No discoveries found</h3>
            <p className="text-gray-600">Try adjusting your search or filters to find more hidden gems.</p>
          </div>
        )}
      </div>

      {/* Post Form Modal */}
      {showPostForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Share Your Discovery</h2>
                <button
                  onClick={() => setShowPostForm(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <form onSubmit={handleSubmitPost} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Discovery Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="What amazing place did you discover? (e.g., 'This Hidden Waterfall in Ella is So Secret...')"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={newPost.description}
                    onChange={(e) => setNewPost({...newPost, description: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Tell us about this special place. What makes it unique? Why should others visit?"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      City *
                    </label>
                    <select
                      required
                      value={newPost.city}
                      onChange={(e) => setNewPost({...newPost, city: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select a city</option>
                      {cities.map(city => (
                        <option key={city} value={city}>{city}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category *
                    </label>
                    <select
                      required
                      value={newPost.category}
                      onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      <option value="">Select a category</option>
                      {categories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={newPost.tags}
                    onChange={(e) => setNewPost({...newPost, tags: e.target.value})}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    placeholder="Enter tags separated by commas (e.g., hidden gems, waterfalls, hiking, secret spots)"
                  />
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Estimated Cost
                    </label>
                    <input
                      type="text"
                      value={newPost.estimatedCost}
                      onChange={(e) => setNewPost({...newPost, estimatedCost: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., LKR 2,000"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={newPost.duration}
                      onChange={(e) => setNewPost({...newPost, duration: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., 4-6 hours"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Best Time
                    </label>
                    <input
                      type="text"
                      value={newPost.bestTime}
                      onChange={(e) => setNewPost({...newPost, bestTime: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      placeholder="e.g., Early morning"
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <button
                    type="button"
                    onClick={() => setShowPostForm(false)}
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                  >
                    Share Discovery
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OnlyInYourCity;
