import * as React from "react";
import { paths } from "@/config/paths";
import { cn } from "@/utils/cn";
import { NavLink, useNavigate } from "react-router-dom";
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
  type LucideIcon,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown";
import { Button } from "@/components/ui/button";
import { Link } from "@/components/ui/link";
import { type Notification } from "@/components/ui/notifications";

type SideNaviagationItem = {
  name: string;
  to: string;
  icon: LucideIcon;
};

type NotificationItem = Notification & {
  status: string;
  icon: LucideIcon;
  href?: string;
};

const colorMap: Record<Notification["type"], { bg: string; text: string }> = {
  info: { bg: "bg-blue-300", text: "text-blue-700" },
  error: { bg: "bg-red-300", text: "text-red-700" },
  success: { bg: "bg-green-300", text: "text-green-700" },
  warning: { bg: "bg-orange-300", text: "text-orange-700" },
};

export const DashboardLayout = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  // const navigate = useNavigate();

  // const logout = useLogout({
  //     onSuccess: () => navigate(paths.auth.login.getHref(location.pathname)),
  // })

  // const {checkAccess}= useAuthorization();

  const navigation: SideNaviagationItem[] = [
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

  return (
    <div className="flex min-h-screen w-full flex-col bg-background">
      <aside className="fixed inset-y-0 left-0 z-10 w-60 flex-col border-r bg-muted font-mono text-muted-foreground">
        <nav className="flex flex-col items-center gap-4 px-2 py-4">
          {/* AVATAR - ROLE */}
          <div className="flex items-center gap-1.5">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDJs2hqzy4-ZZMtHTVfd9722A7aUK0TP1q63a_c9obQLgAhPalZfFef9tqQoScsiOtyEqFNpHN-TG2SIlc9iA_l33PGDcd5uRID5JBWDyPWle8wqO1xi6tLhHavDHpmYBZNaPG9u6b94eqTC2VXLzBFI04SYnMLZ5_MSPVi6rxyhSmAKPqsZeg0pVdIoBq-xxVBRyIVm_XJVaKur9s4YLZG6s_1IJndhOv4b8fbU4Q-O6pNhgstEk-enA"
              data-alt="A professional headshot of a corporate admin user, smiling subtly, wearing a crisp modern shirt. Light mode lighting, sharp focus, clean background fitting for a modern SaaS platform dashboard avatar."
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <h1 className=" text-primary text-2xl font-bold font-serif tracking-normal">
                Harry Ngoc
              </h1>
              <p className="text-muted-foreground text-sm">Admin</p>
            </div>
          </div>
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "text-accent-foreground",
                  "group flex flex-1 w-full items-center rounded-sm p-3 text-base font-medium",
                  isActive && "bg-white text-primary",
                )
              }
            >
              <item.icon className="mr-2" aria-hidden="true" />
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>
      <div className="flex flex-col sm:gap-4 sm:py-4 sm:pl-60">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between gap-4  border-b bg-background px-4 sm:static sm:h-auto sm:justify-end sm:border-0 sm:bg-transparent sm:px-6 ">
          {/*  ------------ Notification ------------  */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full font-mono"
              >
                <span className="sr-only">Open user menu</span>
                <Bell className="size-6 rounded-full" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>
                <div className="flex items-center justify-between w-full">
                  <h2 className="font-bold text-lg">Notifications</h2>
                  <Button variant="link">Mark all as read</Button>
                </div>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {notifications.map((notification) => (
                <DropdownMenuItem
                  key={notification.id}
                  className="flex items-center cursor-pointer p-5"
                >
                  <div
                    className={cn(
                      `p-2 rounded-full `,
                      colorMap[notification.type].text,
                      colorMap[notification.type].bg,
                      "mr-3",
                    )}
                  >
                    <notification.icon />
                  </div>

                  <div className="flex flex-col gap-1">
                    <h3 className="font-bold">{notification.title}</h3>
                    <span className="text-gray-500 text-sm">
                      {notification.message}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-bold",
                        colorMap[notification.type].text,
                      )}
                    >
                      {notification.status}
                    </span>
                  </div>
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center cursor-pointer">
                <Link
                  to="/"
                  className="text-primary hover:underline underline-offset-4"
                >
                  See all notifications
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
            {/*  ----------------------------------------------------*/}

            {/*  ------------ Profile ------------  */}
          </DropdownMenu>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full"
              >
                <span className="sr-only">Open user menu</span>
                <UserRound className="size-6 rounded-full" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Your Profile</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {/*  ----------------------------------------------------*/}
        </header>
        <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8">
          {children}
        </main>
      </div>
    </div>
  );
};
