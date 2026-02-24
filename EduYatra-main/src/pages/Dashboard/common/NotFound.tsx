
import { Layout } from "@/components/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft, Search } from "lucide-react";
import { Link } from "react-router-dom";

const NotFound = () => {
  return (
    <Layout>
      <div className="p-6 min-h-[80vh] flex items-center justify-center">
        <Card className="glass-effect border-primary/20 w-full max-w-2xl animate-fade-in">
          <CardContent className="p-12 text-center space-y-8">
            {/* 404 Illustration */}
            <div className="space-y-4">
              <div className="text-8xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent animate-scale-in">
                404
              </div>
              <h1 className="text-3xl font-bold text-foreground">Page Not Found</h1>
              <p className="text-muted-foreground text-lg max-w-md mx-auto">
                Oops! The page you're looking for doesn't exist. It might have been moved, deleted, or you entered the wrong URL.
              </p>
            </div>

            {/* Helpful Links */}
            <div className="bg-accent/20 p-6 rounded-xl space-y-4">
              <h3 className="font-semibold text-foreground">Here are some helpful links:</h3>
              <div className="grid gap-3 sm:grid-cols-2">
                <Link to="/" className="text-primary hover:text-primary/80 transition-colors">
                  → Dashboard
                </Link>
                <Link to="/conduct-test/online" className="text-primary hover:text-primary/80 transition-colors">
                  → Online Tests
                </Link>
                <Link to="/questions/create" className="text-primary hover:text-primary/80 transition-colors">
                  → Create Questions
                </Link>
                <Link to="/manage-students" className="text-primary hover:text-primary/80 transition-colors">
                  → Manage Students
                </Link>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button asChild className="bg-gradient-to-r from-primary to-primary/80">
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Go to Dashboard
                </Link>
              </Button>
              <Button variant="outline" onClick={() => window.history.back()}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>

            {/* Search Suggestion */}
            <div className="pt-8 border-t border-primary/20">
              <p className="text-sm text-muted-foreground mb-3">
                Still can't find what you're looking for?
              </p>
              <Button variant="ghost" className="text-primary">
                <Search className="h-4 w-4 mr-2" />
                Search the site
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default NotFound;
