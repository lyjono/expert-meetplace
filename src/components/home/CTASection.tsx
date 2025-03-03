
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

export const CTASection = () => {
  return (
    <section className="w-full py-12 md:py-24 bg-primary text-primary-foreground">
      <div className="container px-4 md:px-6 grid gap-8 md:grid-cols-2 items-center">
        <div className="space-y-4">
          <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
            Ready to Connect with Professionals?
          </h2>
          <p className="md:text-xl">
            Join thousands of individuals and businesses who find and work with expert professionals on our platform.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link to="/register">
              <Button size="lg" variant="secondary" className="group">
                Get Started
                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200 ease-in-out" />
              </Button>
            </Link>
            <Link to="/how-it-works">
              <Button variant="outline" size="lg" className="border-white/20 hover:bg-white/10">
                Learn More
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex justify-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-xl p-6 shadow-lg max-w-md border border-white/20">
            <div className="flex items-center space-x-4 mb-6">
              <div className="rounded-full bg-white h-12 w-12 flex items-center justify-center">
                <img 
                  src="/placeholder.svg" 
                  alt="User" 
                  className="h-10 w-10 rounded-full object-cover"
                />
              </div>
              <div>
                <p className="font-medium">Michael Chen</p>
                <p className="text-sm opacity-80">Small Business Owner</p>
              </div>
            </div>
            <blockquote className="text-sm sm:text-base leading-relaxed mb-4">
              "ExpertMeet has transformed how I access professional services. I was able to find a great business attorney and tax consultant all on one platform, saving me countless hours. The video calls and document sharing made the entire process seamless."
            </blockquote>
            <div className="flex items-center space-x-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <svg
                  key={star}
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
