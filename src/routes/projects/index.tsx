import { createFileRoute, Link } from '@tanstack/react-router'
import { Plus } from 'lucide-react'

export const Route = createFileRoute('/projects/')({
  component: RouteComponent,
})

interface Project {
  id: string
  title: string
  thumbnailCount: number
}

const MOCK_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Summer Vacation',
    thumbnailCount: 6,
  },
  {
    id: '2',
    title: 'Product Demo',
    thumbnailCount: 6,
  },
]

function RouteComponent() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-blue-600 mb-8">Projects</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {MOCK_PROJECTS.map((project) => (
          <Link
            key={project.id}
            to="/projects/$id"
            params={{ id: project.id }}
            className="group block border-2 border-black rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white"
          >
            <div className="aspect-square p-4 flex flex-col">
              {/* Thumbnails Grid */}
              <div className="flex-1 grid grid-cols-3 grid-rows-2 gap-2 mb-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="bg-gray-100 border border-gray-200 rounded-sm"
                  />
                ))}
              </div>
              
              {/* Title */}
              <div className="font-bold text-lg truncate">{project.title}</div>
            </div>
          </Link>
        ))}

        {/* Add New Project Card */}
        <button className="group border-2 border-black rounded-lg overflow-hidden hover:shadow-lg transition-shadow bg-white aspect-square flex items-center justify-center cursor-pointer">
          <Plus className="w-12 h-12 text-blue-600 group-hover:scale-110 transition-transform" />
        </button>
      </div>
    </div>
  )
}
