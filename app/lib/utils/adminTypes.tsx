import React from "react";
import { Building2, Globe, MapPin, UserCheck } from "lucide-react";

export type AdminType = "country" | "company" | "region";

export interface AdminTypeColors {
  gradient: string;
  bg: string;
  text: string;
  border: string;
}

// Get icon based on admin type
export const getAdminTypeIcon = (adminType: string) => {
  switch (adminType) {
    case "country":
      return <Globe size={32} />;
    case "company":
      return <Building2 size={32} />;
    case "region":
      return <MapPin size={32} />;
    default:
      return <UserCheck size={32} />;
  }
};

// Get color scheme based on admin type
export const getAdminTypeColors = (adminType: string): AdminTypeColors => {
  switch (adminType) {
    case "country":
      return {
        gradient: "from-[#4DAB46] to-[#3D8B3A]",
        bg: "bg-green-50",
        text: "text-green-700",
        border: "border-green-200",
      };
    case "company":
      return {
        gradient: "from-[#5850DE] to-[#4A42C7]",
        bg: "bg-purple-50",
        text: "text-purple-700",
        border: "border-purple-200",
      };
    case "region":
      return {
        gradient: "from-[#248FEC] to-[#1A73C2]",
        bg: "bg-blue-50",
        text: "text-blue-700",
        border: "border-blue-200",
      };
    default:
      return {
        gradient: "from-[#8E8E93] to-[#6D6D80]",
        bg: "bg-gray-50",
        text: "text-gray-700",
        border: "border-gray-200",
      };
  }
};

// Get human-readable admin type name
export const getAdminTypeName = (adminType: string): string => {
  return adminType ? adminType.charAt(0).toUpperCase() + adminType.slice(1) : "Unknown";
};