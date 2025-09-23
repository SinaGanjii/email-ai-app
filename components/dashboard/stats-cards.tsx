import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail, MailOpen, Star, Archive } from "lucide-react"

export function StatsCards() {
  const stats = [
    {
      title: "Total Emails",
      value: "1,234",
      change: "+12%",
      icon: Mail,
      color: "text-blue-500",
    },
    {
      title: "Unread",
      value: "23",
      change: "-5%",
      icon: MailOpen,
      color: "text-orange-500",
    },
    {
      title: "Important",
      value: "8",
      change: "+2%",
      icon: Star,
      color: "text-yellow-500",
    },
    {
      title: "Archived",
      value: "456",
      change: "+18%",
      icon: Archive,
      color: "text-green-500",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className={stat.change.startsWith("+") ? "text-green-500" : "text-red-500"}>{stat.change}</span>{" "}
                from last month
              </p>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
