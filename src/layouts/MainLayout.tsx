import { Outlet } from 'react-router-dom'
import { cn } from '@/lib/utils'
import Sidebar from '@/components/Sidebar'
import NavBar from '@/components/NavBar'

export default function MainLayout() {
  return (
    <div className={cn('flex h-screen bg-slate-50 overflow-hidden')}>
      <NavBar />
      <Sidebar />
      <main className="flex-1 overflow-y-auto pt-14 ml-64">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
