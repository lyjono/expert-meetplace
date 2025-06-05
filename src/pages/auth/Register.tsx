import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { MainLayout } from "@/components/layout/main-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowRight, AtSign, Lock, User, Check, MapPin, Phone } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

// Static data imports
import countriesData from "../../data/countries.json";
import citiesData from "../../data/cities.json";

const countryCodes = [
  { code: "+1", country: "United States" },
  { code: "+44", country: "United Kingdom" },
  { code: "+33", country: "France" },
  { code: "+49", country: "Germany" },
  { code: "+81", country: "Japan" },
  { code: "+86", country: "China" },
  { code: "+91", country: "India" },
  { code: "+55", country: "Brazil" },
  { code: "+61", country: "Australia" },
];

const Register = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isProvider = location.pathname.includes("/provider");
  const [userType, setUserType] = useState<"user" | "provider">(isProvider ? "provider" : "user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [country, setCountry] = useState(""); // ISO2 code, e.g., "US"
  const [city, setCity] = useState("");
  const [citySearch, setCitySearch] = useState(""); // For searchable input
  const [citySuggestions, setCitySuggestions] = useState([]);
  const [address, setAddress] = useState("");
  const [state, setState] = useState("");
  const [zip, setZip] = useState("");
  const [phoneCode, setPhoneCode] = useState("+1");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [category, setCategory] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [experience, setExperience] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  // Filter cities based on country and search input
  const handleCitySearch = (input) => {
    setCitySearch(input);
    if (input.length < 2 || !country) {
      setCitySuggestions([]);
      return;
    }
    const filteredCities = citiesData
      .filter((c) => c.country_code === country && c.name.toLowerCase().includes(input.toLowerCase()))
      .slice(0, 10); // Limit to 10 suggestions for performance
    setCitySuggestions(filteredCities);
  };

  // Handle city selection from suggestions
  const handleCitySelect = (selectedCity) => {
    setCity(selectedCity.name);
    setCitySearch(selectedCity.name);
    setCitySuggestions([]);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    const phone = `${phoneCode}${phoneNumber}`;

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_type: userType,
            full_name: name,
          },
        },
      });

      if (error) throw error;
      if (!data.user || !data.user.id) throw new Error("User creation failed - no user ID returned");

      console.log("User created successfully with ID:", data.user.id);
      localStorage.setItem("userType", userType);

      await new Promise(resolve => setTimeout(resolve, 1000));

      if (userType === "provider") {
        const { error: profileError } = await supabase
          .from('provider_profiles')
          .insert({
            user_id: data.user.id,
            name,
            email,
            category,
            specialty,
            years_experience: parseInt(experience) || 0,
            address,
            city,
            state,
            zip,
            phone,
            country,
          });

        if (profileError) throw profileError;
      } else {
        const { error: clientError } = await supabase
          .from('client_profiles')
          .insert({
            user_id: data.user.id,
            name,
            email,
            address,
            city,
            state,
            zip,
            phone,
            country,
          });

        if (clientError) throw clientError;
      }

      toast.success("Registration successful! Please check your email for verification.");
      navigate("/login");
    } catch (error) {
      console.error("Registration error:", error);
      toast.error(error.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const nextStep = (e) => {
    e.preventDefault();
    setStep(2);
  };

  return (
    <MainLayout>
      <div className="container px-4 py-12 md:py-24 max-w-md">
        <div className="mb-8 space-y-3 text-center">
          <h1 className="text-3xl font-bold">Create an account</h1>
          <p className="text-muted-foreground">
            Join ExpertMeet to connect with professionals
          </p>
        </div>
        <div className="glass-card rounded-xl p-6 lg:p-8 shadow-lg">
          <Tabs defaultValue={userType} className="w-full" onValueChange={(value) => setUserType(value)}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="user">Client Account</TabsTrigger>
              <TabsTrigger value="provider">Service Provider</TabsTrigger>
            </TabsList>
            <TabsContent value="user">
              <form onSubmit={handleRegister} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="name"
                      placeholder="John Doe"
                      className="pl-10"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      placeholder="name@example.com"
                      type="email"
                      className="pl-10"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      className="pl-10"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Password must be at least 8 characters long
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Select value={country} onValueChange={setCountry} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a country" />
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
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <div className="relative">
                    <Input
                      id="city"
                      placeholder="Type your city..."
                      value={citySearch}
                      onChange={(e) => handleCitySearch(e.target.value)}
                      required
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
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="address"
                      placeholder="Enter your street address"
                      className="pl-10"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="state">State/Province</Label>
                    <Input
                      id="state"
                      placeholder="State"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="zip">ZIP/Postal Code</Label>
                    <Input
                      id="zip"
                      placeholder="ZIP"
                      value={zip}
                      onChange={(e) => setZip(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <div className="flex gap-2">
                    <Select value={phoneCode} onValueChange={setPhoneCode} required>
                      <SelectTrigger className="w-[100px]">
                        <SelectValue placeholder="Code" />
                      </SelectTrigger>
                      <SelectContent>
                        {countryCodes.map(({ code, country }) => (
                          <SelectItem key={code} value={code}>
                            {code} ({country})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="relative flex-1">
                      <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        placeholder="123-456-7890"
                        className="pl-10"
                        value={phoneNumber}
                        onChange={(e) => setPhoneNumber(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox id="terms" required />
                  <Label htmlFor="terms" className="text-sm font-normal">
                    I agree to the{" "}
                    <Link to="/terms" className="text-primary hover:underline">
                      Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link to="/privacy" className="text-primary hover:underline">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating account..." : "Create Account"}
                  {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="provider">
              {step === 1 ? (
                <form onSubmit={nextStep} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="provider-name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="provider-name"
                        placeholder="John Doe"
                        className="pl-10"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="provider-email">Email</Label>
                    <div className="relative">
                      <AtSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="provider-email"
                        placeholder="name@example.com"
                        type="email"
                        className="pl-10"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="provider-password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="provider-password"
                        type="password"
                        className="pl-10"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 8 characters long
                    </p>
                  </div>
                  <Button type="submit" className="w-full">
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </form>
              ) : (
                <form onSubmit={handleRegister} className="space-y-4 animate-fade-in">
                  <div className="space-y-2">
                    <Label htmlFor="category">Service Category</Label>
                    <Select value={category} onValueChange={setCategory} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a category" />
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
                  <div className="space-y-2">
                    <Label htmlFor="specialty">Specialty or Focus Area</Label>
                    <Input
                      id="specialty"
                      placeholder="e.g., Corporate Law, Tax Planning"
                      value={specialty}
                      onChange={(e) => setSpecialty(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="experience">Years of Experience</Label>
                    <Input
                      id="experience"
                      type="number"
                      min="0"
                      placeholder="5"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="country">Country</Label>
                    <Select value={country} onValueChange={setCountry} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a country" />
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
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <div className="relative">
                      <Input
                        id="city"
                        placeholder="Type your city..."
                        value={citySearch}
                        onChange={(e) => handleCitySearch(e.target.value)}
                        required
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
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="address"
                        placeholder="Enter your street address"
                        className="pl-10"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="state">State/Province</Label>
                      <Input
                        id="state"
                        placeholder="State"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zip">ZIP/Postal Code</Label>
                      <Input
                        id="zip"
                        placeholder="ZIP"
                        value={zip}
                        onChange={(e) => setZip(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone</Label>
                    <div className="flex gap-2">
                      <Select value={phoneCode} onValueChange={setPhoneCode} required>
                        <SelectTrigger className="w-[100px]">
                          <SelectValue placeholder="Code" />
                        </SelectTrigger>
                        <SelectContent>
                          {countryCodes.map(({ code, country }) => (
                            <SelectItem key={code} value={code}>
                              {code} ({country})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="phone"
                          placeholder="123-456-7890"
                          className="pl-10"
                          value={phoneNumber}
                          onChange={(e) => setPhoneNumber(e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox id="provider-terms" required />
                    <Label htmlFor="provider-terms" className="text-sm font-normal">
                      I agree to the{" "}
                      <Link to="/terms" className="text-primary hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link to="/privacy" className="text-primary hover:underline">
                        Privacy Policy
                      </Link>
                    </Label>
                  </div>
                  <div className="space-y-2 p-3 bg-secondary/50 rounded-lg text-sm">
                    <p className="font-medium flex items-center">
                      <Check className="h-4 w-4 mr-2 text-primary" />
                      Provider verification required
                    </p>
                    <p className="text-muted-foreground">
                      After signing up, you'll need to complete our verification process to start offering services.
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? "Creating account..." : "Create Provider Account"}
                    {!loading && <ArrowRight className="ml-2 h-4 w-4" />}
                  </Button>
                </form>
              )}
            </TabsContent>
          </Tabs>

          <div className="mt-6">
          </div>

          <div className="mt-6 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-medium hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Register;