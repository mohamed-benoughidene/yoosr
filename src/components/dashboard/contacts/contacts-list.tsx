
"use client"

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Trash2 } from "lucide-react"
import { useTranslations } from 'next-intl'

import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../../convex/_generated/api"
import { useProject } from "@/context/ProjectContext"
import { Id } from "../../../../convex/_generated/dataModel"
import { toast } from "sonner"
import { EditContactDialog } from "./edit-contact-dialog"

export type Contact = {
    _id: Id<"contacts">
    name: string
    email?: string
    phone?: string
    address?: string
    note?: string
    tags?: string[]
    _creationTime: number
}

export function ContactsList() {
    const t = useTranslations('contacts')
    const { activeProject } = useProject()
    const contacts = useQuery(
        api.contacts.list,
        activeProject ? { projectId: activeProject._id } : "skip"
    ) ?? []

    const removeContact = useMutation(api.contacts.remove).withOptimisticUpdate(
        (localStore, args) => {
            const allQueries = localStore.getAllQueries(api.contacts.list);
            for (const q of allQueries) {
                if (q.value) {
                    localStore.setQuery(
                        api.contacts.list,
                        q.args,
                        (q.value as any[]).filter((c: any) => c._id !== args.id)
                    );
                }
            }
        }
    );

    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    const [selectedContact, setSelectedContact] = React.useState<Contact | null>(null)
    const [editDialogOpen, setEditDialogOpen] = React.useState(false)
    const [contactPendingDelete, setContactPendingDelete] = React.useState<Id<"contacts"> | null>(null)

    const handleDelete = async (id: Id<"contacts">) => {
        try {
            await removeContact({ id })
            toast.success(t('deleted_success'))
        } catch (error: unknown) {
            const err = error as { data?: { message?: string }; message?: string };
            const errorMessage = err.data?.message || err.message || t('deleted_failed')
            toast.error(errorMessage)
        }
    }

    const columns: ColumnDef<Contact>[] = [
        {
            id: "select",
            header: ({ table }) => (
                <Checkbox
                    checked={
                        table.getIsAllPageRowsSelected() ||
                        (table.getIsSomePageRowsSelected() && "indeterminate")
                    }
                    onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
                    aria-label={t('select_all')}
                />
            ),
            cell: ({ row }) => (
                <Checkbox
                    checked={row.getIsSelected()}
                    onCheckedChange={(value) => row.toggleSelected(!!value)}
                    aria-label={t('select_row')}
                />
            ),
            enableSorting: false,
            enableHiding: false,
        },
        {
            accessorKey: "name",
            header: t('name'),
            cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
        },
        {
            accessorKey: "email",
            header: ({ column }) => (
                <Button
                    variant="ghost"
                    onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
                >
                    {t('email')}
                    <ArrowUpDown className="ms-2 h-4 w-4" />
                </Button>
            ),
            cell: ({ row }) => <div className="lowercase">{row.getValue("email") || "—"}</div>,
        },
        {
            accessorKey: "phone",
            header: t('phone'),
            cell: ({ row }) => <div>{row.getValue("phone") || "—"}</div>,
        },
        {
            accessorKey: "tags",
            header: t('tags'),
            cell: ({ row }) => {
                const tags = (row.getValue("tags") as string[]) || []
                return (
                    <div className="flex gap-1">
                        {tags.map(tag => <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>)}
                        {tags.length === 0 && <span className="text-muted-foreground text-xs">—</span>}
                    </div>
                )
            }
        },
        {
            id: "actions",
            enableHiding: false,
            cell: ({ row }) => {
                const contact = row.original

                return (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">{t('open_menu')}</span>
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>{t('actions')}</DropdownMenuLabel>
                            <DropdownMenuItem
                                onClick={() => navigator.clipboard.writeText(contact.email || "")}
                            >
                                {t('copy_email')}
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                className="text-destructive"
                                onClick={() => setContactPendingDelete(contact._id)}
                            >
                                <Trash2 className="me-2 h-4 w-4" />
                                {t('delete')}
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )
            },
        },
    ]

    // eslint-disable-next-line react-hooks/incompatible-library
    const table = useReactTable({
        data: contacts as Contact[],
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <div className="w-full">
            <div className="flex items-center py-4">
                <Input
                    placeholder={t('filter_by_name')}
                    value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                    onChange={(event) =>
                        table.getColumn("name")?.setFilterValue(event.target.value)
                    }
                    className="max-w-sm"
                />
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="ms-auto">
                            {t('columns')} <ChevronDown className="ms-2 h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {table
                            .getAllColumns()
                            .filter((column) => column.getCanHide())
                            .map((column) => {
                                return (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) =>
                                            column.toggleVisibility(!!value)
                                        }
                                    >
                                        {t(column.id as string)}
                                    </DropdownMenuCheckboxItem>
                                )
                            })}
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            <div className="rounded-md border overflow-x-auto">
                <Table>
                    <TableHeader>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id}>
                                {headerGroup.headers.map((header) => {
                                    return (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                        </TableHead>
                                    )
                                })}
                            </TableRow>
                        ))}
                    </TableHeader>
                    <TableBody>
                        {table.getRowModel().rows?.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow
                                    key={row.id}
                                    data-state={row.getIsSelected() && "selected"}
                                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                                    onClick={() => {
                                        setSelectedContact(row.original)
                                        setEditDialogOpen(true)
                                    }}
                                >
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell
                                            key={cell.id}
                                            onClick={(e) => {
                                                // Prevent opening edit dialog when clicking on selection checkbox or actions
                                                if (cell.column.id === "select" || cell.column.id === "actions") {
                                                    e.stopPropagation()
                                                }
                                            }}
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell
                                    colSpan={columns.length}
                                    className="h-24 text-center"
                                >
                                    {t('no_contacts_empty')}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    {t('rows_selected', { count: table.getFilteredSelectedRowModel().rows.length })}
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                    >
                        {t('previous')}
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                    >
                        {t('next')}
                    </Button>
                </div>
            </div>

            <EditContactDialog
                key={selectedContact?._id}
                contact={selectedContact}
                open={editDialogOpen}
                onOpenChange={setEditDialogOpen}
            />

            {/* Delete Contact Confirmation */}
            <AlertDialog open={contactPendingDelete !== null} onOpenChange={(open) => { if (!open) setContactPendingDelete(null) }}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{t('delete_contact')}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {t('delete_confirm')}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
                        <AlertDialogAction
                            className="bg-destructive text-white hover:bg-destructive/90"
                            onClick={async () => {
                                if (contactPendingDelete) {
                                    await handleDelete(contactPendingDelete)
                                    setContactPendingDelete(null)
                                }
                            }}
                        >
                            {t('delete')}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
