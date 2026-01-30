import { Search, Download, ExternalLink, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { mockTransactions } from "@/data/mockData";
import { cn } from "@/lib/utils";

export function TransactionLedger() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Transaction History</h1>
          <p className="text-muted-foreground">All your investment transactions in one place</p>
        </div>
        <Button variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input placeholder="Search transactions..." className="pl-10" />
        </div>
        <select className="px-4 py-2 border rounded-md bg-input-background">
          <option>All Types</option>
          <option>Buy</option>
          <option>Sell</option>
        </select>
        <select className="px-4 py-2 border rounded-md bg-input-background">
          <option>All Status</option>
          <option>Completed</option>
          <option>Pending</option>
        </select>
      </div>

      {/* Transaction Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Date & Time
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Project
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Type
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Tokens
                  </th>
                  <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">
                    Amount
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">
                    Tx Hash
                  </th>
                </tr>
              </thead>
              <tbody>
                {mockTransactions.map((tx) => (
                  <tr key={tx.id} className="border-b hover:bg-accent transition-colors">
                    <td className="py-4 px-4 text-sm">{tx.timestamp}</td>
                    <td className="py-4 px-4">
                      <div className="max-w-xs">
                        <p className="font-medium text-sm truncate">{tx.projectName}</p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div
                        className={cn(
                          "inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                          tx.type === "buy"
                            ? "bg-[#10b981]/10 text-[#10b981]"
                            : "bg-[#f59e0b]/10 text-[#f59e0b]"
                        )}
                      >
                        {tx.type === "buy" ? (
                          <ArrowDownRight className="w-3 h-3" />
                        ) : (
                          <ArrowUpRight className="w-3 h-3" />
                        )}
                        {tx.type === "buy" ? "Buy" : "Sell"}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-right font-medium">{tx.tokens}</td>
                    <td className="py-4 px-4 text-right font-medium">
                      ₹{(tx.tokens * tx.price).toLocaleString("en-IN")}
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={cn(
                          "inline-block px-2 py-1 rounded-full text-xs font-medium",
                          tx.status === "completed"
                            ? "bg-[#10b981]/10 text-[#10b981]"
                            : "bg-[#f59e0b]/10 text-[#f59e0b]"
                        )}
                      >
                        {tx.status === "completed" ? "Completed" : "Pending"}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <code className="text-xs text-muted-foreground">
                          {tx.txHash.substring(0, 10)}...
                        </code>
                        <button className="p-1 hover:bg-accent rounded">
                          <ExternalLink className="w-3 h-3 text-muted-foreground" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
