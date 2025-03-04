
import React from "react";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";

const FindExperts = () => {
  return (
    <DashboardLayout userType="user">
      <div className="grid gap-4">
        <h1 className="text-3xl font-bold tracking-tight">Find Experts</h1>
        <p className="text-muted-foreground">
          Connect with professionals in various fields
        </p>
      </div>

      <div className="grid gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Search for Experts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-4">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input className="pl-10" placeholder="Search experts by name or specialty" />
                </div>
              </div>
              <div>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="legal">Legal Services</SelectItem>
                    <SelectItem value="accounting">Accounting & Tax</SelectItem>
                    <SelectItem value="consulting">Consulting</SelectItem>
                    <SelectItem value="financial">Financial Services</SelectItem>
                    <SelectItem value="marketing">Marketing & PR</SelectItem>
                    <SelectItem value="technology">IT & Technology</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Button className="w-full">Search</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <h2 className="text-xl font-semibold mt-4">Recommended Experts</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              name: "Dr. Jane Smith",
              specialty: "Tax Planning",
              category: "Accounting & Tax",
              rating: 4.9,
              image: "/placeholder.svg",
            },
            {
              name: "Mark Johnson",
              specialty: "Corporate Law",
              category: "Legal Services",
              rating: 4.7,
              image: "/placeholder.svg",
            },
            {
              name: "Sarah Williams",
              specialty: "Investment Strategy",
              category: "Financial Services",
              rating: 4.8,
              image: "/placeholder.svg",
            },
          ].map((expert, i) => (
            <Card key={i} className="overflow-hidden">
              <div className="p-6">
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={expert.image} alt={expert.name} />
                    <AvatarFallback>{expert.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{expert.name}</h3>
                    <p className="text-sm text-muted-foreground">{expert.specialty}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <Badge variant="secondary">{expert.category}</Badge>
                  <div className="text-sm">
                    ★ {expert.rating} <span className="text-muted-foreground">(120+ reviews)</span>
                  </div>
                </div>
                <Button className="w-full mt-4">View Profile</Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default FindExperts;
