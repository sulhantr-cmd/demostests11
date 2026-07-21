import { Metadata } from "next"
import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export const runtime = "edge";

export const metadata: Metadata = {
  title: "Subscription Success",
  description: "Your subscription has been successfully activated",
}

export default function SubscriptionSuccessPage() {
  return (
    <div className="container flex flex-col items-center justify-center py-20 space-y-6 max-w-lg mx-auto">
      <Card className="w-full border-zinc-800 bg-gradient-to-t from-zinc-900 to-black">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
            <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl">Subscription Activated!</CardTitle>
          <CardDescription>
            Thank you for subscribing to our Pro plan
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <div className="text-sm text-zinc-400 mb-6">
            <p>Your subscription has been successfully activated. You now have access to all Pro features.</p>
            <p className="mt-2">We&apos;ve sent a confirmation email with your subscription details.</p>
          </div>
          <div className="flex flex-col space-y-3">
            <Button asChild className="w-full rounded-full">
              <Link href="/dashboard">
                Go to Dashboard
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full rounded-full border-zinc-800 hover:bg-zinc-900">
              <Link href="/subscription">
                Manage Subscription
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}