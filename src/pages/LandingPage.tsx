import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
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
  CheckCircle2,
  Menu,
  X,
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

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <header className="border-b sticky top-0 bg-background/95 backdrop-blur z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-green-600 flex items-center justify-center">
              <Map className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-green-600">Crop Circle</span>
          </div>

          <nav className="hidden md:flex items-center gap-8">
            <Link to="#features" className="text-sm font-medium hover:text-green-600 transition-colors">
              Features
            </Link>
            <Link to="#pricing" className="text-sm font-medium hover:text-green-600 transition-colors">
              Pricing
            </Link>
            <Link to="#about" className="text-sm font-medium hover:text-green-600 transition-colors">
              About
            </Link>
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/login')}>
              Sign In
            </Button>
            <Button onClick={handleGoogleSignIn}>Get Started</Button>
          </div>

          <button className="md:hidden" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden border-t p-4 space-y-4 bg-background">
            <Link to="#features" className="block text-sm font-medium">Features</Link>
            <Link to="#pricing" className="block text-sm font-medium">Pricing</Link>
            <Link to="#about" className="block text-sm font-medium">About</Link>
            <div className="flex flex-col gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => navigate('/login')}>Sign In</Button>
              <Button onClick={handleGoogleSignIn}>Get Started</Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight">
              Monitor Your Fields with
              <span className="text-green-600"> Precision Agriculture</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground">
              Crop Circle brings satellite imagery, AI analytics, and real-time weather data
              to help you make informed decisions about your agricultural operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Button size="lg" onClick={handleGoogleSignIn} className="gap-2">
                Start Free Trial
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                Watch Demo
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Powerful Features</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature) => (
              <Card key={feature.title} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center mb-4">
                    <feature.icon className="w-6 h-6 text-green-600" />
                  </div>
                  <CardTitle className="text-lg">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{feature.description}</CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto text-2xl font-bold text-green-600">
                1
              </div>
              <h3 className="text-xl font-semibold">Add Your Fields</h3>
              <p className="text-muted-foreground">
                Draw or import your field boundaries on our interactive map interface.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto text-2xl font-bold text-green-600">
                2
              </div>
              <h3 className="text-xl font-semibold">Connect Data Sources</h3>
              <p className="text-muted-foreground">
                Link satellite imagery, weather stations, and soil sensors.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto text-2xl font-bold text-green-600">
                3
              </div>
              <h3 className="text-xl font-semibold">Get AI Insights</h3>
              <p className="text-muted-foreground">
                Receive personalized recommendations and alerts for your crops.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 bg-muted/50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Simple Pricing</h2>
          <p className="text-center text-muted-foreground mb-12">Choose the plan that fits your operation</p>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>For small operations</CardDescription>
                <div className="text-4xl font-bold pt-4">
                  $0<span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Up to 3 fields</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Weekly satellite updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Basic NDVI analysis</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">Get Started</Button>
              </CardFooter>
            </Card>

            <Card className="border-green-600 ring-2 ring-green-600">
              <CardHeader>
                <div className="text-green-600 text-sm font-medium">Most Popular</div>
                <CardTitle>Pro</CardTitle>
                <CardDescription>For growing farms</CardDescription>
                <div className="text-4xl font-bold pt-4">
                  $49<span className="text-lg font-normal text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Unlimited fields</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Daily satellite updates</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Advanced AI insights</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm">PDF reports</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full">Start Trial</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Enterprise</CardTitle>
                <CardDescription>For large operations</CardDescription>
                <div className="text-4xl font-bold pt-4">
                  Custom<span className="text-lg font-normal text-muted-foreground"></span>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Everything in Pro</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Custom integrations</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm">Dedicated support</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-600" />
                  <span className="text-sm">SLA guarantee</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="outline">Contact Sales</Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="bg-green-600 text-white rounded-2xl p-8 md:p-12 text-center">
            <h2 className="text-3xl font-bold mb-4">Ready to Transform Your Farm?</h2>
            <p className="text-green-100 mb-8 max-w-2xl mx-auto">
              Join thousands of farmers using Crop Circle to monitor their fields
              and optimize their agricultural operations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" onClick={handleGoogleSignIn} className="gap-2">
                <Shield className="w-4 h-4" />
                Sign Up with Google
              </Button>
            </div>
            <form onSubmit={handleEmailSignIn} className="mt-8 max-w-md mx-auto flex gap-2">
              <input
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                className="flex-1 h-12 px-4 rounded-lg bg-white/10 border border-white/20 text-white placeholder:text-white/60 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <Button type="submit" variant="secondary" className="h-12">
                Get Magic Link
              </Button>
            </form>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center">
                <Map className="w-4 h-4 text-white" />
              </div>
              <span className="font-bold text-green-600">Crop Circle</span>
            </div>
            <div className="flex gap-8 text-sm text-muted-foreground">
              <Link to="#" className="hover:text-foreground">Privacy</Link>
              <Link to="#" className="hover:text-foreground">Terms</Link>
              <Link to="#" className="hover:text-foreground">Contact</Link>
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