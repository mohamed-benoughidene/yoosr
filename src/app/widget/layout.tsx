import "../globals.css";

export default function WidgetLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div className="h-full w-full bg-transparent overflow-hidden">
            {children}
        </div>
    )
}
