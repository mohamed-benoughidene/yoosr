"use client"
import { useTranslations, useLocale } from "next-intl"
import { ContactsList } from "@/components/dashboard/contacts/contacts-list"
import { useQuery } from "convex/react"
import { format } from "date-fns"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Download, Upload, Plus, Loader2 } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useState, useReducer } from "react"
import { useMutation } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import { useProject } from "@/context/ProjectContext"
import { toast } from "sonner"

interface ImportState {
    importOpen: boolean;
    importLoading: boolean;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    parsedContacts: any[];
    skippedCount: number;
    importError: string | null;
}

type ImportAction =
    | { type: "OPEN_IMPORT" }
    | { type: "CLOSE_IMPORT" }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    | { type: "SET_PARSED"; payload: { data: any[], skipped: number } }
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_ERROR"; payload: string | null }
    | { type: "RESET" }

const initialImportState: ImportState = {
    importOpen: false,
    importLoading: false,
    parsedContacts: [],
    skippedCount: 0,
    importError: null,
}

function importReducer(state: ImportState, action: ImportAction): ImportState {
    switch (action.type) {
        case "OPEN_IMPORT": return { ...state, importOpen: true }
        case "CLOSE_IMPORT": return { ...state, importOpen: false }
        case "SET_PARSED": return { ...state, parsedContacts: action.payload.data, skippedCount: action.payload.skipped }
        case "SET_LOADING": return { ...state, importLoading: action.payload }
        case "SET_ERROR": return { ...state, importError: action.payload }
        case "RESET": return initialImportState
        default: return state
    }
}

export default function ContactsPage() {
    const t = useTranslations("contacts")
    const locale = useLocale()
    const { activeProject } = useProject()
    const contacts = useQuery(
        api.contacts.list,
        activeProject ? { projectId: activeProject._id } : "skip"
    )
    const createContact = useMutation(api.contacts.create).withOptimisticUpdate(
        (localStore, args) => {
            const existing = localStore.getQuery(api.contacts.list, { projectId: args.projectId });
            if (existing) {
                localStore.setQuery(api.contacts.list, { projectId: args.projectId }, [
                    ...existing,
                    {
                        _id: `temp_${Date.now()}` as any,
                        _creationTime: Date.now(),
                        projectId: args.projectId,
                        name: args.name,
                        email: args.email,
                        phone: args.phone,
                        address: args.address,
                        note: args.note,
                        tags: [],
                    },
                ]);
            }
        }
    );
    const batchImportContacts = useMutation(api.contacts.batchImport);

    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        note: ""
    })

    const [importState, importDispatch] = useReducer(importReducer, initialImportState)
    const { importOpen, importLoading, parsedContacts, skippedCount, importError } = importState

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!activeProject) return

        setLoading(true)
        try {
            await createContact({
                projectId: activeProject._id,
                name: formData.name,
                email: formData.email || undefined,
                phone: formData.phone || undefined,
                address: formData.address || undefined,
                note: formData.note || undefined,
            })
            setOpen(false)
            setFormData({ name: "", email: "", phone: "", address: "", note: "" })
            toast.success(t("contact_created"))
        } catch (error) {
            toast.error(t("contact_create_failed"))
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    const downloadBlob = (blob: Blob, filename: string) => {
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        window.URL.revokeObjectURL(url)
    }

    const handleExport = async (formatType: "csv" | "json" | "xlsx") => {
        if (!contacts || contacts.length === 0) {
            toast.error(t("no_contacts_export"))
            return
        }

        const dateStr = format(new Date(), "yyyy-MM-dd")
        const filename = `contacts-export-${dateStr}.${formatType}`

        const exportData = contacts.map(c => ({
            Name: c.name || "",
            Email: c.email || "",
            Phone: c.phone || "",
            Address: c.address || "",
            Note: c.note || "",
            Tags: c.tags && c.tags.length > 0 ? c.tags.join(";") : ""
        }))

        if (formatType === "csv") {
            const headers = ["Name", "Email", "Phone", "Address", "Note", "Tags"]
            const csvRows = [headers.join(",")]
            exportData.forEach(row => {
                const values = headers.map(header => {
                    const value = row[header as keyof typeof row] || ""
                    return `"${String(value).replace(/"/g, '""')}"`
                })
                csvRows.push(values.join(","))
            })
            downloadBlob(new Blob([csvRows.join("\n")], { type: "text/csv" }), filename)
        } else if (formatType === "json") {
            const jsonData = contacts.map(c => ({
                name: c.name || "",
                email: c.email || "",
                phone: c.phone || "",
                address: c.address || "",
                note: c.note || "",
                tags: c.tags || []
            }))
            downloadBlob(new Blob([JSON.stringify(jsonData, null, 2)], { type: "application/json" }), filename)
        } else if (formatType === "xlsx") {
            const xlsx = await import("xlsx")
            const worksheet = xlsx.utils.json_to_sheet(exportData)
            const workbook = xlsx.utils.book_new()
            xlsx.utils.book_append_sheet(workbook, worksheet, "Contacts")
            xlsx.writeFile(workbook, filename)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        importDispatch({ type: "SET_ERROR", payload: null })
        importDispatch({ type: "SET_PARSED", payload: { data: [], skipped: 0 } })

        const fileExt = file.name.split('.').pop()?.toLowerCase()
        const Papa = (await import("papaparse")).default

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const processData = (data: any[]) => {
            let skipped = 0
            const mapped = data.map(row => {
                const name = row.Name || row.name
                if (!name) {
                    skipped++
                    return null
                }

                let tagsArray: string[] | undefined = undefined
                const rawTags = row.Tags || row.tags
                if (typeof rawTags === 'string') {
                    tagsArray = rawTags.split(';').map((t: string) => t.trim()).filter(Boolean)
                } else if (Array.isArray(rawTags)) {
                    tagsArray = rawTags
                }

                return {
                    name,
                    email: row.Email || row.email || undefined,
                    phone: row.Phone || row.phone || undefined,
                    address: row.Address || row.address || undefined,
                    note: row.Note || row.note || undefined,
                    tags: tagsArray
                }
            }).filter(Boolean)

            importDispatch({ type: "SET_PARSED", payload: { data: mapped, skipped } })

            if (mapped.length === 0) {
                importDispatch({ type: "SET_ERROR", payload: t("import_error_empty") })
            }
        }

        if (fileExt === 'csv') {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    processData(results.data)
                },
                error: (error: Error) => {
                    importDispatch({ type: "SET_ERROR", payload: `${t("error_csv")}: ${error.message}` })
                }
            })
        } else if (fileExt === 'xlsx') {
            const xlsx = await import("xlsx")
            const reader = new FileReader()
            reader.onload = (evt) => {
                try {
                    const bstr = evt.target?.result
                    const wb = xlsx.read(bstr, { type: 'binary' })
                    const wsname = wb.SheetNames[0]
                    const ws = wb.Sheets[wsname]
                    const data = xlsx.utils.sheet_to_json(ws)
                    processData(data)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (error: any) {
                    importDispatch({ type: "SET_ERROR", payload: `${t("error_excel")}: ${error.message}` })
                }
            }
            reader.readAsBinaryString(file)
        } else if (fileExt === 'json') {
            const reader = new FileReader()
            reader.onload = (evt) => {
                try {
                    const data = JSON.parse(evt.target?.result as string)
                    if (!Array.isArray(data)) {
                        importDispatch({ type: "SET_ERROR", payload: t("error_json_array") })
                        return
                    }
                    processData(data)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (error: any) {
                    importDispatch({ type: "SET_ERROR", payload: `${t("error_json")}: ${error.message}` })
                }
            }
            reader.readAsText(file)
        } else {
            importDispatch({ type: "SET_ERROR", payload: t("error_unsupported_file") })
        }
    }

    const handleImportConfirm = async () => {
        if (parsedContacts.length === 0) return

        importDispatch({ type: "SET_LOADING", payload: true })
        try {
            let totalInserted = 0
            let totalSkipped = 0

            for (let i = 0; i < parsedContacts.length; i += 500) {
                const chunk = parsedContacts.slice(i, i + 500)
                const result = await batchImportContacts({
                    contacts: chunk
                }) as { inserted: number, skipped: number }

                totalInserted += result.inserted
                totalSkipped += result.skipped
            }

            importDispatch({ type: "RESET" })
            toast.success(t("import_success_msg", { inserted: totalInserted, skipped: totalSkipped }))

            // Allow re-uploading the same file
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
            if (fileInput) fileInput.value = ''
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(t("import_failed_msg", { error: error.message }))
            console.error(error)
        } finally {
            importDispatch({ type: "SET_LOADING", payload: false })
        }
    }

    return (
        <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold">{t("title")}</h1>
                <div className="flex flex-wrap gap-2">
                    <Dialog open={importOpen} onOpenChange={(val) => importDispatch({ type: val ? "OPEN_IMPORT" : "CLOSE_IMPORT" })}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Upload className="me-2 h-4 w-4" />
                                {t("import")}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>{t("import_contacts")}</DialogTitle>
                                <DialogDescription>
                                    {t("import_description")}
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <Input
                                    type="file"
                                    accept=".csv,.xlsx,.json"
                                    onChange={handleFileUpload}
                                />

                                {importError && <p className="text-sm text-destructive font-medium">{importError}</p>}

                                {parsedContacts.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">
                                            {t("ready_to_import", { count: parsedContacts.length })}
                                        </p>
                                        {skippedCount > 0 && (
                                            <p className="text-sm text-muted-foreground">
                                                {t("skipped_rows", { count: skippedCount })}
                                            </p>
                                        )}
                                        <div className="border rounded-md">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>{t("name")}</TableHead>
                                                        <TableHead>{t("email")}</TableHead>
                                                        <TableHead>{t("phone")}</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {parsedContacts.slice(0, 5).map((c, i) => (
                                                        <TableRow key={i}>
                                                            <TableCell>{c.name}</TableCell>
                                                            <TableCell>{c.email || "—"}</TableCell>
                                                            <TableCell>{c.phone || "—"}</TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                        {parsedContacts.length > 5 && (
                                            <p className="text-xs text-muted-foreground text-center">
                                                {t("showing_contacts", { visible: 5, total: parsedContacts.length })}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => {
                                    importDispatch({ type: "RESET" })
                                }}>{t("cancel")}</Button>
                                <Button onClick={handleImportConfirm} disabled={parsedContacts.length === 0 || importLoading}>
                                    {importLoading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                                    {t("import_contacts")}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Download className="me-2 h-4 w-4" />
                                {t("export")}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleExport("csv")}>
                                {t("export_csv")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport("xlsx")}>
                                {t("export_excel")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport("json")}>
                                {t("export_json")}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="me-2 h-4 w-4" />
                                {t("add_contact")}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <form onSubmit={handleSubmit}>
                                <DialogHeader>
                                    <DialogTitle>{t("add_new_contact")}</DialogTitle>
                                    <DialogDescription>
                                        {t("add_contact_desc")}
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-end">
                                            {t("name")}
                                        </Label>
                                        <Input
                                            id="name"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="col-span-3"
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="email" className="text-end">
                                            {t("email")}
                                        </Label>
                                        <Input
                                            id="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="phone" className="text-end">
                                            {t("phone")}
                                        </Label>
                                        <Input
                                            id="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="address" className="text-end">
                                            {t("address")}
                                        </Label>
                                        <Input
                                            id="address"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="note" className="text-end">
                                            {t("note")}
                                        </Label>
                                        <Textarea
                                            id="note"
                                            value={formData.note}
                                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                            className="col-span-3"
                                            placeholder={t("add_notes_placeholder")}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={loading}>
                                        {loading && <Loader2 className="me-2 h-4 w-4 animate-spin" />}
                                        {t("create_contact")}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
            <ContactsList />
        </div>
    )
}
