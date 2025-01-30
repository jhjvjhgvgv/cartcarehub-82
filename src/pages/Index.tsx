import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Wrench, Key } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { LoadingScreen } from "@/components/ui/loading-screen";

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  const handleLoadingComplete = () => {
    setTimeout(() => {
      setIsLoading(false);
    }, 200);
  };

  if (isLoading) {
    return <LoadingScreen onLoadingComplete={handleLoadingComplete} />;
  }

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-6 bg-gradient-to-br from-primary-50 to-primary-100">
      {/* Logo Section */}
      <div className="mb-8 text-center px-4">
        <h1 className="text-3xl sm:text-4xl font-bold text-primary-800 mb-2 drop-shadow-lg">
          Cart Repair Pros
        </h1>
        <p className="text-base sm:text-lg text-primary-600">
          Cart Maintenance Made Simple
        </p>
      </div>

      <Card className="w-full max-w-md mx-auto shadow-xl bg-white/90 backdrop-blur-sm">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col space-y-4 sm:space-y-6">
            <p className="text-center text-gray-500">Choose how you want to sign in</p>
            
            <Button
              variant="outline"
              className="h-auto py-4 flex items-center justify-start space-x-4 hover:bg-primary-50 transition-all duration-300 shadow-sm hover:shadow-md"
              onClick={() => navigate("/dashboard")}
            >
              <div className="p-2 bg-primary-50 rounded-full flex-shrink-0">
                <Wrench className="w-5 h-5 sm:w-6 sm:h-6 text-primary-700" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Maintenance Provider</div>
                <div className="text-sm text-gray-500">Sign in as service provider</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-auto py-4 flex items-center justify-start space-x-4 hover:bg-primary-50 transition-all duration-300 shadow-sm hover:shadow-md"
              onClick={() => navigate("/customer")}
            >
              <div className="p-2 bg-primary-50 rounded-full flex-shrink-0">
                <ShoppingCart className="w-5 h-5 sm:w-6 sm:h-6 text-primary-700" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Store</div>
                <div className="text-sm text-gray-500">Sign in as store manager</div>
              </div>
            </Button>

            <div className="flex justify-center pt-2 sm:pt-4">
              <Button
                variant="link"
                className="text-primary-600 hover:text-primary-800 flex items-center gap-2"
                onClick={() => navigate("/forgot-password")}
              >
                <Key className="w-4 h-4" />
                Forgot Password?
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;