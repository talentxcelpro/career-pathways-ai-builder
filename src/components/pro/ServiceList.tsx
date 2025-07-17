
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye, Trash2, ToggleLeft, ToggleRight, Star } from "lucide-react";
import { Service } from "@/types/service";

interface ServiceListProps {
  services: Service[];
  onEdit: (serviceId: string) => void;
  onDelete: (serviceId: string) => void;
  onToggleStatus: (serviceId: string, currentStatus: boolean) => void;
}

export default function ServiceList({ services, onEdit, onDelete, onToggleStatus }: ServiceListProps) {
  const formatPrice = (price: number, currency: string) => {
    const currencySymbols: { [key: string]: string } = {
      USD: '$',
      EUR: '€',
      GBP: '£',
      INR: '₹'
    };
    
    return `${currencySymbols[currency] || currency} ${price.toFixed(2)}`;
  };

  if (services.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">No services created yet</h3>
            <p className="text-muted-foreground mb-4">
              Start by creating your first professional service
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-6">
      {services.map((service) => (
        <Card key={service.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-4">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <CardTitle className="text-lg">{service.title}</CardTitle>
                  <Badge variant={service.is_active ? "default" : "secondary"}>
                    {service.is_active ? "Active" : "Inactive"}
                  </Badge>
                </div>
                {service.professional_title && (
                  <p className="text-sm text-muted-foreground">{service.professional_title}</p>
                )}
                {service.location && (
                  <p className="text-sm text-muted-foreground">{service.location}</p>
                )}
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold">
                  {formatPrice(service.price, service.currency)}
                </div>
                <div className="text-sm text-muted-foreground">
                  {service.delivery_time_days} days delivery
                </div>
              </div>
            </div>
          </CardHeader>
          
          <CardContent className="pt-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{service.average_rating.toFixed(1)}</span>
                  <span>({service.total_reviews} reviews)</span>
                </div>
                <div>
                  {service.total_orders} orders completed
                </div>
                <div>
                  Created {new Date(service.created_at).toLocaleDateString()}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onToggleStatus(service.id, service.is_active)}
                >
                  {service.is_active ? (
                    <ToggleRight className="h-4 w-4 text-green-600" />
                  ) : (
                    <ToggleLeft className="h-4 w-4 text-gray-400" />
                  )}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => window.open(`/services/${service.id}`, '_blank')}
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(service.id)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(service.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
