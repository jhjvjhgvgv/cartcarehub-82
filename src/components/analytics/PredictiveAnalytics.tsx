import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  ScatterChart,
  Scatter
} from 'recharts';
import { 
  TrendingUp, 
  Brain, 
  AlertTriangle, 
  Clock, 
  DollarSign, 
  Target,
  Activity,
  Zap,
  Shield
} from "lucide-react";
import { addDays, format, subDays } from "date-fns";

interface PredictionModel {
  id: string;
  name: string;
  accuracy: number;
  confidence: number;
  last_trained: string;
  predictions_made: number;
  model_type: 'failure_prediction' | 'maintenance_scheduling' | 'cost_optimization' | 'usage_pattern';
}

interface FailurePrediction {
  cart_id: string;
  cart_qr_code: string;
  failure_probability: number;
  predicted_failure_date: string;
  failure_type: string;
  contributing_factors: string[];
  recommended_actions: string[];
  potential_cost_impact: number;
}

interface MaintenanceRecommendation {
  cart_id: string;
  cart_qr_code: string;
  optimal_maintenance_date: string;
  maintenance_type: string;
  confidence_score: number;
  cost_savings_potential: number;
  reasoning: string;
}

interface UsagePattern {
  period: string;
  predicted_usage: number;
  actual_usage: number;
  demand_forecast: number;
  optimization_potential: number;
}

interface PredictiveAnalyticsProps {
  storeId?: string;
}

export function PredictiveAnalytics({ storeId }: PredictiveAnalyticsProps) {
  const [models, setModels] = useState<PredictionModel[]>([]);
  const [failurePredictions, setFailurePredictions] = useState<FailurePrediction[]>([]);
  const [maintenanceRecommendations, setMaintenanceRecommendations] = useState<MaintenanceRecommendation[]>([]);
  const [usagePatterns, setUsagePatterns] = useState<UsagePattern[]>([]);
  const [loading, setLoading] = useState(true);

  const generateSampleData = () => {
    // Generate prediction models
    const sampleModels: PredictionModel[] = [
      {
        id: 'failure-model-1',
        name: 'Cart Failure Prediction',
        accuracy: 87.5,
        confidence: 92.1,
        last_trained: subDays(new Date(), 2).toISOString(),
        predictions_made: 1247,
        model_type: 'failure_prediction'
      },
      {
        id: 'maintenance-model-1',
        name: 'Optimal Maintenance Scheduler',
        accuracy: 91.2,
        confidence: 88.7,
        last_trained: subDays(new Date(), 1).toISOString(),
        predictions_made: 892,
        model_type: 'maintenance_scheduling'
      },
      {
        id: 'cost-model-1',
        name: 'Cost Optimization Engine',
        accuracy: 84.3,
        confidence: 89.4,
        last_trained: new Date().toISOString(),
        predictions_made: 634,
        model_type: 'cost_optimization'
      },
      {
        id: 'usage-model-1',
        name: 'Usage Pattern Analyzer',
        accuracy: 93.7,
        confidence: 95.2,
        last_trained: subDays(new Date(), 3).toISOString(),
        predictions_made: 2156,
        model_type: 'usage_pattern'
      }
    ];

    // Generate failure predictions
    const sampleFailurePredictions: FailurePrediction[] = Array.from({ length: 8 }, (_, i) => ({
      cart_id: `cart-${i + 1}`,
      cart_qr_code: `CART-${String(i + 1).padStart(3, '0')}`,
      failure_probability: Math.floor(Math.random() * 40) + 60, // 60-100% for high-risk carts
      predicted_failure_date: addDays(new Date(), Math.floor(Math.random() * 30) + 5).toISOString(),
      failure_type: ['Wheel Assembly', 'Handle Damage', 'Basket Damage', 'Brake System', 'Frame Wear'][Math.floor(Math.random() * 5)],
      contributing_factors: [
        'High usage frequency',
        'Overdue maintenance',
        'Environmental wear',
        'Component age'
      ].slice(0, Math.floor(Math.random() * 3) + 1),
      recommended_actions: [
        'Schedule immediate inspection',
        'Replace worn components',
        'Perform preventive maintenance',
        'Monitor usage patterns'
      ].slice(0, Math.floor(Math.random() * 2) + 1),
      potential_cost_impact: Math.floor(Math.random() * 800) + 200
    }));

    // Generate maintenance recommendations
    const sampleMaintenanceRecommendations: MaintenanceRecommendation[] = Array.from({ length: 12 }, (_, i) => ({
      cart_id: `cart-${i + 10}`,
      cart_qr_code: `CART-${String(i + 10).padStart(3, '0')}`,
      optimal_maintenance_date: addDays(new Date(), Math.floor(Math.random() * 14) + 1).toISOString(),
      maintenance_type: ['Routine Service', 'Wheel Inspection', 'Handle Replacement', 'Basket Repair', 'Deep Clean'][Math.floor(Math.random() * 5)],
      confidence_score: Math.floor(Math.random() * 20) + 80,
      cost_savings_potential: Math.floor(Math.random() * 300) + 50,
      reasoning: 'Based on usage patterns and historical data, optimal maintenance window identified'
    }));

    // Generate usage patterns
    const sampleUsagePatterns: UsagePattern[] = Array.from({ length: 30 }, (_, i) => {
      const date = subDays(new Date(), 29 - i);
      const baseUsage = 100 + Math.sin(i * 0.2) * 20;
      return {
        period: format(date, 'MMM dd'),
        predicted_usage: baseUsage + Math.random() * 10 - 5,
        actual_usage: baseUsage + Math.random() * 15 - 7.5,
        demand_forecast: baseUsage + Math.random() * 20 - 10,
        optimization_potential: Math.random() * 30 + 10
      };
    });

    setModels(sampleModels);
    setFailurePredictions(sampleFailurePredictions);
    setMaintenanceRecommendations(sampleMaintenanceRecommendations);
    setUsagePatterns(sampleUsagePatterns);
    setLoading(false);
  };

  useEffect(() => {
    generateSampleData();
  }, [storeId]);

  const getModelIcon = (type: string) => {
    const icons = {
      failure_prediction: <AlertTriangle className="h-4 w-4 text-red-500" />,
      maintenance_scheduling: <Clock className="h-4 w-4 text-blue-500" />,
      cost_optimization: <DollarSign className="h-4 w-4 text-green-500" />,
      usage_pattern: <Activity className="h-4 w-4 text-purple-500" />
    };
    return icons[type as keyof typeof icons] || icons.usage_pattern;
  };

  const getRiskLevel = (probability: number) => {
    if (probability >= 90) return { level: 'Critical', color: 'bg-red-100 text-red-800 border-red-200' };
    if (probability >= 75) return { level: 'High', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    if (probability >= 60) return { level: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return { level: 'Low', color: 'bg-green-100 text-green-800 border-green-200' };
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Predictive Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI-Powered Predictive Analytics
        </CardTitle>
        <CardDescription>
          Machine learning insights for proactive cart maintenance and optimization
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="models" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="models">Models</TabsTrigger>
            <TabsTrigger value="failures">Failure Prediction</TabsTrigger>
            <TabsTrigger value="maintenance">Maintenance</TabsTrigger>
            <TabsTrigger value="patterns">Usage Patterns</TabsTrigger>
          </TabsList>

          <TabsContent value="models" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {models.map((model) => (
                <Card key={model.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getModelIcon(model.model_type)}
                        <h4 className="font-medium">{model.name}</h4>
                      </div>
                      <Badge className="bg-green-100 text-green-800">
                        Active
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Accuracy</span>
                          <span>{model.accuracy}%</span>
                        </div>
                        <Progress value={model.accuracy} className="h-2" />
                      </div>

                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Confidence</span>
                          <span>{model.confidence}%</span>
                        </div>
                        <Progress value={model.confidence} className="h-2" />
                      </div>

                      <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Predictions Made: {model.predictions_made}</span>
                        <span>Last Trained: {format(new Date(model.last_trained), 'MMM dd')}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="failures" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {failurePredictions.map((prediction) => {
                const risk = getRiskLevel(prediction.failure_probability);
                return (
                  <Card key={prediction.cart_id} className="border-l-4 border-l-red-500">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{prediction.cart_qr_code}</h4>
                        <Badge className={risk.color}>
                          {risk.level} Risk
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-sm mb-1">
                            <span>Failure Probability</span>
                            <span>{prediction.failure_probability}%</span>
                          </div>
                          <Progress value={prediction.failure_probability} className="h-2" />
                        </div>

                        <div className="text-sm">
                          <div className="font-medium">Predicted Issue:</div>
                          <div className="text-muted-foreground">{prediction.failure_type}</div>
                        </div>

                        <div className="text-sm">
                          <div className="font-medium">Expected Date:</div>
                          <div className="text-muted-foreground">
                            {format(new Date(prediction.predicted_failure_date), 'MMM dd, yyyy')}
                          </div>
                        </div>

                        <div className="text-sm">
                          <div className="font-medium">Potential Cost:</div>
                          <div className="text-red-600 font-medium">${prediction.potential_cost_impact}</div>
                        </div>

                        <div className="bg-muted p-2 rounded text-xs">
                          <div className="font-medium mb-1">Contributing Factors:</div>
                          <ul className="list-disc list-inside">
                            {prediction.contributing_factors.map((factor, index) => (
                              <li key={index}>{factor}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {maintenanceRecommendations.map((recommendation) => (
                <Card key={recommendation.cart_id} className="border-l-4 border-l-blue-500">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{recommendation.cart_qr_code}</h4>
                      <Badge className="bg-blue-100 text-blue-800">
                        Optimize
                      </Badge>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Confidence Score</span>
                          <span>{recommendation.confidence_score}%</span>
                        </div>
                        <Progress value={recommendation.confidence_score} className="h-2" />
                      </div>

                      <div className="text-sm">
                        <div className="font-medium">Optimal Date:</div>
                        <div className="text-muted-foreground">
                          {format(new Date(recommendation.optimal_maintenance_date), 'MMM dd, yyyy')}
                        </div>
                      </div>

                      <div className="text-sm">
                        <div className="font-medium">Maintenance Type:</div>
                        <div className="text-muted-foreground">{recommendation.maintenance_type}</div>
                      </div>

                      <div className="text-sm">
                        <div className="font-medium">Potential Savings:</div>
                        <div className="text-green-600 font-medium">${recommendation.cost_savings_potential}</div>
                      </div>

                      <div className="bg-muted p-2 rounded text-xs">
                        <div className="font-medium mb-1">AI Reasoning:</div>
                        <div>{recommendation.reasoning}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="patterns" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Usage Pattern Analysis & Forecasting</CardTitle>
                <CardDescription>
                  AI-powered demand forecasting and optimization recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={400}>
                  <LineChart data={usagePatterns}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="period" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="actual_usage" 
                      stroke="#10b981" 
                      name="Actual Usage"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="predicted_usage" 
                      stroke="#3b82f6" 
                      name="AI Prediction"
                      strokeDasharray="5 5"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="demand_forecast" 
                      stroke="#f59e0b" 
                      name="Demand Forecast"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <Target className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                  <div className="text-2xl font-bold">94.3%</div>
                  <div className="text-sm text-muted-foreground">Prediction Accuracy</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Zap className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
                  <div className="text-2xl font-bold">$2,340</div>
                  <div className="text-sm text-muted-foreground">Optimization Savings</div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 text-center">
                  <Shield className="h-8 w-8 mx-auto mb-2 text-green-600" />
                  <div className="text-2xl font-bold">18</div>
                  <div className="text-sm text-muted-foreground">Failures Prevented</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}