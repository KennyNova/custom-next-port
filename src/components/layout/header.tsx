'use client'

import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/layout/theme-toggle'
import { Menu, X, Home, FolderOpen, BookOpen, Brain, PenTool, Workflow } from 'lucide-react'
import { useState, useEffect } from 'react'

// Component for cycling random characters with sliding slot effect
function CyclingText() {
  const originalText = 'n8n Templates'
  const [displayChars, setDisplayChars] = useState(
    originalText.split('').map(char => ({ current: char, next: char, isAnimating: false }))
  )
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+-=[]{}|;:,.<>?'
  
  useEffect(() => {
    const interval = setInterval(() => {
      setDisplayChars(prev => {
        return prev.map((charData, index) => {
          // Randomly decide if this character should animate (30% chance)
          if (Math.random() < 0.3) {
            const nextChar = characters[Math.floor(Math.random() * characters.length)]
            return {
              current: charData.current,
              next: nextChar,
              isAnimating: true
            }
          }
          return charData
        })
      })
      
      // Complete the animation after a short delay
      setTimeout(() => {
        setDisplayChars(prev => {
          return prev.map(charData => ({
            current: charData.isAnimating ? charData.next : charData.current,
            next: charData.next,
            isAnimating: false
          }))
        })
      }, 200)
    }, 300)
    
    return () => clearInterval(interval)
  }, [])
  
  return (
    <span className="font-mono inline-flex">
      {displayChars.map((charData, index) => (
        <span
          key={index}
          className="relative inline-block overflow-hidden"
          style={{ width: '0.6em' }}
        >
          <motion.span
            className="block"
            animate={{
              y: charData.isAnimating ? '-100%' : '0%'
            }}
            transition={{
              duration: 0.2,
              ease: 'easeInOut'
            }}
          >
            {charData.current}
          </motion.span>
          <motion.span
            className="absolute top-0 left-0 block"
            animate={{
              y: charData.isAnimating ? '0%' : '100%'
            }}
            transition={{
              duration: 0.2,
              ease: 'easeInOut'
            }}
          >
            {charData.next}
          </motion.span>
        </span>
      ))}
    </span>
  )
}

const navigation = [
  { name: 'Home', href: '/', icon: Home },
  { name: 'Projects', href: '/projects', icon: FolderOpen },
  { name: 'Blog', href: '/blog', icon: BookOpen },
  { name: 'Quiz', href: '/quiz', icon: Brain },
  { name: 'Signatures', href: '/signatures', icon: PenTool },
  { name: <CyclingText />, href: '/coming-soon', key: 'templates', disabled: true, icon: Workflow },
]

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="flex items-center space-x-2">
              <div className="h-8 w-8 rounded-full bg-primary" />
              <span className="font-bold text-lg">Portfolio</span>
            </Link>
          </motion.div>

          {/* Desktop Navigation */}
          <motion.nav 
            className="hidden md:flex items-center space-x-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {navigation.map((item) => (
              <Link
                key={item.key || (typeof item.name === 'string' ? item.name : 'element')}
                href={item.href}
                className={`text-sm font-medium transition-colors ${
                  item.disabled 
                    ? 'text-muted-foreground/50 opacity-60 hover:opacity-80' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </motion.nav>

          {/* Right Side */}
          <motion.div 
            className="flex items-center space-x-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <ThemeToggle />
            <Button asChild className="hidden md:inline-flex">
              <Link href="/consultation">Book Consultation</Link>
            </Button>
            
            {/* Mobile menu button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden relative overflow-hidden group"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <motion.div
                animate={mobileMenuOpen ? { rotate: 90 } : { rotate: 0 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                className="relative"
              >
                <AnimatePresence mode="wait">
                  {mobileMenuOpen ? (
                    <motion.div
                      key="close"
                      initial={{ opacity: 0, rotate: -90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: 90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <X className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="menu"
                      initial={{ opacity: 0, rotate: 90 }}
                      animate={{ opacity: 1, rotate: 0 }}
                      exit={{ opacity: 0, rotate: -90 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Menu className="h-5 w-5" />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
              
              {/* Futuristic glow effect on hover */}
              <div className="absolute inset-0 rounded-md bg-gradient-to-r from-blue-500/20 to-purple-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-sm" />
            </Button>
          </motion.div>
        </div>

        {/* Mobile Navigation - Enhanced Futuristic Design */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <>
              {/* Backdrop overlay with blur */}
              <motion.div
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => setMobileMenuOpen(false)}
              />
              
              {/* Mobile menu container */}
              <motion.div
                className="md:hidden absolute left-0 right-0 top-full z-50 border-t shadow-2xl"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              >
                {/* Glass morphism background */}
                <div className="relative bg-gradient-to-br from-background/95 via-background/90 to-background/95 backdrop-blur-xl border-gradient">
                  {/* Animated gradient border */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20 animate-pulse-glow opacity-50" />
                  <div className="absolute inset-[1px] bg-background/95 backdrop-blur-xl rounded-[inherit]" />
                  
                  {/* Content */}
                  <div className="relative px-6 py-8 space-y-2">
                    {navigation.map((item, index) => {
                      const IconComponent = item.icon
                      return (
                        <motion.div
                          key={item.key || (typeof item.name === 'string' ? item.name : 'element')}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ 
                            duration: 0.3, 
                            delay: index * 0.1,
                            ease: "easeOut"
                          }}
                        >
                          <Link
                            href={item.href}
                            className={`group flex items-center space-x-4 p-4 rounded-xl transition-all duration-300 ${
                              item.disabled 
                                ? 'text-muted-foreground/50 opacity-60 hover:opacity-80 cursor-not-allowed' 
                                : 'text-muted-foreground hover:text-foreground hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                            }`}
                            onClick={() => !item.disabled && setMobileMenuOpen(false)}
                          >
                            {/* Icon with glow effect */}
                            <div className="relative">
                              <IconComponent className={`h-6 w-6 transition-all duration-300 ${
                                item.disabled 
                                  ? 'text-muted-foreground/50' 
                                  : 'group-hover:text-blue-500 group-hover:drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                              }`} />
                              {/* Subtle glow background */}
                              {!item.disabled && (
                                <div className="absolute inset-0 bg-blue-500/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-md" />
                              )}
                            </div>
                            
                            {/* Text */}
                            <span className="text-lg font-medium flex-1">
                              {item.name}
                            </span>
                            
                            {/* Animated arrow */}
                            {!item.disabled && (
                              <motion.div
                                className="text-blue-500 opacity-0 group-hover:opacity-100"
                                initial={{ x: -10 }}
                                whileHover={{ x: 0 }}
                                transition={{ duration: 0.2 }}
                              >
                                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                              </motion.div>
                            )}
                          </Link>
                        </motion.div>
                      )
                    })}
                    
                    {/* Consultation button with enhanced styling */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ 
                        duration: 0.4, 
                        delay: navigation.length * 0.1 + 0.2,
                        ease: "easeOut"
                      }}
                      className="pt-4 mt-4 border-t border-gradient-to-r from-transparent via-border to-transparent"
                    >
                      <Button 
                        asChild 
                        className="w-full h-14 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
                      >
                        <Link href="/consultation" className="flex items-center justify-center space-x-2">
                          <span>Book Consultation</span>
                          <motion.div
                            animate={{ x: [0, 4, 0] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                          >
                            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </motion.div>
                        </Link>
                      </Button>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </header>
  )
}