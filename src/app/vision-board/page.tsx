"use client"

import React, { useState, useRef, useCallback, useEffect, Suspense } from 'react'
import { Button } from "@/components/ui/button"
import { useSearchParams } from 'next/navigation'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Icon Components
const UploadIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
)

const PaletteIcon = () => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="1" />
    <circle cx="12" cy="7" r="1" />
    <circle cx="17" cy="12" r="1" />
    <circle cx="7" cy="12" r="1" />
    <circle cx="12" cy="17" r="1" />
    <path d="M3 12h4m10 0h4M12 3v4m0 10v4" />
  </svg>
)

const TrashIcon = () => (
  <svg 
    width="16" 
    height="16" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2"
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <path d="M4 6h16v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6zM7 3h10M9 3v3M15 3v3M9 14v-4M15 14v-4" />
  </svg>
)

interface VisionItem {
  id: string
  src: string
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  aspectRatio: number
}
function ColorPicker({ color, onChange }: { color: string, onChange: (color: string) => void }) {
  const [hue, setHue] = useState(0)
  const [position, setPosition] = useState({ x: 0, y: 0 })
  const pickerRef = useRef<HTMLDivElement>(null)

  const handleMouseDown = (e: React.MouseEvent) => {
    if (pickerRef.current) {
      const rect = pickerRef.current.getBoundingClientRect()
      const x = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
      const y = Math.max(0, Math.min(1, (e.clientY - rect.top) / rect.height))
      setPosition({ x, y })
      const newColor = `hsl(${hue}, ${x * 100}%, ${100 - y * 100}%)`
      onChange(newColor)
    }
  }

  const handleHueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newHue = parseInt(e.target.value)
    setHue(newHue)
    const newColor = `hsl(${newHue}, ${position.x * 100}%, ${100 - position.y * 100}%)`
    onChange(newColor)
  }

  return (
    <div className="p-4 w-64 space-y-4">
      <div
        ref={pickerRef}
        className="w-full h-40 rounded-lg cursor-crosshair relative"
        style={{
          background: `linear-gradient(to bottom, white, transparent),
                      linear-gradient(to right, transparent, hsl(${hue}, 100%, 50%))`,
          backgroundColor: 'black'
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={(e) => e.buttons === 1 && handleMouseDown(e)}
      >
        <div
          className="w-4 h-4 rounded-full border-2 border-white absolute -translate-x-1/2 -translate-y-1/2"
          style={{
            left: `${position.x * 100}%`,
            top: `${position.y * 100}%`,
            backgroundColor: color
          }}
        />
      </div>
      <input
        type="range"
        min="0"
        max="360"
        value={hue}
        onChange={handleHueChange}
        className="w-full h-3 rounded-lg appearance-none cursor-pointer color-slider"
      />
    </div>
  )
}

function VisionBoardComponent() {
  const [visionItems, setVisionItems] = useState<VisionItem[]>([])
  const [maxZIndex, setMaxZIndex] = useState(0)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [resizedItem, setResizedItem] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<{ x: number, y: number } | null>(null)
  const [resizeStart, setResizeStart] = useState<{ x: number, y: number, width: number, height: number, corner: string } | null>(null)
  const [glowColor, setGlowColor] = useState('rgba(85, 107, 199, 0.3)')
  const boardRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const searchParams = useSearchParams()
  const memberId = searchParams.get('memberId')

  const saveVisionBoard = async () => {
    try {
      const itemsToSave = visionItems.map(item => ({
        id: item.id,
        src: item.src,
        position: { x: item.x, y: item.y },
        size: { width: item.width, height: item.height },
        zIndex: item.zIndex,
        aspectRatio: item.aspectRatio
      }))

      await fetch('/api/create-table', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId, items: itemsToSave })
      })
    } catch (error) {
      console.error('Error saving vision board:', error)
    }
  }

  const loadVisionBoard = async () => {
    try {
      const response = await fetch(`/api/create-table?memberId=${memberId}`)
      if (response.ok) {
        const data = await response.json()
        if (data.items?.length) {
          const transformedItems = data.items.map((item: any) => ({
            id: item.id || `vision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            src: item.src,
            x: item.position?.x || 0,
            y: item.position?.y || 0,
            width: item.size?.width || 300,
            height: item.size?.height || 300,
            zIndex: item.zIndex || 1,
            aspectRatio: item.aspectRatio || 1
          }))
          setVisionItems(transformedItems)
        }
      }
    } catch (error) {
      console.error('Error loading vision board:', error)
    }
  }

  useEffect(() => {
    if (memberId) {
      loadVisionBoard()
    }
  }, [memberId])

  useEffect(() => {
    if (memberId && visionItems.length > 0) {
      const debounceTimer = setTimeout(() => {
        saveVisionBoard()
      }, 2000)
      return () => clearTimeout(debounceTimer)
    }
  }, [visionItems, memberId])
const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && boardRef.current) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const img = new Image()
          img.onload = () => {
            const aspectRatio = img.width / img.height
            const height = 300
            const width = height * aspectRatio
            const board = boardRef.current!.getBoundingClientRect()
            
            const maxX = board.width - width
            const maxY = board.height - height
            const x = Math.min(Math.max(0, Math.random() * maxX), maxX)
            const y = Math.min(Math.max(0, Math.random() * maxY), maxY)
            
            const newItem: VisionItem = {
              id: `vision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              src: e.target?.result as string,
              x,
              y,
              width,
              height,
              zIndex: maxZIndex + 1,
              aspectRatio
            }
            setVisionItems(prev => [...prev, newItem])
            setMaxZIndex(prev => prev + 1)
          }
          img.src = e.target?.result as string
        }
        reader.readAsDataURL(file)
      })
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [maxZIndex])

  const updateItemPosition = useCallback((id: string, x: number, y: number) => {
    setVisionItems(prev => prev.map(item => {
      if (item.id === id && boardRef.current) {
        const board = boardRef.current.getBoundingClientRect()
        const maxX = board.width - item.width
        const maxY = board.height - item.height
        return {
          ...item,
          x: Math.min(Math.max(0, x), maxX),
          y: Math.min(Math.max(0, y), maxY)
        }
      }
      return item
    }))
  }, [])

  const updateItemSize = useCallback((id: string, width: number, height: number, x: number, y: number) => {
    setVisionItems(prev => prev.map(item => {
      if (item.id === id && boardRef.current) {
        const board = boardRef.current.getBoundingClientRect()
        const newWidth = Math.min(Math.max(100, width), board.width - x)
        const newHeight = Math.min(Math.max(100, height), board.height - y)
        const newX = Math.max(0, Math.min(x, board.width - newWidth))
        const newY = Math.max(0, Math.min(y, board.height - newHeight))
        return { ...item, width: newWidth, height: newHeight, x: newX, y: newY }
      }
      return item
    }))
  }, [])

  const bringToFront = useCallback((id: string) => {
    setMaxZIndex(prev => prev + 1)
    setVisionItems(prev => prev.map(item => 
      item.id === id ? { ...item, zIndex: maxZIndex + 1 } : item
    ))
  }, [maxZIndex])

  const deleteItem = useCallback((id: string) => {
    setVisionItems(prev => prev.filter(item => item.id !== id))
  }, [])

  const handleMouseDown = (event: React.MouseEvent, id: string) => {
    if (event.button !== 0) return
    const item = visionItems.find(item => item.id === id)
    if (item) {
      setDraggedItem(id)
      setDragOffset({
        x: event.clientX - item.x,
        y: event.clientY - item.y
      })
      bringToFront(id)
    }
  }

  const handleMouseMove = (event: React.MouseEvent) => {
    if (draggedItem && dragOffset && boardRef.current) {
      const board = boardRef.current.getBoundingClientRect()
      const x = event.clientX - board.left - dragOffset.x
      const y = event.clientY - board.top - dragOffset.y
      updateItemPosition(draggedItem, x, y)
    } else if (resizedItem && resizeStart && boardRef.current) {
      const board = boardRef.current.getBoundingClientRect()
      const item = visionItems.find(item => item.id === resizedItem)
      if (item) {
        let newWidth, newHeight, newX, newY
        const deltaX = event.clientX - board.left - resizeStart.x
        const deltaY = event.clientY - board.top - resizeStart.y

        switch (resizeStart.corner) {
          case 'top-left':
            newWidth = resizeStart.width - deltaX
            newHeight = resizeStart.height - deltaY
            newX = resizeStart.x + deltaX
            newY = resizeStart.y + deltaY
            break
          case 'top-right':
            newWidth = resizeStart.width + deltaX
            newHeight = resizeStart.height - deltaY
            newX = resizeStart.x
            newY = resizeStart.y + deltaY
            break
          case 'bottom-left':
            newWidth = resizeStart.width - deltaX
            newHeight = resizeStart.height + deltaY
            newX = resizeStart.x + deltaX
            newY = resizeStart.y
            break
          case 'bottom-right':
            newWidth = resizeStart.width + deltaX
            newHeight = resizeStart.height + deltaY
            newX = resizeStart.x
            newY = resizeStart.y
            break
          default:
            return
        }

        const aspectRatio = item.aspectRatio
        if (newWidth / newHeight > aspectRatio) {
          newWidth = newHeight * aspectRatio
        } else {
          newHeight = newWidth / aspectRatio
        }

        updateItemSize(resizedItem, newWidth, newHeight, newX, newY)
      }
    }
  }

  const handleMouseUp = useCallback(() => {
    setDraggedItem(null)
    setDragOffset(null)
    setResizedItem(null)
    setResizeStart(null)
  }, [])

  const handleResizeStart = (event: React.MouseEvent, id: string, corner: string) => {
    event.stopPropagation()
    event.preventDefault()
    const item = visionItems.find(item => item.id === id)
    if (item && boardRef.current) {
      const board = boardRef.current.getBoundingClientRect()
      setResizedItem(id)
      setResizeStart({
        x: event.clientX - board.left,
        y: event.clientY - board.top,
        width: item.width,
        height: item.height,
        corner
      })
      bringToFront(id)
    }
  }

  useEffect(() => {
    const handleGlobalMouseUp = () => {
      handleMouseUp()
    }

    window.addEventListener('mouseup', handleGlobalMouseUp)
    return () => {
      window.removeEventListener('mouseup', handleGlobalMouseUp)
    }
  }, [handleMouseUp])
return (
    <div className="fixed inset-0 bg-white">
      <div className="flex flex-col h-screen w-screen overflow-hidden">
        <header className="mx-4 mt-4">
          <div className="bg-[#f2f3f9] rounded-t-3xl p-4">
            <div className="flex items-center justify-between px-8 py-4 bg-white rounded-3xl shadow-lg">
              <h1 className="text-3xl font-semibold text-[#556bc7]">
                Interactive Vision Board
              </h1>
              <div className="flex items-center gap-3">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      size="lg"
                      className="bg-[#fbb350] hover:bg-[#f9a238] text-white border-[#fbb350] gap-2 rounded-xl"
                    >
                      <PaletteIcon />
                      Color
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="end">
                    <ColorPicker color={glowColor} onChange={setGlowColor} />
                  </PopoverContent>
                </Popover>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-[#51c1a9] hover:bg-[#45a892] text-white border-[#51c1a9] gap-2 rounded-xl"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <UploadIcon />
                  Add Vision
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </div>
            </div>
          </div>
        </header>
        <main className="flex-grow relative px-4 pb-4">
          <div className="w-full h-full bg-[#f2f3f9] rounded-b-3xl p-4">
            <div 
              ref={boardRef} 
              className="relative w-full h-full rounded-3xl bg-white shadow-lg border transition-all duration-300"
              style={{
                borderColor: glowColor,
                boxShadow: `0 0 10px ${glowColor}, 0 0 20px ${glowColor.replace('0.3', '0.2')}`
              }}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div className="absolute inset-0 overflow-hidden">
                {visionItems.map((item) => (
                  <div
                    key={item.id}
                    className="absolute cursor-move group select-none"
                    style={{
                      left: `${item.x}px`,
                      top: `${item.y}px`,
                      width: `${item.width}px`,
                      height: `${item.height}px`,
                      zIndex: item.zIndex,
                    }}
                    onMouseDown={(e) => handleMouseDown(e, item.id)}
                  >
                    <div className="relative w-full h-full rounded-2xl overflow-hidden border shadow-lg transition-all duration-300"
  style={{
    borderColor: glowColor,
    boxShadow: `0 0 10px ${glowColor}, 0 0 20px ${glowColor.replace('0.3', '0.2')}`
  }}>
                      <img 
                        src={item.src} 
                        alt="Vision Item" 
                        className="w-full h-full object-cover select-none" 
                        draggable={false}
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#fbb350] hover:bg-[#f9a238] text-white"
                        onClick={() => deleteItem(item.id)}
                      >
                        <TrashIcon />
                      </Button>
                      <div 
                        className="resize-handle resize-handle-tl" 
                        onMouseDown={(e) => handleResizeStart(e, item.id, 'top-left')} 
                      />
                      <div 
                        className="resize-handle resize-handle-tr" 
                        onMouseDown={(e) => handleResizeStart(e, item.id, 'top-right')} 
                      />
                      <div 
                        className="resize-handle resize-handle-bl" 
                        onMouseDown={(e) => handleResizeStart(e, item.id, 'bottom-left')} 
                      />
                      <div 
                        className="resize-handle resize-handle-br" 
                        onMouseDown={(e) => handleResizeStart(e, item.id, 'bottom-right')} 
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
      <style jsx global>{`
        .resize-handle {
          position: absolute;
          width: 10px;
          height: 10px;
          background-color: white;
          border: 1px solid #ccc;
        }
        .resize-handle-tl { top: -5px; left: -5px; cursor: nwse-resize; }
        .resize-handle-tr { top: -5px; right: -5px; cursor: nesw-resize; }
        .resize-handle-bl { bottom: -5px; left: -5px; cursor: nesw-resize; }
        .resize-handle-br { bottom: -5px; right: -5px; cursor: nwse-resize; }
        .color-slider {
          background: linear-gradient(to right, #fbb350 0%, #51c1a9 50%, #556bc7 100%);
        }
      `}</style>
    </div>
  )
}
function VisionBoard() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VisionBoardComponent />
    </Suspense>
  )
}

export default VisionBoard;
