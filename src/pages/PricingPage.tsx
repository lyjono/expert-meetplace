
import React from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { Link } from "react-router-dom";

const PricingPage = () => {
  const pricingPlans = [
    {
      name: "Basic",
      price: "Free",
      description: "For individuals looking to connect with professionals occasionally",
      features: [
        "Browse professional profiles",
        "Access to basic messaging",
        "Join 1 consultation per month",
        "Community support",
      ],
      cta: "Get Started",
      href: "/register",
      variant: "outline" as const,
    },
    {
      name: "Professional",
      price: "$19/month",
      description: "For individuals with regular professional service needs",
      features: [
        "All Basic features",
        "Unlimited consultations",
        "Priority scheduling",
        "Document sharing",
        "Direct phone support",
      ],
      cta: "Subscribe Now",
      href: "/register",
      variant: "default" as const,
      highlighted: true,
    },
    {
      name: "Business",
      price: "$49/month",
      description: "For businesses needing multiple professional connections",
      features: [
        "All Professional features",
        "Team account (up to 5 users)",
        "Advanced document management",
        "Dedicated account manager",
        "Custom contract templates",
        "Analytics and reporting",
      ],
      cta: "Contact Sales",
      href: "/register",
      variant: "outline" as const,
    },
  ];

  return (
    <MainLayout>
      <div className="container px-4 md:px-6 py-12 md:py-24">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl mb-4">Simple, Transparent Pricing</h1>
          <p className="text-xl text-muted-foreground">
            Choose the plan that works for your needs. All plans include access to our network of verified professionals.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {pricingPlans.map((plan) => (
            <div 
              key={plan.name} 
              className={`border rounded-lg p-8 relative ${plan.highlighted ? 'shadow-lg border-primary' : ''}`}
            >
              {plan.highlighted && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-primary text-primary-foreground px-4 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </div>
              )}
              <h3 className="text-2xl font-bold">{plan.name}</h3>
              <div className="mt-4 mb-6">
                <span className="text-3xl font-bold">{plan.price}</span>
              </div>
              <p className="text-muted-foreground mb-6">{plan.description}</p>
              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start">
                    <Check className="text-primary h-5 w-5 mr-2 shrink-0 mt-0.5" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
              <Button className="w-full" variant={plan.variant} asChild>
                <Link to={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-20 max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-semibold mb-4">Need a Custom Solution?</h2>
          <p className="text-muted-foreground mb-8">
            We offer tailored plans for larger organizations or those with specific requirements.
            Contact our sales team to discuss your needs.
          </p>
          <Button variant="outline" asChild>
            <Link to="/contact">Contact Sales</Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default PricingPage;
