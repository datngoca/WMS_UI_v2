import * as React from "react";
import { paths } from "@/config/paths";
import { cn } from "@/utils/cn";
import { NavLink } from "react-router-dom";
import avatarImg from "@/assets/IMG_6321.jpg";
import {
  LayoutDashboard,
  ShieldUser,
  Package,
  CreditCard,
  UsersRound,
  UserRound,
  Bell,
  Archive,
  ShoppingBasket,
  ListCollapse,
  PencilRuler,
  Menu,
  type LucideIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown";
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { type Notification } from "@/components/ui/notifications";

type SideNavigationItem = {
  name: string;
  to: string;
  icon: LucideIcon;
};

type NotificationItem = Notification & {
  status: string;
  icon: LucideIcon;
  href?: string;
};

const navigation: SideNavigationItem[] = [
  {
    name: "Dashboard",
    to: paths.app.dashboard.getHref(),
    icon: LayoutDashboard,
  },
  { name: "Accounts", to: paths.app.account.getHref(), icon: ShieldUser },
  { name: "Inventory", to: paths.app.inventory.getHref(), icon: Package },
  { name: "Product", to: paths.app.product.getHref(), icon: ShoppingBasket },
  { name: "Orders", to: paths.app.order.getHref(), icon: CreditCard },
  { name: "Customer", to: paths.app.customer.getHref(), icon: UsersRound },
  { name: "Category", to: paths.app.category.getHref(), icon: ListCollapse },
  { name: "Unit", to: paths.app.unit.getHref(), icon: PencilRuler },
];

const notifications: NotificationItem[] = [
  {
    id: "1",
    type: "warning",
    title: "Low Stock Alert",
    message: "Organic Bananas below threshold",
    status: "Urgent",
    icon: Archive,
  },
  {
    id: "2",
    type: "success",
    title: "New Order Received",
    message: "Order #ORD-4920 by John Doe",
    status: "Just now",
    icon: Archive,
    href: "/orders",
  },
];

const colorMap: Record<Notification["type"], { bg: string; text: string }> = {
  info: {
    bg: "bg-blue-100 dark:bg-blue-900/40",
    text: "text-blue-600 dark:text-blue-400",
  },
  error: {
    bg: "bg-red-100 dark:bg-red-900/40",
    text: "text-red-600 dark:text-red-400",
  },
  success: {
    bg: "bg-green-100 dark:bg-green-900/40",
    text: "text-green-600 dark:text-green-400",
  },
  warning: {
    bg: "bg-amber-100 dark:bg-amber-900/40",
    text: "text-amber-600 dark:text-amber-400",
  },
};

export const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [mobileOpen, setMobileOpen] = React.useState(false);

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex fixed inset-y-0 left-0 z-20 w-60 flex-col border-r bg-muted/40 font-mono text-muted-foreground backdrop-blur">
        <div className="flex h-14 items-center gap-3 border-b px-4">
          <img
            src={avatarImg}
            alt="Harry Ngoc"
            className="w-8 h-8 rounded-full object-cover shrink-0 ring-1 ring-border"
          />
          <div className="overflow-hidden">
            <h1 className="text-primary text-base font-bold font-serif tracking-tight truncate leading-none">
              Harry Ngoc
            </h1>
            <p className="text-muted-foreground text-xs mt-0.5">Admin</p>
          </div>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "group flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                  "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                  isActive && "bg-white text-primary shadow-xs font-semibold",
                )
              }
            >
              <item.icon className="mr-3 size-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Main Content Layout */}
      <div className="flex flex-col md:pl-60 min-h-screen">
        {/* Header (Responsive) */}
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-2 border-b bg-background/95 px-4 backdrop-blur sm:px-6">
          {/* Mobile Menu & Branding */}
          <div className="flex items-center gap-2 md:hidden">
            <Drawer open={mobileOpen} onOpenChange={setMobileOpen}>
              <DrawerTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 rounded-lg"
                  aria-label="Open navigation menu"
                >
                  <Menu className="size-5" />
                </Button>
              </DrawerTrigger>
              <DrawerContent
                side="left"
                className="w-72 max-w-[85vw] p-0 flex flex-col h-full bg-card"
              >
                <DrawerHeader className="p-4 border-b text-left">
                  <DrawerTitle className="sr-only">Navigation Menu</DrawerTitle>
                  <DrawerDescription className="sr-only">
                    Warehouse Management Navigation
                  </DrawerDescription>
                  <div className="flex items-center gap-3 pr-6">
                    <img
                      src={avatarImg}
                      alt="Harry Ngoc"
                      className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-border"
                    />
                    <div className="overflow-hidden">
                      <h2 className="text-primary text-base font-bold font-serif leading-none truncate">
                        Harry Ngoc
                      </h2>
                      <p className="text-muted-foreground text-xs mt-1 font-mono">
                        Admin
                      </p>
                    </div>
                  </div>
                </DrawerHeader>

                <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-3">
                  {navigation.map((item) => (
                    <NavLink
                      key={item.name}
                      to={item.to}
                      onClick={() => setMobileOpen(false)}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                          "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
                          isActive &&
                            "bg-white text-primary shadow-xs font-semibold",
                        )
                      }
                    >
                      <item.icon
                        className="mr-3 size-5 shrink-0"
                        aria-hidden="true"
                      />
                      <span>{item.name}</span>
                    </NavLink>
                  ))}
                </nav>
              </DrawerContent>
            </Drawer>

            <span className="font-bold text-base tracking-tight text-primary font-serif">
              WMS
            </span>
          </div>

          {/* Spacer for Desktop to align actions to the right */}
          <div className="hidden md:block flex-1" />

          {/* Right Actions: Notifications & Profile */}
          <div className="flex items-center gap-2">
            {/* ------------ Notification ------------ */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 rounded-full relative"
                  aria-label="Notifications"
                >
                  <Bell className="size-4" />
                  {notifications.length > 0 && (
                    <span className="absolute top-1 right-1 size-2 rounded-full bg-red-500 ring-2 ring-background" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-[calc(100vw-2rem)] sm:w-80 max-w-sm"
              >
                <DropdownMenuItem className="cursor-default focus:bg-transparent">
                  <div className="flex items-center justify-between w-full">
                    <h2 className="font-bold text-sm">Notifications</h2>
                    <Button
                      variant="link"
                      size="sm"
                      className="h-auto p-0 text-xs text-primary"
                    >
                      Mark all as read
                    </Button>
                  </div>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex items-start cursor-pointer p-3 gap-3"
                  >
                    <div
                      className={cn(
                        "p-2 rounded-full shrink-0",
                        colorMap[notification.type].text,
                        colorMap[notification.type].bg,
                      )}
                    >
                      <notification.icon className="size-4" />
                    </div>

                    <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                      <h3 className="font-semibold text-sm truncate">
                        {notification.title}
                      </h3>
                      <span className="text-muted-foreground text-xs line-clamp-2">
                        {notification.message}
                      </span>
                      <span
                        className={cn(
                          "text-[10px] font-bold mt-0.5",
                          colorMap[notification.type].text,
                        )}
                      >
                        {notification.status}
                      </span>
                    </div>
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                <DropdownMenuItem className="justify-center cursor-pointer py-2">
                  <Link
                    to="/"
                    className="text-primary text-xs font-medium hover:underline underline-offset-4"
                  >
                    See all notifications
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* ------------ Profile ------------ */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="size-9 rounded-full overflow-hidden"
                  aria-label="User Profile"
                >
                  <UserRound className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem className="cursor-pointer">
                  Your Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="cursor-pointer text-destructive focus:text-destructive">
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-3 sm:p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
};
