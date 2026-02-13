
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { categories } from "./data"

export function ArticleEditor() {
    return (
        <div className="space-y-4 max-w-2xl">
            <div className="grid gap-2">
                <Label htmlFor="title">Article Title</Label>
                <Input id="title" placeholder="How to..." />
            </div>
            <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select>
                    <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                        {categories.map((category) => (
                            <SelectItem key={category.id} value={category.id}>
                                {category.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>
            <div className="grid gap-2">
                <Label htmlFor="content">Content (Markdown)</Label>
                <Textarea
                    id="content"
                    placeholder="# Introduction\n\nWrite your article here..."
                    className="min-h-[300px] font-mono"
                />
            </div>
            <div className="flex gap-2">
                <Button>Publish</Button>
                <Button variant="outline">Save Draft</Button>
            </div>
        </div>
    )
}
