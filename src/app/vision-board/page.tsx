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
              className="relative w-full h-full rounded-3xl bg-white shadow-lg border border-gray-200"
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            >
              <div className="absolute inset-0 overflow-hidden">
                {visionItems.map((item) => (
                  <div
                    key={item.id}
                    className={`absolute cursor-move group select-none`}
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
                        draggable="false"
                      />
                      <Button
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-[#fbb350] hover:bg-[#f9a238] text-white"
                        onClick={() => deleteItem(item.id)}
                      >
                        <TrashIcon />
                      </Button>
                      <div className="resize-handle resize-handle-tl" onMouseDown={(e) => handleResizeStart(e, item.id, 'top-left')} />
                      <div className="resize-handle resize-handle-tr" onMouseDown={(e) => handleResizeStart(e, item.id, 'top-right')} />
                      <div className="resize-handle resize-handle-bl" onMouseDown={(e) => handleResizeStart(e, item.id, 'bottom-left')} />
                      <div className="resize-handle resize-handle-br" onMouseDown={(e) => handleResizeStart(e, item.id, 'bottom-right')} />
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
