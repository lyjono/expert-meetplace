
import React from "react";
import { Chip } from "@/components/ui/chip";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { serviceCategories } from "./ServiceData";
import { ServiceIcons } from "./ServiceIcons";

export const ServicesSection = () => {
  return (
    <section className="w-full py-12 md:py-24 bg-secondary/50">
      <div className="container px-4 md:px-6">
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <Chip variant="subtle">Our Services</Chip>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Professional Services</h2>
            <p className="max-w-[700px] text-muted-foreground md:text-xl/relaxed">
              Connect with qualified experts across various professional fields
            </p>
          </div>
        </div>
        <div className="mx-auto grid gap-8 md:grid-cols-2 lg:grid-cols-3 items-start md:max-w-5xl mt-12">
          {serviceCategories.map((category, index) => (
            <Link 
              key={category.title}
              to={category.href}
              className="flex flex-col p-6 space-y-4 bg-white rounded-lg shadow-md neo-card hover:shadow-lg transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="bg-primary/10 rounded-md p-2.5 text-primary">
                  {React.createElement(ServiceIcons[index % ServiceIcons.length], { className: "h-6 w-6" })}
                </div>
                <h3 className="text-xl font-semibold">{category.title}</h3>
              </div>
              <p className="text-muted-foreground">{category.description}</p>
              <div className="flex items-center text-primary mt-auto pt-2 text-sm font-medium group-hover:underline">
                <span>Browse Professionals</span>
                <ArrowRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200 ease-in-out" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
