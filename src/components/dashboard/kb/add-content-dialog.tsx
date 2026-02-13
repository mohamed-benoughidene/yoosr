"use client"

import { Button } from "@/components/ui/button"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Globe, FileText, Upload, Link as LinkIcon, Plus } from "lucide-react"
import { useState } from "react"

export function AddContentDialog({ onAdd }: { onAdd: (type: string, value: string) => Promise<void> }) {
    const [open, setOpen] = useState(false)
    const [url, setUrl] = useState("")
    const [text, setText] = useState("")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (type: string) => {
        setLoading(true)
        try {
            if (type === 'url' && url) {
                await onAdd('url', url)
                setUrl("")
                setOpen(false)
            } else if (type === 'text' && text) {
                await onAdd('text', text)
                setText("")
                setOpen(false)
            }
        } catch (error) {
            console.error("Error adding content:", error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Content
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>Add Data Source</DialogTitle>
                    <DialogDescription>
                        Add content to your Knowledge Base to train your AI agents.
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="url" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="url">
                            <Globe className="mr-2 h-4 w-4" />
                            URL
                        </TabsTrigger>
                        <TabsTrigger value="text">
                            <FileText className="mr-2 h-4 w-4" />
                            Text
                        </TabsTrigger>
                        <TabsTrigger value="file">
                            <Upload className="mr-2 h-4 w-4" />
                            File
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="url" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="url">Web Page URL</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="url"
                                    placeholder="https://example.com/page"
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                />
                                <Button size="icon" variant="outline">
                                    <LinkIcon className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                We will scrape the content of this page and index it.
                            </p>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => handleSubmit('url')} disabled={!url}>Import URL</Button>
                        </DialogFooter>
                    </TabsContent>
                    <TabsContent value="text" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="text">Plain Text</Label>
                            <Textarea
                                id="text"
                                placeholder="Paste your content here..."
                                className="min-h-[150px]"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button onClick={() => handleSubmit('text')} disabled={!text}>Save Text</Button>
                        </DialogFooter>
                    </TabsContent>
                    <TabsContent value="file" className="space-y-4 py-4">
                        <div className="border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer">
                            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold">Upload Files</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                Drag & drop or click to upload PDF, DOCX, TXT
                            </p>
                            <Button variant="secondary">Select Files</Button>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                            Max file size: 10MB. Content will be reflected after processing.
                        </p>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
