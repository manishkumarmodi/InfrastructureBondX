import { useState } from "react";
import { Calculator, TrendingUp, ArrowUpRight, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { ChartContainer } from "@/app/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
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

  const formatCurrency = (value: number) =>
    `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;

  const highlightTiles = [
    {
      label: "Tokens Allocated",
      value: results.tokens.toLocaleString(),
      sub: `@ ₹${tokenPrice.toLocaleString()} each`,
    },
    {
      label: "Projected Yield",
      value: `${roiPercentage}% p.a.`,
      sub: `${tenure} year horizon`,
    },
  ];

  // Prepare bar chart data for each year
  const barData = [];
  const amount = parseFloat(investment) || 0;
  for (let year = 0; year <= tenure; year++) {
    const value = amount * Math.pow(1 + roiPercentage / 100, year);
    barData.push({ year: `Year ${year}`, value });
  }

  return (
    <Card className="bg-[#050816] border-white/10 text-white overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#22d3ee] via-[#a855f7] to-[#f472b6]" />
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="w-5 h-5 text-[#22d3ee]" />
          Infra ROI Playground
        </CardTitle>
        <p className="text-xs text-white/60">
          Simulated compound returns for tokenized infra bonds.
        </p>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Growth Bar Graph */}
        <div>
          <div className="mb-2 text-xs text-white/60">Growth Over Time</div>
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
            <ChartContainer config={{}} className="w-full h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="year" stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 12 }} />
                  <YAxis stroke="#94a3b8" tick={{ fill: '#cbd5e1', fontSize: 12 }} tickFormatter={v => `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`} />
                  <Tooltip formatter={v => `₹${v.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`} labelStyle={{ color: '#fff' }} contentStyle={{ background: '#0f172a', border: '1px solid #334155', color: '#fff' }} />
                  <Bar dataKey="value" fill="#22d3ee" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </div>
        </div>
        {/* Investment Input */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-white/50">
                Capital at work
              </p>
              <p className="text-sm text-white/70">Enter ticket size (₹100+)</p>
            </div>
            <Activity className="w-4 h-4 text-white/50" />
          </div>
          <Input
            type="number"
            value={investment}
            onChange={(e) => setInvestment(e.target.value)}
            placeholder="Enter amount"
            min="100"
            className="bg-black/40 border-white/20 text-white"
          />
        </div>

        {/* Highlights */}
        <div className="grid md:grid-cols-2 gap-3">
          {highlightTiles.map((tile) => (
            <div key={tile.label} className="rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-transparent p-4">
              <p className="text-xs text-white/60">{tile.label}</p>
              <p className="text-2xl font-semibold text-white mt-2 flex items-center gap-2">
                {tile.value}
                {tile.label === "Projected Yield" && (
                  <ArrowUpRight className="w-5 h-5 text-[#22d3ee]" />
                )}
              </p>
              <p className="text-xs text-white/50">{tile.sub}</p>
            </div>
          ))}
        </div>

        {/* Breakdown */}
        <div className="rounded-[24px] border border-white/10 bg-black/30 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/60">Total Return at Maturity</p>
            <span className="text-lg font-semibold text-emerald-300">
              {formatCurrency(results.totalReturn)}
            </span>
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-xs text-white/60">Net Profit</p>
              <p className="text-2xl font-semibold text-emerald-200 mt-1">
                +{formatCurrency(results.profit)}
              </p>
              <p className="text-xs text-white/50">post escrow releases</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-xs text-white/60">Capital Locked</p>
              <p className="text-2xl font-semibold mt-1">
                {formatCurrency(results.amount)}
              </p>
              <p className="text-xs text-white/50">initial investment</p>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-white/50">Avg. Yearly Value</span>
              <span className="font-semibold">{formatCurrency(results.yearlyReturn)}</span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-white/50">Avg. Monthly Value</span>
              <span className="font-semibold">{formatCurrency(results.monthlyReturn)}</span>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="flex items-start gap-3 text-xs text-white/60 bg-white/5 border border-white/10 rounded-2xl p-4">
          <TrendingUp className="w-4 h-4 text-[#22d3ee] mt-0.5" />
          <span>
            Output is illustrative, assumes annual compounding, and is tied to milestone approvals and successful project completion.
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
