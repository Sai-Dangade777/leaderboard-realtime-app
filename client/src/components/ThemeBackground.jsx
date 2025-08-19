// Helper component for creating confetti-style sparkle background
import { useEffect, useRef } from 'react'

// Animation lasts 20s, fairly subtle
export default function ThemeBackground({ theme = 'gold', density = 20 }) {
  const canvasRef = useRef(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    const ctx = canvas.getContext('2d')
    const width = canvas.width = canvas.offsetWidth
    const height = canvas.height = canvas.offsetHeight
    
    // Theme colors
    const themeColors = {
      gold: ['#fff8e1', '#ffe082', '#ffd54f', '#ffca28', '#ffc107'],
      purple: ['#f3e5f5', '#e1bee7', '#ce93d8', '#ba68c8', '#ab47bc'],
      orange: ['#fff3e0', '#ffe0b2', '#ffcc80', '#ffb74d', '#ffa726']
    };
    
    const colors = themeColors[theme] || themeColors.gold;
    
    // Generate particles with random properties
    const particles = Array.from({ length: density }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 4 + 2,
      speedX: Math.random() * 1 - 0.5,
      speedY: Math.random() * 1 - 0.5,
      opacity: Math.random() * 0.5 + 0.1,
      color: colors[Math.floor(Math.random() * colors.length)]
    }))
    
    // Shapes for variety: square, circle, triangle
    const shapes = ['square', 'circle', 'triangle']
    
    const animate = () => {
      ctx.clearRect(0, 0, width, height)
      
      particles.forEach((p, i) => {
        const shape = shapes[i % shapes.length]
        ctx.fillStyle = p.color
        ctx.globalAlpha = p.opacity
        
        // Draw different shapes
        if (shape === 'square') {
          ctx.fillRect(p.x, p.y, p.size, p.size)
        } else if (shape === 'circle') {
          ctx.beginPath()
          ctx.arc(p.x, p.y, p.size / 2, 0, Math.PI * 2)
          ctx.fill()
        } else { // triangle
          ctx.beginPath()
          ctx.moveTo(p.x, p.y)
          ctx.lineTo(p.x + p.size, p.y + p.size)
          ctx.lineTo(p.x - p.size, p.y + p.size)
          ctx.closePath()
          ctx.fill()
        }
        
        // Update position with subtle animation
        p.x += p.speedX
        p.y += p.speedY
        
        // Loop the particles at the edges
        if (p.x < -p.size) p.x = width + p.size
        if (p.x > width + p.size) p.x = -p.size
        if (p.y < -p.size) p.y = height + p.size
        if (p.y > height + p.size) p.y = -p.size
      })
      
      animationId = requestAnimationFrame(animate)
    }
    
    let animationId = requestAnimationFrame(animate)
    return () => cancelAnimationFrame(animationId)
  }, [theme, density])

  return (
    <canvas 
      ref={canvasRef} 
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        pointerEvents: 'none',
        zIndex: 0,
        opacity: 0.5
      }}
    />
  )
}
