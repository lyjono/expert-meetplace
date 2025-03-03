
import React from "react";
import { useParams } from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";
import { serviceCategories } from "@/components/home/ServiceData";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const ServicesPage = () => {
  const { serviceType } = useParams<{ serviceType: string }>();
  
  // Find the service category based on the URL parameter
  const serviceCategory = serviceCategories.find(
    (category) => category.href === `/services/${serviceType}`
  );

  return (
    <MainLayout>
      <div className="container px-4 md:px-6 py-12 md:py-24">
        <Link to="/" className="inline-flex items-center text-primary hover:underline mb-8">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Home
        </Link>
        
        {serviceCategory ? (
          <div className="space-y-6">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl">{serviceCategory.title}</h1>
            <p className="text-xl text-muted-foreground max-w-3xl">{serviceCategory.description}</p>
            
            <div className="bg-secondary/50 p-8 rounded-lg mt-8">
              <h2 className="text-2xl font-semibold mb-4">Connect with {serviceType} Experts</h2>
              <p className="mb-6">Our platform connects you with verified professionals in the {serviceType} field, ready to assist with your specific needs.</p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button>Find a {serviceType.replace(/^\w/, (c) => c.toUpperCase())} Professional</Button>
                <Button variant="outline">Learn More</Button>
              </div>
            </div>
            
            <div className="mt-12">
              <h2 className="text-2xl font-semibold mb-6">Popular {serviceType.replace(/^\w/, (c) => c.toUpperCase())} Services</h2>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {/* Placeholder for service items - would be populated with real data */}
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <div key={item} className="border rounded-lg p-6 hover:shadow-md transition-shadow">
                    <h3 className="font-semibold text-lg mb-2">{serviceType.replace(/^\w/, (c) => c.toUpperCase())} Service {item}</h3>
                    <p className="text-muted-foreground mb-4">Description of this specific service and how it can help clients.</p>
                    <Button variant="ghost" className="text-primary">Learn more</Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <h1 className="text-4xl font-bold mb-4">Service Under Development</h1>
            <p className="text-xl text-muted-foreground mb-8">We're currently building this page. Please check back soon!</p>
            <Button asChild>
              <Link to="/">Return to Home</Link>
            </Button>
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default ServicesPage;
