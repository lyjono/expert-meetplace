
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";

const DashboardRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  useEffect(() => {
    // Get user type from localStorage - this would normally come from your auth context
    const userType = localStorage.getItem("userType") || "user";
    
    // Check for a specific redirectPath in location state (useful for post-login redirects)
    const redirectPath = location.state?.redirectPath;
    
    if (userType === "provider") {
      navigate(redirectPath || "/dashboard/provider");
    } else {
      navigate(redirectPath || "/dashboard/client");
    }
    
    toast.info(`Welcome to your ${userType === "provider" ? "provider" : "client"} dashboard!`);
  }, [navigate, location]);
  
  return <div className="flex items-center justify-center min-h-screen">Redirecting...</div>;
};

export default DashboardRedirect;
