import { SidebarNavItem, SiteConfig } from "types";
import { env } from "@/env.mjs";

const site_url = env.NEXT_PUBLIC_APP_URL;

export const siteConfig: SiteConfig = {
  name: "Agent CEO",
  author: "Agent CEO Team",
  description:
    "Transform your business with AI-powered automation, content creation, and intelligent decision-making tools. The ultimate business automation platform.",
  keywords: [
    "AI automation",
    "business intelligence",
    "content creation",
    "workflow automation",
    "n8n",
    "artificial intelligence",
    "business optimization",
    "lead management",
    "social media automation",
    "web scraping",
  ],
  url: {
    base: env.NEXT_PUBLIC_APP_URL,
    author: "https://n8ndevcloud.site",
  },
  links: {
    twitter: "https://twitter.com/miickasmt",
    github: "https://github.com/agent-ceo/interface", // You can create a new repo for your frontend
  },
  ogImage: `${env.NEXT_PUBLIC_APP_URL}/og.jpg`,

};

export const footerLinks: SidebarNavItem[] = [
  {
    title: "Company",
    items: [
      { title: "About", href: "#" },
      { title: "Enterprise", href: "#" },
      { title: "Terms", href: "/terms" },
      { title: "Privacy", href: "/privacy" },
    ],
  },
  {
    title: "Product",
    items: [
      { title: "Security", href: "#" },
      { title: "Customization", href: "#" },
      { title: "Customers", href: "#" },
      { title: "Changelog", href: "#" },
    ],
  },
  {
    title: "Docs",
    items: [
      { title: "Introduction", href: "#" },
      { title: "Installation", href: "#" },
      { title: "Components", href: "#" },
      { title: "Code Blocks", href: "#" },
    ],
  },
];
