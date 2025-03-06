
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { getUserType } from "@/lib/supabase";

const DashboardRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const checkUserType = async () => {
      try {
        // Get user type from Supabase (falling back to localStorage if not yet in DB)
        const userTypeFromDb = await getUserType();
        const userType = userTypeFromDb || localStorage.getItem("userType") || "client";
        
        // Check for a specific redirectPath in location state (useful for post-login redirects)
        const redirectPath = location.state?.redirectPath;
        
        if (userType === "provider") {
          navigate(redirectPath || "/dashboard/provider");
        } else {
          navigate(redirectPath || "/dashboard/client");
        }
        
        toast.info(`Welcome to your ${userType === "provider" ? "provider" : "client"} dashboard!`);
      } catch (error) {
        console.error("Error determining user type:", error);
        // If there's an error, redirect to client dashboard as a fallback
        navigate("/dashboard/client");
        toast.error("Something went wrong. Redirecting to client dashboard.");
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUserType();
  }, [navigate, location]);
  
  return (
    <div className="flex items-center justify-center min-h-screen">
      {isLoading ? "Loading..." : "Redirecting..."}
    </div>
  );
};

export default DashboardRedirect;
