import "../globals.css";

export default function WidgetLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <div 
            className="widget-root h-full w-full bg-transparent overflow-hidden"
            style={{
                // Reset theme CSS variables to prevent theme leakage
                // This ensures the widget uses its own inline styles, not the app theme
                '--background': 'transparent',
                '--foreground': 'inherit',
                '--card': 'transparent',
                '--card-foreground': 'inherit',
                '--popover': 'transparent',
                '--popover-foreground': 'inherit',
                '--primary': 'inherit',
                '--primary-foreground': 'inherit',
                '--secondary': 'transparent',
                '--secondary-foreground': 'inherit',
                '--muted': 'transparent',
                '--muted-foreground': 'inherit',
                '--accent': 'transparent',
                '--accent-foreground': 'inherit',
                '--destructive': 'inherit',
                '--border': 'transparent',
                '--input': 'transparent',
                '--ring': 'transparent',
            } as React.CSSProperties}
        >
            {children}
        </div>
    )
}
