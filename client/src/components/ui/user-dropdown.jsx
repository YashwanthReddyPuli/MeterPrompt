import React from "react";
import { Icon } from "@iconify/react";
import { Avatar, AvatarImage, AvatarFallback } from "./avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./dropdown-menu";

const getMenuItems = (role) => {
  if (role === "admin") {
    return {
      quicklinks: [
        { icon: "solar:chart-square-line-duotone", label: "Revenue & Churn (MRR)", action: "admin-overview" },
        { icon: "solar:users-group-rounded-line-duotone", label: "User Directory", action: "admin-users" },
        { icon: "solar:layers-line-duotone", label: "Manage Plans (CRUD)", action: "admin-plans" },
        { icon: "solar:tag-price-line-duotone", label: "Promotions & Coupons", action: "admin-coupons" }
      ],
      support: [
        { icon: "solar:refresh-circle-line-duotone", label: "Dunning Retries", action: "admin-dunning" },
        { icon: "solar:letter-unread-line-duotone", label: "Billing Events", action: "admin-events" }
      ],
      account: [
        { icon: "solar:logout-2-bold-duotone", label: "Sign Out", action: "logout" }
      ]
    };
  }

  // Developer (Customer) Menu
  return {
    quicklinks: [
      { icon: "solar:code-circle-line-duotone", label: "Developer Console", action: "overview" },
      { icon: "solar:key-minimalistic-line-duotone", label: "API Keys & Secrets", action: "keys" },
      { icon: "solar:card-line-duotone", label: "Credits & Billing", action: "credits" }
    ],
    support: [
      { icon: "solar:document-text-line-duotone", label: "Gateway Documentation", action: "docs" }
    ],
    account: [
      { icon: "solar:logout-2-bold-duotone", label: "Sign Out", action: "logout" }
    ]
  };
};

export function UserDropdown({ user, onAction }) {
  const role = user?.role || "customer";
  const items = getMenuItems(role);

  const displayName = user?.name || "Developer User";
  const displayEmail = user?.email || "user@meterprompt.io";
  const initials = user?.name
    ? user.name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
    : "U";

  const avatarUrl = user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(displayName)}`;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 rounded-full p-1 hover:bg-zinc-100 transition-colors outline-none cursor-pointer group">
          <Avatar className="h-8 w-8 ring-2 ring-[#5865f2]/20 group-hover:ring-[#5865f2]/40 transition-all">
            <AvatarImage src={avatarUrl} alt={displayName} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="hidden sm:flex flex-col items-start text-left pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-zinc-900 leading-none">{displayName}</span>
              {role === "admin" ? (
                <span className="bg-[#5865f2] text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider">
                  ADMIN
                </span>
              ) : (
                <span className="bg-zinc-100 text-zinc-600 text-[9px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider border border-zinc-200">
                  DEV
                </span>
              )}
            </div>
            <span className="text-[10px] text-zinc-500 font-mono mt-0.5 max-w-[120px] truncate">{displayEmail}</span>
          </div>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-60">
        {/* Header User Profile Info */}
        <div className="p-2.5 bg-zinc-50 rounded-xl mb-1 border border-zinc-100">
          <p className="text-xs font-extrabold text-zinc-900 truncate">{displayName}</p>
          <p className="text-[10px] text-zinc-500 font-mono truncate">{displayEmail}</p>
          <div className="mt-1.5 flex items-center justify-between">
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Role Permissions</span>
            <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded ${role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-emerald-100 text-emerald-700'}`}>
              {role === 'admin' ? 'Administrative Control' : 'Developer Access'}
            </span>
          </div>
        </div>

        {/* Quicklinks Section */}
        <DropdownMenuLabel>Quicklinks</DropdownMenuLabel>
        <DropdownMenuGroup>
          {items.quicklinks.map((item) => (
            <DropdownMenuItem key={item.action} onClick={() => onAction && onAction(item.action)}>
              <Icon icon={item.icon} className="mr-2.5 h-4 w-4 text-[#5865f2]" />
              <span>{item.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Support Section */}
        <DropdownMenuLabel>System Controls</DropdownMenuLabel>
        <DropdownMenuGroup>
          {items.support.map((item) => (
            <DropdownMenuItem key={item.action} onClick={() => onAction && onAction(item.action)}>
              <Icon icon={item.icon} className="mr-2.5 h-4 w-4 text-zinc-500" />
              <span>{item.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>

        <DropdownMenuSeparator />

        {/* Account Section */}
        <DropdownMenuGroup>
          {items.account.map((item) => (
            <DropdownMenuItem 
              key={item.action} 
              onClick={() => onAction && onAction(item.action)}
              className="text-rose-600 focus:text-rose-700 focus:bg-rose-50"
            >
              <Icon icon={item.icon} className="mr-2.5 h-4 w-4 text-rose-500" />
              <span>{item.label}</span>
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
