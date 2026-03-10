"use client"
import { ContactsList } from "@/components/dashboard/contacts/contacts-list"
import { useQuery } from "convex/react"
import { format } from "date-fns"
import * as xlsx from "xlsx"
import Papa from "papaparse"
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
import { api } from "../../../../convex/_generated/api"
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
    const { activeProject } = useProject()
    const contacts = useQuery(
        api.contacts.list,
        activeProject ? { projectId: activeProject._id } : "skip"
    )
    const createContact = useMutation(api.contacts.create)
    const batchImportContacts = useMutation(api.contacts.batchImport)

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
            toast.success("Contact created successfully")
        } catch (error) {
            toast.error("Failed to create contact")
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

    const handleExport = (formatType: "csv" | "json" | "xlsx") => {
        if (!contacts || contacts.length === 0) {
            toast.error("No contacts to export.")
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
            const worksheet = xlsx.utils.json_to_sheet(exportData)
            const workbook = xlsx.utils.book_new()
            xlsx.utils.book_append_sheet(workbook, worksheet, "Contacts")
            xlsx.writeFile(workbook, filename)
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        importDispatch({ type: "SET_ERROR", payload: null })
        importDispatch({ type: "SET_PARSED", payload: { data: [], skipped: 0 } })

        const fileExt = file.name.split('.').pop()?.toLowerCase()

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
                importDispatch({ type: "SET_ERROR", payload: "No valid contacts found in file." })
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
                    importDispatch({ type: "SET_ERROR", payload: `CSV Parse Error: ${error.message}` })
                }
            })
        } else if (fileExt === 'xlsx') {
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
                    importDispatch({ type: "SET_ERROR", payload: `Excel Parse Error: ${error.message}` })
                }
            }
            reader.readAsBinaryString(file)
        } else if (fileExt === 'json') {
            const reader = new FileReader()
            reader.onload = (evt) => {
                try {
                    const data = JSON.parse(evt.target?.result as string)
                    if (!Array.isArray(data)) {
                        importDispatch({ type: "SET_ERROR", payload: "JSON file must contain an array of objects." })
                        return
                    }
                    processData(data)
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                } catch (error: any) {
                    importDispatch({ type: "SET_ERROR", payload: `JSON Parse Error: ${error.message}` })
                }
            }
            reader.readAsText(file)
        } else {
            importDispatch({ type: "SET_ERROR", payload: "Unsupported file type. Please upload .csv, .xlsx, or .json" })
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
            toast.success(`Imported ${totalInserted} contacts. ${totalSkipped} skipped (duplicates).`)

            // Allow re-uploading the same file
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
            if (fileInput) fileInput.value = ''
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (error: any) {
            toast.error(`Import failed: ${error.message}`)
            console.error(error)
        } finally {
            importDispatch({ type: "SET_LOADING", payload: false })
        }
    }

    return (
        <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="text-2xl font-bold">Contacts</h1>
                <div className="flex flex-wrap gap-2">
                    <Dialog open={importOpen} onOpenChange={(val) => importDispatch({ type: val ? "OPEN_IMPORT" : "CLOSE_IMPORT" })}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Upload className="mr-2 h-4 w-4" />
                                Import
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Import Contacts</DialogTitle>
                                <DialogDescription>
                                    Upload a .csv, .xlsx, or .json file.
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
                                            {parsedContacts.length} contacts ready to import.
                                        </p>
                                        {skippedCount > 0 && (
                                            <p className="text-sm text-muted-foreground">
                                                {skippedCount} rows skipped — missing name.
                                            </p>
                                        )}
                                        <div className="border rounded-md">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Name</TableHead>
                                                        <TableHead>Email</TableHead>
                                                        <TableHead>Phone</TableHead>
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
                                                Showing 5 of {parsedContacts.length} contacts
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => {
                                    importDispatch({ type: "RESET" })
                                }}>Cancel</Button>
                                <Button onClick={handleImportConfirm} disabled={parsedContacts.length === 0 || importLoading}>
                                    {importLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Import Contacts
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Download className="mr-2 h-4 w-4" />
                                Export
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleExport("csv")}>
                                Export as CSV
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport("xlsx")}>
                                Export as Excel
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleExport("json")}>
                                Export as JSON
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Dialog open={open} onOpenChange={setOpen}>
                        <DialogTrigger asChild>
                            <Button>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Contact
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                            <form onSubmit={handleSubmit}>
                                <DialogHeader>
                                    <DialogTitle>Add New Contact</DialogTitle>
                                    <DialogDescription>
                                        Create a new contact manually.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="grid gap-4 py-4">
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="name" className="text-right">
                                            Name
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
                                        <Label htmlFor="email" className="text-right">
                                            Email
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
                                        <Label htmlFor="phone" className="text-right">
                                            Phone
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
                                        <Label htmlFor="address" className="text-right">
                                            Address
                                        </Label>
                                        <Input
                                            id="address"
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="col-span-3"
                                        />
                                    </div>
                                    <div className="grid grid-cols-4 items-center gap-4">
                                        <Label htmlFor="note" className="text-right">
                                            Note
                                        </Label>
                                        <Textarea
                                            id="note"
                                            value={formData.note}
                                            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                            className="col-span-3"
                                            placeholder="Add any notes here..."
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button type="submit" disabled={loading}>
                                        {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                        Create Contact
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
