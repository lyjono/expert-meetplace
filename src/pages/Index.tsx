
import React from "react";
import { Button } from "@/components/ui/button";
import { MainLayout } from "@/components/layout/main-layout";
import { Chip } from "@/components/ui/chip";
import { Link } from "react-router-dom";
import { ChevronRight, CheckCircle2, ArrowRight } from "lucide-react";

const Index = () => {
  return (
    <MainLayout>
      {/* Hero Section */}
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

      {/* Services Section */}
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
                    {React.createElement(serviceIcons[index % serviceIcons.length], { className: "h-6 w-6" })}
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

      {/* How it Works */}
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

      {/* CTA Section */}
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
    </MainLayout>
  );
};

// Icons for the service categories
const serviceIcons = [
  ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v17.25m0 0c-1.472 0-2.882.265-4.185.75M12 20.25c1.472 0 2.882.265 4.185.75M18.75 4.97A48.416 48.416 0 0 0 12 4.5c-2.291 0-4.545.16-6.75.47m13.5 0c1.01.143 2.01.317 3 .52m-3-.52 2.25 2.25m-11.411-.576L5.25 7.5m0 0-2.25-2.25m2.25 2.25 2.25 2.25m-4.5-6.5-2.25 2.25m0 0 2.25 2.25M3.75 4.5l2.25-2.25m11.411.576L15.75 4.5m0 0 2.25-2.25m-2.25 2.25-2.25 2.25" />
    </svg>
  ),
  ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
    </svg>
  ),
  ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
    </svg>
  ),
  ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
  ),
];

const serviceCategories = [
  {
    title: "Legal Services",
    description: "Connect with attorneys specializing in various areas of law including corporate, family, real estate, and intellectual property.",
    href: "/services/legal",
  },
  {
    title: "Accounting & Tax",
    description: "Find certified accountants and tax professionals to help with personal finances, business accounting, and tax preparation.",
    href: "/services/accounting",
  },
  {
    title: "Consulting",
    description: "Access business consultants, management advisors, and strategy experts to help grow and optimize your business.",
    href: "/services/consulting",
  },
  {
    title: "Financial Services",
    description: "Connect with financial advisors, planners, and wealth management professionals to secure your financial future.",
    href: "/services/financial",
  },
  {
    title: "Marketing & PR",
    description: "Discover marketing strategists, public relations experts, and communication professionals to enhance your brand presence.",
    href: "/services/marketing",
  },
  {
    title: "IT & Technology",
    description: "Find IT consultants, software developers, and technology experts to solve your technical challenges and drive innovation.",
    href: "/services/technology",
  },
];

const howItWorksSteps = [
  {
    title: "Find an Expert",
    description: "Browse through our extensive directory of verified professionals and filter by specialty, location, and ratings.",
  },
  {
    title: "Schedule a Consultation",
    description: "Book a convenient time for a video call consultation directly through our platform's integrated calendar.",
  },
  {
    title: "Collaborate Securely",
    description: "Conduct video meetings, share documents, and communicate with your chosen professional all in one secure environment.",
  },
];

export default Index;
