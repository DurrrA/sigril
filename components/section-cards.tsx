
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  const tags = ["BBQ", "Kebersihan", "Tutorial"]
  const roles = ["Admin", "Penyewa", "User"]
  const pendapatan = 20000000


  return (
    <div className="*:data-[slot=card]:shadow-xs @xl/main:grid-cols-2 @5xl/main:grid-cols-4 grid grid-cols-1 gap-4 px-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-[#3528ab]/15 *:data-[slot=card]:to-white dark:*:data-[slot=card]:bg-card lg:px-6">
      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Tags</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {tags.length}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="font-medium">Tags Terdaftar:</div>
          <ul className="text-muted-foreground text-sm list-disc list-inside">
            {tags.map((tag, i) => (
              <li key={i}>{tag}</li>
            ))}
          </ul>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Roles</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {roles.length}
          </CardTitle>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1 text-sm">
          <div className="font-medium">Role Pengguna:</div>
          <ul className="text-muted-foreground text-sm list-disc list-inside">
            {roles.map((role, i) => (
              <li key={i}>{role}</li>
            ))}
          </ul>
        </CardFooter>
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Pendapatan</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {pendapatan}
          </CardTitle>
        </CardHeader>
        
      </Card>

      <Card className="@container/card">
        <CardHeader>
          <CardDescription>Total Pendapatan</CardDescription>
          <CardTitle className="@[250px]/card:text-3xl text-2xl font-semibold tabular-nums">
            {pendapatan}
          </CardTitle>
        </CardHeader>
        
      </Card>
    </div>
  )
}
