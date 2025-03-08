
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, MessageSquare, FileText, Calendar as CalendarIcon, Clock, Star } from "lucide-react";
import { getExpertById } from "@/services/experts";
import { toast } from "sonner";

const ExpertProfile = () => {
  const { expertId } = useParams<{ expertId: string }>();
  const navigate = useNavigate();
  
  const { data: expert, isLoading, error } = useQuery({
    queryKey: ['expert', expertId],
    queryFn: () => expertId ? getExpertById(expertId) : null,
    enabled: !!expertId
  });

  const handleSchedule = () => {
    toast.success("Appointment scheduling initiated");
    navigate("/dashboard/appointments");
  };

  const handleMessage = () => {
    toast.success("Message thread created");
    navigate("/dashboard/messages");
  };

  if (isLoading) return (
    <DashboardLayout userType="user">
      <div className="flex items-center justify-center h-96">
        <p>Loading expert profile...</p>
      </div>
    </DashboardLayout>
  );

  if (error || !expert) return (
    <DashboardLayout userType="user">
      <div className="flex items-center justify-center h-96">
        <p>Error loading expert profile. Please try again.</p>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout userType="user">
      <div className="grid gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex flex-col items-center md:items-start">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={expert.image} alt={expert.name} />
                  <AvatarFallback>{expert.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div className="mt-4 text-center md:text-left">
                  <h1 className="text-2xl font-bold">{expert.name}</h1>
                  <p className="text-lg text-muted-foreground">{expert.specialty}</p>
                  <div className="flex mt-2 gap-2 flex-wrap justify-center md:justify-start">
                    <Badge>{expert.category}</Badge>
                    <Badge variant="outline">Financial Planning</Badge>
                    <Badge variant="outline">Tax Advisory</Badge>
                  </div>
                  <div className="flex items-center mt-3">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < Math.floor(expert.rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
                      ))}
                    </div>
                    <span className="ml-2 text-sm text-muted-foreground">({expert.rating}) · 120+ reviews</span>
                  </div>
                </div>
              </div>
              <div className="flex-1 flex flex-col md:items-end justify-between gap-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full md:w-auto">
                  <Button className="flex gap-2" onClick={handleSchedule}>
                    <Calendar className="h-4 w-4" />
                    Schedule
                  </Button>
                  <Button variant="outline" className="flex gap-2" onClick={handleMessage}>
                    <MessageSquare className="h-4 w-4" />
                    Message
                  </Button>
                  <Button variant="outline" className="flex gap-2" onClick={() => navigate("/dashboard/documents")}>
                    <FileText className="h-4 w-4" />
                    Share Files
                  </Button>
                </div>
                <div className="bg-accent/50 p-4 rounded-lg w-full md:w-auto">
                  <div className="flex items-center gap-2 mb-2">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    <span className="font-medium">Next Available: Tomorrow, 10:00 AM</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-primary" />
                    <span>Typically responds within 2 hours</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Tabs defaultValue="about">
          <TabsList className="mb-4">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About {expert.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">Bio</h3>
                    <p>
                      {expert.name} is a highly experienced professional in {expert.category.toLowerCase()} services with over 15 years of industry experience. 
                      Specializing in {expert.specialty}, they have helped hundreds of clients navigate complex financial and legal challenges.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Experience</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>15+ years experience in {expert.category}</li>
                      <li>Certified Professional Accountant (CPA)</li>
                      <li>Former advisor at top-tier consulting firm</li>
                      <li>Helped 500+ clients with tax optimization strategies</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium mb-2">Education & Certifications</h3>
                    <ul className="list-disc pl-5 space-y-2">
                      <li>MBA, Finance, Stanford University</li>
                      <li>BS, Accounting, University of California</li>
                      <li>Certified Financial Planner (CFP)</li>
                      <li>Certified Tax Advisor (CTA)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="services">
            <Card>
              <CardHeader>
                <CardTitle>Services Offered</CardTitle>
                <CardDescription>
                  Professional services available for booking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">Initial Consultation</h3>
                        <p className="text-muted-foreground">60 minutes • Virtual or In-person</p>
                        <p className="mt-2">Discuss your financial situation and goals to establish a personalized plan.</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-lg">$150</p>
                        <Button className="mt-2" onClick={handleSchedule}>Book Now</Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">Comprehensive Tax Planning</h3>
                        <p className="text-muted-foreground">90 minutes • Virtual</p>
                        <p className="mt-2">Strategic tax planning to optimize your financial position and minimize tax liability.</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-lg">$250</p>
                        <Button className="mt-2" onClick={handleSchedule}>Book Now</Button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-medium text-lg">Financial Review</h3>
                        <p className="text-muted-foreground">45 minutes • Virtual</p>
                        <p className="mt-2">Review your current financial status and provide recommendations for improvement.</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-lg">$125</p>
                        <Button className="mt-2" onClick={handleSchedule}>Book Now</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Client Reviews</CardTitle>
                <CardDescription>
                  Feedback from previous clients
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    {
                      name: "Michael Thompson",
                      rating: 5,
                      date: "2 weeks ago",
                      comment: "Extremely helpful and knowledgeable. Helped me save significantly on my taxes this year with strategic planning."
                    },
                    {
                      name: "Sarah Johnson",
                      rating: 5,
                      date: "1 month ago",
                      comment: "Outstanding service. Very responsive and provided excellent guidance for my small business finances."
                    },
                    {
                      name: "David Wilson",
                      rating: 4,
                      date: "2 months ago",
                      comment: "Solid advice and professional service. Would recommend for anyone looking for tax planning assistance."
                    }
                  ].map((review, i) => (
                    <div key={i} className="border-b pb-4 last:border-0">
                      <div className="flex justify-between items-center mb-2">
                        <div className="font-medium">{review.name}</div>
                        <div className="text-sm text-muted-foreground">{review.date}</div>
                      </div>
                      <div className="flex mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-4 w-4 ${i < review.rating ? "text-yellow-500 fill-yellow-500" : "text-gray-300"}`} />
                        ))}
                      </div>
                      <p>{review.comment}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline" className="w-full">View All Reviews</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ExpertProfile;
