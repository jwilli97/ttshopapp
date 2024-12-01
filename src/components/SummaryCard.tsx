import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SummaryCardProps } from "./DepartmentViews/types";

export default function SummaryCard({ title, value, description, icon }: SummaryCardProps) {
    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>{title}</CardTitle>
                {icon}
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-sm text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    );
}