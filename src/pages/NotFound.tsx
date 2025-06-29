import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  HouseIcon,
  ArrowLeftIcon,
  MagnifyingGlassIcon,
  ChatCircleIcon,
} from "@phosphor-icons/react";

export default function NotFound() {
  const navigate = useNavigate();

  const handleGoHome = () => {
    navigate("/");
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  const quickLinks = [
    {
      title: "Browse Properties",
      description: "Discover available properties and investments",
      href: "/properties",
      icon: HouseIcon,
    },
    {
      title: "Dashboard",
      description: "View your investments and portfolio",
      href: "/dashboard",
      icon: MagnifyingGlassIcon,
    },
    {
      title: "Contact Support",
      description: "Get help from our support team",
      href: "/support",
      icon: ChatCircleIcon,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* 404 Illustration */}
        <div className="space-y-4">
          <div className="text-8xl md:text-9xl font-bold text-indigo-600 opacity-80">
            404
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            Page Not Found
          </h1>
          <p className="text-lg text-gray-600 max-w-md mx-auto">
            Oops! The page you're looking for seems to have vanished into the
            digital ether. Don't worry, we'll help you find your way back home.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={handleGoBack}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Go Back
          </Button>
          <Button onClick={handleGoHome} className="flex items-center gap-2">
            <HouseIcon className="w-4 h-4" />
            Go to Homepage
          </Button>
        </div>

        {/* Quick Links */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Or explore these popular sections:
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickLinks.map((link, index) => {
              const Icon = link.icon;
              return (
                <Card
                  key={index}
                  className="hover:shadow-lg transition-shadow cursor-pointer group"
                  onClick={() => navigate(link.href)}
                >
                  <CardContent className="p-6 text-center space-y-3">
                    <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mx-auto group-hover:bg-indigo-200 transition-colors">
                      <Icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900">
                      {link.title}
                    </h3>
                    <p className="text-sm text-gray-600">{link.description}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Help Text */}
        <div className="bg-white/60 backdrop-blur-sm rounded-lg p-6 border border-white/20">
          <p className="text-sm text-gray-600">
            If you believe this is an error or you were expecting to find
            something here, please{" "}
            <span className="text-indigo-600 font-medium cursor-pointer hover:underline">
              contact our support team
            </span>{" "}
            for assistance.
          </p>
        </div>
      </div>
    </div>
  );
}
