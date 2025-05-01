import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SummaryCardProps } from "./DepartmentViews/types";
import { cn } from "@/lib/utils";

export default function SummaryCard({ title, value, description, icon, className }: SummaryCardProps) {
    return (
        <Card className={cn(className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground mt-1">{description}</p>
            </CardContent>
        </Card>
    );
}