import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Wrench } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 p-4">
      {/* Logo Section */}
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-primary-800 mb-2 drop-shadow-lg">
          CartCareHub
        </h1>
        <p className="text-primary-600 text-lg">Cart Maintenance Made Simple</p>
      </div>

      <Card className="w-full max-w-md shadow-xl bg-white/90 backdrop-blur-sm">
        <CardContent className="pt-6 px-6">
          <div className="flex flex-col space-y-6">
            <p className="text-center text-gray-500">Choose how you want to sign in</p>
            
            <Button
              variant="outline"
              className="h-16 flex items-center justify-start space-x-4 hover:bg-primary-50 transition-all duration-300 shadow-sm hover:shadow-md"
              onClick={() => navigate("/maintenance-login")}
            >
              <div className="p-2 bg-primary-50 rounded-full">
                <Wrench className="w-6 h-6 text-primary-700" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Maintenance Provider</div>
                <div className="text-sm text-gray-500">Sign in as service provider</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-16 flex items-center justify-start space-x-4 hover:bg-primary-50 transition-all duration-300 shadow-sm hover:shadow-md"
              onClick={() => navigate("/store-login")}
            >
              <div className="p-2 bg-primary-50 rounded-full">
                <ShoppingCart className="w-6 h-6 text-primary-700" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Store</div>
                <div className="text-sm text-gray-500">Sign in as store manager</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;