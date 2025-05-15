"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { format } from "date-fns"
import { CalendarIcon, Loader2, User, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage
} from "@/components/ui/form"
import {
  Card, CardContent, CardDescription, CardFooter,
  CardHeader, CardTitle
} from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { cn } from "@/lib/utils"
import type { User as UserType } from "@/interfaces/user.interfaces"

const formSchema = z.object({
  username: z.string().min(3, { message: "Username must be at least 3 characters." }),
  phone: z.string().min(10, { message: "Phone number must be at least 10 digits." }),
  address: z.string().min(5, { message: "Address must be at least 5 characters." }),
  fullName: z.string().min(3, { message: "Full name must be at least 3 characters." }),
  dateOfBirth: z.date().optional(),
  avatar: z.union([z.string(), z.instanceof(File)]).optional(),
})

export default function ProfilePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [userData, setUserData] = useState<UserType | null>(null)
  const [error, setError] = useState<string | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: "",
      phone: "",
      address: "",
      fullName: "",
      dateOfBirth: undefined,
      avatar: "",
    },
  })

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setIsLoading(true)
        const response = await fetch("/api/me")

        if (!response.ok) throw new Error("Failed to fetch user data")

        const data = await response.json()
        const user = data.data.user
        setUserData(user)

        form.reset({
          username: user.username || "",
          phone: user.no_telp || "",
          address: user.alamat || "",
          fullName: user.full_name || "",
          dateOfBirth: user.date_of_birth ? new Date(user.date_of_birth) : undefined,
          avatar: user.avatar || "",
        })
      } catch (err) {
        setError("Failed to load profile data")
        toast("Error", { description: "Failed to load profile data" })
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserData()
  }, [form])

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSaving(true)

      const formData = new FormData()
      formData.append("username", values.username)
      formData.append("phone", values.phone)
      formData.append("address", values.address)
      formData.append("fullName", values.fullName)
      if (values.dateOfBirth) {
        formData.append("dateOfBirth", values.dateOfBirth.toISOString())
      }
      if (values.avatar && values.avatar instanceof File) {
        formData.append("avatar", values.avatar)
      }

      const response = await fetch("/api/me", {
        method: "PUT",
        body: formData,
      })

      if (!response.ok) throw new Error("Failed to update profile")

      const updatedUser = await response.json()
      setUserData({
        ...userData!,
        username: updatedUser.username,
        no_telp: updatedUser.phone,
        alamat: updatedUser.address,
        full_name: updatedUser.fullName,
        date_of_birth: updatedUser.dateOfBirth,
        avatar: updatedUser.avatar,
      })

      toast("Profile Updated", {
        description: "Your profile has been updated successfully.",
      })
    } catch (err) {
      toast("Error", {
        description: "Failed to update profile. Please try again.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen p-4">
        <Alert variant="destructive" className="max-w-md">
          <Info className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-3xl shadow-lg">
        <CardHeader className="text-center pb-6 border-b">
          <CardTitle className="text-2xl font-bold">Profile Settings</CardTitle>
          <CardDescription>Update your personal information and profile settings</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center justify-center space-y-4 pb-6 border-b">
                <Avatar className="h-28 w-28 border-2 border-primary/20">
                  <AvatarImage
                    src={
                      userData?.avatar && typeof userData.avatar === "string"
                        ? userData.avatar
                        : form.watch("avatar") instanceof File
                          ? URL.createObjectURL(form.watch("avatar") as File)
                          : ""
                    }
                    alt={userData?.username || "User"}
                  />
                  <AvatarFallback className="text-2xl bg-primary/10">
                    <User className="h-12 w-12" />
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col space-y-1 items-center">
                  <h3 className="text-lg font-medium">{userData?.email}</h3>
                  <p className="text-sm text-muted-foreground">
                    Member since {new Date(userData?.createdAt || "").toLocaleDateString()}
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="avatar"
                  render={({ field: { value, onChange, ...fieldProps } }) => (
                    <FormItem className="w-full max-w-sm">
                      <FormLabel className="text-center block">Profile Picture</FormLabel>
                      <FormControl>
                        <div className="flex items-center space-x-2">
                          <Input
                            type="file"
                            accept="image/*"
                            className="w-full"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                onChange(file)
                              }
                            }}
                            {...fieldProps}
                          />
                          {value && typeof value === "object" && (
                            <div className="text-sm text-muted-foreground">{(value as File).name}</div>
                          )}
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid gap-6 pt-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input placeholder="username" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="John Doe" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="+1234567890" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem className="flex flex-col">
                      <FormLabel>Date of Birth</FormLabel>
                      <Popover>
                        <PopoverTrigger asChild>
                          <FormControl>
                            <Button
                              variant={"outline"}
                              className={cn(
                                "w-full pl-3 text-left font-normal",
                                !field.value && "text-muted-foreground",
                              )}
                            >
                              {field.value ? format(field.value, "PPP") : <span>Pick a date</span>}
                              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                            </Button>
                          </FormControl>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <Calendar
                            mode="single"
                            selected={field.value}
                            onSelect={field.onChange}
                            disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem className="md:col-span-2">
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Your address" className="resize-none" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 border-t px-6 py-4 bg-muted/10">
              <Button variant="outline" onClick={() => form.reset()} disabled={isSaving}>
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                className="px-6 bg-[#3528AB] text-white disabled:bg-[#3528AB]/70"
              >
                {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Changes
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>
    </div>
  )
}
