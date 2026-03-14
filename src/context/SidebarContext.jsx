import { createContext, useContext, useState, useEffect } from 'react'

const SidebarContext = createContext()

export function SidebarProvider({ children }) {
  const [toggled, setToggled] = useState(false)

  const toggleSidebar = () => setToggled(prev => !prev)

  useEffect(() => {
    if (toggled) {
      document.body.classList.add('sidebar-toggled')
    } else {
      document.body.classList.remove('sidebar-toggled')
    }
    return () => document.body.classList.remove('sidebar-toggled')
  }, [toggled])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setToggled(false)
      }
    }
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <SidebarContext.Provider value={{ toggled, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  )
}

export const useSidebar = () => useContext(SidebarContext)
