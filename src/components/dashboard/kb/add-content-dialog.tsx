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
import { useTranslations } from "next-intl"

export function AddContentDialog({ onAdd }: { onAdd: (type: string, value: string) => Promise<void> }) {
    const t = useTranslations("knowledge_base")
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
            if (droppedFile.name.match(/\.(txt|md|csv|pdf)$/i)) {
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

                if (!result.ok) throw new Error(t("file_upload_failed"));
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
                    {t("add_content")}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px] md:max-w-[600px]">
                <DialogHeader>
                    <DialogTitle>{t("add_data_source")}</DialogTitle>
                    <DialogDescription>
                        {t("add_data_source_desc")}
                    </DialogDescription>
                </DialogHeader>
                <Tabs defaultValue="url" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="url">
                            <Globe className="mr-2 h-4 w-4" />
                            {t("url")}
                        </TabsTrigger>
                        <TabsTrigger value="text">
                            <FileText className="mr-2 h-4 w-4" />
                            {t("text")}
                        </TabsTrigger>
                        <TabsTrigger value="file">
                            <Upload className="mr-2 h-4 w-4" />
                            {t("file")}
                        </TabsTrigger>
                    </TabsList>
                    <TabsContent value="url" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="url">{t("url")}</Label>
                            <div className="flex gap-2">
                                <Input
                                    id="url"
                                    placeholder={t("url_placeholder")}
                                    value={url}
                                    onChange={(e) => setUrl(e.target.value)}
                                />
                                <Button size="icon" variant="outline">
                                    <LinkIcon className="h-4 w-4" />
                                </Button>
                            </div>
                            <p className="text-xs text-muted-foreground">
                                {t("url_hint")}
                            </p>
                        </div>
                        <DialogFooter>
                            <Button onClick={() => handleSubmit('url')} disabled={!url}>{t("import_url")}</Button>
                        </DialogFooter>
                    </TabsContent>
                    <TabsContent value="text" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="text">{t("plain_text")}</Label>
                            <Textarea
                                id="text"
                                placeholder={t("text_placeholder")}
                                className="min-h-[150px]"
                                value={text}
                                onChange={(e) => setText(e.target.value)}
                            />
                        </div>
                        <DialogFooter>
                            <Button onClick={() => handleSubmit('text')} disabled={!text}>{t("save_text")}</Button>
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
                                accept=".txt,.md,.csv,.pdf"
                                onChange={handleFileChange}
                            />
                            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                            <h3 className="text-lg font-semibold text-center break-all">
                                {file ? file.name : t("upload_files")}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-4">
                                {file ? t("drop_to_replace") : t("drop_to_upload")}
                            </p>
                            <Button variant="secondary" type="button" className="pointer-events-none">
                                {file ? t("change_file") : t("select_files")}
                            </Button>
                        </div>
                        <p className="text-xs text-muted-foreground text-center">
                            {t("file_size_hint")}
                        </p>
                        <DialogFooter>
                            <Button
                                onClick={() => handleSubmit('file')}
                                disabled={!file || loading}
                            >
                                {loading ? t("uploading") : t("save_file")}
                            </Button>
                        </DialogFooter>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
