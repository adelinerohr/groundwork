import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardHeader,
  CardDescription,
  CardTitle,
  CardFooter,
} from "@workspace/ui/components/card";
import { TrendingUpIcon } from "lucide-react";

interface ClientCardProps {
  data: number;
}

export function ClientCard({ data }: ClientCardProps) {
  return (
    <Card className="@container/card">
      <CardHeader className="relative">
        <CardDescription>Total clients</CardDescription>
        <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
          {data}
        </CardTitle>
        <div className="absolute right-4 top-4">
          <Badge variant={"outline"} className="flex gap-1 rounded-lg text-xs">
            <TrendingUpIcon className="size-3" />
            +12.5%
          </Badge>
        </div>
      </CardHeader>
      <CardFooter className="flex-col items-start gap-1 text-sm">
        <div className="line-clamp-1 flex gap-2 font-medium">
          Trending up this month <TrendingUpIcon className="size-4" />
        </div>
        <div className="text-muted-foreground">
          Visitors for the last 6 months
        </div>
      </CardFooter>
    </Card>
  );
}
