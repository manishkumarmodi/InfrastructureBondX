import { Users, Building2, ShieldCheck, ArrowLeft } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";

interface RoleSelectPageProps {
  onSelectRole: (role: "investor" | "issuer" | "admin") => void;
  onBack: () => void;
}

export function RoleSelectPage({ onSelectRole, onBack }: RoleSelectPageProps) {
  const roles = [
    {
      id: "investor" as const,
      icon: Users,
      title: "Investor / Citizen",
      description: "Browse projects, invest in infrastructure bonds, and track your portfolio.",
      features: [
        "Start investing with ₹100",
        "View milestone progress",
        "Track returns & impact",
        "Access secondary market",
      ],
    },
    {
      id: "issuer" as const,
      icon: Building2,
      title: "Issuer / Government / PPP",
      description: "List infrastructure projects, manage milestones, and raise funding.",
      features: [
        "Create bond listings",
        "Upload milestone proofs",
        "Track investor base",
        "Manage escrow releases",
      ],
    },
    {
      id: "admin" as const,
      icon: ShieldCheck,
      title: "Platform Admin",
      description: "Verify issuers, approve projects, and monitor platform integrity.",
      features: [
        "Verify issuer credentials",
        "Approve bond listings",
        "Monitor fraud alerts",
        "Generate platform reports",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c4a6e] to-[#075985] flex items-center justify-center p-4">
      <div className="w-full max-w-5xl">
        <Button
          variant="ghost"
          className="text-white hover:bg-white/10 mb-6"
          onClick={onBack}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Home
        </Button>

        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#22d3ee] via-[#a855f7] to-[#f472b6] mb-4 drop-shadow-lg">
            Choose Your Role
          </h1>
          <p className="text-xl text-white/80">
            Select how you want to interact with InfraBondX
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((role) => (
            <Card
              key={role.id}
              className="cursor-pointer transition-all hover:scale-105 border-0 shadow-xl bg-white/10 backdrop-blur-lg ring-1 ring-white/20 hover:ring-2 hover:ring-[#22d3ee] group relative overflow-hidden"
              onClick={() => onSelectRole(role.id)}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-[#22d3ee]/10 via-[#a855f7]/10 to-[#f472b6]/10 opacity-80 group-hover:opacity-100 transition-all duration-300 pointer-events-none" />
              <CardContent className="relative p-8 text-center z-10">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#22d3ee]/30 via-[#a855f7]/20 to-[#f472b6]/20 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <role.icon className="w-10 h-10 text-[#22d3ee] group-hover:text-[#a855f7] transition-colors duration-300" />
                </div>
                <h3 className="text-2xl font-bold mb-2 text-white drop-shadow-sm">{role.title}</h3>
                <p className="text-base text-white/80 mb-6">{role.description}</p>
                <ul className="text-left space-y-2 mb-8">
                  {role.features.map((feature, i) => (
                    <li key={i} className="text-sm flex items-start gap-2 text-white/80">
                      <span className="text-[#10b981] mt-0.5">✓</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full bg-gradient-to-r from-[#22d3ee] to-[#a855f7] text-white font-semibold shadow-md group-hover:from-[#a855f7] group-hover:to-[#22d3ee] transition-all">
                  Continue as {role.title.split(" / ")[0]}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-white/60 italic">
            All roles use mock authentication for this demo
          </p>
        </div>
      </div>
    </div>
  );
}
