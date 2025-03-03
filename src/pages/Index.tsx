
import React from "react";
import { MainLayout } from "@/components/layout/main-layout";
import { HeroSection } from "@/components/home/HeroSection";
import { ServicesSection } from "@/components/home/ServicesSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { CTASection } from "@/components/home/CTASection";

const Index = () => {
  return (
    <MainLayout>
      <HeroSection />
      <ServicesSection />
      <HowItWorksSection />
      <CTASection />
    </MainLayout>
  );
};

export default Index;
