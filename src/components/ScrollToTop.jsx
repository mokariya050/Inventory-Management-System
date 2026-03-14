import { useState, useEffect } from 'react'

export default function ScrollToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const handleScroll = () => setVisible(window.pageYOffset > 100)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <a
      className="border rounded d-inline scroll-to-top"
      href="#page-top"
      style={{ display: visible ? 'block' : 'none' }}
    >
      <i className="fas fa-angle-up"></i>
    </a>
  )
}
