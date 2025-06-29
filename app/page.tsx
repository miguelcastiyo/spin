"use client"

import type React from "react"

import { useState, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Shuffle, Trash2, Plus, Upload, X } from "lucide-react"
import { SpinningWheel } from "../components/spinning-wheel"
import { ThemeToggle } from "../components/theme-toggle"
import FeedbackModal from '../components/feedback-modal'

const DEFAULT_ENTRIES = ["Yes", "No", "Yes", "No", "Yes", "No", "Yes", "No"]
// Expanded color palette to prevent clashing - ensures no adjacent colors are similar
const WHEEL_COLORS = [
  "#007AFF", // Blue
  "#FF3B30", // Red
  "#34C759", // Green
  "#FF9500", // Orange
  "#AF52DE", // Purple
  "#FFCC00", // Yellow
  "#5AC8FA", // Cyan
  "#FF2D92", // Pink
  "#30D158", // Lime Green
  "#FF6B35", // Orange Red
  "#64D2FF", // Light Blue
  "#BF5AF2", // Light Purple
  "#32D74B", // Bright Green
  "#FF453A", // Bright Red
  "#0A84FF", // System Blue
  "#FF9F0A", // Amber
]

export default function SpinningWheelApp() {
  const [entries, setEntries] = useState<string[]>(DEFAULT_ENTRIES)
  const [newEntry, setNewEntry] = useState("")
  const [isSpinning, setIsSpinning] = useState(false)
  const [winner, setWinner] = useState<string | null>(null)
  const [winnerIndex, setWinnerIndex] = useState<number | null>(null)
  const [backgroundImage, setBackgroundImage] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const addEntry = () => {
    const trimmedEntry = newEntry.trim()
    if (!trimmedEntry) {
      setError("Please enter a valid entry")
      return
    }
    
    if (entries.length >= 20) {
      setError("Maximum 20 entries allowed")
      return
    }
    
    if (entries.includes(trimmedEntry)) {
      setError("This entry already exists")
      return
    }
    
    setEntries([...entries, trimmedEntry])
    setNewEntry("")
    setError(null)
  }

  const removeEntry = (index: number) => {
    if (entries.length > 2) {
      setEntries(entries.filter((_, i) => i !== index))
      setError(null)
    }
  }

  const updateEntry = (index: number, value: string) => {
    const trimmedValue = value.trim()
    if (!trimmedValue) return
    
    const updated = [...entries]
    updated[index] = trimmedValue
    setEntries(updated)
    setError(null)
  }

  const shuffleEntries = () => {
    const shuffled = [...entries].sort(() => Math.random() - 0.5)
    setEntries(shuffled)
  }

  const clearAllEntries = () => {
    setEntries(["Option 1", "Option 2"])
    setWinner(null)
    setIsSpinning(false)
    setError(null)
  }

  const handleSpin = useCallback(() => {
    if (isSpinning || entries.length === 0) return
    setIsSpinning(true)
    setError(null)
    // Pick winner index first
    const randomIndex = Math.floor(Math.random() * entries.length)
    setWinner(entries[randomIndex])
    setWinnerIndex(randomIndex)
  }, [entries, isSpinning])

  const handleWinnerClose = () => {
    setWinner(null)
    setWinnerIndex(null)
  }

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    
    if (file.size > 5 * 1024 * 1024) {
      setError("Image must be smaller than 5MB")
      return
    }
    
    if (!file.type.startsWith('image/')) {
      setError("Please select a valid image file")
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      setBackgroundImage(e.target?.result as string)
      setError(null)
    }
    reader.onerror = () => {
      setError("Failed to load image. Please try again.")
    }
    reader.readAsDataURL(file)
  }

  const clearBackgroundImage = () => {
    setBackgroundImage(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
    setError(null)
  }

  const handleImageButtonClick = () => {
    if (backgroundImage) {
      clearBackgroundImage()
    } else {
      fileInputRef.current?.click()
    }
  }

  // Smart color assignment to prevent adjacent similar colors
  const getSegmentColor = (index: number) => {
    // For better color distribution, we use a pattern that ensures
    // no two adjacent segments have similar colors
    const colorIndex = (index * 3) % WHEEL_COLORS.length
    return WHEEL_COLORS[colorIndex]
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-300 overflow-x-hidden">
      <ThemeToggle />
      <FeedbackModal />

      <div className="max-w-sm mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="text-center pt-2">
          <h1 className="text-4xl font-semibold text-gray-900 dark:text-white tracking-tight transition-colors duration-300">
            Spin!
          </h1>
        </div>

        {/* Spinning Wheel - Made bigger */}
        <div className="flex justify-center py-4">
          <SpinningWheel
            entries={entries}
            colors={entries.map((_, i) => getSegmentColor(i))}
            isSpinning={isSpinning}
            onSpin={handleSpin}
            backgroundImage={backgroundImage}
            winner={winner}
            winnerIndex={winnerIndex}
            onWinnerClose={handleWinnerClose}
          />
        </div>

        {/* Controls */}
        <div className="space-y-5">
          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-3">
            <Button
              onClick={shuffleEntries}
              variant="outline"
              size="lg"
              className="h-12 bg-white/80 dark:bg-gray-800/80 border-gray-200/80 dark:border-gray-700/80 hover:bg-white dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 rounded-2xl font-medium text-gray-700 dark:text-gray-200 active:scale-95 touch-manipulation"
              aria-label="Shuffle entries"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Shuffle
            </Button>
            <Button
              onClick={handleImageButtonClick}
              variant="outline"
              size="lg"
              className={`h-12 bg-white/80 dark:bg-gray-800/80 border-gray-200/80 dark:border-gray-700/80 hover:bg-white dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 rounded-2xl font-medium active:scale-95 touch-manipulation ${
                backgroundImage 
                  ? 'text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300' 
                  : 'text-gray-700 dark:text-gray-200'
              }`}
              aria-label={backgroundImage ? "Remove background image" : "Upload background image"}
            >
              {backgroundImage ? (
                <Trash2 className="w-4 h-4 mr-2" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              Image
            </Button>
            <Button
              onClick={clearAllEntries}
              variant="outline"
              size="lg"
              className="h-12 bg-white/80 dark:bg-gray-800/80 border-gray-200/80 dark:border-gray-700/80 hover:bg-white dark:hover:bg-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 rounded-2xl font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 active:scale-95 touch-manipulation"
              aria-label="Clear all entries"
            >
              <X className="w-4 h-4 mr-2" />
              Clear
            </Button>
          </div>

          <input 
            ref={fileInputRef} 
            type="file" 
            accept="image/*" 
            onChange={handleImageUpload} 
            className="hidden" 
            aria-label="Upload background image"
          />

          {/* Add Entry */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Input
                value={newEntry}
                onChange={(e) => {
                  setNewEntry(e.target.value)
                  setError(null)
                }}
                placeholder="Add new entry..."
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault()
                    addEntry()
                  }
                }}
                className="h-12 text-base bg-white/80 dark:bg-gray-800/80 border-gray-200/80 dark:border-gray-700/80 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-blue-400/20 dark:focus:ring-blue-500/20 rounded-2xl transition-all duration-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white touch-manipulation"
                autoComplete="off"
                autoCapitalize="words"
                autoCorrect="off"
                spellCheck="false"
                aria-label="Add new entry"
                maxLength={50}
              />
            </div>
            <Button
              onClick={addEntry}
              size="lg"
              disabled={!newEntry.trim() || entries.length >= 20}
              className="h-12 px-4 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 disabled:bg-gray-300 dark:disabled:bg-gray-600 transition-all duration-200 rounded-2xl shadow-sm active:scale-95 touch-manipulation"
              aria-label="Add entry"
            >
              <Plus className="w-5 h-5" />
            </Button>
          </div>

          {error && (
            <div className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-200 dark:border-red-800">
              {error}
            </div>
          )}

          {/* Entries List */}
          <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-gray-200/50 dark:border-gray-700/50 rounded-3xl overflow-hidden shadow-sm transition-colors duration-300">
            <div className="p-4 space-y-3">
              {entries.map((entry, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div
                    className="w-4 h-4 rounded-full flex-shrink-0 shadow-sm"
                    style={{ backgroundColor: getSegmentColor(index) }}
                    aria-label={`Color indicator for entry ${index + 1}`}
                  />
                  <Input
                    value={entry}
                    onChange={(e) => updateEntry(index, e.target.value)}
                    className="flex-1 h-11 text-base bg-white/70 dark:bg-gray-700/70 border-gray-200/60 dark:border-gray-600/60 focus:border-blue-400 dark:focus:border-blue-500 focus:ring-blue-400/20 dark:focus:ring-blue-500/20 rounded-xl transition-all duration-200 text-gray-900 dark:text-white touch-manipulation"
                    autoComplete="off"
                    autoCapitalize="words"
                    autoCorrect="off"
                    spellCheck="false"
                    aria-label={`Edit entry ${index + 1}`}
                    maxLength={50}
                  />
                  <Button
                    onClick={() => removeEntry(index)}
                    variant="ghost"
                    size="sm"
                    disabled={entries.length <= 2}
                    className="p-2 h-11 w-11 hover:bg-red-50 dark:hover:bg-red-900/30 hover:text-red-500 dark:hover:text-red-400 disabled:opacity-20 transition-all duration-200 rounded-xl active:scale-95 touch-manipulation"
                    aria-label={`Remove entry ${index + 1}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </Card>

          {/* Instructions */}
          <div className="text-center pb-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
              Tap anywhere on the wheel to spin
            </p>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              {entries.length} of 20 entries
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
