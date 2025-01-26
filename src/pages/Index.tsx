import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Tools } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardContent className="pt-6 px-6">
          <div className="flex flex-col space-y-6">
            <h1 className="text-2xl font-bold text-center text-gray-900">CartCareHub</h1>
            <p className="text-center text-gray-500">Choose how you want to sign in</p>
            
            <Button
              variant="outline"
              className="h-16 flex items-center justify-start space-x-4"
              onClick={() => navigate("/maintenance-login")}
            >
              <div className="p-2 bg-primary-50 rounded-full">
                <Tools className="w-6 h-6 text-primary-700" />
              </div>
              <div className="text-left">
                <div className="font-semibold">Maintenance Provider</div>
                <div className="text-sm text-gray-500">Sign in as service provider</div>
              </div>
            </Button>

            <Button
              variant="outline"
              className="h-16 flex items-center justify-start space-x-4"
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