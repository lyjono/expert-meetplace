import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { Expert, searchExperts, getRecommendedExperts } from "@/services/experts";
import { toast } from "sonner";
import citiesData from "../../../data/cities.json";
import countriesData from "../../../data/countries.json";

const FindExperts = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [category, setCategory] = useState("");
  const [country, setCountry] = useState(""); // ISO2 code, e.g., "US"
  const [city, setCity] = useState("");
  const [citySearch, setCitySearch] = useState(""); // For searchable input
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [experts, setExperts] = useState<Expert[]>([]);
  const [recommendedExperts, setRecommendedExperts] = useState<Expert[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Load recommended experts on component mount
  useEffect(() => {
    const loadRecommendedExperts = async () => {
      try {
        const experts = await getRecommendedExperts();
        setRecommendedExperts(experts);
      } catch (error) {
        console.error("Error loading recommended experts:", error);
        toast.error("Failed to load recommended experts");
      }
    };

    loadRecommendedExperts();
  }, []);

  // Filter cities based on country and search input
  const handleCitySearch = (input: string) => {
    setCitySearch(input);
    if (input.length < 2 || !country) {
      setCitySuggestions([]);
      return;
    }
    const filteredCities = citiesData
      .filter(
        (c) =>
          c.country_code === country &&
          c.name.toLowerCase().includes(input.toLowerCase())
      )
      .slice(0, 10); // Limit to 10 suggestions for performance
    setCitySuggestions(filteredCities);
  };

  // Handle city selection from suggestions
  const handleCitySelect = (selectedCity: { id: string; name: string; country_code: string }) => {
    setCity(selectedCity.name);
    setCitySearch(selectedCity.name);
    setCitySuggestions([]);
  };

  const handleSearch = async () => {
    setIsLoading(true);
    try {
      const results = await searchExperts(searchTerm, category, city);
      setExperts(results);
      if (results.length === 0) {
        toast.info("No experts found matching your criteria");
      }
    } catch (error) {
      console.error("Search error:", error);
      toast.error("Failed to search experts");
    } finally {
      setIsLoading(false);
    }
  };

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
            <div className="grid gap-4 md:grid-cols-5">
              <div className="md:col-span-2">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    className="pl-10"
                    placeholder="Search experts by name or specialty"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Select value={category} onValueChange={setCategory}>
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
                <Select value={country} onValueChange={setCountry}>
                  <SelectTrigger>
                    <SelectValue placeholder="Country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countriesData.map((c) => (
                      <SelectItem key={c.iso2} value={c.iso2}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="relative">
                <Input
                  placeholder="Type your city..."
                  value={citySearch}
                  onChange={(e) => handleCitySearch(e.target.value)}
                />
                {citySuggestions.length > 0 && (
                  <ul className="absolute z-10 w-full bg-white border rounded-md shadow-lg max-h-40 overflow-auto mt-1">
                    {citySuggestions.map((c) => (
                      <li
                        key={c.id}
                        className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleCitySelect(c)}
                      >
                        {c.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div>
                <Button
                  className="w-full"
                  onClick={handleSearch}
                  disabled={isLoading}
                >
                  {isLoading ? "Searching..." : "Search"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Search Results */}
        {experts.length > 0 && (
          <>
            <h2 className="text-xl font-semibold mt-4">Search Results</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {experts.map((expert) => (
                <ExpertCard key={expert.id} expert={expert} />
              ))}
            </div>
          </>
        )}

        {/* Recommended Experts */}
        <h2 className="text-xl font-semibold mt-4">Recommended Experts</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {recommendedExperts.length > 0 ? (
            recommendedExperts.map((expert) => (
              <ExpertCard key={expert.id} expert={expert} />
            ))
          ) : (
            <p className="text-muted-foreground col-span-3">
              Loading recommended experts...
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

// Expert card component
const ExpertCard = ({ expert }: { expert: Expert }) => {
  const navigate = useNavigate();

  const handleViewProfile = () => {
    navigate(`/dashboard/expert/${expert.id}`);
  };

  return (
    <Card
      className="overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
      onClick={handleViewProfile}
    >
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
            ★ {expert.rating}{" "}
            <span className="text-muted-foreground">(120+ reviews)</span>
          </div>
        </div>
        <Button className="w-full mt-4">View Profile</Button>
      </div>
    </Card>
  );
};

export default FindExperts;