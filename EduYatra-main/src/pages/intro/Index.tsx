// frontend/src/pages/intro/Index.tsx - Complete Rebuild with Deskoros Branding
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  GraduationCap, BookOpen, Users, Award, TrendingUp, Shield, Zap, Heart,
  Star, ArrowRight, Play, CheckCircle2, Sparkles, Target, Brain, Rocket, Globe
} from 'lucide-react';
import Navbar from './navbar';
import { getPublicSliders, getPublicPosters, getPublicAds, getPublicSuccessStories, getPublicVideo } from '@/lib/api/public';
import { API_URL } from '@/config/api';

const Index: React.FC = () => {
  const [sliders, setSliders] = useState<any[]>([]);
  const [posters, setPosters] = useState<any[]>([]);
  const [ads, setAds] = useState<any[]>([]);
  const [successStories, setSuccessStories] = useState<any[]>([]);
  const [video, setVideo] = useState<any>(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isSliderHovered, setIsSliderHovered] = useState(false);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const [slidersData, postersData, adsData, storiesData, videoData] = await Promise.all([
        getPublicSliders(),
        getPublicPosters(),
        getPublicAds(),
        getPublicSuccessStories(),
        getPublicVideo()
      ]);
      setSliders(slidersData.sliders || []);
      setPosters(postersData.posters || []);
      setAds(adsData.ads || []);
      setSuccessStories(storiesData.stories || []);
      setVideo(videoData.video || null);
    } catch (error) {
      console.error('Error fetching content:', error);
    }
  };

  useEffect(() => {
    if (sliders.length > 0 && !isSliderHovered) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % sliders.length);
      }, 4000); // Auto-slide every 4 seconds
      return () => clearInterval(interval);
    }
  }, [sliders, isSliderHovered]);

  const trackAdClick = async (adId: string) => {
    try {
      await fetch(`${API_URL}/public/ads/${adId}/click`, {
        method: 'POST'
      });
    } catch (error) {
      console.error('Error tracking ad click:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-600 to-cyan-500">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-24">
        {/* Animated Background */}
        <div className="absolute inset-0">
          <div className="absolute top-20 left-10 w-96 h-96 bg-blue-300/30 rounded-full blur-3xl animate-blob"></div>
          <div className="absolute top-40 right-10 w-[500px] h-[500px] bg-cyan-300/30 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute bottom-20 left-1/3 w-[450px] h-[450px] bg-blue-400/30 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-600/10 to-transparent"></div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-left space-y-8">
              <div className="inline-flex items-center space-x-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                <Sparkles className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  #1 Education Platform 2026
                </span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight">
                <span className="glitch-text text-white drop-shadow-lg" data-text="Transform">
                  Transform
                </span>
                <br />
                <span className="glitch-text drip-text text-white" data-text="Learning into">
                  Learning into
                </span>
                <br />
                <span className="glitch-text text-cyan-300 font-extrabold" data-text="Excellence">
                  Excellence
                </span>
              </h1>

              <p className="text-base text-blue-50 leading-relaxed max-w-xl">
                Empowering educators and students with cutting-edge technology. 
                Create, manage, and excel in examinations with Deskoros.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link to="/signup">
                  <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-base rounded-xl shadow-2xl transform hover:scale-105 transition-all font-bold">
                    Get Started Free
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
                <Link to="/features">
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-base rounded-xl shadow-2xl backdrop-blur-sm bg-white/10">
                    <Play className="mr-2 w-5 h-5" />
                    Watch Demo
                  </Button>
                </Link>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-6">
                {[
                  { number: '50K+', label: 'Users' },
                  { number: '100K+', label: 'Tests' },
                  { number: '98%', label: 'Happy' }
                ].map((stat, index) => (
                  <div key={index} className="text-center bg-white/10 backdrop-blur-sm rounded-xl p-3 border border-white/20">
                    <div className="text-2xl font-bold text-white">{stat.number}</div>
                    <div className="text-xs text-blue-100">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative">
              <div className="relative max-w-lg mx-auto">
                {/* Slider Carousel */}
                {sliders.length > 0 && (
                  <div 
                    className="relative rounded-[2rem] overflow-hidden shadow-2xl bg-white group"
                    onMouseEnter={() => setIsSliderHovered(true)}
                    onMouseLeave={() => setIsSliderHovered(false)}
                  >
                    {sliders.map((slider, index) => (
                      <div
                        key={slider._id}
                        className={`transition-all duration-700 ${
                          index === currentSlide ? 'opacity-100' : 'opacity-0 absolute inset-0'
                        }`}
                      >
                        <div className="relative h-[450px]">
                          <img src={slider.image_url} alt={slider.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/40 to-transparent flex items-end">
                            <div className="p-6 text-white w-full">
                              <Badge className="mb-2 bg-cyan-500 text-white px-3 py-1 text-xs">Latest</Badge>
                              <h3 className="text-xl font-bold mb-2">{slider.title}</h3>
                              <p className="text-sm mb-3">{slider.description}</p>
                              {slider.link_url && (
                                <a href={slider.link_url} target="_blank" rel="noopener noreferrer">
                                  <Button size="sm" className="bg-white text-blue-600 hover:bg-blue-50">
                                    Learn More <ArrowRight className="ml-1 w-4 h-4" />
                                  </Button>
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Navigation Dots */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 bg-blue-900/50 px-4 py-2 rounded-full backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {sliders.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentSlide(index)}
                          className={`transition-all duration-300 rounded-full ${
                            index === currentSlide 
                              ? 'bg-white w-8 h-3' 
                              : 'bg-white/50 w-3 h-3 hover:bg-white/70'
                          }`}
                        />
                      ))}
                    </div>
                    
                    {/* Arrow Navigation */}
                    {sliders.length > 1 && (
                      <>
                        <button 
                          onClick={() => setCurrentSlide((prev) => (prev - 1 + sliders.length) % sliders.length)}
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        >
                          <ArrowRight className="w-5 h-5 rotate-180" />
                        </button>
                        <button 
                          onClick={() => setCurrentSlide((prev) => (prev + 1) % sliders.length)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full transition-all opacity-0 group-hover:opacity-100"
                        >
                          <ArrowRight className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Video Section */}
      {video && (
        <section className="relative bg-gradient-to-br from-gray-900 via-blue-900 to-gray-900 py-20">
          <div className="container mx-auto px-4 md:px-8">
            <div className="grid lg:grid-cols-4 gap-10 items-stretch">
              {/* Video Side - Takes 3 columns */}
              <div className="lg:col-span-3 relative rounded-3xl overflow-hidden shadow-2xl transform hover:scale-[1.02] transition-all duration-500">
                <div className="aspect-video">
                  <iframe
                    src={`${video.video_url}?autoplay=1&mute=1&loop=1&playlist=${video.video_url.split('/').pop()}`}
                    title={video.title}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  ></iframe>
                </div>
              </div>

              {/* Feature Points Poster - Takes 1 column */}
              <div className="lg:col-span-1 relative">
                {/* Notice Board Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-200 to-cyan-100 rounded-2xl shadow-inner opacity-40 blur-sm"></div>
                
                {/* Paper Sheet with Blue Tint */}
                <div className="relative h-full bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg shadow-2xl overflow-hidden transform rotate-1 hover:rotate-0 transition-all duration-500" style={{ 
                  boxShadow: '0 10px 40px rgba(59, 130, 246, 0.4), inset 0 1px 0 rgba(147, 197, 253, 0.3)',
                  backgroundImage: 'linear-gradient(to bottom, rgba(239, 246, 255, 0.95) 95%, rgba(219, 234, 254, 0.95) 100%)'
                }}>
                  {/* Push Pins */}
                  <div className="absolute -top-2 left-8 w-4 h-4 bg-blue-500 rounded-full shadow-lg z-20 border-2 border-blue-600">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full"></div>
                  </div>
                  <div className="absolute -top-2 right-8 w-4 h-4 bg-cyan-500 rounded-full shadow-lg z-20 border-2 border-cyan-600">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full"></div>
                  </div>
                  
                  {/* Paper Texture with Blue Tint */}
                  <div className="absolute inset-0 opacity-5" style={{
                    backgroundImage: 'url("data:image/svg+xml,%3Csvg width="100" height="100" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="4" /%3E%3C/filter%3E%3Crect width="100" height="100" filter="url(%23noise)" opacity="0.4" /%3E%3C/svg%3E")'
                  }}></div>
                  
                  {/* Content */}
                  <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                    {/* Header with Tape Effect */}
                    <div className="space-y-4">
                      {/* Washi Tape with Blue Theme */}
                      <div className="absolute top-4 left-0 right-0 h-8 bg-blue-200/50 border-t border-b border-blue-300/60 -mx-2 transform -rotate-1" style={{
                        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(147, 197, 253, 0.2) 10px, rgba(147, 197, 253, 0.2) 20px)'
                      }}></div>
                      
                      <div className="relative pt-6">
                        <h2 className="text-2xl md:text-3xl font-bold text-blue-900 mb-2" style={{ 
                          fontFamily: "'Caveat', 'Segoe Print', cursive",
                          textShadow: '1px 1px 0px rgba(59, 130, 246, 0.1)'
                        }}>
                          {video.title}
                        </h2>
                        <p className="text-sm text-blue-700 leading-relaxed" style={{ 
                          fontFamily: "'Patrick Hand', 'Comic Sans MS', cursive"
                        }}>
                          {video.description}
                        </p>
                      </div>
                    </div>
                    
                    {/* Feature Points - Handwritten List */}
                    {video.feature_points && video.feature_points.length > 0 && (
                      <div className="space-y-4 mt-6">
                        {video.feature_points.map((point: string, index: number) => (
                          <div 
                            key={index} 
                            className="flex items-start space-x-3 group transform hover:translate-x-1 transition-all duration-300"
                          >
                            <div className="flex-shrink-0 mt-1">
                              {/* Hand-drawn checkmark in blue */}
                              <div className="relative w-6 h-6">
                                <svg viewBox="0 0 24 24" className="w-full h-full text-blue-600 transform group-hover:scale-110 transition-transform">
                                  <path 
                                    d="M4 12l5 5L20 7" 
                                    fill="none" 
                                    stroke="currentColor" 
                                    strokeWidth="3" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                    style={{
                                      filter: 'url(#pencil)',
                                      strokeDasharray: '30',
                                      strokeDashoffset: '0'
                                    }}
                                  />
                                </svg>
                              </div>
                            </div>
                            <p className="text-sm md:text-base text-blue-800 leading-relaxed font-medium" style={{ 
                              fontFamily: "'Caveat', 'Segoe Print', cursive",
                              fontSize: '1.1rem',
                              lineHeight: '1.6'
                            }}>
                              {point}
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Bottom Section with Stamp Effect */}
                    <div className="mt-6 pt-4 border-t-2 border-dashed border-blue-300 relative">
                      <div className="flex items-center justify-between">
                        {/* Stamp in Blue */}
                        <div className="relative">
                          <div className="px-3 py-1.5 border-2 border-blue-600 rounded-md transform -rotate-6 bg-blue-100/70">
                            <span className="text-xs font-bold text-blue-700 uppercase tracking-wider" style={{ fontFamily: "'Courier New', monospace" }}>
                              Featured
                            </span>
                          </div>
                        </div>
                        
                        {/* Signature Style */}
                        <span className="text-sm text-blue-600" style={{ 
                          fontFamily: "'Caveat', cursive",
                          fontSize: '1rem'
                        }}>
                          - Deskoros
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Paper Corner Fold with Blue Tint */}
                  <div className="absolute bottom-0 right-0 w-12 h-12 overflow-hidden">
                    <div className="absolute bottom-0 right-0 w-full h-full bg-gradient-to-tl from-blue-200 to-blue-100 transform rotate-45 origin-bottom-right translate-x-1/2 translate-y-1/2 shadow-inner"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ction>

      {/* Features Grid */}
      <section className="py-24 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-500">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <Badge className="mb-3 bg-white text-blue-600 px-4 py-1.5 text-sm font-semibold">Why Choose Deskoros</Badge>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 text-white">
              Everything You Need
            </h2>
            <p className="text-sm text-blue-100 max-w-2xl mx-auto">
              Comprehensive tools for modern education
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: GraduationCap, title: 'For Students', description: 'Practice exams, track progress, excel in studies', color: 'from-cyan-400 to-blue-400' },
              { icon: BookOpen, title: 'For Teachers', description: 'Create tests, manage classes, monitor performance', color: 'from-blue-400 to-cyan-500' },
              { icon: Users, title: 'For Institutes', description: 'Complete management system for institutions', color: 'from-cyan-500 to-blue-500' },
              { icon: Award, title: 'Smart Analytics', description: 'Detailed insights and performance tracking', color: 'from-blue-500 to-cyan-400' },
              { icon: Shield, title: 'Secure Platform', description: 'Enterprise-grade security for your data', color: 'from-cyan-400 to-blue-400' },
              { icon: Rocket, title: 'Fast & Reliable', description: 'Lightning-fast performance you can count on', color: 'from-blue-400 to-cyan-500' }
            ].map((feature, index) => (
              <Card
                key={index}
                className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 bg-white overflow-hidden group"
              >
                <CardContent className="p-6">
                  <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-6 transition-all`}>
                    <feature.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-lg font-bold mb-2 text-gray-900">{feature.title}</h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Posters Section - Updates & Events */}
      {posters.length > 0 && (
        <section className="py-24 bg-white relative overflow-hidden">
          {/* Background Decoration */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-cyan-600 rounded-full blur-3xl"></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-10">
              <Badge className="mb-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-1.5 text-sm font-semibold">
                Updates & Events
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold mb-3">
                <span className="bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
                  Stay Informed
                </span>
              </h2>
              <p className="text-sm text-gray-600 max-w-2xl mx-auto">
                Latest updates from admin panel
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {posters.map((poster) => (
                <Card 
                  key={poster._id} 
                  className="overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border-2 border-blue-100 group"
                >
                  <div className="relative overflow-hidden">
                    <img 
                      src={poster.image_url} 
                      alt={poster.title} 
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-500" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                  <CardContent className="p-4 bg-gradient-to-br from-blue-50 to-white">
                    <h3 className="font-bold text-base mb-2 text-gray-900 group-hover:text-blue-600 transition-colors">{poster.title}</h3>
                    {poster.description && (
                      <p className="text-gray-600 text-xs mb-3 line-clamp-2">{poster.description}</p>
                    )}
                    {poster.link_url && (
                      <a href={poster.link_url} target="_blank" rel="noopener noreferrer">
                        <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white text-xs py-2">
                          View Details <ArrowRight className="ml-1 w-3 h-3" />
                        </Button>
                      </a>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Photo Gallery Slider - Student Success Stories */}
      {successStories.length > 0 && (
        <section className="py-20 bg-gradient-to-br from-blue-600 to-cyan-600 relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse-slow"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-300 rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-10">
              <Badge className="mb-3 bg-white text-blue-600 px-4 py-1.5 text-sm font-semibold">
                Success Stories
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Real Results from Real Students
              </h2>
              <p className="text-sm text-blue-100 max-w-2xl mx-auto">
                See how Deskoros transforms education
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {successStories.map((story) => (
                <Card key={story._id} className="overflow-hidden group border-0 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-2">
                  <div className="relative overflow-hidden h-48">
                    <img src={story.image_url} alt={story.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent"></div>
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
                      <h3 className="font-bold text-sm mb-1">{story.title}</h3>
                      <p className="text-xs text-blue-100">{story.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Advertisements - Sponsored Content */}
      {ads.length > 0 && (
        <section className="py-24 bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-600 relative overflow-hidden">
          {/* Decorative Background */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-cyan-200 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center mb-10">
              <Badge className="mb-3 bg-white text-blue-600 px-4 py-1.5 text-sm font-semibold">
                Featured Partners
              </Badge>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                Trusted Brands
              </h2>
              <p className="text-sm text-blue-100 max-w-2xl mx-auto">
                Managed from admin dashboard
              </p>
            </div>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {ads.filter(ad => ad.placement === 'home' || ad.placement === 'global').slice(0, 3).map((ad) => (
                <a
                  key={ad._id}
                  href={ad.link_url || '#'}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => trackAdClick(ad._id)}
                  className="group"
                >
                  <Card className="overflow-hidden hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 hover:scale-105 cursor-pointer border-4 border-white/20 bg-white">
                    <div className="relative overflow-hidden">
                      <img 
                        src={ad.image_url} 
                        alt={ad.title} 
                        className="w-full h-56 object-cover group-hover:scale-110 transition-transform duration-500" 
                      />
                      <div className="absolute top-4 right-4">
                        <Badge className="bg-blue-600 text-white px-3 py-1 text-xs font-semibold shadow-lg">
                          {ad.ad_type}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-medium">Sponsored</span>
                        <ArrowRight className="w-4 h-4 text-blue-600 group-hover:translate-x-2 transition-transform" />
                      </div>
                      <h3 className="text-sm font-bold text-gray-900 mt-1 group-hover:text-blue-600 transition-colors">
                        {ad.title}
                      </h3>
                    </CardContent>
                  </Card>
                </a>
              ))}
            </div>
            
            {ads.length > 3 && (
              <div className="text-center mt-12">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-6 text-lg rounded-xl">
                  View All Partners <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-700 via-blue-600 to-cyan-600 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl animate-blob"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-cyan-300 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white relative z-10">
          <div className="max-w-4xl mx-auto">
            <Badge className="mb-4 bg-white text-blue-600 px-4 py-1.5 text-sm font-semibold">
              Get Started Today
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Transform Learning?
            </h2>
            <p className="text-base mb-8 text-blue-100">
              Join thousands using Deskoros
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Link to="/signup">
                <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 px-8 py-4 text-base rounded-xl shadow-2xl transform hover:scale-105 transition-all">
                  Start Free Trial <Rocket className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="/contact-us">
                <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-base rounded-xl shadow-2xl transform hover:scale-105 transition-all">
                  Contact Sales
                </Button>
              </Link>
            </div>
            
            {/* Trust Indicators */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12 pt-8 border-t border-white/20">
              {[
                { number: '50K+', label: 'Users' },
                { number: '100K+', label: 'Tests' },
                { number: '98%', label: 'Happy' },
                { number: '24/7', label: 'Support' }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{stat.number}</div>
                  <div className="text-xs text-blue-100">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <img src="/logo.svg" alt="Deskoros" className="w-10 h-10" />
                <span className="text-2xl font-bold">Deskoros</span>
              </div>
              <p className="text-gray-400">Empowering education through technology</p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/features" className="hover:text-white">Features</Link></li>
                <li><Link to="/courses" className="hover:text-white">Courses</Link></li>
                <li><Link to="/tutoring" className="hover:text-white">Tutoring</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/about" className="hover:text-white">About Us</Link></li>
                <li><Link to="/contact-us" className="hover:text-white">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-gray-400">
                <li><Link to="/privacy" className="hover:text-white">Privacy</Link></li>
                <li><Link to="/terms" className="hover:text-white">Terms</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2026 Deskoros. All rights reserved.</p>
          </div>
        </div>
      </footer>

      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(20px, -20px) scale(1.1); }
          50% { transform: translate(-20px, 20px) scale(0.9); }
          75% { transform: translate(20px, 20px) scale(1.05); }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        @keyframes float-reverse {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(20px); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes gradient-shift {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        
        @keyframes pulse-slow {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.2; }
        }
        
        @keyframes glitch {
          0% {
            transform: translate(0);
          }
          20% {
            transform: translate(-2px, 2px);
          }
          40% {
            transform: translate(-2px, -2px);
          }
          60% {
            transform: translate(2px, 2px);
          }
          80% {
            transform: translate(2px, -2px);
          }
          100% {
            transform: translate(0);
          }
        }
        
        @keyframes drip {
          0% {
            transform: translateY(0);
            filter: blur(0);
          }
          50% {
            transform: translateY(2px);
            filter: blur(0.5px);
          }
          100% {
            transform: translateY(0);
            filter: blur(0);
          }
        }
        
        .animate-blob {
          animation: blob 7s infinite;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        
        .animate-float-reverse {
          animation: float-reverse 4s ease-in-out infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }
        
        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        /* Glitch Text Effect */
        .glitch-text {
          position: relative;
          animation: glitch 3s infinite;
        }
        
        .glitch-text::before,
        .glitch-text::after {
          content: attr(data-text);
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
        }
        
        .glitch-text::before {
          left: 2px;
          text-shadow: -2px 0 #00ffff;
          clip: rect(24px, 550px, 90px, 0);
          animation: glitch-anim 2s infinite linear alternate-reverse;
        }
        
        .glitch-text::after {
          left: -2px;
          text-shadow: -2px 0 #ff00ff;
          clip: rect(85px, 550px, 140px, 0);
          animation: glitch-anim 3s infinite linear alternate-reverse;
        }
        
        @keyframes glitch-anim {
          0% { clip: rect(10px, 9999px, 31px, 0); }
          5% { clip: rect(70px, 9999px, 71px, 0); }
          10% { clip: rect(30px, 9999px, 91px, 0); }
          15% { clip: rect(60px, 9999px, 100px, 0); }
          20% { clip: rect(10px, 9999px, 140px, 0); }
          25% { clip: rect(50px, 9999px, 20px, 0); }
          30% { clip: rect(80px, 9999px, 75px, 0); }
          35% { clip: rect(20px, 9999px, 105px, 0); }
          40% { clip: rect(90px, 9999px, 45px, 0); }
          45% { clip: rect(40px, 9999px, 85px, 0); }
          50% { clip: rect(65px, 9999px, 115px, 0); }
          55% { clip: rect(15px, 9999px, 55px, 0); }
          60% { clip: rect(75px, 9999px, 95px, 0); }
          65% { clip: rect(25px, 9999px, 125px, 0); }
          70% { clip: rect(85px, 9999px, 35px, 0); }
          75% { clip: rect(45px, 9999px, 65px, 0); }
          80% { clip: rect(95px, 9999px, 105px, 0); }
          85% { clip: rect(5px, 9999px, 135px, 0); }
          90% { clip: rect(55px, 9999px, 25px, 0); }
          95% { clip: rect(100px, 9999px, 50px, 0); }
          100% { clip: rect(35px, 9999px, 80px, 0); }
        }
        
        /* Drip Text Effect */
        .drip-text {
          position: relative;
          display: inline-block;
        }
        
        .drip-text::after {
          content: '';
          position: absolute;
          bottom: -5px;
          left: 0;
          width: 100%;
          height: 8px;
          background: linear-gradient(to bottom, rgba(255, 255, 255, 0.8), transparent);
          animation: drip 2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default Index;
