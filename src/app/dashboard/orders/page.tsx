"use client"

import { useState, useReducer } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { useProject } from "@/context/ProjectContext"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ShoppingBag, Trash2, Check, X, Loader2, Download, Upload } from "lucide-react"
import { toast } from "sonner"
import { format } from "date-fns"
import * as xlsx from "xlsx"
import Papa from "papaparse"

type FilterType = "all" | "new" | "confirmed" | "cancelled"


interface ImportState {
    importOpen: boolean;
    importLoading: boolean;
    parsedOrders: any[];
    skippedCount: number;
    importError: string | null;
}

type ImportAction =
    | { type: "OPEN_IMPORT" }
    | { type: "CLOSE_IMPORT" }
    | { type: "SET_PARSED"; payload: { data: any[], skipped: number } }
    | { type: "SET_LOADING"; payload: boolean }
    | { type: "SET_ERROR"; payload: string | null }
    | { type: "RESET" }

const initialImportState: ImportState = {
    importOpen: false,
    importLoading: false,
    parsedOrders: [],
    skippedCount: 0,
    importError: null,
}

function importReducer(state: ImportState, action: ImportAction): ImportState {
    switch (action.type) {
        case "OPEN_IMPORT": return { ...state, importOpen: true }
        case "CLOSE_IMPORT": return { ...state, importOpen: false }
        case "SET_PARSED": return { ...state, parsedOrders: action.payload.data, skippedCount: action.payload.skipped }
        case "SET_LOADING": return { ...state, importLoading: action.payload }
        case "SET_ERROR": return { ...state, importError: action.payload }
        case "RESET": return initialImportState
        default: return state
    }
}

export default function OrdersPage() {
    const { activeProject } = useProject()
    const [filter, setFilter] = useState<FilterType>("all")

    const [importState, importDispatch] = useReducer(importReducer, initialImportState)
    const { importOpen, importLoading, parsedOrders, skippedCount, importError } = importState

    const orders = useQuery(
        api.orders.listOrders,
        activeProject ? { projectId: activeProject._id } : "skip"
    )

    const updateOrderStatus = useMutation(api.orders.updateOrderStatus)
    const deleteOrder = useMutation(api.orders.deleteOrder)
    const batchImportOrders = useMutation(api.orders.batchImportOrders)

    const filteredOrders = orders?.filter(order => {
        if (filter === "all") return true
        return order.status === filter
    })

    const handleUpdateStatus = async (orderId: any, status: "new" | "confirmed" | "cancelled") => {
        try {
            await updateOrderStatus({ orderId, status })
            toast.success(`Order marked as ${status}`)
        } catch {
            toast.error("Failed to update status")
        }
    }

    const handleDelete = async (orderId: any) => {
        if (!confirm("Are you sure you want to delete this order?")) return;
        try {
            await deleteOrder({ orderId })
            toast.success("Order deleted")
        } catch {
            toast.error("Failed to delete order")
        }
    }

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
            hour: "numeric",
            minute: "2-digit"
        });
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
        if (!orders || orders.length === 0) {
            toast.error("No orders to export.")
            return
        }

        const dateStr = format(new Date(), "yyyy-MM-dd")
        const filename = `orders-export-${dateStr}.${formatType}`

        const exportData = orders.map(o => ({
            "Contact Name": o.contactName || "",
            "Phone": o.phone || "",
            "Product": o.product || "",
            "Notes": o.notes || "",
            "Status": o.status || "",
            "Created At": format(new Date(o.createdAt), "yyyy-MM-dd HH:mm")
        }))

        if (formatType === "csv") {
            const headers = ["Contact Name", "Phone", "Product", "Notes", "Status", "Created At"]
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
            downloadBlob(new Blob([JSON.stringify(exportData, null, 2)], { type: "application/json" }), filename)
        } else if (formatType === "xlsx") {
            const worksheet = xlsx.utils.json_to_sheet(exportData)
            const workbook = xlsx.utils.book_new()
            xlsx.utils.book_append_sheet(workbook, worksheet, "Orders")
            xlsx.writeFile(workbook, filename)
        }
    }

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        importDispatch({ type: "SET_ERROR", payload: null })
        importDispatch({ type: "SET_PARSED", payload: { data: [], skipped: 0 } })

        const fileExt = file.name.split('.').pop()?.toLowerCase()

        const processData = (data: any[]) => {
            let skipped = 0
            const mapped = data.map(row => {
                const contactName = row["Contact Name"] || row.contactName
                const product = row["Product"] || row.product

                if (!contactName || !product) {
                    skipped++
                    return null
                }

                return {
                    contactName,
                    phone: row["Phone"] || row.phone || undefined,
                    product,
                    notes: row["Notes"] || row.notes || undefined,
                    status: row["Status"] || row.status || undefined,
                }
            }).filter(Boolean)

            importDispatch({ type: "SET_PARSED", payload: { data: mapped, skipped } })

            if (mapped.length === 0 && data.length > 0) {
                importDispatch({ type: "SET_ERROR", payload: "No valid orders found. Check required columns: Contact Name, Product." })
            } else if (mapped.length === 0) {
                importDispatch({ type: "SET_ERROR", payload: "File is empty." })
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
        if (parsedOrders.length === 0) return

        importDispatch({ type: "SET_LOADING", payload: true })
        try {
            let totalInserted = 0
            let totalSkipped = 0

            for (let i = 0; i < parsedOrders.length; i += 500) {
                const chunk = parsedOrders.slice(i, i + 500)
                const result = await batchImportOrders({
                    orders: chunk
                }) as { inserted: number, skipped: number }

                totalInserted += result.inserted
                totalSkipped += result.skipped
            }

            importDispatch({ type: "RESET" })
            toast.success(`Imported ${totalInserted} orders.`)

            // Allow re-uploading the same file
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
            if (fileInput) fileInput.value = ''
        } catch (error: any) {
            toast.error(`Import failed: ${error.message}`)
        } finally {
            importDispatch({ type: "SET_LOADING", payload: false })
        }
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                    <p className="text-muted-foreground mt-1">
                        Track and manage orders from your customer conversations.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Dialog open={importOpen} onOpenChange={(val) => importDispatch({ type: val ? "OPEN_IMPORT" : "CLOSE_IMPORT" })}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Upload className="mr-2 h-4 w-4" />
                                Import
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>Import Orders</DialogTitle>
                                <DialogDescription>
                                    Upload a .csv, .xlsx, or .json file. Required columns: Contact Name, Product.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <Input
                                    type="file"
                                    accept=".csv,.xlsx,.json"
                                    onChange={handleFileUpload}
                                />

                                {importError && <p className="text-sm text-destructive font-medium">{importError}</p>}

                                {parsedOrders.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">
                                            {parsedOrders.length} orders ready to import.
                                        </p>
                                        {skippedCount > 0 && (
                                            <p className="text-sm text-muted-foreground">
                                                {skippedCount} rows skipped — missing required fields.
                                            </p>
                                        )}
                                        <div className="border rounded-md">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Contact Name</TableHead>
                                                        <TableHead>Phone</TableHead>
                                                        <TableHead>Product</TableHead>
                                                        <TableHead>Status</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {parsedOrders.slice(0, 5).map((o, i) => (
                                                        <TableRow key={i}>
                                                            <TableCell>{o.contactName}</TableCell>
                                                            <TableCell>{o.phone || "—"}</TableCell>
                                                            <TableCell>{o.product}</TableCell>
                                                            <TableCell>
                                                                <Badge variant="outline" className="text-[10px] uppercase font-bold py-0.5 px-2 shadow-sm border-none bg-muted hover:bg-muted">
                                                                    {o.status || "new"}
                                                                </Badge>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </div>
                                        {parsedOrders.length > 5 && (
                                            <p className="text-xs text-muted-foreground text-center">
                                                Showing 5 of {parsedOrders.length} orders
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => {
                                    importDispatch({ type: "RESET" })
                                }}>Cancel</Button>
                                <Button onClick={handleImportConfirm} disabled={parsedOrders.length === 0 || importLoading}>
                                    {importLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    Import Orders
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
                </div>
            </div>

            <div className="flex space-x-2">
                <Button
                    variant={filter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("all")}
                >
                    All
                </Button>
                <Button
                    variant={filter === "new" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("new")}
                >
                    New
                </Button>
                <Button
                    variant={filter === "confirmed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("confirmed")}
                >
                    Confirmed
                </Button>
                <Button
                    variant={filter === "cancelled" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("cancelled")}
                >
                    Cancelled
                </Button>
            </div>

            <div className="rounded-md border bg-white shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Contact Name</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead className="w-[200px]">Notes</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Created At</TableHead>
                            <TableHead className="w-[70px]"></TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders === undefined ? (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center">
                                    <Loader2 className="h-6 w-6 animate-spin mx-auto text-muted-foreground" />
                                </TableCell>
                            </TableRow>
                        ) : filteredOrders && filteredOrders.length > 0 ? (
                            filteredOrders.map((order) => (
                                <TableRow key={order._id}>
                                    <TableCell className="font-medium">{order.contactName}</TableCell>
                                    <TableCell className="text-muted-foreground">{order.phone || "-"}</TableCell>
                                    <TableCell>{order.product}</TableCell>
                                    <TableCell className="text-muted-foreground text-sm max-w-[200px] truncate" title={order.notes}>
                                        {order.notes || "-"}
                                    </TableCell>
                                    <TableCell>
                                        {order.status === "new" && <Badge className="bg-blue-500 hover:bg-blue-600 outline-none border-none shadow-sm uppercase text-[10px] font-bold px-2 py-0.5">New</Badge>}
                                        {order.status === "confirmed" && <Badge className="bg-green-500 hover:bg-green-600 outline-none border-none shadow-sm uppercase text-[10px] font-bold px-2 py-0.5">Confirmed</Badge>}
                                        {order.status === "cancelled" && <Badge className="bg-red-500 hover:bg-red-600 outline-none border-none shadow-sm uppercase text-[10px] font-bold px-2 py-0.5">Cancelled</Badge>}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {formatDate(order.createdAt)}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleUpdateStatus(order._id, "confirmed")}>
                                                    <Check className="mr-2 h-4 w-4" />
                                                    Mark Confirmed
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleUpdateStatus(order._id, "cancelled")}>
                                                    <X className="mr-2 h-4 w-4" />
                                                    Mark Cancelled
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDelete(order._id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                                    <div className="flex flex-col items-center justify-center space-y-2">
                                        <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
                                        <p>No orders yet. Orders are created from the Monitor panel when chatting with customers.</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    )
}
