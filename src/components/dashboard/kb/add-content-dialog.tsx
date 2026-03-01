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
import { useState, useRef } from "react"
import { useAction } from "convex/react"
import { api } from "../../../../convex/_generated/api"

export function AddContentDialog({ onAdd }: { onAdd: (type: string, value: string) => Promise<void> }) {
    const [open, setOpen] = useState(false)
    const [url, setUrl] = useState("")
    const [text, setText] = useState("")
    const [loading, setLoading] = useState(false)
    const [file, setFile] = useState<File | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const generateUploadUrl = useAction(api.knowledgeBases.generateKbUploadUrl)

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0])
        }
    }

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault()
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
            const droppedFile = e.dataTransfer.files[0]
            if (droppedFile.name.match(/\.(txt|md|csv)$/i)) {
                setFile(droppedFile)
            }
        }
    }

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault()
    }

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
            } else if (type === 'file' && file) {
                const postUrl = await generateUploadUrl();
                const result = await fetch(postUrl, {
                    method: "POST",
                    headers: { "Content-Type": file.type },
                    body: file,
                });

                if (!result.ok) throw new Error("File upload failed");
                const { storageId } = await result.json();

                await onAdd('file', storageId)
                setFile(null)
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
                        <div
                            className="border-2 border-dashed rounded-lg p-12 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                            onDrop={handleDrop}
                            onDragOver={handleDragOver}
                        >
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".txt,.md,.csv"
                                onChange={handleFileChange}
                            />
                            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold text-center break-all">
                                {file ? file.name : "Upload Files"}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {file ? "Click or drag a new file to replace" : "Drag & drop or click to upload TXT, MD, CSV"}
                            </p>
                            <Button variant="secondary" type="button" className="pointer-events-none">
                                {file ? "Change File" : "Select Files"}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                            Max file size: 10MB. Content will be reflected after processing.
                        </p>
                        <DialogFooter>
                            <Button
                                onClick={() => handleSubmit('file')}
                                disabled={!file || loading}
                            >
                                {loading ? "Uploading..." : "Save File"}
                            </Button>
                        </DialogFooter>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
