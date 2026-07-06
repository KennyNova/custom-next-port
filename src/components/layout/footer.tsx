'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Github, Linkedin, Mail, Twitter } from 'lucide-react'
import { PreloadLink } from '@/components/ui/preload-link'

type FooterLink = {
  name: string
  href: string
  key?: string
  disabled?: boolean
}

type FooterSection = {
  title: string
  links: FooterLink[]
}

const socialLinks = [
  { name: 'GitHub', href: '#', icon: Github },
  { name: 'LinkedIn', href: '#', icon: Linkedin },
  { name: 'Twitter', href: '#', icon: Twitter },
  { name: 'Email', href: 'mailto:hello@example.com', icon: Mail },
]

const footerLinks: FooterSection[] = [
  {
    title: 'Navigation',
    links: [
      { name: 'Home', href: '/' },
      { name: 'Projects', href: '/projects' },
      { name: 'Blog', href: '/blog' },
      { name: 'Quiz', href: '/quiz' },
    ],
  },
  {
    title: 'Resources',
    links: [
      { name: 'n8n Templates', href: '/templates', key: 'templates' },
      { name: 'Signatures', href: '/signatures' },
      { name: 'Consultation', href: '/consultation' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t bg-background">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="h-8 w-8 rounded-full bg-primary" />
              <span className="font-bold text-lg">Portfolio</span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              A modern, interactive portfolio and blog website showcasing professional work, personal projects, and hobbies.
            </p>
            <div className="flex space-x-4">
              {socialLinks.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  whileHover={{ scale: 1.2 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <social.icon className="h-5 w-5" />
                  <span className="sr-only">{social.name}</span>
                </motion.a>
              ))}
            </div>
          </motion.div>

          {/* Footer Links */}
          {footerLinks.map((section, index) => (
            <motion.div
              key={section.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.key || (typeof link.name === 'string' ? link.name : 'element')}>
                    <PreloadLink
                      href={link.href}
                      disabled={link.disabled}
                      className={`text-sm transition-colors ${
                        link.disabled 
                          ? 'text-muted-foreground/50 opacity-60 hover:opacity-80' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {link.name}
                    </PreloadLink>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="border-t mt-12 pt-8 text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Portfolio & Blog. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  )
}