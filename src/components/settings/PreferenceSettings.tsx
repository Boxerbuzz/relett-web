import { Switch } from "@/components/ui/switch";
import { GlobeIcon } from "@phosphor-icons/react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";

const PreferenceSettings = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>App Preferences</CardTitle>
        <CardDescription>
          Customize your app experience and interface
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Dark Mode</Label>
              <p className="text-sm text-gray-500">
                Switch between light and dark themes
              </p>
            </div>
            <Switch />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Language</Label>
              <p className="text-sm text-gray-500">
                Choose your preferred language
              </p>
            </div>
            <Button variant="outline" size="sm">
              <GlobeIcon size={16} className="mr-2" />
              English
            </Button>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-base">Currency</Label>
              <p className="text-sm text-gray-500">
                Display prices in your preferred currency
              </p>
            </div>
            <Button variant="outline" size="sm">
              USD
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default PreferenceSettings;
