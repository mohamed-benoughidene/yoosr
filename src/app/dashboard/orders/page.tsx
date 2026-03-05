"use client"

import { useState } from "react"
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
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ShoppingBag, Trash2, Check, X, Loader2 } from "lucide-react"
import { toast } from "sonner"

type FilterType = "all" | "new" | "confirmed" | "cancelled"

export default function OrdersPage() {
    const { activeProject } = useProject()
    const [filter, setFilter] = useState<FilterType>("all")

    const orders = useQuery(
        api.orders.listOrders,
        activeProject ? { projectId: activeProject._id } : "skip"
    )

    const updateOrderStatus = useMutation(api.orders.updateOrderStatus)
    const deleteOrder = useMutation(api.orders.deleteOrder)

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

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                    <p className="text-muted-foreground mt-1">
                        Track and manage orders from your customer conversations.
                    </p>
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
