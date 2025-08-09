"use client";

import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import { LayoutDashboard, Siren, ClipboardList, BookOpenCheck, Activity, Car, Boxes, CalendarDays, HardHat } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function SidebarDemo({ children }: { children: React.ReactNode }) {
  const links = [
    {
      label: "Dashboard",
      href: "/dashboard",
      icon: (
        <LayoutDashboard className="text-coal-black h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Ocorrências",
      href: "#",
      icon: (
        <Siren className="text-coal-black h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Atividades Acessórias",
      href: "#",
      icon: (
        <ClipboardList className="text-coal-black h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Programa de treinamento",
      href: "#",
      icon: (
        <BookOpenCheck className="text-coal-black h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Exercícios",
      href: "#",
      icon: (
        <Activity className="text-coal-black h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Viaturas",
      href: "#",
      icon: (
        <Car className="text-coal-black h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Controle de estoque",
      href: "#",
      icon: (
        <Boxes className="text-coal-black h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Escalas",
      href: "#",
      icon: (
        <CalendarDays className="text-coal-black h-5 w-5 flex-shrink-0" />
      ),
    },
    {
      label: "Epi/Uniformes",
      href: "#",
      icon: (
        <HardHat className="text-coal-black h-5 w-5 flex-shrink-0" />
      ),
    },
  ];
  
  const [open, setOpen] = useState(false);
  
  return (
    <div className="flex flex-col md:flex-row bg-white w-full flex-1 overflow-hidden h-screen">
      <Sidebar open={open} setOpen={setOpen}>
        <SidebarBody className="justify-between gap-10">
          <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
            {open ? <Logo /> : <LogoIcon />}
            <div className="mt-8 flex flex-col gap-2 justify-center flex-1">
               {links.map((link, idx) => (
                 <SidebarLink key={idx} link={link} />
               ))}
            </div>
          </div>
          <div>
          </div>
        </SidebarBody>
      </Sidebar>
      <div className="flex flex-1 flex-col overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export const Logo = () => {
  return (
    <Link
      href="/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-coal-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-radiant-orange rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-coal-black whitespace-pre font-geist-sans"
      >
        SCI-Core
      </motion.span>
    </Link>
  );
};

export const LogoIcon = () => {
  return (
    <Link
      href="/dashboard"
      className="font-normal flex space-x-2 items-center text-sm text-coal-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-radiant-orange rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};