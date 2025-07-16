
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ArrowLeft, TrendingUp, Target } from "lucide-react";
import { useNavigate, useParams } from 'react-router-dom';

const JobPromote = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const promotionOptions = [
    {
      title: "Featured Job",
      price: "₹49/week",
      description: "Highlight your job with a colored border and badge",
      features: ["Premium placement", "Colored highlighting", "Featured badge"]
    },
    {
      title: "Top Spot",
      price: "₹99/week", 
      description: "Place your job at the top of search results",
      features: ["Top position", "Featured highlighting", "Priority visibility"]
    }
  ];

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-2">
        <Button variant="ghost" onClick={() => navigate(`/jobs/manage/${id}`)}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Star className="h-8 w-8 text-yellow-600" />
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Promote Job Post</h1>
          <p className="text-gray-600">Boost your job visibility and attract more candidates</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {promotionOptions.map((option, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {index === 0 ? <TrendingUp className="h-5 w-5 text-blue-600" /> : <Target className="h-5 w-5 text-purple-600" />}
                {option.title}
              </CardTitle>
              <CardDescription>{option.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold mb-4">{option.price}</div>
              <ul className="space-y-2 mb-6">
                {option.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-center">
                    <Star className="h-4 w-4 text-green-600 mr-2" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Button className="w-full">
                Promote with {option.title}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default JobPromote;
