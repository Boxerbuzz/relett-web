"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  StarIcon,
  HeartIcon,
  ShareIcon,
  EyeIcon,
  CalendarIcon,
  ChatCenteredDotsIcon,
} from "@phosphor-icons/react";

export function RightPanelDemo() {
  const [liked, setLiked] = useState(false);

  return (
    <div className="space-y-4">
      {/* Property Quick Info */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-lg">Modern Apartment</CardTitle>
              <p className="text-sm text-gray-600">Lagos, Nigeria</p>
            </div>
            <Badge variant="secondary">₦45M</Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-1">
              <EyeIcon size={16} className="text-gray-500" />
              <span>1,234 views</span>
            </div>
            <div className="flex items-center gap-1">
              <StarIcon size={16} className="text-yellow-500" />
              <span>4.8 (24 reviews)</span>
            </div>
          </div>

          <Separator />

          <div className="space-y-2">
            <h4 className="font-medium">Quick Actions</h4>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setLiked(!liked)}
                className={liked ? "text-red-500 border-red-200" : ""}
              >
                <HeartIcon size={16} className={liked ? "fill-current" : ""} />
              </Button>
              <Button variant="outline" size="sm">
                <ShareIcon size={16} />
              </Button>
              <Button variant="outline" size="sm">
                <ChatCenteredDotsIcon size={16} />
              </Button>
              <Button variant="outline" size="sm">
                <CalendarIcon size={16} />
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-medium">Details</h4>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-gray-500">Bedrooms</p>
                <p className="font-medium">3</p>
              </div>
              <div>
                <p className="text-gray-500">Bathrooms</p>
                <p className="font-medium">2</p>
              </div>
              <div>
                <p className="text-gray-500">Area</p>
                <p className="font-medium">1,200 sqft</p>
              </div>
              <div>
                <p className="text-gray-500">Year Built</p>
                <p className="font-medium">2019</p>
              </div>
            </div>
          </div>

          <Button className="w-full">Schedule Viewing</Button>
        </CardContent>
      </Card>

      {/* Investment Info */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Investment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Token Price</span>
              <span className="font-medium">₦1,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Available Tokens</span>
              <span className="font-medium">45,000</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Expected ROI</span>
              <span className="font-medium text-green-600">12% p.a.</span>
            </div>
          </div>

          <Button className="w-full" variant="outline">
            Invest Now
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
