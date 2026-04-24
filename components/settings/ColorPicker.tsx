'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { isValidHexColor } from '@/lib/color-utils'

interface ColorPickerProps {
  label: string
  value: string
  onChange: (color: string) => void
  presets?: string[]
}

const DEFAULT_PRESETS = [
  '#0f172a', '#020617', '#1e293b', '#334155',
  '#0d9488', '#059669', '#2563eb', '#7c3aed',
  '#dc2626', '#ea580c', '#ca8a04', '#ffffff',
]

export function ColorPicker({ label, value, onChange, presets = DEFAULT_PRESETS }: ColorPickerProps) {
  const [inputValue, setInputValue] = useState(value)
  const [isOpen, setIsOpen] = useState(false)
  const colorInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { setInputValue(value) }, [value])

  const handleInputChange = (newValue: string) => {
    setInputValue(newValue)
    if (isValidHexColor(newValue)) onChange(newValue)
  }

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">{label}</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger className="w-full flex items-center justify-start gap-3 h-11 px-3 font-mono text-sm border border-slate-200 rounded-md bg-white hover:bg-slate-50 transition-colors">
          <div className="w-5 h-5 rounded border border-border shrink-0" style={{ backgroundColor: value }} />
          <span className="text-slate-500">{value}</span>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-3" align="start">
          <div className="space-y-3">
            <div className="flex gap-2">
              <div
                className="w-10 h-10 rounded border border-border cursor-pointer shrink-0"
                style={{ backgroundColor: value }}
                onClick={() => colorInputRef.current?.click()}
              />
              <input ref={colorInputRef} type="color" value={value} onChange={(e) => { setInputValue(e.target.value); onChange(e.target.value) }} className="sr-only" />
              <Input value={inputValue} onChange={(e) => handleInputChange(e.target.value)} placeholder="#000000" className="font-mono text-sm h-10" />
            </div>
            <div className="space-y-1.5">
              <p className="text-xs text-muted-foreground">Presets</p>
              <div className="grid grid-cols-6 gap-1.5">
                {presets.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => { setInputValue(color); onChange(color) }}
                    className={`w-8 h-8 rounded border transition-all ${value === color ? 'border-primary ring-1 ring-primary' : 'border-border hover:border-primary/50'}`}
                    style={{ backgroundColor: color }}
                    title={color}
                  />
                ))}
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
