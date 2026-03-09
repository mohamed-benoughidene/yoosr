# React Doctor Diagnostic Report

**Overall health score**: 79 / 100 (Great)
`✗ 4 errors  ⚠ 231 warnings  across 100/221 files`

---

## ❌ Errors

### Derived state in useEffect — compute during render instead
*For derived state, compute inline: `const x = fn(dep)`. For state resets on prop change, use a key prop: `<Component key={prop} />`.*
- [x] [src/components/dashboard/shared/VisitorPanel.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/shared/VisitorPanel.tsx) (Line 98)
- [x] [src/components/dashboard/monitor/canned-response-picker.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/monitor/canned-response-picker.tsx) (Line 34)

### React Hook "useProject" is called conditionally
*React Hooks must be called in the exact same order in every component render.*
- [x] [src/components/design-studio/NodePropertiesPanel.tsx](file:///home/mohamed/lab/yoosr/src/components/design-studio/NodePropertiesPanel.tsx) (Lines 45, 48)

---

## ⚠️ Warnings

### Component has many `useState` calls — consider `useReducer` for related state (16)
- [ ] [src/app/dashboard/settings/webhooks/page.tsx](file:///home/mohamed/lab/yoosr/src/app/dashboard/settings/webhooks/page.tsx)
- [ ] [src/app/dashboard/settings/widget/page.tsx](file:///home/mohamed/lab/yoosr/src/app/dashboard/settings/widget/page.tsx)
- [ ] [src/app/dashboard/settings/canned-responses/page.tsx](file:///home/mohamed/lab/yoosr/src/app/dashboard/settings/canned-responses/page.tsx)
- [ ] [src/app/dashboard/settings/departments/page.tsx](file:///home/mohamed/lab/yoosr/src/app/dashboard/settings/departments/page.tsx)
- [ ] [src/app/dashboard/settings/page.tsx](file:///home/mohamed/lab/yoosr/src/app/dashboard/settings/page.tsx)
- [ ] [src/app/dashboard/contacts/page.tsx](file:///home/mohamed/lab/yoosr/src/app/dashboard/contacts/page.tsx)
- [ ] [src/components/dashboard/kb/add-content-dialog.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/kb/add-content-dialog.tsx)
- [ ] [src/components/dashboard/bots/create-bot-dialog.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/bots/create-bot-dialog.tsx)
- [ ] [src/app/dashboard/orders/page.tsx](file:///home/mohamed/lab/yoosr/src/app/dashboard/orders/page.tsx)
- [ ] [src/components/dashboard/shared/VisitorPanel.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/shared/VisitorPanel.tsx)
- [ ] [src/components/dashboard/monitor/conversation-list.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/monitor/conversation-list.tsx)
- [ ] [src/components/dashboard/monitor/chat-display.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/monitor/chat-display.tsx)
- [ ] [src/components/chat/ChatArea.tsx](file:///home/mohamed/lab/yoosr/src/components/chat/ChatArea.tsx)
- [ ] [src/app/design-studio/[botId]/page.tsx](file:///home/mohamed/lab/yoosr/src/app/design-studio/%5BbotId%5D/page.tsx)
- [ ] [src/app/widget/rating-component.tsx](file:///home/mohamed/lab/yoosr/src/app/widget/rating-component.tsx)
- [ ] [src/app/widget/page.tsx](file:///home/mohamed/lab/yoosr/src/app/widget/page.tsx)

### "recharts" is a heavy library — use React.lazy() or next/dynamic for code splitting (6)
- [ ] [src/components/dashboard/analytics/charts.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/analytics/charts.tsx)
- [ ] [src/components/analytics/ConversationVolumeChart.tsx](file:///home/mohamed/lab/yoosr/src/components/analytics/ConversationVolumeChart.tsx)
- [ ] [src/components/analytics/AnalyticsTagsChart.tsx](file:///home/mohamed/lab/yoosr/src/components/analytics/AnalyticsTagsChart.tsx)
- [ ] [src/components/ui/charts/TrendChart.tsx](file:///home/mohamed/lab/yoosr/src/components/ui/charts/TrendChart.tsx)
- [ ] [src/components/ui/charts/BarChart.tsx](file:///home/mohamed/lab/yoosr/src/components/ui/charts/BarChart.tsx)
- [ ] [src/components/ui/chart.tsx](file:///home/mohamed/lab/yoosr/src/components/ui/chart.tsx)

### Multiple setState calls in a single useEffect — consider useReducer or deriving state (6)
- [ ] [src/app/dashboard/settings/operating-hours/page.tsx](file:///home/mohamed/lab/yoosr/src/app/dashboard/settings/operating-hours/page.tsx)
- [ ] [src/app/dashboard/settings/widget/page.tsx](file:///home/mohamed/lab/yoosr/src/app/dashboard/settings/widget/page.tsx)
- [ ] [src/app/dashboard/settings/page.tsx](file:///home/mohamed/lab/yoosr/src/app/dashboard/settings/page.tsx)
- [ ] [src/app/widget/page.tsx](file:///home/mohamed/lab/yoosr/src/app/widget/page.tsx)

### useEffect simulating an event handler — move logic to an actual event handler instead (6)
- [ ] [src/app/dashboard/settings/operating-hours/page.tsx](file:///home/mohamed/lab/yoosr/src/app/dashboard/settings/operating-hours/page.tsx)
- [ ] [src/components/dashboard/contacts/edit-contact-dialog.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/contacts/edit-contact-dialog.tsx)
- [ ] [src/app/dashboard/settings/page.tsx](file:///home/mohamed/lab/yoosr/src/app/dashboard/settings/page.tsx)
- [ ] [src/app/dashboard/layout.tsx](file:///home/mohamed/lab/yoosr/src/app/dashboard/layout.tsx)
- [ ] [src/components/dashboard/SiteHeader.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/SiteHeader.tsx)

### Enforce a clickable non-interactive element has at least one keyboard event listener (13)
- [ ] [src/components/dashboard/AppSidebar.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/AppSidebar.tsx)
- [ ] [src/components/dashboard/kb/add-content-dialog.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/kb/add-content-dialog.tsx)
- [ ] [src/components/dashboard/bots/create-bot-dialog.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/bots/create-bot-dialog.tsx)
- [ ] [src/components/dashboard/shared/VisitorPanel.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/shared/VisitorPanel.tsx)
- [ ] [src/components/pricing/PricingTable.tsx](file:///home/mohamed/lab/yoosr/src/components/pricing/PricingTable.tsx)
- [ ] [src/components/dashboard/monitor/chat-display.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/monitor/chat-display.tsx)
- [ ] [src/components/chat/ConversationList.tsx](file:///home/mohamed/lab/yoosr/src/components/chat/ConversationList.tsx)
- [ ] [src/components/chat/ChatArea.tsx](file:///home/mohamed/lab/yoosr/src/components/chat/ChatArea.tsx)
- [ ] [src/components/design-studio/DebuggerPanel.tsx](file:///home/mohamed/lab/yoosr/src/components/design-studio/DebuggerPanel.tsx)

### Static HTML elements with event handlers require a role (13)
- [ ] [src/components/dashboard/AppSidebar.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/AppSidebar.tsx)
- [ ] [src/components/dashboard/kb/add-content-dialog.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/kb/add-content-dialog.tsx)
- [ ] [src/components/dashboard/bots/create-bot-dialog.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/bots/create-bot-dialog.tsx)
- [ ] [src/components/dashboard/shared/VisitorPanel.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/shared/VisitorPanel.tsx)
- [ ] [src/components/pricing/PricingTable.tsx](file:///home/mohamed/lab/yoosr/src/components/pricing/PricingTable.tsx)
- [ ] [src/components/dashboard/monitor/chat-display.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/monitor/chat-display.tsx)
- [ ] [src/components/chat/ConversationList.tsx](file:///home/mohamed/lab/yoosr/src/components/chat/ConversationList.tsx)
- [ ] [src/components/chat/ChatArea.tsx](file:///home/mohamed/lab/yoosr/src/components/chat/ChatArea.tsx)
- [ ] [src/components/design-studio/DebuggerPanel.tsx](file:///home/mohamed/lab/yoosr/src/components/design-studio/DebuggerPanel.tsx)

### Component is too large — consider breaking it into smaller focused components (13)
- [ ] [src/app/dashboard/settings/widget/page.tsx](file:///home/mohamed/lab/yoosr/src/app/dashboard/settings/widget/page.tsx) (521 lines)
- [ ] [src/app/dashboard/settings/canned-responses/page.tsx](file:///home/mohamed/lab/yoosr/src/app/dashboard/settings/canned-responses/page.tsx)
- [ ] [src/app/dashboard/settings/departments/page.tsx](file:///home/mohamed/lab/yoosr/src/app/dashboard/settings/departments/page.tsx)
- [ ] [src/components/dashboard/contacts/contacts-list.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/contacts/contacts-list.tsx)
- [ ] [src/app/dashboard/contacts/page.tsx](file:///home/mohamed/lab/yoosr/src/app/dashboard/contacts/page.tsx)
- [ ] [src/app/dashboard/orders/page.tsx](file:///home/mohamed/lab/yoosr/src/app/dashboard/orders/page.tsx)
- [ ] [src/components/dashboard/shared/VisitorPanel.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/shared/VisitorPanel.tsx)
- [ ] [src/components/dashboard/monitor/conversation-list.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/monitor/conversation-list.tsx)
- [ ] [src/components/dashboard/monitor/chat-display.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/monitor/chat-display.tsx)
- [ ] [src/components/chat/ChatArea.tsx](file:///home/mohamed/lab/yoosr/src/components/chat/ChatArea.tsx)
- [ ] [src/components/design-studio/NodePropertiesPanel.tsx](file:///home/mohamed/lab/yoosr/src/components/design-studio/NodePropertiesPanel.tsx)
- [ ] [src/components/design-studio/FlowEditor.tsx](file:///home/mohamed/lab/yoosr/src/components/design-studio/FlowEditor.tsx)
- [ ] [src/app/widget/page.tsx](file:///home/mohamed/lab/yoosr/src/app/widget/page.tsx)

### Array index "i" used as key — causes bugs when list is reordered or filtered (19)
- [ ] [src/app/dashboard/contacts/page.tsx](file:///home/mohamed/lab/yoosr/src/app/dashboard/contacts/page.tsx)
- [ ] [src/app/dashboard/orders/page.tsx](file:///home/mohamed/lab/yoosr/src/app/dashboard/orders/page.tsx)
- [ ] [src/components/analytics/AnalyticsTagsChart.tsx](file:///home/mohamed/lab/yoosr/src/components/analytics/AnalyticsTagsChart.tsx)
- [ ] [src/components/pricing/PricingTable.tsx](file:///home/mohamed/lab/yoosr/src/components/pricing/PricingTable.tsx)
- [ ] [src/components/landing/ChannelsSection.tsx](file:///home/mohamed/lab/yoosr/src/components/landing/ChannelsSection.tsx)
- [ ] [src/app/dashboard/page.tsx](file:///home/mohamed/lab/yoosr/src/app/dashboard/page.tsx)
- [ ] [src/components/landing/AnalyticsSection.tsx](file:///home/mohamed/lab/yoosr/src/components/landing/AnalyticsSection.tsx)
- [ ] [src/components/landing/Testimonials.tsx](file:///home/mohamed/lab/yoosr/src/components/landing/Testimonials.tsx)
- [ ] [src/components/landing/DesignStudioSection.tsx](file:///home/mohamed/lab/yoosr/src/components/landing/DesignStudioSection.tsx)
- [ ] [src/components/landing/OrdersSection.tsx](file:///home/mohamed/lab/yoosr/src/components/landing/OrdersSection.tsx)
- [ ] [src/components/design-studio/NodePropertiesPanel.tsx](file:///home/mohamed/lab/yoosr/src/components/design-studio/NodePropertiesPanel.tsx)
- [ ] [src/components/landing/HowItWorks.tsx](file:///home/mohamed/lab/yoosr/src/components/landing/HowItWorks.tsx)
- [ ] [src/components/design-studio/BuildWithAIModal.tsx](file:///home/mohamed/lab/yoosr/src/components/design-studio/BuildWithAIModal.tsx)
- [ ] [src/components/design-studio/DebuggerPanel.tsx](file:///home/mohamed/lab/yoosr/src/components/design-studio/DebuggerPanel.tsx)
- [ ] [src/app/widget/page.tsx](file:///home/mohamed/lab/yoosr/src/app/widget/page.tsx)
- [ ] [src/components/design-studio/nodes/ReplyNode.tsx](file:///home/mohamed/lab/yoosr/src/components/design-studio/nodes/ReplyNode.tsx)

### A form label must be associated with a control (5)
- [ ] [src/components/dashboard/shared/VisitorPanel.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/shared/VisitorPanel.tsx) (Lines 686, 698, 710, 723, 735)

### The `autoFocus` attribute is found here, which can cause usability issues (3)
- [ ] [src/components/dashboard/shared/VisitorPanel.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/shared/VisitorPanel.tsx) (Lines 129, 145, 718)

### useState initialized from prop "value"
- [x] [src/components/dashboard/shared/VisitorPanel.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/shared/VisitorPanel.tsx)

### setInputValue(inputValue + ...) — use functional update to avoid stale closures (2)
- [x] [src/components/dashboard/monitor/chat-display.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/monitor/chat-display.tsx)
- [x] [src/components/chat/ChatArea.tsx](file:///home/mohamed/lab/yoosr/src/components/chat/ChatArea.tsx)

### Do not use `dangerouslySetInnerHTML` prop
- [ ] [src/components/ui/chart.tsx](file:///home/mohamed/lab/yoosr/src/components/ui/chart.tsx)

### useEffect(setState, []) on mount causes a flash
- [ ] [src/app/dashboard/test-widget/page.tsx](file:///home/mohamed/lab/yoosr/src/app/dashboard/test-widget/page.tsx)

---

## 🌐 Next.js App Router-specific issues

### Client-side redirect in useEffect — use redirect() or handle in middleware (8)
- [ ] [src/app/dashboard/settings/layout.tsx](file:///home/mohamed/lab/yoosr/src/app/dashboard/settings/layout.tsx)
- [ ] [src/app/design-studio/layout.tsx](file:///home/mohamed/lab/yoosr/src/app/design-studio/layout.tsx)
- [ ] [src/app/onboarding/page.tsx](file:///home/mohamed/lab/yoosr/src/app/onboarding/page.tsx)

### useSearchParams() requires a `<Suspense>` boundary
- [x] [src/components/chat/ConversationList.tsx](file:///home/mohamed/lab/yoosr/src/components/chat/ConversationList.tsx)
- [x] [src/components/chat/ChatArea.tsx](file:///home/mohamed/lab/yoosr/src/components/chat/ChatArea.tsx)
- [x] [src/app/design-studio/[botId]/page.tsx](file:///home/mohamed/lab/yoosr/src/app/design-studio/%5BbotId%5D/page.tsx)
- [x] [src/app/design-studio/layout.tsx](file:///home/mohamed/lab/yoosr/src/app/design-studio/layout.tsx)
- [x] [src/components/design-studio/NodePropertiesPanel.tsx](file:///home/mohamed/lab/yoosr/src/components/design-studio/NodePropertiesPanel.tsx)
- [x] [src/components/design-studio/FlowToolbar.tsx](file:///home/mohamed/lab/yoosr/src/components/design-studio/FlowToolbar.tsx)
- [x] [src/app/dashboard/chat/layout.tsx](file:///home/mohamed/lab/yoosr/src/app/dashboard/chat/layout.tsx)

### Use next/link instead of `<a>` for internal links
- [ ] [src/components/layout/Header.tsx](file:///home/mohamed/lab/yoosr/src/components/layout/Header.tsx)

### Use next/image instead of `<img>`
- [ ] [src/app/widget/page.tsx](file:///home/mohamed/lab/yoosr/src/app/widget/page.tsx)

### Page without metadata or generateMetadata export — hurts SEO (12)
- [ ] [src/app/login/page.tsx](file:///home/mohamed/lab/yoosr/src/app/login/page.tsx)
- [ ] [src/app/signup/page.tsx](file:///home/mohamed/lab/yoosr/src/app/signup/page.tsx)
- [ ] [src/app/design-studio/[botId]/page.tsx](file:///home/mohamed/lab/yoosr/src/app/design-studio/%5BbotId%5D/page.tsx)
- [ ] [src/app/test-widget/page.tsx](file:///home/mohamed/lab/yoosr/src/app/test-widget/page.tsx)
- [ ] [src/app/products/[slug]/page.tsx](file:///home/mohamed/lab/yoosr/src/app/products/%5Bslug%5D/page.tsx)
- [ ] [src/app/(marketing)/legal/privacy/page.tsx](file:///home/mohamed/lab/yoosr/src/app/%28marketing%29/legal/privacy/page.tsx)
- [ ] [src/app/(marketing)/legal/terms/page.tsx](file:///home/mohamed/lab/yoosr/src/app/%28marketing%29/legal/terms/page.tsx)
- [ ] [src/app/(marketing)/page.tsx](file:///home/mohamed/lab/yoosr/src/app/%28marketing%29/page.tsx)
- [ ] [src/app/solutions/[slug]/page.tsx](file:///home/mohamed/lab/yoosr/src/app/solutions/%5Bslug%5D/page.tsx)
- [ ] [src/app/widget/page.tsx](file:///home/mohamed/lab/yoosr/src/app/widget/page.tsx)
- [ ] [src/app/pricing/page.tsx](file:///home/mohamed/lab/yoosr/src/app/pricing/page.tsx)
- [ ] [src/app/onboarding/page.tsx](file:///home/mohamed/lab/yoosr/src/app/onboarding/page.tsx)

### Use of incorrect `href` for the 'a' element
- [ ] [src/app/test-widget/page.tsx](file:///home/mohamed/lab/yoosr/src/app/test-widget/page.tsx)

### Headings must have content and the content must be accessible by a screen reader
- [ ] [src/components/ui/alert.tsx](file:///home/mohamed/lab/yoosr/src/components/ui/alert.tsx)

---

## 🗑️ Dead code found

### Unused files (32)
- [ ] [public/widget.js](file:///home/mohamed/lab/yoosr/public/widget.js)
- [x] [src/lib/logging.ts](file:///home/mohamed/lab/yoosr/src/lib/logging.ts)
- [x] [src/components/analytics/AnalyticsMetrics.tsx](file:///home/mohamed/lab/yoosr/src/components/analytics/AnalyticsMetrics.tsx)
- [x] [src/components/analytics/AnalyticsRealtime.tsx](file:///home/mohamed/lab/yoosr/src/components/analytics/AnalyticsRealtime.tsx)
- [ ] [src/components/chat/NotificationManager.tsx](file:///home/mohamed/lab/yoosr/src/components/chat/NotificationManager.tsx)
- [x] [src/components/dashboard/DashboardHeader.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/DashboardHeader.tsx)
- [x] [src/components/dashboard/DashboardSidebar.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/DashboardSidebar.tsx)
- [x] [src/components/design-studio/BuildWithAIModal.tsx](file:///home/mohamed/lab/yoosr/src/components/design-studio/BuildWithAIModal.tsx)
- [ ] [src/components/landing/SolutionsSection.tsx](file:///home/mohamed/lab/yoosr/src/components/landing/SolutionsSection.tsx)
- [x] [src/components/ui/breadcrumb.tsx](file:///home/mohamed/lab/yoosr/src/components/ui/breadcrumb.tsx)
- [ ] [src/components/ui/collapsible.tsx](file:///home/mohamed/lab/yoosr/src/components/ui/collapsible.tsx)
- [ ] [src/components/ui/form.tsx](file:///home/mohamed/lab/yoosr/src/components/ui/form.tsx)
- [ ] [src/components/analytics/metrics/ConversationsMetric.tsx](file:///home/mohamed/lab/yoosr/src/components/analytics/metrics/ConversationsMetric.tsx)
- [ ] [src/components/analytics/metrics/ResponseTimeMetric.tsx](file:///home/mohamed/lab/yoosr/src/components/analytics/metrics/ResponseTimeMetric.tsx)
- [ ] [src/components/analytics/metrics/VisitorsMetric.tsx](file:///home/mohamed/lab/yoosr/src/components/analytics/metrics/VisitorsMetric.tsx)
- [ ] [src/components/dashboard/analytics/charts.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/analytics/charts.tsx)
- [ ] [src/components/dashboard/bots/bot-templates.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/bots/bot-templates.tsx)
- [ ] [src/components/dashboard/bots/bots-list.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/bots/bots-list.tsx)
- [ ] [src/components/dashboard/bots/data.ts](file:///home/mohamed/lab/yoosr/src/components/dashboard/bots/data.ts)
- [ ] [src/components/dashboard/contacts/data.ts](file:///home/mohamed/lab/yoosr/src/components/dashboard/contacts/data.ts)
- [ ] [src/components/dashboard/kb/article-editor.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/kb/article-editor.tsx)
- [ ] [src/components/dashboard/kb/article-list.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/kb/article-list.tsx)
- [ ] [src/components/dashboard/kb/categories-manager.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/kb/categories-manager.tsx)
- [ ] [src/components/dashboard/kb/data.ts](file:///home/mohamed/lab/yoosr/src/components/dashboard/kb/data.ts)
- [ ] [src/components/dashboard/settings/SettingsSidebar.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/settings/SettingsSidebar.tsx)
- [ ] [src/components/dashboard/settings/general-settings.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/settings/general-settings.tsx)
- [ ] [src/components/dashboard/settings/operating-hours.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/settings/operating-hours.tsx)
- [ ] [src/components/dashboard/settings/team-settings.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/settings/team-settings.tsx)
- [ ] [src/components/ui/charts/BarChart.tsx](file:///home/mohamed/lab/yoosr/src/components/ui/charts/BarChart.tsx)
- [ ] [src/components/ui/charts/TrendChart.tsx](file:///home/mohamed/lab/yoosr/src/components/ui/charts/TrendChart.tsx)

### Unused export: SidebarGroupAction (37)
- [ ] [src/components/ui/sidebar.tsx](file:///home/mohamed/lab/yoosr/src/components/ui/sidebar.tsx)
- [ ] [src/components/ui/badge.tsx](file:///home/mohamed/lab/yoosr/src/components/ui/badge.tsx)
- [ ] [src/components/ui/table.tsx](file:///home/mohamed/lab/yoosr/src/components/ui/table.tsx)
- [ ] [src/components/ui/dropdown-menu.tsx](file:///home/mohamed/lab/yoosr/src/components/ui/dropdown-menu.tsx)
- [ ] [src/components/ui/alert-dialog.tsx](file:///home/mohamed/lab/yoosr/src/components/ui/alert-dialog.tsx)
- [ ] [src/components/ui/dialog.tsx](file:///home/mohamed/lab/yoosr/src/components/ui/dialog.tsx)
- [ ] [src/components/ui/calendar.tsx](file:///home/mohamed/lab/yoosr/src/components/ui/calendar.tsx)
- [ ] [src/components/ui/scroll-area.tsx](file:///home/mohamed/lab/yoosr/src/components/ui/scroll-area.tsx)
- [ ] [src/components/ui/select.tsx](file:///home/mohamed/lab/yoosr/src/components/ui/select.tsx)
- [ ] [src/components/ui/navigation-menu.tsx](file:///home/mohamed/lab/yoosr/src/components/ui/navigation-menu.tsx)
- [ ] [src/components/ui/sheet.tsx](file:///home/mohamed/lab/yoosr/src/components/ui/sheet.tsx)

### Unused type: BadgeProps (20)
- [ ] [src/components/ui/badge.tsx](file:///home/mohamed/lab/yoosr/src/components/ui/badge.tsx)
- [ ] [src/config/apps.ts](file:///home/mohamed/lab/yoosr/src/config/apps.ts)
- [ ] [src/components/dashboard/contacts/contacts-list.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/contacts/contacts-list.tsx)
- [ ] [src/types/flow.ts](file:///home/mohamed/lab/yoosr/src/types/flow.ts)
- [ ] [src/components/dashboard/monitor/canned-response-picker.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/monitor/canned-response-picker.tsx)
- [ ] [src/components/dashboard/monitor/conversation-list.tsx](file:///home/mohamed/lab/yoosr/src/components/dashboard/monitor/conversation-list.tsx)
