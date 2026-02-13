
"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { Button } from "@/components/ui/button"
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"

const notificationsFormSchema = z.object({
    enableOperatingHours: z.boolean().default(false).optional(),
    marketing_emails: z.boolean().default(false).optional(),
    social_emails: z.boolean().default(true).optional(),
    security_emails: z.boolean(),
})

type NotificationsFormValues = z.infer<typeof notificationsFormSchema>

const defaultValues: Partial<NotificationsFormValues> = {
    enableOperatingHours: false,
    marketing_emails: false,
    social_emails: true,
    security_emails: true,
}

export function OperatingHoursSettings() {
    const form = useForm<NotificationsFormValues>({
        resolver: zodResolver(notificationsFormSchema),
        defaultValues,
    })

    function onSubmit(data: NotificationsFormValues) {
        console.log(data)
    }

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div>
                    <h3 className="mb-4 text-lg font-medium">Availability</h3>
                    <div className="space-y-4">
                        <FormField
                            control={form.control}
                            name="enableOperatingHours"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base">
                                            Operating Hours
                                        </FormLabel>
                                        <FormDescription>
                                            Enable to only show the chat widget during specific hours.
                                        </FormDescription>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )}
                        />
                        {/* Logic for defining hours would go here (e.g., Mon-Fri 9-5) */}
                    </div>
                </div>
                <Button type="submit">Save changes</Button>
            </form>
        </Form>
    )
}
