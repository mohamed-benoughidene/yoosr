# Teammates Settings Audit Report

## 1. The exact component/file that renders the Teammates page
The Teammates page is rendered by the **`TeammatesPage`** component located in:
`src/app/dashboard/settings/teammates/[[...rest]]/page.tsx`

## 2. How <OrganizationProfile /> is currently wrapped
The component is wrapped inside a main container `div` and preceded by a header section:
- **Outer Wrapper**: `<div className="w-full">`
- **Header Section**: Contains an `<h3>Teammates</h3>` and a `<p>` description.
- **Clerk Appearance Props**: The `<OrganizationProfile />` component has the following `appearance` settings applied directly via props to control its layout and styling:
    ```tsx
    appearance={{
        elements: {
            rootBox: "w-full max-w-none shadow-none",
            cardBox: "w-full max-w-none shadow-none border",
            card: "w-full max-w-none shadow-none p-0 sm:p-0",
            navbar: "hidden", // Internal sidebar is hidden
            pageScrollBox: "p-6",
        }
    }}
    ```

## 3. What the parent settings layout looks like
The parent layout is defined in `src/app/dashboard/settings/layout.tsx`. It is a shared layout for all settings pages and includes:
- **Structure**: A header section ("Settings") followed by a split-pane layout:
    - **Left Sidebar**: Renders the `<SettingsSidebar />` component (fixed width `lg:w-48`).
    - **Main Content Area**: A `<div className="flex-1">` that wraps the `{children}`.
- **Styling**: Uses `lg:flex-row` and `lg:space-x-12` for desktop layout.

## 4. Any hardcoded height, overflow, or padding values on the wrapper
- **Height/Overflow**: There are **no hardcoded `height`, `max-height`, or `overflow` values** in the immediate wrappers (`TeammatesPage` or `SettingsLayout`).
- **Padding**:
    - **`OrganizationProfile` Internal**: Uses `p-6` on the `pageScrollBox` via the `appearance` prop.
    - **Settings Page Root**: The `TeammatesPage` content has no root padding (though the `OrganizationProfile` adds its own).
    - **Dashboard Root**: The top-level `src/app/dashboard/layout.tsx` wraps the entire content in `<div className="flex flex-1 flex-col gap-4 p-4 pt-0">`, providing a global padding of `p-4` (excluding top).
- **Spacing**: `SettingsLayout` uses `space-y-6` on the top-level container.
