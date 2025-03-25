import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Legend } from "recharts";

// Sample historical data - in a real application, this would come from an API
const usageData = [{
  month: "Jan",
  active: 65,
  maintenance: 15,
  inactive: 10
}, {
  month: "Feb",
  active: 59,
  maintenance: 12,
  inactive: 15
}, {
  month: "Mar",
  active: 80,
  maintenance: 10,
  inactive: 5
}, {
  month: "Apr",
  active: 81,
  maintenance: 14,
  inactive: 8
}, {
  month: "May",
  active: 56,
  maintenance: 20,
  inactive: 12
}, {
  month: "Jun",
  active: 55,
  maintenance: 15,
  inactive: 18
}];
const chartConfig = {
  active: {
    color: "#22c55e"
  },
  maintenance: {
    color: "#eab308"
  },
  inactive: {
    color: "#ef4444"
  }
};
export function AnalyticsChart() {
  return <Card className="col-span-3">
      <CardHeader className="pb-2">
        <CardTitle className="text-md text-base font-bold">Historical Cart Status</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="aspect-[4/3] sm:aspect-[2/1] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={usageData} margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 0
          }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="month" tick={{
              fontSize: 12
            }} tickLine={false} axisLine={false} />
              <YAxis tick={{
              fontSize: 12
            }} tickLine={false} axisLine={false} tickFormatter={value => `${value}`} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Legend />
              <Bar dataKey="active" name="Active" stackId="a" fill="var(--color-active)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="maintenance" name="Maintenance" stackId="a" fill="var(--color-maintenance)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="inactive" name="Inactive" stackId="a" fill="var(--color-inactive)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
    </Card>;
}