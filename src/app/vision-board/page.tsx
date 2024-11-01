'use client'

import React, { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { useSearchParams } from 'next/navigation';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

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
        className="w-full h-3 rounded-lg appearance-none cursor-pointer"
        style={{
          background: 'linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)'
        }}
      />
    </div>
  )
}

export default function Component() {
  const [visionItems, setVisionItems] = useState<VisionItem[]>([])
  const [maxZIndex, setMaxZIndex] = useState(0)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [resizedItem, setResizedItem] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState<{ x: number, y: number } | null>(null)
  const [resizeStart, setResizeStart] = useState<{ x: number, y: number, width: number, height: number } | null>(null)
  const [glowColor, setGlowColor] = useState('rgba(255, 0, 222, 0.5)')
  const boardRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const searchParams = useSearchParams();
  const memberId = searchParams.get('memberId');

  const saveVisionBoard = async () => {
    try {
      await fetch('/api/vision-board', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          memberId,
          items: visionItems
        })
      });
    } catch (error) {
      console.error('Error saving vision board:', error);
    }
  };

  const loadVisionBoard = async () => {
    try {
      const response = await fetch(`/api/vision-board?memberId=${memberId}`);
      if (response.ok) {
        const items = await response.json();
        if (items.length > 0) {
          setVisionItems(items);
        }
      }
    } catch (error) {
      console.error('Error loading vision board:', error);
    }
  };

  useEffect(() => {
    if (memberId) {
      loadVisionBoard();
    }
  }, [memberId]);

  useEffect(() => {
    if (memberId && visionItems.length > 0) {
      const debounceTimer = setTimeout(() => {
        saveVisionBoard();
      }, 1000); // Save after 1 second of no changes

      return () => clearTimeout(debounceTimer);
    }
  }, [visionItems]);

  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (files && boardRef.current) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader()
        reader.onload = (e) => {
          const img = new Image()
          img.onload = () => {
            const aspectRatio = img.width / img.height
            const height = 300 // base height
            const width = height * aspectRatio
            
            const newItem: VisionItem = {
              id: `vision-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
              src: e.target?.result as string,
              x: Math.random() * (boardRef.current!.clientWidth - width),
              y: Math.random() * (boardRef.current!.clientHeight - height),
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
      if (item.id === id) {
        const boardWidth = boardRef.current?.clientWidth ?? 0
        const boardHeight = boardRef.current?.clientHeight ?? 0
        return {
          ...item,
          x: Math.min(Math.max(0, x), boardWidth - item.width),
          y: Math.min(Math.max(0, y), boardHeight - item.height)
        }
      }
      return item
    }))
  }, [])

  const updateItemSize = useCallback((id: string, width: number, height: number) => {
    setVisionItems(prev => prev.map(item => {
      if (item.id === id) {
        const boardWidth = boardRef.current?.clientWidth ?? 0
        const boardHeight = boardRef.current?.clientHeight ?? 0
        const newWidth = Math.min(Math.max(100, width), boardWidth - item.x)
        const newHeight = Math.min(Math.max(100, height), boardHeight - item.y)
        return { ...item, width: newWidth, height: newHeight }
      }
      return item
    }))
  }, [])

  const bringToFront = useCallback((id: string) => {
    setMaxZIndex(prev => prev + 1)
    setVisionItems(prev => prev.map(item => item.id === id ? { ...item, zIndex: maxZIndex + 1 } : item))
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
      const deltaX = event.clientX - board.left - resizeStart.x
      const deltaY = event.clientY - board.top - resizeStart.y
      const newWidth = resizeStart.width + deltaX
      const newHeight = resizeStart.height + deltaY
      updateItemSize(resizedItem, newWidth, newHeight)
    }
  }

  const handleMouseUp = useCallback(() => {
    setDraggedItem(null)
    setDragOffset(null)
    setResizedItem(null)
    setResizeStart(null)
  }, [])

  const handleResizeStart = (event: React.MouseEvent, id: string) => {
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
        height: item.height
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
    <div className="fixed inset-0 bg-black">
      <style jsx global>{`
        .neon-border {
          border: 2px solid ${glowColor};
          box-shadow: 0 0 10px ${glowColor},
                      0 0 20px ${glowColor.replace('0.5', '0.2')};
          transition: all 0.3s ease;
        }

        .resizing .neon-border {
          border-color: rgba(255, 255, 255, 0.2);
          box-shadow: none;
        }

        .board-border {
          border: 4px solid ${glowColor};
          box-shadow: 0 0 10px ${glowColor},
                      0 0 20px ${glowColor.replace('0.5', '0.2')};
        }
      `}</style>
      <div className="flex flex-col h-screen w-screen overflow-hidden">
        <header className="flex items-center justify-between px-6 py-4 bg-black/80 backdrop-blur-xl border-b border-white/10">
          <h1 className="text-2xl font-medium bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
            Interactive Vision Board
          </h1>
          <div className="flex items-center gap-2">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white gap-2"
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
              className="bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20 text-white gap-2"
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
        </header>
        <main className="flex-grow relative">
          <div 
            ref={boardRef} 
            className="absolute inset-0 w-full h-full board-border"
            style={{
              backgroundImage: `url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/WhatsApp%20Image%202024-10-30%20at%2023.57.20_ed2f1e31-aPdwQSRkwi53AybFdiD3fKtsJDczh6.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
            onMouseMove={handleMouseMove}
            
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            {visionItems.map((item) => (
              <div
                key={item.id}
                className={`absolute cursor-move group select-none ${resizedItem === item.id ? 'resizing' : ''}`}
                style={{
                  left: `${item.x}px`,
                  top: `${item.y}px`,
                  width: `${item.width}px`,
                  height: `${item.height}px`,
                  zIndex: item.zIndex,
                }}
                onMouseDown={(e) => handleMouseDown(e, item.id)}
              >
                <div className="relative w-full h-full neon-border rounded-xl overflow-hidden">
                  <img 
                    src={item.src} 
                    alt="Vision Item" 
                    className="w-full h-full object-cover select-none" 
                    draggable="false"
                  />
                  <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 hover:bg-black/90 backdrop-blur-sm"
                    onClick={() => deleteItem(item.id)}
                  >
                    <TrashIcon />
                  </Button>
                  <div
                    className="absolute bottom-0 right-0 w-6 h-6 bg-white/10 hover:bg-white/20 cursor-se-resize rounded-xl transition-colors backdrop-blur-sm"
                    onMouseDown={(e) => handleResizeStart(e, item.id)}
                  />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
