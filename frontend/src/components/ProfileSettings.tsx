import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../context/AuthContext";
import { Loader2 } from "lucide-react";

interface ProfileSettingsState {
  name: string;
  email: string;
  phone: string;
  bio: string;
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
  appearance: "light" | "dark" | "system";
}

const ProfileSettings: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const [settings, setSettings] = useState<ProfileSettingsState>({
    name: user?.name || "",
    email: user?.email || "",
    phone: "1234567890",
    bio: "Learning enthusiast",
    notifications: {
      email: true,
      push: true,
      sms: false,
    },
    appearance: "system"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setSettings((prev) => ({ ...prev, [name]: value }));
  };

  const handleNotificationChange = (
    type: keyof ProfileSettingsState["notifications"],
    checked: boolean
  ) => {
    setSettings((prev) => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: checked
      }
    }));
  };

  const handleAppearanceChange = (value: "light" | "dark" | "system") => {
    setSettings((prev) => ({
      ...prev,
      appearance: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const token = localStorage.getItem("eduApp_token");
      if (!token) throw new Error("Authentication token not found");

      const response = await fetch("http://localhost:5000/api/user/update-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: settings.name,
          phone: settings.phone,
        }),
      });

      if (!response.ok) {
        const errRes = await response.json();
        throw new Error(errRes.message || "Profile update failed");
      }

      const result = await response.json();

      if (result.success) {
        updateUserProfile(result.data);
        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Personal Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input
              name="name"
              value={settings.name}
              onChange={handleChange}
              className="border-blue-200 focus:border-blue-500"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <Input
              type="email"
              name="email"
              value={settings.email}
              disabled
              className="border-blue-200"
            />
            <p className="text-xs text-gray-500">Email cannot be changed</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <Input
              name="phone"
              value={settings.phone}
              onChange={handleChange}
              className="border-blue-200 focus:border-blue-500"
            />
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Notification Preferences</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {["email", "push", "sms"].map((type) => (
            <div className="flex items-center justify-between" key={type}>
              <div>
                <p className="font-medium capitalize">{type} Notifications</p>
                <p className="text-sm text-gray-500">
                  {type === "sms"
                    ? "Get text messages for important updates"
                    : type === "push"
                    ? "Get alerts on your device"
                    : "Receive course updates via email"}
                </p>
              </div>
              <Switch
                checked={settings.notifications[type as keyof typeof settings.notifications]}
                onCheckedChange={(checked) =>
                  handleNotificationChange(type as keyof typeof settings.notifications, checked)
                }
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Button type="submit" className="w-full blue-gradient" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Saving Changes...
          </>
        ) : (
          "Save Changes"
        )}
      </Button>
    </form>
  );
};

export default ProfileSettings;
