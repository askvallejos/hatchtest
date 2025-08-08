import * as React from "react"
import { X } from "lucide-react"
import { Button } from "./button"

interface DialogProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}

const Dialog = ({ isOpen, onClose, title, children }: DialogProps) => {
  const [isVisible, setIsVisible] = React.useState(false)
  const [isAnimating, setIsAnimating] = React.useState(true)

  React.useEffect(() => {
    if (isOpen) {
      setIsVisible(true)
      setIsAnimating(true)
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(false)
        })
      })
    } else {
      setIsAnimating(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
      }, 300)
      return () => clearTimeout(timer)
    }
  }, [isOpen])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-all duration-300 ease-out ${
          isAnimating ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={onClose}
      />
      
      <div className={`relative w-[90%] h-auto max-h-[90vh] overflow-hidden bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border border-white/30 dark:border-gray-700/30 shadow-2xl rounded-xs flex flex-col transition-all duration-300 ease-out ${
        isAnimating 
          ? 'opacity-0 scale-95 translate-y-4' 
          : 'opacity-100 scale-100 translate-y-0'
      }`}>
        <div className="flex items-center justify-between p-6 border-b border-gray-200/50 dark:border-gray-700/50 flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {title}
          </h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100/80 dark:hover:bg-gray-700/80 hover:scale-110 hover:drop-shadow-md transition-all duration-200 rounded-xs"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  )
}

export { Dialog } 