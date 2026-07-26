import { createFileRoute, Outlet } from "@tanstack/react-router"

import { MainLayout } from "@/components/layouts/mainlayout"

export const Route = createFileRoute("/_main")({
  component: RouteComponent
})

/*
 * ==========================================
 * Internal components
 * ==========================================
 */

function RouteComponent() {
  return (
    <MainLayout>
      <Outlet />
    </MainLayout>
  )
}
