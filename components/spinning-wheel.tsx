"use client"

import { useEffect, useRef, useState } from "react"

interface SpinningWheelProps {
  entries: string[]
  colors: string[]
  isSpinning: boolean
  onSpin: () => void
  backgroundImage?: string | null
  winner: string | null
  onWinnerClose: () => void
}

export function SpinningWheel({
  entries,
  colors,
  isSpinning,
  onSpin,
  backgroundImage,
  winner,
  onWinnerClose,
}: SpinningWheelProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [rotation, setRotation] = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showWinnerOverlay, setShowWinnerOverlay] = useState(false)
  const [backgroundImg, setBackgroundImg] = useState<HTMLImageElement | null>(null)

  // Preload background image
  useEffect(() => {
    if (backgroundImage) {
      const img = new window.Image()
      img.onload = () => setBackgroundImg(img)
      img.crossOrigin = "anonymous"
      img.src = backgroundImage
    } else {
      setBackgroundImg(null)
    }
  }, [backgroundImage])

  // Reset rotation when entries change
  useEffect(() => {
    setRotation(0)
  }, [entries])

  useEffect(() => {
    if (isSpinning) {
      setIsFullscreen(true)
      // Animate rotation with dramatic deceleration
      const startRotation = rotation
      const spinAmount = 1800 + Math.random() * 1800 // 5-10 full rotations
      const finalRotation = startRotation + spinAmount

      const startTime = Date.now()
      const duration = 4000 + Math.random() * 2000 // 4-6 seconds

      const animate = () => {
        const elapsed = Date.now() - startTime
        const progress = Math.min(elapsed / duration, 1)

        // Dramatic easing function - starts very fast, ends very slow
        const easeOut = 1 - Math.pow(1 - progress, 4) // More dramatic curve
        const currentRotation = startRotation + spinAmount * easeOut

        setRotation(currentRotation)

        if (progress < 1) {
          requestAnimationFrame(animate)
        } else {
          // Show winner overlay after spin completes
          setTimeout(() => {
            setShowWinnerOverlay(true)
          }, 500)
        }
      }

      requestAnimationFrame(animate)
    }
  }, [isSpinning])

  // Handle winner close - zoom out and return to normal view
  const handleWinnerClose = () => {
    setShowWinnerOverlay(false)
    setTimeout(() => {
      setIsFullscreen(false)
      onWinnerClose()
    }, 300)
  }

  // Redraw canvas when relevant state changes
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const size = isFullscreen ? Math.min(window.innerWidth, window.innerHeight) * 0.95 : 340
    canvas.width = size
    canvas.height = size

    const centerX = size / 2
    const centerY = size / 2
    const radius = size / 2 - 8

    ctx.clearRect(0, 0, size, size)

    drawWheel()

    function drawWheel() {
      if (!ctx) return
      const anglePerSegment = (2 * Math.PI) / entries.length
      ctx.save()
      ctx.translate(centerX, centerY)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.translate(-centerX, -centerY)
      if (backgroundImg) {
        ctx.save()
        ctx.beginPath()
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI)
        ctx.clip()
        ctx.drawImage(backgroundImg, centerX - radius, centerY - radius, radius * 2, radius * 2)
        ctx.restore()
      }
      entries.forEach((entry, index) => {
        const startAngle = index * anglePerSegment
        const endAngle = (index + 1) * anglePerSegment
        ctx.beginPath()
        ctx.moveTo(centerX, centerY)
        ctx.arc(centerX, centerY, radius, startAngle, endAngle)
        ctx.closePath()
        if (!backgroundImg) {
          ctx.fillStyle = colors[index]
          ctx.fill()
        }
        ctx.strokeStyle = "#ffffff"
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.save()
        ctx.translate(centerX, centerY)
        ctx.rotate(startAngle + anglePerSegment / 2)
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillStyle = "#ffffff"
        ctx.font = `600 ${Math.max(14, size / 22)}px -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif`
        ctx.shadowColor = "rgba(0,0,0,0.5)"
        ctx.shadowBlur = 2
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 1
        ctx.fillText(entry, radius * 0.72, 0)
        ctx.restore()
      })
      ctx.restore()
      ctx.beginPath()
      ctx.arc(centerX, centerY, 6, 0, 2 * Math.PI)
      ctx.fillStyle = "#ffffff"
      ctx.fill()
      ctx.strokeStyle = "#007AFF"
      ctx.lineWidth = 1.5
      ctx.stroke()
      ctx.beginPath()
      ctx.moveTo(centerX + radius - 4, centerY)
      ctx.lineTo(centerX + radius - 20, centerY - 12)
      ctx.lineTo(centerX + radius - 20, centerY + 12)
      ctx.closePath()
      ctx.fillStyle = "#1d1d1f"
      ctx.fill()
      ctx.strokeStyle = "#ffffff"
      ctx.lineWidth = 1.5
      ctx.stroke()
    }
  }, [entries, colors, rotation, isFullscreen, backgroundImg])

  const handleClick = () => {
    if (!isSpinning && !showWinnerOverlay) {
      onSpin()
    }
  }

  return (
    <>
      <div className="relative">
        <canvas
          key={`wheel-${entries.length}-${entries.join('-')}-${backgroundImage ? 'img' : 'color'}`}
          ref={canvasRef}
          onClick={handleClick}
          className={`cursor-pointer transition-all duration-300 ease-out rounded-full shadow-lg touch-manipulation ${
            isFullscreen ? "hidden" : "hover:scale-105 hover:shadow-xl active:scale-95"
          }`}
          style={{
            maxWidth: "100%",
            height: "auto",
            WebkitTapHighlightColor: "transparent",
            WebkitTouchCallout: "none",
            WebkitUserSelect: "none",
            userSelect: "none",
          }}
        />
      </div>

      {/* Fullscreen spinning overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md flex items-center justify-center z-50 transition-all duration-300">
          <div className="relative">
            <canvas
              key={`wheel-fullscreen-${entries.length}-${entries.join('-')}-${backgroundImage ? 'img' : 'color'}`}
              ref={canvasRef}
              className="max-w-full max-h-full drop-shadow-2xl transition-all duration-500 ease-out"
              style={{
                WebkitTapHighlightColor: "transparent",
                WebkitTouchCallout: "none",
                WebkitUserSelect: "none",
                userSelect: "none",
              }}
            />

            {/* Winner Modal Overlay on Fullscreen Wheel */}
            {showWinnerOverlay && winner && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-black/20 backdrop-blur-sm absolute inset-0 rounded-full"></div>
                <div className="relative z-10 bg-white/95 dark:bg-gray-800/95 backdrop-blur-md p-8 rounded-3xl shadow-2xl text-center max-w-xs w-full mx-4 transform transition-all duration-500 scale-100">
                  {/* Fireworks Animation */}
                  <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                    {[...Array(16)].map((_, i) => (
                      <div
                        key={i}
                        className="absolute animate-ping"
                        style={{
                          left: `${10 + i * 5}%`,
                          top: `${10 + (i % 5) * 18}%`,
                          animationDelay: `${i * 0.1}s`,
                          animationDuration: "1.5s",
                        }}
                      >
                        <div className="w-4 h-4 bg-yellow-400 rounded-full opacity-60"></div>
                      </div>
                    ))}
                  </div>

                  <div className="relative z-10 space-y-6">
                    <div className="space-y-4">
                      <div className="w-16 h-16 bg-yellow-500 rounded-full mx-auto flex items-center justify-center">
                        <span className="text-2xl">🏆</span>
                      </div>
                      <h2 className="text-2xl font-semibold text-gray-900 dark:text-white tracking-tight">
                        🎉 Winner! 🎉
                      </h2>
                    </div>

                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-2xl p-6 border border-blue-100/50 dark:border-blue-800/50">
                      <p className="text-3xl font-semibold text-gray-900 dark:text-white tracking-tight">{winner}</p>
                    </div>

                    <button
                      onClick={handleWinnerClose}
                      className="w-full h-12 text-base font-medium bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 transition-all duration-200 rounded-2xl shadow-sm active:scale-95 text-white touch-manipulation"
                      style={{
                        WebkitTapHighlightColor: "transparent",
                      }}
                    >
                      Spin Again
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}
