
import React from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { howItWorksSteps } from "@/components/home/ServiceData";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HowItWorksPage = () => {
  return (
    <MainLayout>
      <div className="container px-4 md:px-6 py-12 md:py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl mb-6">How ExpertMeet Works</h1>
          <p className="text-xl text-muted-foreground mb-12">
            Our platform makes it easy to connect with professional experts in various fields. Here's how it works:
          </p>

          <div className="space-y-12 my-12">
            {howItWorksSteps.map((step, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-6 items-start">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground text-xl font-bold shrink-0">
                  {index + 1}
                </div>
                <div>
                  <h2 className="text-2xl font-semibold mb-2">{step.title}</h2>
                  <p className="text-muted-foreground text-lg">{step.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-secondary/50 p-8 rounded-lg mt-8">
            <h2 className="text-2xl font-semibold mb-4">Ready to Get Started?</h2>
            <p className="mb-6">Connect with top professionals today and get the expert advice you need.</p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button asChild>
                <Link to="/register">Create an Account</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/services/legal">Browse Services</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default HowItWorksPage;
