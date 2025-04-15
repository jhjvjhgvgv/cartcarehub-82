
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Lightbulb, Rocket, ChartBar, Users, Zap, Settings, Smartphone, Database } from "lucide-react";

export function DesignNotes() {
  return (
    <Card className="shadow-md">
      <CardHeader className="bg-gradient-to-r from-primary-100 to-primary-50 dark:from-primary-950 dark:to-primary-900">
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="text-primary h-5 w-5" />
          CartCareHub: Future Potential & Roadmap
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <Tabs defaultValue="features" className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="features">Core Features</TabsTrigger>
            <TabsTrigger value="technical">Technical Expansion</TabsTrigger>
            <TabsTrigger value="business">Business Growth</TabsTrigger>
          </TabsList>
          
          <TabsContent value="features" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FeatureCard 
                icon={<Zap className="h-5 w-5 text-amber-500" />}
                title="Predictive Maintenance Platform"
                description="Expand AI capabilities to predict cart failures with higher accuracy using historical maintenance data and machine learning models."
              />
              <FeatureCard 
                icon={<Smartphone className="h-5 w-5 text-green-500" />}
                title="Mobile Scanning Enhancements"
                description="Add image recognition for damage detection, automated issue categorization, and offline scanning capabilities."
              />
              <FeatureCard 
                icon={<ChartBar className="h-5 w-5 text-blue-500" />}
                title="Advanced Analytics Dashboard"
                description="Develop comprehensive analytics with cart lifecycle metrics, maintenance ROI calculations, and preventative maintenance scheduling."
              />
              <FeatureCard 
                icon={<Users className="h-5 w-5 text-purple-500" />}
                title="Multi-Role Collaboration"
                description="Build collaborative workflows between stores and maintenance providers with task management and communication tools."
              />
            </div>
          </TabsContent>
          
          <TabsContent value="technical" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FeatureCard 
                icon={<Rocket className="h-5 w-5 text-red-500" />}
                title="IoT Integration"
                description="Connect with IoT sensors on carts to track location, usage patterns, and real-time condition monitoring."
              />
              <FeatureCard 
                icon={<Database className="h-5 w-5 text-indigo-500" />}
                title="Data Pipeline Expansion"
                description="Build robust data collection and processing pipelines to feed maintenance prediction models and business intelligence."
              />
              <FeatureCard 
                icon={<Settings className="h-5 w-5 text-orange-500" />}
                title="API Ecosystem"
                description="Create developer-friendly APIs for integration with inventory management, POS systems, and enterprise resource planning platforms."
              />
              <FeatureCard 
                icon={<Smartphone className="h-5 w-5 text-teal-500" />}
                title="Native Mobile Features"
                description="Leverage device capabilities for enhanced cart scanning, offline operation, and push notifications for urgent maintenance alerts."
              />
            </div>
          </TabsContent>
          
          <TabsContent value="business" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <FeatureCard 
                icon={<Users className="h-5 w-5 text-blue-500" />}
                title="Multi-tenant Architecture"
                description="Scale to support multiple retail chains with isolated data and customized branding while maintaining a unified codebase."
              />
              <FeatureCard 
                icon={<ChartBar className="h-5 w-5 text-green-500" />}
                title="ROI Reporting Suite"
                description="Develop comprehensive reporting tools showing maintenance cost savings, extended cart lifespans, and operational efficiency improvements."
              />
              <FeatureCard 
                icon={<Settings className="h-5 w-5 text-purple-500" />}
                title="Integration Marketplace"
                description="Build a marketplace for third-party integrations with retail software ecosystems, inventory management, and enterprise systems."
              />
              <FeatureCard 
                icon={<Zap className="h-5 w-5 text-amber-500" />}
                title="Service Provider Network"
                description="Create a network connecting stores with certified maintenance providers, including scheduling, bidding, and performance metrics."
              />
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

interface FeatureCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="mt-1">{icon}</div>
          <div>
            <h3 className="font-medium text-sm">{title}</h3>
            <p className="text-muted-foreground text-xs mt-1">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
