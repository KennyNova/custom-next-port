'use client'

import { motion } from 'framer-motion'
import { ExternalLink, Quote, Info, AlertTriangle, CheckCircle, XCircle } from 'lucide-react'
// @ts-ignore
import ReactMarkdown from 'react-markdown'
// @ts-ignore
import remarkGfm from 'remark-gfm'
import { CodeBlock, InlineCode } from './code-block'
import { cn } from '@/lib/utils'
import Link from 'next/link'

interface MarkdownContentProps {
  content: string
  className?: string
}

export function MarkdownContent({ content, className }: MarkdownContentProps) {
  // Generate heading IDs for table of contents
  const generateHeadingId = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .trim()
  }

  // Custom components for enhanced markdown rendering
  const components = {
    // Enhanced headings with anchor links
    h1: ({ children, ...props }: any) => {
      const id = generateHeadingId(children)
      return (
        <motion.h1
          id={id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="group relative scroll-mt-24 text-4xl font-bold leading-tight tracking-tight text-foreground mb-6 mt-8 first:mt-0"
          {...props}
        >
          <a
            href={`#${id}`}
            className="absolute -left-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-muted-foreground hover:text-primary"
            aria-label="Link to heading"
          >
            #
          </a>
          {children}
        </motion.h1>
      )
    },
    h2: ({ children, ...props }: any) => {
      const id = generateHeadingId(children)
      return (
        <motion.h2
          id={id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="group relative scroll-mt-24 text-3xl font-bold leading-tight text-foreground mb-4 mt-12 border-b pb-2"
          {...props}
        >
          <a
            href={`#${id}`}
            className="absolute -left-6 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-muted-foreground hover:text-primary"
            aria-label="Link to heading"
          >
            #
          </a>
          {children}
        </motion.h2>
      )
    },
    h3: ({ children, ...props }: any) => {
      const id = generateHeadingId(children)
      return (
        <motion.h3
          id={id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="group relative scroll-mt-24 text-2xl font-semibold leading-tight text-foreground mb-3 mt-8"
          {...props}
        >
          <a
            href={`#${id}`}
            className="absolute -left-5 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-muted-foreground hover:text-primary"
            aria-label="Link to heading"
          >
            #
          </a>
          {children}
        </motion.h3>
      )
    },
    h4: ({ children, ...props }: any) => {
      const id = generateHeadingId(children)
      return (
        <motion.h4
          id={id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="group relative scroll-mt-24 text-xl font-semibold text-foreground mb-2 mt-6"
          {...props}
        >
          <a
            href={`#${id}`}
            className="absolute -left-4 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-muted-foreground hover:text-primary"
            aria-label="Link to heading"
          >
            #
          </a>
          {children}
        </motion.h4>
      )
    },
    h5: ({ children, ...props }: any) => {
      const id = generateHeadingId(children)
      return (
        <motion.h5
          id={id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="group relative scroll-mt-24 text-lg font-semibold text-foreground mb-2 mt-4"
          {...props}
        >
          <a
            href={`#${id}`}
            className="absolute -left-4 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-muted-foreground hover:text-primary"
            aria-label="Link to heading"
          >
            #
          </a>
          {children}
        </motion.h5>
      )
    },
    h6: ({ children, ...props }: any) => {
      const id = generateHeadingId(children)
      return (
        <motion.h6
          id={id}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="group relative scroll-mt-24 text-base font-semibold text-foreground mb-2 mt-3"
          {...props}
        >
          <a
            href={`#${id}`}
            className="absolute -left-4 top-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-muted-foreground hover:text-primary"
            aria-label="Link to heading"
          >
            #
          </a>
          {children}
        </motion.h6>
      )
    },

    // Enhanced paragraphs with better spacing
    p: ({ children, ...props }: any) => (
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-foreground/90 leading-7 mb-4 text-base [&:not(:first-child)]:mt-4"
        {...props}
      >
        {children}
      </motion.p>
    ),

    // Enhanced lists
    ul: ({ children, ...props }: any) => (
      <motion.ul
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="my-6 ml-6 list-none space-y-2"
        {...props}
      >
        {children}
      </motion.ul>
    ),
    ol: ({ children, ...props }: any) => (
      <motion.ol
        initial={{ opacity: 0, x: -10 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="my-6 ml-6 list-decimal space-y-2"
        {...props}
      >
        {children}
      </motion.ol>
    ),
    li: ({ children, ...props }: any) => (
      <li className="relative pl-2" {...props}>
        <span className="absolute -left-4 top-1 h-2 w-2 rounded-full bg-primary/60"></span>
        {children}
      </li>
    ),

    // Enhanced blockquotes
    blockquote: ({ children, ...props }: any) => (
      <motion.blockquote
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="relative my-6 border-l-4 border-primary/50 bg-muted/30 pl-6 pr-4 py-4 italic"
        {...props}
      >
        <Quote className="absolute top-2 left-2 h-4 w-4 text-primary/50" />
        <div className="relative">{children}</div>
      </motion.blockquote>
    ),

    // Enhanced links
    a: ({ href, children, ...props }: any) => {
      const isExternal = href?.startsWith('http')
      const isAnchor = href?.startsWith('#')
      
      if (isAnchor) {
        return (
          <a
            href={href}
            className="text-primary hover:text-primary/80 underline underline-offset-2 font-medium transition-colors"
            {...props}
          >
            {children}
          </a>
        )
      }
      
      if (isExternal) {
        return (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:text-primary/80 underline underline-offset-2 font-medium transition-colors"
            {...props}
          >
            {children}
            <ExternalLink className="h-3 w-3" />
          </a>
        )
      }
      
      return (
        <Link
          href={href}
          className="text-primary hover:text-primary/80 underline underline-offset-2 font-medium transition-colors"
          {...props}
        >
          {children}
        </Link>
      )
    },

    // Enhanced code blocks
    code: ({ node, inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '')
      const language = match ? match[1] : ''
      
      if (inline) {
        return <InlineCode className={className} {...props}>{children}</InlineCode>
      }
      
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="my-6"
        >
          <CodeBlock language={language} {...props}>
            {String(children).replace(/\n$/, '')}
          </CodeBlock>
        </motion.div>
      )
    },

    // Enhanced tables
    table: ({ children, ...props }: any) => (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="my-6 overflow-x-auto"
      >
        <table className="w-full border-collapse rounded-lg overflow-hidden border border-border" {...props}>
          {children}
        </table>
      </motion.div>
    ),
    thead: ({ children, ...props }: any) => (
      <thead className="bg-muted/50" {...props}>
        {children}
      </thead>
    ),
    tbody: ({ children, ...props }: any) => (
      <tbody className="divide-y divide-border" {...props}>
        {children}
      </tbody>
    ),
    tr: ({ children, ...props }: any) => (
      <tr className="hover:bg-muted/30 transition-colors" {...props}>
        {children}
      </tr>
    ),
    th: ({ children, ...props }: any) => (
      <th className="px-4 py-3 text-left font-semibold text-foreground border-r border-border last:border-r-0" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }: any) => (
      <td className="px-4 py-3 text-foreground/80 border-r border-border last:border-r-0" {...props}>
        {children}
      </td>
    ),

    // Horizontal rule
    hr: ({ ...props }: any) => (
      <motion.hr
        initial={{ scaleX: 0 }}
        whileInView={{ scaleX: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.8 }}
        className="my-8 border-t-2 border-border/50"
        {...props}
      />
    ),

    // Images with enhanced styling
    img: ({ src, alt, ...props }: any) => (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="my-8 overflow-hidden rounded-lg"
      >
        <img
          src={src}
          alt={alt}
          className="w-full h-auto rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300"
          {...props}
        />
        {alt && (
          <p className="text-sm text-muted-foreground text-center mt-2 italic">
            {alt}
          </p>
        )}
      </motion.div>
    ),
  }

  return (
    <div className={cn("prose prose-neutral dark:prose-invert max-w-none", className)}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

// Callout component for special content blocks
export function Callout({ 
  type = 'info', 
  title, 
  children 
}: { 
  type?: 'info' | 'warning' | 'success' | 'error'
  title?: string
  children: React.ReactNode 
}) {
  const icons = {
    info: Info,
    warning: AlertTriangle,
    success: CheckCircle,
    error: XCircle,
  }
  
  const styles = {
    info: 'border-blue-200 bg-blue-50 text-blue-900 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-100',
    warning: 'border-yellow-200 bg-yellow-50 text-yellow-900 dark:border-yellow-800 dark:bg-yellow-950 dark:text-yellow-100',
    success: 'border-green-200 bg-green-50 text-green-900 dark:border-green-800 dark:bg-green-950 dark:text-green-100',
    error: 'border-red-200 bg-red-50 text-red-900 dark:border-red-800 dark:bg-red-950 dark:text-red-100',
  }
  
  const iconColors = {
    info: 'text-blue-500',
    warning: 'text-yellow-500',
    success: 'text-green-500',
    error: 'text-red-500',
  }

  const Icon = icons[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6 }}
      className={cn(
        "relative rounded-lg border-l-4 p-4 my-6",
        styles[type]
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("h-5 w-5 flex-shrink-0 mt-0.5", iconColors[type])} />
        <div className="flex-1">
          {title && (
            <h4 className="font-semibold mb-2">{title}</h4>
          )}
          <div className="text-sm">{children}</div>
        </div>
      </div>
    </motion.div>
  )
}
