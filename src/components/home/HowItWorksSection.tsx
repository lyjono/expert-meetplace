
import React from "react";
import { Chip } from "@/components/ui/chip";
import { ArrowRight } from "lucide-react";
import { howItWorksSteps } from "./ServiceData";

export const HowItWorksSection = () => {
  return (
    <section className="w-full py-12 md:py-24 lg:py-32">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <Chip variant="subtle">Simple Process</Chip>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">How ExpertMeet Works</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
              Connect with professionals in three simple steps
            </p>
          </div>
        </div>
        <div className="mx-auto grid gap-8 sm:grid-cols-2 lg:grid-cols-3 items-start md:max-w-5xl mt-12">
          {howItWorksSteps.map((step, index) => (
            <div key={step.title} className="relative flex flex-col items-center text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white text-xl font-bold mb-4">
                {index + 1}
              </div>
              <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
              <p className="text-muted-foreground">{step.description}</p>
              {index < howItWorksSteps.length - 1 && (
                <div className="hidden sm:block absolute top-6 left-[calc(100%_-_1.5rem)] w-[calc(100%_-_3rem)] h-0.5 bg-border">
                  <ArrowRight className="absolute right-0 top-1/2 -translate-y-1/2 text-border" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
