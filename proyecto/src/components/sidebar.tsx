"use client";
import {
  ArrowDownToLine,
  TelescopeIcon as Binoculars,
  Home,
  Users,
  LogOut,
  PanelLeft,
  FlaskConicalIcon,
  PawPrint,
  MapIcon,
  MapPin,
  Map,
  CloudSun,
  Layers,
  GitBranch,
  ChevronDown,
  Triangle,
  Inbox,
  Wrench,
  Bug,
  BookOpen,
  PlusIcon,
  Leaf,
  UserPlus2Icon,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import React, {
  useEffect,
  useState,
  useMemo,
  useCallback,
  startTransition,
} from "react";
import { useRoleAuth } from "@/hooks/use-role-auth";
import { ROLE_IDS } from "@/lib/constants/roles";
import { contactApi } from "@/lib/api/contact";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarSeparator,
  SidebarRail,
  SidebarFooter,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const observacionesItem = {
  title: "Observaciones",
  icon: Binoculars,
  subItems: [
    {
      title: "Gestión de observaciones",
      url: "/dashboard/observaciones",
      icon: PlusIcon,
    },
    {
      title: "Métodos de preservación",
      url: "/dashboard/metodos-preservacion",
      icon: FlaskConicalIcon,
    },
    { title: "Trampas", url: "/dashboard/trampas", icon: PawPrint },
    { title: "Castas", url: "/dashboard/castas", icon: Bug },
    {
      title: "Identificadores/Colectores",
      url: "/dashboard/personas",
      icon: UserPlus2Icon,
    },
  ],
};

const taxonomiaItem = {
  title: "Taxonomía",
  icon: Triangle,
  subItems: [
    { title: "Taxones", url: "/dashboard/taxones", icon: GitBranch },
    {
      title: "Niveles Taxonómicos",
      url: "/dashboard/niveles-taxonomicos",
      icon: Layers,
    },
    { title: "Autores Científicos", url: "/dashboard/autores", icon: BookOpen },
  ],
};

const ubicacionItem = {
  title: "Ubicación",
  icon: MapIcon,
  subItems: [
    { title: "Gestión de Ubicaciones", url: "/dashboard/ubicacion", icon: Map },
    {
      title: "Geolocalizaciones",
      url: "/dashboard/geolocalizacion",
      icon: MapPin,
    },
    { title: "Ambientes", url: "/dashboard/ambientes", icon: Leaf },
    {
      title: "Datos Climáticos",
      url: "/dashboard/datos-climaticos",
      icon: CloudSun,
    },
  ],
};

const inicioItem = { title: "Inicio", url: "/dashboard", icon: Home };

const items = [
  { title: "Reportes", url: "/dashboard/reportes", icon: ArrowDownToLine },
  {
    title: "Usuarios",
    url: "/dashboard/usuarios",
    icon: Users,
    requiredRoles: [ROLE_IDS.ADMIN],
  },
  {
    // Bandeja interna de consultas: el backend la restringe a ADMIN
    // (ContactController lleva @Roles(Role.ADMIN)). El formulario publico
    // de la landing sigue abierto porque su endpoint es @Public().
    title: "Contacto",
    url: "/dashboard/contacto",
    icon: Inbox,
    requiredRoles: [ROLE_IDS.ADMIN],
  },
  {
    title: "Servicios",
    url: "/dashboard/servicios",
    icon: Wrench,
    requiredRoles: [ROLE_IDS.ADMIN],
  },
];

/* ---------- hook para unread count (separado) ---------- */
function useUnreadCount() {
  const pathname = usePathname();
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    let mounted = true;

    // Solo actualizar si estamos en una ruta del dashboard
    if (!pathname.startsWith("/dashboard")) {
      return;
    }

    const fetchUnreadCount = async () => {
      if (!mounted) return;
      try {
        const messages = await contactApi.contact.getAll();
        if (!mounted) return;
        const unreadCount = messages.filter((m) => m.status === false).length;
        setCount(unreadCount);
      } catch (err) {
        if (!mounted) return;
        if (err instanceof Error && err.name !== "AbortError") {
          console.error("Error fetching unread count:", err);
        }
      }
    };

    fetchUnreadCount();

    return () => {
      mounted = false;
    };
  }, [pathname]);

  return count;
}

/* ---------- componente memoizado para una sección colapsable ---------- */
type CollapsibleSectionProps = {
  item: typeof observacionesItem;
  isCollapsed: boolean;
  isPathActive: boolean;
  activeUrls: Set<string>; // Set de URLs activas en lugar de función
};

// Componente memoizado para subitems del dropdown (colapsado)
const DropdownSubItem = React.memo(function DropdownSubItem({
  subItem,
  isActive,
}: {
  subItem: {
    title: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
  };
  isActive: boolean;
}) {
  return (
    <DropdownMenuItem key={subItem.title} asChild>
      <Link
        href={subItem.url}
        className={`flex items-center gap-2 px-2 py-1.5 text-xs md:text-sm cursor-pointer w-full ${
          isActive ? "bg-accent text-accent-foreground" : ""
        }`}
      >
        <subItem.icon className="h-4 w-4" />
        <span className="text-xs md:text-sm">{subItem.title}</span>
      </Link>
    </DropdownMenuItem>
  );
});

// Componente memoizado para subitems del collapsible (expandido)
const CollapsibleSubItem = React.memo(function CollapsibleSubItem({
  subItem,
  isActive,
}: {
  subItem: {
    title: string;
    url: string;
    icon: React.ComponentType<{ className?: string }>;
  };
  isActive: boolean;
}) {
  return (
    <SidebarMenuSubItem key={subItem.title}>
      <SidebarMenuSubButton asChild isActive={isActive}>
        <Link href={subItem.url}>
          <subItem.icon className="h-4 w-4" />
          <span className="text-xs md:text-sm">{subItem.title}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
});

const CollapsibleSection = React.memo(
  function CollapsibleSection({
    item,
    isCollapsed,
    isPathActive,
    activeUrls,
  }: CollapsibleSectionProps) {
    // Inicializar estado solo una vez, luego sincronizar solo cuando sea necesario
    const [open, setOpen] = useState<boolean>(() => isPathActive);
    const prevIsPathActiveRef = React.useRef(isPathActive);

    // Sincronizar estado solo cuando isPathActive cambie realmente
    useEffect(() => {
      // Solo actualizar si isPathActive cambió y es diferente al estado actual
      if (
        prevIsPathActiveRef.current !== isPathActive &&
        isPathActive !== open
      ) {
        prevIsPathActiveRef.current = isPathActive;
        // Usar startTransition para que la actualización no bloquee el render
        startTransition(() => {
          setOpen(isPathActive);
        });
      } else if (prevIsPathActiveRef.current !== isPathActive) {
        // Actualizar la referencia incluso si no cambiamos el estado
        prevIsPathActiveRef.current = isPathActive;
      }
    }, [isPathActive, open]);

    // Renderizado condicional optimizado: solo renderizar la versión necesaria
    if (isCollapsed) {
      return (
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                tooltip={item.title}
                className="w-full cursor-pointer"
              >
                <item.icon />
                <span className="flex-1 text-left text-xs md:text-sm">
                  {item.title}
                </span>
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              side="right"
              align="start"
              className="w-56 ml-2"
              sideOffset={8}
            >
              {item.subItems.map((subItem) => (
                <DropdownSubItem
                  key={subItem.title}
                  subItem={subItem}
                  isActive={activeUrls.has(subItem.url)}
                />
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      );
    }

    return (
      <SidebarMenuItem>
        <Collapsible
          id={`${item.title}-collapsible`}
          open={open}
          onOpenChange={setOpen}
          className="w-full"
        >
          <CollapsibleTrigger asChild>
            <SidebarMenuButton className="w-full">
              <item.icon />
              <span className="text-left cursor-pointer text-xs md:text-sm">
                {item.title}
              </span>
              <ChevronDown
                className={`h-4 w-4 -ml-4 transition-transform duration-200 ${
                  open ? "rotate-180" : ""
                }`}
              />
            </SidebarMenuButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {item.subItems.map((subItem) => (
                <CollapsibleSubItem
                  key={subItem.title}
                  subItem={subItem}
                  isActive={activeUrls.has(subItem.url)}
                />
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuItem>
    );
  },
  (prev, next) => {
    // Comparación mejorada: verificar todos los valores relevantes
    if (prev.isCollapsed !== next.isCollapsed) return false;
    if (prev.isPathActive !== next.isPathActive) return false;
    // Comparar Sets de URLs activas
    if (prev.activeUrls.size !== next.activeUrls.size) return false;
    for (const url of prev.activeUrls) {
      if (!next.activeUrls.has(url)) return false;
    }
    return true;
  }
);

/* ---------- componente principal ---------- */
export function AppSidebar() {
  const pathname = usePathname();
  const { filterByRole } = useRoleAuth();
  const { toggleSidebar, state } = useSidebar();
  const isCollapsed = state === "collapsed";

  const unreadCount = useUnreadCount();

  // derivar booleans mínimos que necesita cada collapsible (evita pasar pathname entero)
  const isObservacionesPathActive = useMemo(
    () =>
      pathname.startsWith("/dashboard/observaciones") ||
      pathname.startsWith("/dashboard/metodos-preservacion") ||
      pathname.startsWith("/dashboard/trampas") ||
      pathname.startsWith("/dashboard/castas"),
    [pathname]
  );

  const isTaxonomiaPathActive = useMemo(
    () =>
      pathname.startsWith("/dashboard/taxones") ||
      pathname.startsWith("/dashboard/niveles-taxonomicos") ||
      pathname.startsWith("/dashboard/autores"),
    [pathname]
  );

  const isUbicacionPathActive = useMemo(
    () =>
      pathname.startsWith("/dashboard/ubicacion") ||
      pathname.startsWith("/dashboard/geolocalizacion") ||
      pathname.startsWith("/dashboard/ambientes") ||
      pathname.startsWith("/dashboard/datos-climaticos"),
    [pathname]
  );

  // Crear Set de URLs activas para comparación eficiente
  const activeUrls = useMemo(() => {
    const urls = new Set<string>();
    // Agregar todas las URLs de observaciones si alguna está activa
    if (isObservacionesPathActive) {
      observacionesItem.subItems.forEach((subItem) => {
        if (pathname.startsWith(subItem.url)) {
          urls.add(subItem.url);
        }
      });
    }
    // Agregar todas las URLs de taxonomía si alguna está activa
    if (isTaxonomiaPathActive) {
      taxonomiaItem.subItems.forEach((subItem) => {
        if (pathname.startsWith(subItem.url)) {
          urls.add(subItem.url);
        }
      });
    }
    // Agregar todas las URLs de ubicación si alguna está activa
    if (isUbicacionPathActive) {
      ubicacionItem.subItems.forEach((subItem) => {
        if (pathname.startsWith(subItem.url)) {
          urls.add(subItem.url);
        }
      });
    }
    // Agregar otras URLs activas
    items.forEach((item) => {
      if (
        pathname === item.url ||
        (item.url !== "/dashboard" && pathname.startsWith(item.url))
      ) {
        urls.add(item.url);
      }
    });
    // Agregar pathname exacto
    urls.add(pathname);
    return urls;
  }, [
    pathname,
    isObservacionesPathActive,
    isTaxonomiaPathActive,
    isUbicacionPathActive,
  ]);

  const isActive = useCallback(
    (url: string) =>
      activeUrls.has(url) ||
      (pathname.startsWith(url) && (url !== "/dashboard" || pathname === url)),
    [pathname, activeUrls]
  );

  const handleLogout = useCallback(async () => {
    sessionStorage.clear();
    localStorage.clear();
    document.cookie.split(";").forEach((cookie) => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      if (name) {
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
      }
    });
    await signOut({ redirect: false });
    window.location.href = "/";
  }, []);

  const filteredItems = useMemo(() => filterByRole(items), [filterByRole]);

  // Optimizar el toggle del sidebar con startTransition
  const handleToggleSidebar = useCallback(() => {
    startTransition(() => {
      toggleSidebar();
    });
  }, [toggleSidebar]);

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="pt-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={handleToggleSidebar}
                  tooltip="Contraer/Expandir"
                  className="cursor-pointer hidden md:flex"
                >
                  <PanelLeft
                    className="h-5 w-5 transition-transform duration-300"
                    style={{
                      transform:
                        state === "collapsed"
                          ? "rotate(180deg)"
                          : "rotate(0deg)",
                    }}
                  />
                  <span className="text-xs md:text-sm">Contraer menú</span>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarSeparator className="my-2 hidden md:block" />

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  tooltip={inicioItem.title}
                  isActive={pathname === inicioItem.url}
                >
                  <Link href={inicioItem.url}>
                    <inicioItem.icon />
                    <span className="text-xs md:text-sm">
                      {inicioItem.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              {/* Secciones memoizadas */}
              <CollapsibleSection
                item={observacionesItem}
                isCollapsed={isCollapsed}
                isPathActive={isObservacionesPathActive}
                activeUrls={activeUrls}
              />
              <CollapsibleSection
                item={taxonomiaItem}
                isCollapsed={isCollapsed}
                isPathActive={isTaxonomiaPathActive}
                activeUrls={activeUrls}
              />
              <CollapsibleSection
                item={ubicacionItem}
                isCollapsed={isCollapsed}
                isPathActive={isUbicacionPathActive}
                activeUrls={activeUrls}
              />

              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton
                    asChild
                    tooltip={item.title}
                    isActive={
                      item.url === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname === item.url
                    }
                  >
                    <Link href={item.url}>
                      {item.title === "Contacto" ? (
                        <div className="relative">
                          <item.icon className="h-5 w-5" />
                          {unreadCount > 0 && (
                            <span
                              aria-label={`${unreadCount} mensajes sin leer`}
                              className={
                                isCollapsed
                                  ? "absolute -top-0.5 -right-0.5 h-3 min-w-3 px-0.5 rounded-full bg-red-600 text-[9px] leading-3 text-white flex items-center justify-center"
                                  : "absolute -top-1 -right-1 h-4 min-w-4 px-1 rounded-full bg-red-600 text-[10px] leading-4 text-white flex items-center justify-center"
                              }
                            >
                              {unreadCount > 10 ? "10+" : unreadCount}
                            </span>
                          )}
                        </div>
                      ) : (
                        <item.icon />
                      )}
                      <span className="text-xs md:text-sm">{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarSeparator />
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              onClick={handleLogout}
              tooltip="Cerrar Sesión"
              className="cursor-pointer text-red-800 hover:text-red-800"
            >
              <LogOut className="h-5 w-5" />
              <span className="text-xs md:text-sm">Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail className="z-20" />
    </Sidebar>
  );
}
