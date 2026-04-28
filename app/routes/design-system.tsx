import React, { useState } from "react";
import { useNavigate } from "react-router";
import type { Route } from "./+types/design-system";
import {
  Palette,
  Type,
  Box,
  CheckCircle2,
  Copy,
  ArrowRight,
} from "lucide-react";
import { Button, Card, Input, Textarea } from "~/components/ui";
import AppSidebar from "../../src/components/shared/AppSidebar";
import Navbar from "../../src/components/shared/Navbar";
import { RoleGuard } from "~/components/auth/RoleGuard";
import { useUser } from "~/hooks/useAuth";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Design System - Ealthiness Admin Portal" },
    {
      name: "description",
      content: "Brand guidelines and design system for the Ealthiness platform",
    },
  ];
}

const DS_COLORS = {
  primary: [
    { name: "Primary", hex: "#5850DE", usage: "Main brand purple" },
    { name: "Light Blue", hex: "#248FEC", usage: "Accent blue" },
  ],
  semantic: [
    { name: "Error", hex: "#EF4444", usage: "Error states" },
    { name: "Success", hex: "#4DAB46", usage: "Success confirmations" },
    { name: "Warning", hex: "#FFB900", usage: "Warnings" },
  ],
};

const CopyButton = ({ text }: { text: string }) => {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(text);
    } catch (err) {}
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <button
      onClick={handleCopy}
      className="p-1.5 hover:bg-gray-100 rounded-md transition-colors text-gray-500 hover:text-[#5850DE]"
      title="Copy Hex"
    >
      {copied ? (
        <CheckCircle2 size={16} className="text-[#4DAB46]" />
      ) : (
        <Copy size={16} />
      )}
    </button>
  );
};

export default function DesignSystemPage() {
  const user = useUser();
  const navigate = useNavigate();
  const [refreshing, setRefreshing] = useState(false);
  const [dsTab, setDsTab] = useState("colors");

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1500);
  };

  const handleLogout = () => {
    navigate("/");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <RoleGuard allowedRoles={["SUPER_ADMIN", "COUNTRY_ADMIN", "REGIONAL_ADMIN", "COMPANY_ADMIN"]}>
      <div className="min-h-screen bg-[#F8F9FB] font-sans flex">
        <AppSidebar user={user} />

      <div className="flex-1 flex flex-col">
        <Navbar
          user={user}
          onLogout={handleLogout}
          onRefresh={handleRefresh}
          refreshing={refreshing}
        />

        <div className="flex-1 p-6">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-5xl">
            <div className="mb-8 border-b border-[#E0E1E6] pb-6 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#5850DE] to-[#248FEC] text-white flex items-center justify-center shadow-md">
                    <Palette size={20} />
                  </div>
                  <h2 className="text-3xl font-extrabold text-[#1B173A]">
                    Brand Guidelines
                  </h2>
                </div>
                <p className="text-[#60646C] ml-13 font-medium">
                  The visual language of the Ealthiness Admin Portal.
                </p>
              </div>
            </div>

            {/* Mini Tabs for DS */}
            <div className="flex gap-4 mb-8 border-b border-[#E0E1E6]">
              {["colors", "typography", "components"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setDsTab(tab)}
                  className={`pb-3 text-sm font-bold capitalize transition-all border-b-2 ${
                    dsTab === tab
                      ? "border-[#5850DE] text-[#5850DE]"
                      : "border-transparent text-[#8E8E93] hover:text-[#1B173A]"
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {dsTab === "colors" && (
              <div className="space-y-8 animate-in fade-in">
                <div>
                  <h3 className="text-lg font-bold text-[#1B173A] mb-4">
                    Primary Colors
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {DS_COLORS.primary.map((c, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl p-3 border border-[#E0E1E6] shadow-sm flex items-center gap-4"
                      >
                        <div
                          className="w-16 h-16 rounded-xl shrink-0 shadow-inner"
                          style={{ backgroundColor: c.hex }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-[#1B173A]">
                              {c.name}
                            </h4>
                            <CopyButton text={c.hex} />
                          </div>
                          <p className="text-sm font-mono text-[#5850DE] font-semibold">
                            {c.hex}
                          </p>
                          <p className="text-xs text-[#60646C] mt-1">
                            {c.usage}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-[#1B173A] mb-4">
                    Semantic Colors
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {DS_COLORS.semantic.map((c, i) => (
                      <div
                        key={i}
                        className="bg-white rounded-2xl p-3 border border-[#E0E1E6] shadow-sm flex items-center gap-4"
                      >
                        <div
                          className="w-12 h-12 rounded-xl shrink-0 shadow-inner"
                          style={{ backgroundColor: c.hex }}
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start">
                            <h4 className="font-bold text-[#1B173A] text-sm">
                              {c.name}
                            </h4>
                            <CopyButton text={c.hex} />
                          </div>
                          <p className="text-xs font-mono text-[#5850DE] font-semibold">
                            {c.hex}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {dsTab === "typography" && (
              <div className="bg-white rounded-3xl border border-[#E0E1E6] shadow-sm p-8 space-y-10 animate-in fade-in">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-8 border-b border-[#E0E1E6]">
                  <div className="text-sm font-bold text-[#8E8E93] uppercase tracking-widest mt-2">
                    H1 Heading
                  </div>
                  <div className="md:col-span-3">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-[#1B173A] mb-2">
                      Admin Portal
                    </h1>
                    <p className="text-sm text-[#60646C] font-medium">
                      Font Weight: 800 (Extrabold) • Font Family: Inter
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-8 border-b border-[#E0E1E6]">
                  <div className="text-sm font-bold text-[#8E8E93] uppercase tracking-widest mt-2">
                    H2 Section
                  </div>
                  <div className="md:col-span-3">
                    <h2 className="text-2xl font-extrabold text-[#1B173A] mb-2">
                      Section Title
                    </h2>
                    <p className="text-sm text-[#60646C] font-medium">
                      Font Weight: 800 (Extrabold)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-8 border-b border-[#E0E1E6]">
                  <div className="text-sm font-bold text-[#8E8E93] uppercase tracking-widest mt-2">
                    H3 Card Title
                  </div>
                  <div className="md:col-span-3">
                    <h3 className="text-lg font-extrabold text-[#1B173A] mb-2">
                      Card Component Title
                    </h3>
                    <p className="text-sm text-[#60646C] font-medium">
                      Font Weight: 800 (Extrabold)
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-sm font-bold text-[#8E8E93] uppercase tracking-widest mt-2">
                    Body Text
                  </div>
                  <div className="md:col-span-3">
                    <p className="text-base text-[#1B173A] leading-relaxed mb-2">
                      This is standard body text used for descriptions and
                      longer content. High legibility and readability are
                      prioritized in the design system.
                    </p>
                    <p className="text-sm text-[#60646C] font-medium">
                      Font Weight: 400 (Regular) • Line Height: 1.5
                    </p>
                  </div>
                </div>
              </div>
            )}

            {dsTab === "components" && (
              <div className="bg-white rounded-3xl border border-[#E0E1E6] shadow-sm p-8 animate-in fade-in space-y-10">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-[#8E8E93]">
                    Buttons
                  </h3>
                  <div className="flex flex-wrap gap-4 mb-8">
                    <Button className="bg-[#5850DE] hover:bg-[#665AF6] text-white py-3 px-6 rounded-xl font-bold flex items-center gap-3 shadow-md">
                      Primary Button <ArrowRight size={18} />
                    </Button>
                    <Button
                      variant="outline"
                      className="py-3 px-6 rounded-xl font-bold"
                    >
                      Secondary Button
                    </Button>
                    <Button
                      variant="ghost"
                      className="py-3 px-6 rounded-xl font-bold"
                    >
                      Ghost Button
                    </Button>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-[#8E8E93]">
                    Form Elements
                  </h3>
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="block text-xs font-bold text-[#8E8E93] uppercase mb-2">
                        Input Field
                      </label>
                      <Input placeholder="Enter your email address" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-[#8E8E93] uppercase mb-2">
                        Textarea
                      </label>
                      <Textarea placeholder="Enter your message here..." />
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-[#8E8E93]">
                    Cards
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-[#E8E6FC] text-[#5850DE] flex items-center justify-center">
                          <Box size={16} />
                        </div>
                        <h4 className="text-lg font-extrabold text-[#1B173A]">
                          Standard Card
                        </h4>
                      </div>
                      <p className="text-sm text-[#60646C] leading-relaxed">
                        This is a standard card component with consistent
                        padding, rounded corners, and subtle shadow.
                      </p>
                    </Card>

                    <div className="bg-gradient-to-br from-[#5850DE] to-[#248FEC] rounded-xl p-6 text-white shadow-xl">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-8 h-8 rounded-lg bg-white/20 text-white flex items-center justify-center">
                          <Palette size={16} />
                        </div>
                        <h4 className="text-lg font-extrabold">
                          Gradient Card
                        </h4>
                      </div>
                      <p className="text-white/90 text-sm leading-relaxed">
                        Special highlight card with gradient background for key
                        metrics and important information.
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-[#8E8E93]">
                    Color Usage Guidelines
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-[#F8F9FB] rounded-xl border border-[#E0E1E6]">
                      <div className="w-4 h-4 rounded-full bg-[#5850DE]"></div>
                      <div>
                        <p className="text-sm font-bold text-[#1B173A]">
                          Primary (#5850DE)
                        </p>
                        <p className="text-xs text-[#60646C]">
                          Use for primary actions, active states, and brand
                          elements
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-[#F8F9FB] rounded-xl border border-[#E0E1E6]">
                      <div className="w-4 h-4 rounded-full bg-[#248FEC]"></div>
                      <div>
                        <p className="text-sm font-bold text-[#1B173A]">
                          Accent Blue (#248FEC)
                        </p>
                        <p className="text-xs text-[#60646C]">
                          Use for secondary actions, links, and informational
                          elements
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-[#F8F9FB] rounded-xl border border-[#E0E1E6]">
                      <div className="w-4 h-4 rounded-full bg-[#4DAB46]"></div>
                      <div>
                        <p className="text-sm font-bold text-[#1B173A]">
                          Success Green (#4DAB46)
                        </p>
                        <p className="text-xs text-[#60646C]">
                          Use for success messages, positive metrics, and
                          confirmations
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    </RoleGuard>
  );
}
