import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui";

interface PlaceholderPageProps {
  description: string;
  title: string;
}

export function PlaceholderPage({ description, title }: PlaceholderPageProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-slate-600">This workspace area will be built when its API integration is added.</p>
      </CardContent>
    </Card>
  );
}
