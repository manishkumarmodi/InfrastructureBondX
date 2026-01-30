import { useState } from "react";
import { Calculator, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Input } from "@/app/components/ui/input";

interface ROICalculatorProps {
  roiPercentage: number; // % per year
  tenure: number; // in years
  tokenPrice: number;
}

export function ROICalculator({
  roiPercentage,
  tenure,
  tokenPrice,
}: ROICalculatorProps) {
  const [investment, setInvestment] = useState<string>("1000");

  const calculateReturns = () => {
    const amount = parseFloat(investment) || 0;

    // Tokens calculation
    const tokens = Math.floor(amount / tokenPrice);

    // ✅ Compound Interest Formula
    const totalReturn =
      amount * Math.pow(1 + roiPercentage / 100, tenure);

    const profit = totalReturn - amount;

    const yearlyReturn = totalReturn / tenure;
    const monthlyReturn = totalReturn / (tenure * 12);

    return {
      amount,
      tokens,
      totalReturn,
      profit,
      yearlyReturn,
      monthlyReturn,
    };
  };

  const results = calculateReturns();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="w-5 h-5" />
          ROI Calculator
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Investment Input */}
        <div>
          <label className="text-sm text-muted-foreground mb-2 block">
            Investment Amount (₹)
          </label>
          <Input
            type="number"
            value={investment}
            onChange={(e) => setInvestment(e.target.value)}
            placeholder="Enter amount"
            min="100"
          />
        </div>

        {/* Results */}
        <div className="p-4 bg-accent rounded-lg space-y-3">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              Tokens Received
            </span>
            <span className="font-medium">
              {results.tokens.toLocaleString()}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">
              ROI (Per Year)
            </span>
            <span className="font-medium text-[#10b981]">
              {roiPercentage}% p.a.
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Tenure</span>
            <span className="font-medium">{tenure} years</span>
          </div>

          <div className="border-t pt-3 mt-3 space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm">Total Return</span>
              <span className="text-lg font-semibold text-[#10b981]">
                ₹
                {results.totalReturn.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Profit</span>
              <span className="font-medium text-[#10b981]">
                +₹
                {results.profit.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Avg. Yearly Value
              </span>
              <span className="font-medium">
                ₹
                {results.yearlyReturn.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">
                Avg. Monthly Value
              </span>
              <span className="font-medium">
                ₹
                {results.monthlyReturn.toLocaleString("en-IN", {
                  maximumFractionDigits: 2,
                })}
              </span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <TrendingUp className="w-4 h-4" />
          <span>
            Returns are simulated, compounded annually, and subject to project
            completion.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
