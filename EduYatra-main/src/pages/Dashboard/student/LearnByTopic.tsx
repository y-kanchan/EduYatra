
import { Layout } from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Search, BookOpen, Play, CheckCircle, Lock } from "lucide-react";

const LearnByTopic = () => {
  return (
    <Layout>
      <div className="p-6 space-y-8">
        <div className="flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Learn by Topic
            </h1>
            <p className="text-muted-foreground mt-2">Explore topics and enhance your knowledge</p>
          </div>
        </div>

        {/* Search */}
        <Card className="glass-effect border-primary/20 animate-fade-in">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Search topics..." className="pl-10" />
              </div>
              <Button variant="outline">Search</Button>
            </div>
          </CardContent>
        </Card>

        {/* Subjects */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[
            { subject: "Mathematics", topics: 24, completed: 18, color: "bg-blue-500" },
            { subject: "Physics", topics: 20, completed: 12, color: "bg-green-500" },
            { subject: "Chemistry", topics: 18, completed: 15, color: "bg-purple-500" },
            { subject: "Biology", topics: 22, completed: 8, color: "bg-orange-500" },
          ].map((subject, index) => (
            <Card key={subject.subject} className="glass-effect border-primary/20 animate-scale-in hover-lift" style={{ animationDelay: `${index * 100}ms` }}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded ${subject.color}`}></div>
                  {subject.subject}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between text-sm">
                    <span>Progress</span>
                    <span>{subject.completed}/{subject.topics}</span>
                  </div>
                  <Progress value={(subject.completed / subject.topics) * 100} className="h-2" />
                  <Button variant="outline" className="w-full">
                    Continue Learning
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Featured Topics */}
        <Card className="glass-effect border-primary/20 animate-fade-in hover-lift">
          <CardHeader>
            <CardTitle>Mathematics Topics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { topic: "Algebra Basics", difficulty: "Easy", duration: "45 min", status: "completed" },
                { topic: "Linear Equations", difficulty: "Medium", duration: "60 min", status: "completed" },
                { topic: "Quadratic Functions", difficulty: "Medium", duration: "75 min", status: "current" },
                { topic: "Calculus Introduction", difficulty: "Hard", duration: "90 min", status: "locked" },
                { topic: "Derivatives", difficulty: "Hard", duration: "120 min", status: "locked" },
                { topic: "Integration", difficulty: "Hard", duration: "150 min", status: "locked" },
              ].map((topic, index) => (
                <Card key={topic.topic} className={`border-2 transition-all duration-200 hover:shadow-lg animate-slide-in ${
                  topic.status === 'completed' ? 'border-green-200 bg-green-50/20' :
                  topic.status === 'current' ? 'border-blue-200 bg-blue-50/20' :
                  'border-gray-200 bg-gray-50/20'
                }`} style={{ animationDelay: `${index * 100}ms` }}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-medium">{topic.topic}</h3>
                      {topic.status === 'completed' && <CheckCircle className="h-5 w-5 text-green-500" />}
                      {topic.status === 'current' && <Play className="h-5 w-5 text-blue-500" />}
                      {topic.status === 'locked' && <Lock className="h-5 w-5 text-gray-400" />}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <Badge variant={topic.difficulty === 'Hard' ? 'destructive' : topic.difficulty === 'Medium' ? 'default' : 'secondary'}>
                          {topic.difficulty}
                        </Badge>
                        <span className="text-muted-foreground">{topic.duration}</span>
                      </div>
                      <Button 
                        variant={topic.status === 'locked' ? 'outline' : 'default'} 
                        className="w-full" 
                        size="sm"
                        disabled={topic.status === 'locked'}
                      >
                        {topic.status === 'completed' ? 'Review' : 
                         topic.status === 'current' ? 'Continue' : 'Locked'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default LearnByTopic;
