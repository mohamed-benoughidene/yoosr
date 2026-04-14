"use client"

import { useState, useReducer } from "react"
import { useTranslations } from "next-intl"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../../convex/_generated/api"
import { Id, Doc } from "../../../../../convex/_generated/dataModel"
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

type FilterType = "all" | "new" | "confirmed" | "cancelled"


interface ImportState {
    importOpen: boolean;
    importLoading: boolean;
    parsedOrders: { contactName: string; phone?: string; product: string; notes?: string; status?: string }[];
    skippedCount: number;
    importError: string | null;
}

type ImportAction =
    | { type: "OPEN_IMPORT" }
    | { type: "CLOSE_IMPORT" }
    | { type: "SET_PARSED"; payload: { data: { contactName: string; phone?: string; product: string; notes?: string; status?: string }[], skipped: number } }
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
    const t = useTranslations("orders")
    const { activeProject } = useProject()
    const [filter, setFilter] = useState<FilterType>("all")

    const [importState, importDispatch] = useReducer(importReducer, initialImportState)
    const { importOpen, importLoading, parsedOrders, skippedCount, importError } = importState

    const orders = useQuery(
        api.orders.listOrders,
        activeProject ? { projectId: activeProject._id } : "skip"
    )

    const updateOrderStatus = useMutation(api.orders.updateOrderStatus).withOptimisticUpdate(
        (localStore, args) => {
            const allQueries = localStore.getAllQueries(api.orders.listOrders);
            for (const q of allQueries) {
                if (q.value) {
                    localStore.setQuery(
                        api.orders.listOrders,
                        q.args,
                        (q.value as Doc<"orders">[]).map((o) =>
                            o._id === args.orderId ? { ...o, status: args.status } : o
                        )
                    );
                }
            }
        }
    );
    const deleteOrder = useMutation(api.orders.deleteOrder).withOptimisticUpdate(
        (localStore, args) => {
            const allQueries = localStore.getAllQueries(api.orders.listOrders);
            for (const q of allQueries) {
                if (q.value) {
                    localStore.setQuery(
                        api.orders.listOrders,
                        q.args,
                        (q.value as Doc<"orders">[]).filter((o) => o._id !== args.orderId)
                    );
                }
            }
        }
    );
    const batchImportOrders = useMutation(api.orders.batchImportOrders);

    const filteredOrders = orders?.filter(order => {
        if (filter === "all") return true
        return order.status === filter
    })

    const handleUpdateStatus = async (orderId: Id<"orders">, status: "new" | "confirmed" | "cancelled") => {
        try {
            await updateOrderStatus({ orderId, status })
            toast.success(t("order_marked", { status }))
        } catch {
            toast.error(t("update_status_failed"))
        }
    }

    const handleDelete = async (orderId: Id<"orders">) => {
        if (!confirm(t("confirm_delete"))) return;
        try {
            await deleteOrder({ orderId })
            toast.success(t("order_deleted"))
        } catch {
            toast.error(t("delete_failed"))
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

    const handleExport = async (formatType: "csv" | "json" | "xlsx") => {
        if (!orders || orders.length === 0) {
            toast.error(t("no_orders_export"))
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
            const ExcelJS = (await import("exceljs")).default
            const workbook = new ExcelJS.Workbook()
            const worksheet = workbook.addWorksheet("Orders")
            worksheet.columns = [
                { header: "Contact Name", key: "Contact Name", width: 25 },
                { header: "Phone", key: "Phone", width: 20 },
                { header: "Product", key: "Product", width: 25 },
                { header: "Notes", key: "Notes", width: 35 },
                { header: "Status", key: "Status", width: 15 },
                { header: "Created At", key: "Created At", width: 20 },
            ]
            worksheet.addRows(exportData)
            const buffer = await workbook.xlsx.writeBuffer()
            downloadBlob(new Blob([buffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }), filename)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        importDispatch({ type: "SET_ERROR", payload: null })
        importDispatch({ type: "SET_PARSED", payload: { data: [], skipped: 0 } })

        const fileExt = file.name.split('.').pop()?.toLowerCase()
        const Papa = (await import("papaparse")).default

        const processData = (data: Record<string, unknown>[]) => {
            let skipped = 0
            const mapped = data.map(row => {
                const contactName = row["Contact Name"] || row.contactName
                const product = row["Product"] || row.product

                if (!contactName || !product) {
                    skipped++
                    return null
                }

                return {
                    contactName: String(contactName),
                    phone: row["Phone"] ? String(row["Phone"]) : (row.phone ? String(row.phone) : undefined),
                    product: String(product),
                    notes: row["Notes"] ? String(row["Notes"]) : (row.notes ? String(row.notes) : undefined),
                    status: row["Status"] ? String(row["Status"]) : (row.status ? String(row.status) : undefined),
                }
            }).filter(Boolean) as Array<{ contactName: string; phone?: string; product: string; notes?: string; status?: string }>

            importDispatch({ type: "SET_PARSED", payload: { data: mapped, skipped } })

            if (mapped.length === 0 && data.length > 0) {
                importDispatch({ type: "SET_ERROR", payload: t("error_no_valid_orders") })
            } else if (mapped.length === 0) {
                importDispatch({ type: "SET_ERROR", payload: t("error_empty_file") })
            }
        }

        if (fileExt === 'csv') {
            Papa.parse(file, {
                header: true,
                skipEmptyLines: true,
                complete: (results) => {
                    processData(results.data as Record<string, unknown>[])
                },
                error: (error: Error) => {
                    importDispatch({ type: "SET_ERROR", payload: `${t("error_csv")}: ${error.message}` })
                }
            })
        } else if (fileExt === 'xlsx') {
            try {
                const ExcelJS = (await import("exceljs")).default
                const workbook = new ExcelJS.Workbook()
                await workbook.xlsx.load(await file.arrayBuffer())
                const worksheet = workbook.getWorksheet(1)
                if (!worksheet) {
                    importDispatch({ type: "SET_ERROR", payload: t("error_empty_file") })
                    return
                }

                const data: Record<string, unknown>[] = []
                worksheet.eachRow({ includeEmpty: false }, (row) => {
                    const rowObj: Record<string, unknown> = {}
                    row.eachCell({ includeEmpty: true }, (cell, colNumber) => {
                        const colKey = worksheet.getColumn(colNumber)?.key
                        if (colKey) {
                            rowObj[colKey as string] = cell.value ?? ""
                        }
                    })
                    data.push(rowObj)
                })
                processData(data)
            } catch (error: unknown) {
                const errorMessage = error instanceof Error ? error.message : String(error);
                importDispatch({ type: "SET_ERROR", payload: `${t("error_excel")}: ${errorMessage}` })
            }
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
                } catch (error: unknown) {
                    const errorMessage = error instanceof Error ? error.message : String(error);
                    importDispatch({ type: "SET_ERROR", payload: `${t("error_json")}: ${errorMessage}` })
                }
            }
            reader.readAsText(file)
        } else {
            importDispatch({ type: "SET_ERROR", payload: t("error_unsupported_file") })
        }
    }

    const handleImportConfirm = async () => {
        if (parsedOrders.length === 0) return

        importDispatch({ type: "SET_LOADING", payload: true })
        try {
            let totalInserted = 0

            for (let i = 0; i < parsedOrders.length; i += 500) {
                const chunk = parsedOrders.slice(i, i + 500)
                const result = await batchImportOrders({
                    orders: chunk
                }) as { inserted: number, skipped: number }

                totalInserted += result.inserted
            }

            importDispatch({ type: "RESET" })
            toast.success(t("import_success_msg", { inserted: totalInserted }))

            // Allow re-uploading the same file
            const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement
            if (fileInput) fileInput.value = ''
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            toast.error(t("import_failed_msg", { error: errorMessage }))
        } finally {
            importDispatch({ type: "SET_LOADING", payload: false })
        }
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                    <p className="text-muted-foreground mt-1">
                        {t("description")}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2 shrink-0">
                    <Dialog open={importOpen} onOpenChange={(val) => importDispatch({ type: val ? "OPEN_IMPORT" : "CLOSE_IMPORT" })}>
                        <DialogTrigger asChild>
                            <Button variant="outline">
                                <Upload className="mr-2 h-4 w-4" />
                                {t("import")}
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                                <DialogTitle>{t("import_orders")}</DialogTitle>
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

                                {parsedOrders.length > 0 && (
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium">
                                            {t("ready_to_import", { count: parsedOrders.length })}
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
                                                        <TableHead>{t("contact_name")}</TableHead>
                                                        <TableHead>{t("phone")}</TableHead>
                                                        <TableHead>{t("product")}</TableHead>
                                                        <TableHead>{t("status")}</TableHead>
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
                                                {t("showing_orders", { visible: 5, total: parsedOrders.length })}
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                            <DialogFooter>
                                <Button variant="outline" onClick={() => {
                                    importDispatch({ type: "RESET" })
                                }}>{t("cancel")}</Button>
                                <Button onClick={handleImportConfirm} disabled={parsedOrders.length === 0 || importLoading}>
                                    {importLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                    {t("import_orders")}
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                <Download className="mr-2 h-4 w-4" />
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
                </div>
            </div>

            <div className="flex space-x-2">
                <Button
                    variant={filter === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("all")}
                >
                    {t("filter_all")}
                </Button>
                <Button
                    variant={filter === "new" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("new")}
                >
                    {t("filter_new")}
                </Button>
                <Button
                    variant={filter === "confirmed" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("confirmed")}
                >
                    {t("filter_confirmed")}
                </Button>
                <Button
                    variant={filter === "cancelled" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter("cancelled")}
                >
                    {t("filter_cancelled")}
                </Button>
            </div>

            <div className="rounded-md border bg-card shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t("contact_name")}</TableHead>
                            <TableHead>{t("phone")}</TableHead>
                            <TableHead>{t("product")}</TableHead>
                            <TableHead className="w-[200px]">{t("notes")}</TableHead>
                            <TableHead>{t("status")}</TableHead>
                            <TableHead>{t("created_at")}</TableHead>
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
                                        {order.status === "new" && <Badge className="bg-blue-500 hover:bg-blue-600 outline-none border-none shadow-sm uppercase text-[10px] font-bold px-2 py-0.5">{t("status_new")}</Badge>}
                                        {order.status === "confirmed" && <Badge className="bg-green-500 hover:bg-green-600 outline-none border-none shadow-sm uppercase text-[10px] font-bold px-2 py-0.5">{t("status_confirmed")}</Badge>}
                                        {order.status === "cancelled" && <Badge className="bg-red-500 hover:bg-red-600 outline-none border-none shadow-sm uppercase text-[10px] font-bold px-2 py-0.5">{t("status_cancelled")}</Badge>}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground text-sm">
                                        {formatDate(order.createdAt)}
                                    </TableCell>
                                    <TableCell>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">{t("open_menu")}</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleUpdateStatus(order._id, "confirmed")}>
                                                    <Check className="mr-2 h-4 w-4" />
                                                    {t("mark_confirmed")}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleUpdateStatus(order._id, "cancelled")}>
                                                    <X className="mr-2 h-4 w-4" />
                                                    {t("mark_cancelled")}
                                                </DropdownMenuItem>
                                                <DropdownMenuItem className="text-red-600 focus:text-red-600" onClick={() => handleDelete(order._id)}>
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    {t("delete")}
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
                                        <p>{t("no_orders_message")}</p>
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
