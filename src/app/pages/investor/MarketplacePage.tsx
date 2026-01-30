import { useState } from "react";
import { Search, SlidersHorizontal, MapPin, TrendingUp, Target, Clock } from "lucide-react";
import { Card, CardContent } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { RiskScoreMeter } from "@/app/components/RiskScoreMeter";
import { VerifiedBadge } from "@/app/components/VerifiedBadge";
import { mockProjects } from "@/data/mockData";
import { cn } from "@/lib/utils";

interface MarketplacePageProps {
  onNavigate: (page: string) => void;
}

export function MarketplacePage({ onNavigate }: MarketplacePageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("most-funded");

  const categories = [
    { id: "all", label: "All Projects" },
    { id: "roads", label: "Roads & Highways" },
    { id: "transport", label: "Public Transport" },
    { id: "energy", label: "Renewable Energy" },
    { id: "smart-cities", label: "Smart Cities" },
    { id: "ports", label: "Ports & Logistics" },
  ];

  const sortOptions = [
    { id: "most-funded", label: "Most Funded" },
    { id: "highest-roi", label: "Highest ROI" },
    { id: "lowest-risk", label: "Lowest Risk" },
    { id: "shortest-tenure", label: "Shortest Tenure" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Project Marketplace</h1>
        <p className="text-muted-foreground">
          Browse and invest in verified infrastructure projects
        </p>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search projects by name, location, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 border rounded-md bg-input-background"
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
          <Button variant="outline">
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={cn(
              "px-4 py-2 rounded-full whitespace-nowrap transition-colors",
              selectedCategory === cat.id
                ? "bg-primary text-white"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Project Cards Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockProjects.map((project) => {
          const fundingProgress = (project.fundingRaised / project.fundingTarget) * 100;

          return (
            <Card
              key={project.id}
              className="hover:shadow-lg transition-all cursor-pointer border-2 hover:border-primary"
              onClick={() => onNavigate(`project-${project.id}`)}
            >
              <CardContent className="p-6 space-y-4">
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold leading-tight">{project.name}</h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <MapPin className="w-4 h-4" />
                    <span>{project.location}</span>
                  </div>
                  {project.issuerVerified && (
                    <div className="mt-2">
                      <VerifiedBadge size="sm" />
                    </div>
                  )}
                </div>

                {/* Funding Progress */}
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Funding Progress</span>
                    <span className="font-medium">{fundingProgress.toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-1">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${fundingProgress}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>
                      ₹{(project.fundingRaised / 10000000).toFixed(1)}Cr raised
                    </span>
                    <span>
                      ₹{(project.fundingTarget / 10000000).toFixed(1)}Cr target
                    </span>
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-3 gap-4 py-4 border-t border-b">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-[#10b981] mb-1">
                      <TrendingUp className="w-4 h-4" />
                      <span className="font-semibold">{project.roi}%</span>
                    </div>
                    <p className="text-xs text-muted-foreground">ROI p.a.</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-primary mb-1">
                      <Clock className="w-4 h-4" />
                      <span className="font-semibold">{project.tenure}y</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Tenure</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 text-[#0ea5e9] mb-1">
                      <Target className="w-4 h-4" />
                      <span className="font-semibold">₹{project.tokenPrice}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">Per Token</p>
                  </div>
                </div>

                {/* Risk Score */}
                <RiskScoreMeter score={project.riskScore} showLabel={false} />

                {/* Action Buttons */}
                <div className="flex gap-2 pt-2">
                  <Button className="flex-1" onClick={() => onNavigate(`project-${project.id}`)}>
                    View Details
                  </Button>
                  <Button variant="outline" className="flex-1">
                    Invest
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" size="lg">
          Load More Projects
        </Button>
      </div>
    </div>
  );
}
