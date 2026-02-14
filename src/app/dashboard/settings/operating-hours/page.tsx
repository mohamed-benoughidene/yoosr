"use client"

import { useProject } from "@/context/ProjectContext"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"
import { useState, useEffect } from "react"
import { toast } from "sonner"
import { Clock, Plus, Trash2, Save } from "lucide-react"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

const DAYS = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
] as const

const DAY_LABELS: Record<string, string> = {
    sunday: "Sunday",
    monday: "Monday",
    tuesday: "Tuesday",
    wednesday: "Wednesday",
    thursday: "Thursday",
    friday: "Friday",
    saturday: "Saturday",
}

interface TimeSlot {
    start: string
    end: string
}

interface DaySchedule {
    day: string
    open: boolean
    slots: TimeSlot[]
}

const defaultSchedule: DaySchedule[] = [
    { day: "sunday", open: false, slots: [] },
    { day: "monday", open: true, slots: [{ start: "09:00", end: "17:00" }] },
    { day: "tuesday", open: true, slots: [{ start: "09:00", end: "17:00" }] },
    { day: "wednesday", open: true, slots: [{ start: "09:00", end: "17:00" }] },
    { day: "thursday", open: true, slots: [{ start: "09:00", end: "17:00" }] },
    { day: "friday", open: true, slots: [{ start: "09:00", end: "17:00" }] },
    { day: "saturday", open: false, slots: [] },
]

const TIMEZONES = [
    "UTC",
    "America/New_York",
    "America/Chicago",
    "America/Denver",
    "America/Los_Angeles",
    "America/Sao_Paulo",
    "Europe/London",
    "Europe/Paris",
    "Europe/Berlin",
    "Europe/Moscow",
    "Africa/Algiers",
    "Africa/Cairo",
    "Africa/Casablanca",
    "Africa/Lagos",
    "Asia/Dubai",
    "Asia/Kolkata",
    "Asia/Shanghai",
    "Asia/Tokyo",
    "Asia/Seoul",
    "Australia/Sydney",
    "Pacific/Auckland",
]

// Generate time options in 30-min increments
function generateTimeOptions(): string[] {
    const times: string[] = []
    for (let h = 0; h < 24; h++) {
        for (const m of [0, 30]) {
            times.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`)
        }
    }
    return times
}

const TIME_OPTIONS = generateTimeOptions()

export default function OperatingHoursPage() {
    const { activeProject } = useProject()
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [enabled, setEnabled] = useState(false)
    const [timezone, setTimezone] = useState("UTC")
    const [schedule, setSchedule] = useState<DaySchedule[]>(defaultSchedule)
    const [hasRecord, setHasRecord] = useState(false)

    const fetchHours = async () => {
        if (!activeProject) return
        const supabase = createClient()
        const { data } = await supabase
            .from("operating_hours")
            .select("*")
            .eq("project_id", activeProject.id)
            .single()

        if (data) {
            setEnabled(data.enabled)
            setTimezone(data.timezone)
            setSchedule(data.schedule as DaySchedule[])
            setHasRecord(true)
        }
        setLoading(false)
    }

    useEffect(() => {
        fetchHours()
    }, [activeProject])

    const handleSave = async () => {
        if (!activeProject) return
        setSaving(true)
        const supabase = createClient()

        const payload = {
            project_id: activeProject.id,
            enabled,
            timezone,
            schedule,
            updated_at: new Date().toISOString(),
        }

        let error
        if (hasRecord) {
            const result = await supabase
                .from("operating_hours")
                .update(payload)
                .eq("project_id", activeProject.id)
            error = result.error
        } else {
            const result = await supabase
                .from("operating_hours")
                .insert(payload)
            error = result.error
        }

        if (error) {
            toast.error("Failed to save operating hours")
            console.error(error)
        } else {
            toast.success("Operating hours saved")
            setHasRecord(true)
        }
        setSaving(false)
    }

    const toggleDayOpen = (dayIndex: number) => {
        setSchedule((prev) => {
            const updated = [...prev]
            updated[dayIndex] = {
                ...updated[dayIndex],
                open: !updated[dayIndex].open,
                slots: !updated[dayIndex].open
                    ? updated[dayIndex].slots.length === 0
                        ? [{ start: "09:00", end: "17:00" }]
                        : updated[dayIndex].slots
                    : updated[dayIndex].slots,
            }
            return updated
        })
    }

    const updateSlot = (
        dayIndex: number,
        slotIndex: number,
        field: "start" | "end",
        value: string
    ) => {
        setSchedule((prev) => {
            const updated = [...prev]
            const slots = [...updated[dayIndex].slots]
            slots[slotIndex] = { ...slots[slotIndex], [field]: value }
            updated[dayIndex] = { ...updated[dayIndex], slots }
            return updated
        })
    }

    const addSlot = (dayIndex: number) => {
        setSchedule((prev) => {
            const updated = [...prev]
            const lastSlot = updated[dayIndex].slots[updated[dayIndex].slots.length - 1]
            const newStart = lastSlot ? lastSlot.end : "09:00"
            updated[dayIndex] = {
                ...updated[dayIndex],
                slots: [
                    ...updated[dayIndex].slots,
                    { start: newStart, end: "17:00" },
                ],
            }
            return updated
        })
    }

    const removeSlot = (dayIndex: number, slotIndex: number) => {
        setSchedule((prev) => {
            const updated = [...prev]
            const slots = updated[dayIndex].slots.filter(
                (_, i) => i !== slotIndex
            )
            updated[dayIndex] = { ...updated[dayIndex], slots }
            return updated
        })
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12 text-muted-foreground">
                Loading...
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-medium">Operating Hours</h3>
                    <p className="text-sm text-muted-foreground">
                        Set when your project is open or closed for conversations.
                    </p>
                </div>
                <Button onClick={handleSave} disabled={saving}>
                    <Save className="mr-2 h-4 w-4" />
                    {saving ? "Saving..." : "Save Changes"}
                </Button>
            </div>
            <Separator />

            {/* Master toggle */}
            <Card className="p-5">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-sm font-medium">
                            Activate General Operating Hours
                        </Label>
                        <p className="text-xs text-muted-foreground">
                            When enabled, the widget will show open/closed status
                            based on your schedule.
                        </p>
                    </div>
                    <Switch checked={enabled} onCheckedChange={setEnabled} />
                </div>
            </Card>

            {/* Timezone */}
            <Card className="p-5">
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label className="text-sm font-medium">Timezone</Label>
                        <p className="text-xs text-muted-foreground">
                            All operating hours will be relative to this timezone.
                        </p>
                    </div>
                    <Select value={timezone} onValueChange={setTimezone}>
                        <SelectTrigger className="w-[240px]">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {TIMEZONES.map((tz) => (
                                <SelectItem key={tz} value={tz}>
                                    {tz.replace(/_/g, " ")}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </Card>

            {/* Schedule */}
            <Card className="divide-y">
                {schedule.map((day, dayIndex) => (
                    <div
                        key={day.day}
                        className="flex items-start gap-4 p-4"
                    >
                        {/* Day name + toggle */}
                        <div className="flex items-center gap-3 w-[160px] pt-1.5">
                            <Switch
                                checked={day.open}
                                onCheckedChange={() => toggleDayOpen(dayIndex)}
                            />
                            <span className="text-sm font-medium">
                                {DAY_LABELS[day.day]}
                            </span>
                        </div>

                        {/* Status */}
                        <div className="pt-2 w-[70px]">
                            {day.open ? (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-100 px-2 py-0.5 rounded-full">
                                    <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                    Open
                                </span>
                            ) : (
                                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                                    <span className="h-1.5 w-1.5 rounded-full bg-gray-400" />
                                    Closed
                                </span>
                            )}
                        </div>

                        {/* Time slots */}
                        <div className="flex-1 space-y-2">
                            {day.open ? (
                                <>
                                    {day.slots.map((slot, slotIndex) => (
                                        <div
                                            key={slotIndex}
                                            className="flex items-center gap-2"
                                        >
                                            <Select
                                                value={slot.start}
                                                onValueChange={(v) =>
                                                    updateSlot(
                                                        dayIndex,
                                                        slotIndex,
                                                        "start",
                                                        v
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="w-[110px] h-8 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TIME_OPTIONS.map((t) => (
                                                        <SelectItem
                                                            key={t}
                                                            value={t}
                                                        >
                                                            {t}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <span className="text-xs text-muted-foreground">
                                                to
                                            </span>
                                            <Select
                                                value={slot.end}
                                                onValueChange={(v) =>
                                                    updateSlot(
                                                        dayIndex,
                                                        slotIndex,
                                                        "end",
                                                        v
                                                    )
                                                }
                                            >
                                                <SelectTrigger className="w-[110px] h-8 text-xs">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {TIME_OPTIONS.map((t) => (
                                                        <SelectItem
                                                            key={t}
                                                            value={t}
                                                        >
                                                            {t}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            {day.slots.length > 1 && (
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                                                    onClick={() =>
                                                        removeSlot(
                                                            dayIndex,
                                                            slotIndex
                                                        )
                                                    }
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            )}
                                        </div>
                                    ))}
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 text-xs gap-1 text-muted-foreground"
                                        onClick={() => addSlot(dayIndex)}
                                    >
                                        <Plus className="h-3 w-3" />
                                        Add slot
                                    </Button>
                                </>
                            ) : (
                                <p className="text-xs text-muted-foreground pt-2">
                                    —
                                </p>
                            )}
                        </div>
                    </div>
                ))}
            </Card>
        </div>
    )
}
