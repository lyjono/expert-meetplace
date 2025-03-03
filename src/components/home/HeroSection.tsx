
import React from "react";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { Link } from "react-router-dom";
import { ChevronRight, CheckCircle2 } from "lucide-react";

export const HeroSection = () => {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32 overflow-hidden">
      <div className="container px-4 md:px-6">
        <div className="grid gap-6 lg:grid-cols-2 lg:gap-12 items-center">
          <div className="flex flex-col justify-center space-y-4 animate-fade-in">
            <div className="space-y-2">
              <Chip variant="subtle" className="mb-2">Professional Services Platform</Chip>
              <h1 className="text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-clip-text text-transparent bg-gradient-to-r from-black to-gray-600 dark:from-white dark:to-gray-400">
                Connect with Expert Professionals
              </h1>
              <p className="max-w-[600px] text-muted-foreground md:text-xl">
                Find, book, and consult with top lawyers, accountants, and consultants. All in one secure platform.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button size="lg" className="group">
                  Find an Expert
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200 ease-in-out" />
                </Button>
              </Link>
              <Link to="/register/provider">
                <Button variant="outline" size="lg">
                  Join as a Provider
                </Button>
              </Link>
            </div>
            <div className="flex items-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center">
                <CheckCircle2 className="mr-1 h-3 w-3 text-primary" />
                <span>Secure Video Calls</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="mr-1 h-3 w-3 text-primary" />
                <span>Document Sharing</span>
              </div>
              <div className="flex items-center">
                <CheckCircle2 className="mr-1 h-3 w-3 text-primary" />
                <span>Verified Experts</span>
              </div>
            </div>
          </div>
          <div className="relative lg:ml-auto">
            <div className="mx-auto max-w-[500px] rounded-lg overflow-hidden shadow-2xl animate-float glass-morphism border">
              <img
                src="https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1287&auto=format&fit=crop"
                alt="Professional collaboration"
                className="w-full h-auto object-cover"
                width="500"
                height="400"
              />
            </div>
            <div className="absolute -bottom-4 -left-4 lg:-left-8 bg-white rounded-lg shadow-lg p-4 glass-card animate-zoom-in max-w-[260px]">
              <div className="flex items-center space-x-2 mb-2">
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">L</div>
                <div>
                  <p className="text-sm font-medium">Sarah Johnson</p>
                  <p className="text-xs text-muted-foreground">Corporate Lawyer</p>
                </div>
              </div>
              <div className="bg-secondary rounded p-2 text-xs">
                "Booked 3 new clients this week through ExpertMeet!"
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
