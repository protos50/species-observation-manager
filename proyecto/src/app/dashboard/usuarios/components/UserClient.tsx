'use client'

import { useMemo, useState, useEffect, useCallback } from 'react'
import { Users } from 'lucide-react'

import type { user } from '@/types/user'
import type { Role } from '@/types/role'

import { CreateUserDialog } from '@/app/dashboard/usuarios/components/CreateUserDialog'
import { getColumns, getDeletedColumns } from './columns'
import { usersApi } from '@/lib/api/users'

import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import ResponsiveDataList from '@/components/ResponsiveDataList'

interface UserClientProps {
  users: user[]
  roles: Role[]
}

export function UserClient({ users: initialUsers, roles }: UserClientProps) {
  const [activeUsers, setActiveUsers] = useState<user[]>(initialUsers)
  const [deletedUsers, setDeletedUsers] = useState<user[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('activos')

  // Cargar usuarios dados de baja al inicio
  const loadDeletedUsers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await usersApi.getDeleted()
      setDeletedUsers(data)
    } catch {
      setError('Error al cargar usuarios dados de baja')
    } finally {
      setLoading(false)
    }
  }, [])

  // Recargar usuarios activos
  const loadActiveUsers = useCallback(async () => {
    try {
      const data = await usersApi.getAll()
      setActiveUsers(data)
    } catch {
      console.error('Error al recargar usuarios activos')
    }
  }, [])

  // Función para manejar acciones de usuario (eliminar/restaurar)
  const handleUserAction = useCallback(
    async (userId: number, firstName: string, lastName: string, action: 'delete' | 'restore') => {
      try {
        if (action === 'delete') {
          await usersApi.delete(userId.toString())
          // Remover de usuarios activos y agregar a eliminados
          const userToDelete = activeUsers.find((u) => u.user_id === userId)
          if (userToDelete) {
            setActiveUsers((prev) => prev.filter((u) => u.user_id !== userId))
            setDeletedUsers((prev) => [...prev, { ...userToDelete, deleted_at: new Date() }])
          }
        } else {
          await usersApi.restore(userId.toString())
          // Remover de usuarios eliminados y agregar a activos
          const userToRestore = deletedUsers.find((u) => u.user_id === userId)
          if (userToRestore) {
            setDeletedUsers((prev) => prev.filter((u) => u.user_id !== userId))
            setActiveUsers((prev) => [...prev, { ...userToRestore, deleted_at: undefined }])
          }
        }
      } catch (error) {
        console.error(`Error al ${action === 'delete' ? 'eliminar' : 'restaurar'} usuario:`, error)
        // En caso de error, recargar ambos listados para mantener consistencia
        await Promise.all([loadActiveUsers(), loadDeletedUsers()])
      }
    },
    [activeUsers, deletedUsers, loadActiveUsers, loadDeletedUsers],
  )

  // Función para manejar la creación de usuarios
  const handleUserCreated = useCallback(async (newUser: user) => {
    setActiveUsers((prev) => [...prev, newUser])
  }, [])

  const columns = useMemo(() => getColumns(roles, handleUserAction), [roles, handleUserAction])

  const deletedColumns = useMemo(() => getDeletedColumns(roles, handleUserAction), [roles, handleUserAction])

  const activosCount = activeUsers.length
  const bajaCount = deletedUsers.length

  // Cargar datos al montar el componente
  useEffect(() => {
    loadDeletedUsers()
  }, [loadDeletedUsers])

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <div className="rounded-full bg-primary/10 p-2">
            <Users className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
          </div>
          <h2 className="text-lg sm:text-xl font-semibold tracking-tight">Listado de usuarios</h2>
        </div>
        <CreateUserDialog onUserCreated={handleUserCreated} />
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-muted p-1 w-full sm:w-fit overflow-x-auto ">
          <TabsTrigger value="activos" className="text-sm sm:text-base whitespace-nowrap">
            Usuarios activos
            <Badge
              variant="secondary"
              className="bg-green-100 text-green-600 rounded-full px-1.5 sm:px-2 py-0.5 text-xs"
            >
              {activosCount}
            </Badge>
          </TabsTrigger>

          <TabsTrigger value="baja" className="text-sm sm:text-base whitespace-nowrap">
            Usuarios dados de baja
            <Badge variant="secondary" className="bg-red-100 text-red-600 rounded-full px-1.5 sm:px-2 py-0.5 text-xs">
              {bajaCount}
            </Badge>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="activos" className="mt-4">
          <ResponsiveDataList columns={columns} data={activeUsers} />
        </TabsContent>

        <TabsContent value="baja" className="mt-4">
          {loading ? (
            <div className="border rounded-md p-3 sm:p-4 text-muted-foreground text-sm sm:text-base">
              <p>Cargando usuarios dados de baja...</p>
            </div>
          ) : error ? (
            <div className="border rounded-md p-3 sm:p-4 text-red-600 text-sm sm:text-base">{error}</div>
          ) : deletedUsers.length === 0 ? (
            <div className="border rounded-md p-3 sm:p-4 text-muted-foreground text-sm sm:text-base">
              <p>No hay usuarios dados de baja</p>
            </div>
          ) : (
            <ResponsiveDataList columns={deletedColumns} data={deletedUsers} />
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
