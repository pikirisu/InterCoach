import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui";

export function AppHomePage() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Overview</CardTitle>
        <CardDescription>Your InterCoach workspace is ready.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600">
          Resume upload and analysis workflows will be connected in the next increments.
        </p>
      </CardContent>
    </Card>
  );
}
