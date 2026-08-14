'use client'

import { ColumnDef } from '@tanstack/react-table'
import { Role } from '@/types/role'
import { user } from '@/types/user'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Eye, Trash2, RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { formatDateTimeLocalFromUtc } from '@/lib/utils/dateUtils'

type HandleUserAction = (
  userId: number,
  firstName: string,
  lastName: string,
  action: 'delete' | 'restore',
) => Promise<void>

type HandleUserView = (user: user) => void

export function getColumns(
  roles: Role[],
  handleUserAction: HandleUserAction,
  onView?: HandleUserView,
): ColumnDef<user>[] {
  return [
    {
      accessorKey: 'first_name',
      header: 'Nombre',
      meta: { align: 'left' },
    },
    {
      accessorKey: 'last_name',
      header: 'Apellido',
      meta: { align: 'left' },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      meta: { align: 'left' },
    },
    {
      accessorKey: 'created_at',
      header: 'Creado en',
      meta: { align: 'center' },
      cell: ({ getValue }) => {
        const date = getValue() as string | null | undefined
        if (!date) return '-'
        return formatDateTimeLocalFromUtc(date)
      },
    },
    {
      accessorKey: 'role_id',
      header: 'Rol',
      meta: { align: 'center' },
      cell: ({ getValue }) => {
        const roleId = getValue() as number
        const role = roles.find((r) => r.role_id === roleId)
        return role ? (
          <Badge variant="secondary" className="font-medium">
            {role.name}
          </Badge>
        ) : (
          <span className="text-gray-400">Desconocido</span>
        )
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      meta: { align: 'center' },
      cell: ({ row }) => {
        const handleDelete = async () => {
          try {
            await handleUserAction(row.original.user_id, row.original.first_name, row.original.last_name, 'delete')
            toast.success(
              `El usuario ${row.original.first_name} ${row.original.last_name} fue dado de baja exitosamente`,
            )
          } catch {
            toast.error('Error al dar de baja el usuario')
          }
        }

        return (
          <div className="flex items-center justify-center gap-2">
            {onView && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onView(row.original)}
                className="cursor-pointer h-8 w-8 p-0"
              >
                <Eye className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDelete}
              className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 cursor-pointer"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )
      },
    },
  ]
}

export function getDeletedColumns(roles: Role[], handleUserAction: HandleUserAction): ColumnDef<user>[] {
  return [
    {
      accessorKey: 'first_name',
      header: 'Nombre',
      meta: { align: 'left' },
    },
    {
      accessorKey: 'last_name',
      header: 'Apellido',
      meta: { align: 'left' },
    },
    {
      accessorKey: 'email',
      header: 'Email',
      meta: { align: 'left' },
    },
    {
      accessorKey: 'created_at',
      header: 'Creado en',
      meta: { align: 'center' },
      cell: ({ getValue }) => {
        const date = getValue() as string | null | undefined
        if (!date) return '-'
        return formatDateTimeLocalFromUtc(date)
      },
    },
    {
      accessorKey: 'deleted_at',
      header: 'Fecha de baja',
      meta: { align: 'center' },
      cell: ({ getValue }) => {
        const date = getValue() as Date | string | null | undefined
        if (!date) return '-'
        return formatDateTimeLocalFromUtc(String(date))
      },
    },
    {
      accessorKey: 'role_id',
      header: 'Rol',
      meta: { align: 'center' },
      cell: ({ getValue }) => {
        const roleId = getValue() as number
        const role = roles.find((r) => r.role_id === roleId)
        return role ? (
          <Badge variant="secondary" className="font-medium">
            {role.name}
          </Badge>
        ) : (
          <span className="text-gray-400">Desconocido</span>
        )
      },
    },
    {
      id: 'actions',
      header: 'Acciones',
      meta: { align: 'center' },
      cell: ({ row }) => {
        const handleRestore = async () => {
          try {
            await handleUserAction(row.original.user_id, row.original.first_name, row.original.last_name, 'restore')
            toast.success(`El usuario ${row.original.first_name} ${row.original.last_name} fue restaurado exitosamente`)
          } catch {
            toast.error('Error al restaurar el usuario')
          }
        }

        return (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRestore}
            className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 cursor-pointer"
          >
            <RotateCcw className="h-4 w-4" />
            <span className="sr-only sm:not-sr-only ml-1 text-sm">Restaurar</span>
          </Button>
        )
      },
    },
  ]
}
