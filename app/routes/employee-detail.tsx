import { useParams, Link } from "react-router";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Progress } from "~/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs";
import { Separator } from "~/components/ui/separator";
import {
  employees,
  getEmployeeMonthlyProgress,
  bonuses,
} from "~/lib/mock-data";
import type { Employee } from "~/lib/types";
import {
  ArrowLeftIcon,
  HeartPulseIcon,
  BriefcaseIcon,
  CalendarIcon,
  DollarSignIcon,
  TrendingUpIcon,
  SmileIcon,
  ActivityIcon,
} from "lucide-react";

const statusVariant: Record<Employee["status"], "default" | "secondary" | "destructive"> = {
  active: "default",
  on_leave: "secondary",
  terminated: "destructive",
};

export default function EmployeeDetailPage() {
  const { id } = useParams();
  const employee = employees.find((e) => e.id === id);

  if (!employee) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-lg text-muted-foreground">Employee not found</p>
        <Button variant="link" className="mt-2" render={<Link to="/employees" />}>
          Back to employees
        </Button>
      </div>
    );
  }

  const monthlyProgress = getEmployeeMonthlyProgress(employee.id);
  const employeeBonuses = bonuses.filter((b) => b.employeeId === employee.id);

  // Latest month data for radar
  const latest = monthlyProgress[monthlyProgress.length - 1];
  const radarData = [
    { metric: "Health", value: latest.healthScore },
    { metric: "Productivity", value: latest.productivity },
    { metric: "Engagement", value: latest.engagement },
    { metric: "Wellbeing", value: latest.wellbeing },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" render={<Link to="/employees" />}>
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold tracking-tight">
              {employee.name}
            </h1>
            <Badge variant={statusVariant[employee.status]}>
              {employee.status.replace("_", " ")}
            </Badge>
          </div>
          <p className="text-muted-foreground">
            {employee.position} at {employee.companyName}
          </p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <HeartPulseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employee.healthScore}%</div>
            <Progress value={employee.healthScore} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <TrendingUpIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employee.progressPercent}%</div>
            <Progress value={employee.progressPercent} className="mt-2" />
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Salary</CardTitle>
            <DollarSignIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${employee.salary.toLocaleString()}
            </div>
            <CardDescription>Monthly base</CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Start Date</CardTitle>
            <CalendarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{employee.startDate}</div>
            <CardDescription>{employee.email}</CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="progress">
        <TabsList>
          <TabsTrigger value="progress">
            <ActivityIcon className="mr-1 h-4 w-4" />
            Monthly Progress
          </TabsTrigger>
          <TabsTrigger value="breakdown">
            <SmileIcon className="mr-1 h-4 w-4" />
            Score Breakdown
          </TabsTrigger>
          <TabsTrigger value="overview">
            <BriefcaseIcon className="mr-1 h-4 w-4" />
            Overview
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Monthly Progress</CardTitle>
              <CardDescription>
                Tracking health, productivity, engagement, and wellbeing over 12 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={monthlyProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Legend />
                    <Line
                      type="monotone"
                      dataKey="healthScore"
                      stroke="hsl(0, 72%, 51%)"
                      name="Health"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="productivity"
                      stroke="hsl(221, 83%, 53%)"
                      name="Productivity"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="engagement"
                      stroke="hsl(142, 71%, 45%)"
                      name="Engagement"
                      strokeWidth={2}
                    />
                    <Line
                      type="monotone"
                      dataKey="wellbeing"
                      stroke="hsl(38, 92%, 50%)"
                      name="Wellbeing"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="breakdown" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Current Score Breakdown</CardTitle>
                <CardDescription>Latest month metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis domain={[0, 100]} />
                      <Radar
                        name="Score"
                        dataKey="value"
                        stroke="hsl(221, 83%, 53%)"
                        fill="hsl(221, 83%, 53%)"
                        fillOpacity={0.3}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Score Comparison</CardTitle>
                <CardDescription>Bar chart of current metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={radarData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="metric" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Bar
                        dataKey="value"
                        fill="hsl(221, 83%, 53%)"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="overview" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Employee Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Full Name</span>
                  <span className="font-medium">{employee.name}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium">{employee.email}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Position</span>
                  <span className="font-medium">{employee.position}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Company</span>
                  <span className="font-medium">{employee.companyName}</span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant={statusVariant[employee.status]}>
                    {employee.status.replace("_", " ")}
                  </Badge>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Start Date</span>
                  <span className="font-medium">{employee.startDate}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bonuses & Gifts</CardTitle>
                <CardDescription>
                  {employeeBonuses.length} recorded entries
                </CardDescription>
              </CardHeader>
              <CardContent>
                {employeeBonuses.length === 0 ? (
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    No bonuses or gifts recorded yet.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {employeeBonuses.map((bonus) => (
                      <div
                        key={bonus.id}
                        className="flex items-center justify-between rounded-md border p-3"
                      >
                        <div>
                          <p className="text-sm font-medium">
                            {bonus.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {bonus.date}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold">
                            ${bonus.amount}
                          </p>
                          <Badge
                            variant={
                              bonus.type === "gift" ? "secondary" : "default"
                            }
                            className="text-xs"
                          >
                            {bonus.type === "gift" ? "Gift" : "Bonus"}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
