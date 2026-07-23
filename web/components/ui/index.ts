/**
 * UI Components — Barrel Export
 * Reference: DeutschFlow Design Bible 02_COMPONENTS
 */

// Primitives (Phase 2)
export { Button } from "./Button";
export { Input } from "./Input";
export type { InputProps } from "./Input";
export { PasswordInput } from "./PasswordInput";
export { Checkbox } from "./Checkbox";
export { Card } from "./Card";
export { Badge } from "./Badge";
export { Avatar } from "./Avatar";
export { Skeleton } from "./Skeleton";
export { Tooltip } from "./Tooltip";
export { EmptyState } from "./EmptyState";

// Composites (Phase 4)
export { Dialog } from "./Dialog";
export { DropdownSelect } from "./DropdownSelect";
export type { /* DropdownOption */ } from "./DropdownSelect";
export { Tabs } from "./Tabs";
export { Table } from "./Table";
export { Pagination } from "./Pagination";
export { SearchInput } from "./SearchInput";
export { ToastProvider, useToast } from "./Toast";

// Form Components (Phase 2.4)
export { Stepper } from "./Stepper";
export { OTPInput } from "./OTPInput";
export { FileUpload } from "./FileUpload";

// Utility Components (Phase 2.6)
export { LanguageSelector } from "./LanguageSelector";
export { ThemeSwitch } from "./ThemeSwitch";

// Error handling
export { ErrorState } from "./ErrorState";
export { ErrorBoundary } from "./ErrorBoundary";

// Legacy/Existing
export { ProgressBar } from "./ProgressBar";
export { TabBar } from "./TabBar";
export { CommandBar } from "./CommandBar";
