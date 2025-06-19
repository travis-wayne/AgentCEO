import { UserRole } from "@prisma/client";

import { SidebarNavItem } from "types";

export const sidebarLinks: SidebarNavItem[] = [
  {
    title: "MENU",
    items: [
      {
        href: "/admin",
        icon: "dashboard",
        title: "Dashboard",
        authorizeOnly: UserRole.ADMIN,
      },
    ],
  }, {
    title: "TOOLS",
    items: [
      { href: "/dashboard", icon: "laptop", title: "Content Hub" },
      {
        title: "Workflows",
        href: "/dashboard/workflows",
        icon: "package",
      },
      {
        title: "Lead Management",
        href: "/dashboard/leads",
        icon: "user",
      },
      {
        title: "Web Scraper",
        href: "/dashboard/scraper",
        icon: "search",
        authorizeOnly: UserRole.ADMIN,
      },
      {
        title: "Reports",
        href: "/dashboard/reports",
        badge: 2,
        icon: "lineChart",
      },
      {
        href: "/admin/posts",
        icon: "post",
        title: "User Posts",
        authorizeOnly: UserRole.ADMIN,
      },
      
    ],
  },
  {
    title: "OPTIONS",
    items: [
      { href: "/dashboard/settings", icon: "settings", title: "Settings" },
      {
        href: "/dashboard/billing",
        icon: "billing",
        title: "Billing",
      },
      {
        href: "#",
        icon: "messages",
        title: "Support",
      },
    ],
  },
];
