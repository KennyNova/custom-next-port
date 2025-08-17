'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, Download, Maximize2 } from 'lucide-react'
import { Button } from './button'
import { cn } from '@/lib/utils'
// @ts-ignore
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
// @ts-ignore
import { oneDark, oneLight } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { useTheme } from '../providers/theme-provider'

interface CodeBlockProps {
  children: string
  language?: string
  filename?: string
  highlightLines?: number[]
  showLineNumbers?: boolean
  className?: string
}

export function CodeBlock({
  children,
  language = 'javascript',
  filename,
  highlightLines = [],
  showLineNumbers = true,
  className,
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const { theme } = useTheme()

  const codeString = String(children).replace(/\n$/, '')
  const lines = codeString.split('\n')
  const isLongCode = lines.length > 20

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(codeString)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const downloadCode = () => {
    const blob = new Blob([codeString], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename || `code.${getFileExtension(language)}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getFileExtension = (lang: string): string => {
    const extensions: Record<string, string> = {
      javascript: 'js',
      typescript: 'ts',
      python: 'py',
      java: 'java',
      cpp: 'cpp',
      c: 'c',
      rust: 'rs',
      go: 'go',
      php: 'php',
      ruby: 'rb',
      swift: 'swift',
      kotlin: 'kt',
      html: 'html',
      css: 'css',
      scss: 'scss',
      json: 'json',
      xml: 'xml',
      yaml: 'yml',
      sql: 'sql',
      bash: 'sh',
      shell: 'sh',
    }
    return extensions[lang] || 'txt'
  }

  const getLanguageIcon = (lang: string) => {
    // You could expand this with more language-specific icons
    const icons: Record<string, string> = {
      javascript: '🟨',
      typescript: '🔷',
      python: '🐍',
      java: '☕',
      cpp: '🔧',
      rust: '🦀',
      go: '🐹',
      php: '🐘',
      ruby: '💎',
      html: '🌐',
      css: '🎨',
      json: '📄',
      bash: '⚡',
      shell: '⚡',
    }
    return icons[lang] || '📝'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "group relative rounded-lg overflow-hidden border bg-muted/30",
        "hover:bg-muted/50 transition-colors duration-200",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-muted/50 border-b">
        <div className="flex items-center gap-2">
          <span className="text-sm">{getLanguageIcon(language)}</span>
          <span className="text-sm font-medium text-muted-foreground">
            {filename || language.toUpperCase()}
          </span>
          {lines.length > 1 && (
            <span className="text-xs text-muted-foreground">
              {lines.length} lines
            </span>
          )}
        </div>
        
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="sm"
            onClick={copyToClipboard}
            className="h-7 px-2"
          >
            <AnimatePresence mode="wait">
              {copied ? (
                <motion.div
                  key="check"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-1"
                >
                  <Check className="h-3 w-3 text-green-500" />
                  <span className="text-xs text-green-500">Copied!</span>
                </motion.div>
              ) : (
                <motion.div
                  key="copy"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-1"
                >
                  <Copy className="h-3 w-3" />
                  <span className="text-xs">Copy</span>
                </motion.div>
              )}
            </AnimatePresence>
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={downloadCode}
            className="h-7 px-2"
          >
            <Download className="h-3 w-3" />
          </Button>
          
          {isLongCode && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 px-2"
            >
              <Maximize2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Code */}
      <div className={cn(
        "relative overflow-hidden",
        isLongCode && !isExpanded && "max-h-96"
      )}>
        <SyntaxHighlighter
          language={language}
          style={theme === 'dark' ? oneDark : oneLight}
          showLineNumbers={showLineNumbers}
          customStyle={{
            margin: 0,
            padding: '1rem',
            background: 'transparent',
            fontSize: '0.875rem',
            lineHeight: '1.5',
          }}
          lineNumberStyle={{
            minWidth: '3em',
            paddingRight: '1em',
            color: theme === 'dark' ? '#4a5568' : '#a0aec0',
            userSelect: 'none',
          }}
          wrapLines={true}
          wrapLongLines={true}
          lineProps={(lineNumber) => {
            const style: any = { display: 'block' }
            if (highlightLines.includes(lineNumber)) {
              style.backgroundColor = theme === 'dark' ? 'rgba(255, 255, 0, 0.1)' : 'rgba(255, 255, 0, 0.2)'
              style.borderLeft = '3px solid #facc15'
              style.paddingLeft = '0.5rem'
              style.marginLeft = '-0.5rem'
            }
            return { style }
          }}
        >
          {codeString}
        </SyntaxHighlighter>

        {/* Expand/Collapse Gradient Overlay */}
        {isLongCode && !isExpanded && (
          <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent pointer-events-none" />
        )}
      </div>

      {/* Expand Button */}
      {isLongCode && !isExpanded && (
        <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsExpanded(true)}
            className="shadow-lg"
          >
            <Maximize2 className="h-3 w-3 mr-1" />
            Expand Code
          </Button>
        </div>
      )}
    </motion.div>
  )
}

// Enhanced inline code component
export function InlineCode({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <code
      className={cn(
        "relative px-1.5 py-0.5 text-sm font-mono",
        "bg-muted/60 text-foreground rounded border",
        "before:absolute before:inset-0 before:rounded before:bg-gradient-to-r",
        "before:from-primary/10 before:to-secondary/10 before:opacity-0",
        "hover:before:opacity-100 before:transition-opacity",
        className
      )}
    >
      {children}
    </code>
  )
}
