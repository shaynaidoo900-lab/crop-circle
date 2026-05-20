import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/store';
import {
  Map,
  Satellite,
  Sparkles,
  BarChart3,
  CloudRain,
  Shield,
  ArrowRight,
  Menu,
  X,
  Sprout,
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);

  const handleGoogleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      console.error('Error signing in:', error.message);
    }
  };

  const handleEmailSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const email = e.currentTarget.email.value;
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) {
      console.error('Error sending magic link:', error.message);
    } else {
      alert('Check your email for the magic link!');
    }
  };

  const features = [
    {
      icon: Satellite,
      title: 'Satellite Imagery',
      description: 'Access high-resolution satellite images of your fields with regular updates.',
    },
    {
      icon: BarChart3,
      title: 'NDVI Analysis',
      description: 'Track crop health with normalized difference vegetation index analytics.',
    },
    {
      icon: CloudRain,
      title: 'Weather Integration',
      description: 'Real-time weather data and 7-day forecasts for optimal planning.',
    },
    {
      icon: Sparkles,
      title: 'AI Insights',
      description: 'Get personalized recommendations powered by machine learning.',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Fields Monitored' },
    { value: '500K', label: 'Acres Covered' },
    { value: '98%', label: 'Accuracy Rate' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50 safe-top">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center shadow-md">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="none"/>
                <circle cx="12" cy="12" r="6" stroke="white" strokeWidth="1.5" fill="none" opacity="0.8"/>
                <circle cx="12" cy="12" r="3" stroke="white" strokeWidth="1" fill="none" opacity="0.6"/>
                <circle cx="12" cy="12" r="1.5" fill="white"/>
              </svg>
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">Crop Circle</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="#features" className="text-sm font-medium text-muted-foreground hover:text-green-600 transition-colors">
              Features
            </Link>
            <Link to="#pricing" className="text-sm font-medium text-muted-foreground hover:text-green-600 transition-colors">
              Pricing
            </Link>
            <Link to="#about" className="text-sm font-medium text-muted-foreground hover:text-green-600 transition-colors">
              About
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/')} className="tap-target">
              Sign In
            </Button>
            <Button onClick={handleGoogleSignIn} className="tap-target">Get Started</Button>
          </div>

          <button 
            className="md:hidden p-2 tap-target flex items-center justify-center" 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t p-4 space-y-4 bg-background">
            <Link to="#features" className="block text-sm font-medium py-2">Features</Link>
            <Link to="#pricing" className="block text-sm font-medium py-2">Pricing</Link>
            <Link to="#about" className="block text-sm font-medium py-2">About</Link>
            <div className="flex flex-col gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => navigate('/')} className="w-full tap-target">Sign In</Button>
              <Button onClick={handleGoogleSignIn} className="w-full tap-target">Get Started</Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 lg:py-32 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-green-200 rounded-full blur-3xl opacity-30" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-green-300 rounded-full blur-3xl opacity-20" />
        </div>
        
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 text-sm text-green-700">
              <Sprout className="w-4 h-4" />
              <span>Precision Agriculture Redefined</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
              Monitor Your Fields with
              <span className="bg-gradient-to-r from-green-600 via-green-500 to-green-700 bg-clip-text text-transparent"> Precision Agriculture</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Crop Circle brings satellite imagery, AI analytics, and real-time weather data
              to help you make informed decisions about your agricultural operations.
            </p>
            
            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-8 py-6">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl md:text-3xl font-bold text-green-600">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" onClick={handleGoogleSignIn} className="gap-2 tap-target text-base px-8 h-14 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 shadow-lg shadow-green-600/25">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2 tap-target text-base px-8 h-14">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-gradient-to-b from-green-50/50 to-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Powerful Features</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Everything you need to monitor, analyze, and optimize your agricultural operations.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="card-hover border-green-100 hover:border-green-300">
                <CardHeader className="p-6 pb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mb-4 shadow-sm">
                    <feature.icon className="w-7 h-7 text-green-700" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-base">{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground">Three simple steps to precision farming</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4 group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mx-auto text-2xl font-bold text-green-700 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all">
                <Map className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-semibold">Add Your Fields</h3>
              <p className="text-muted-foreground">
                Draw or import your field boundaries on our interactive map interface.
              </p>
            </div>
            <div className="text-center space-y-4 group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto text-2xl font-bold text-blue-700 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all">
                <Satellite className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-semibold">Connect Data Sources</h3>
              <p className="text-muted-foreground">
                Link satellite imagery, weather stations, and soil sensors.
              </p>
            </div>
            <div className="text-center space-y-4 group">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center mx-auto text-2xl font-bold text-amber-700 shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all">
                <Sparkles className="w-10 h-10" />
              </div>
              <h3 className="text-xl font-semibold">Get AI Insights</h3>
              <p className="text-muted-foreground">
                Receive personalized recommendations and alerts for your crops.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-br from-green-600 via-green-700 to-green-800 rounded-3xl p-8 md:p-16 text-center relative overflow-hidden">
            {/* Decorative elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />
            
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 text-white">Ready to Transform Your Farm?</h2>
              <p className="text-green-100 mb-8 max-w-2xl mx-auto text-lg">
                Join thousands of farmers using Crop Circle to monitor their fields
                and optimize their agricultural operations.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" variant="secondary" onClick={handleGoogleSignIn} className="gap-2 tap-target text-base px-8 h-14 shadow-xl">
                  <Shield className="w-5 h-5" />
                  Sign Up with Google
                </Button>
              </div>
              <form onSubmit={handleEmailSignIn} className="mt-10 max-w-md mx-auto flex gap-3">
                <input
                  name="email"
                  type="email"
                  placeholder="Enter your email"
                  required
                  className="flex-1 h-14 px-5 rounded-xl bg-white/15 border border-white/25 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50 backdrop-blur"
                />
                <Button type="submit" variant="secondary" className="h-14 px-6 tap-target">
                  Get Magic Link
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="12" cy="12" r="10" stroke="white" strokeWidth="2" fill="none"/>
                  <circle cx="12" cy="12" r="6" stroke="white" strokeWidth="1.5" fill="none" opacity="0.8"/>
                  <circle cx="12" cy="12" r="2" fill="white"/>
                </svg>
              </div>
              <span className="font-bold bg-gradient-to-r from-green-600 to-green-700 bg-clip-text text-transparent">Crop Circle</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <Link to="#" className="hover:text-foreground transition-colors">Privacy</Link>
              <Link to="#" className="hover:text-foreground transition-colors">Terms</Link>
              <Link to="#" className="hover:text-foreground transition-colors">Contact</Link>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 Crop Circle. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}