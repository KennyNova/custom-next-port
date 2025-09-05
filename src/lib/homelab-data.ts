import type { HomelabHardwareSpec, HomelabTechnology, HomelabNode } from '@/types'

export const homelabHardware: HomelabHardwareSpec = {
	cpu: 'AMD Ryzen 5 5600G',
	memory: '16GB DDR4-3200',
	storage: '1TB NVMe SSD + 2TB HDD',
	motherboard: 'MSI B550M PRO-B',
	gpu: 'Integrated Radeon Graphics',
	cores: '6 cores / 12 threads',
	baseClockPowerSpecStorage: '3.9GHz base, 4.4GHz boost, 65W TDP',
}

// Core infrastructure nodes - organized layout without dragging
export const homelabNodes: HomelabNode[] = [
	// Hardware layer
	{
		id: 'hardware',
		name: 'Hardware Server',
		type: 'hardware',
		description: 'AMD Ryzen 5 5600G, 16GB RAM, 1TB NVMe + 2TB HDD',
		icon: 'Server',
		color: '#6B7280',
		position: { x: 600, y: 50 },
		children: ['proxmox']
	},
	
	// Hypervisor layer
	{
		id: 'proxmox',
		name: 'Proxmox VE',
		type: 'hypervisor',
		description: 'Virtualization platform running on Debian',
		icon: 'Layers',
		color: '#E57000',
		position: { x: 600, y: 200 },
		parentId: 'hardware',
		children: ['casaos', 'coolify', 'homeassistant', 'windows-vm', 'cloudstorage']
	},
	
	// Virtual Machines layer
	{
		id: 'casaos',
		name: 'CasaOS VM',
		type: 'vm',
		description: 'Docker app management platform',
		icon: 'Box',
		color: '#00AEFF',
		position: { x: 200, y: 350 },
		parentId: 'proxmox',
		children: ['casaos-apps']
	},
	
	{
		id: 'coolify',
		name: 'Coolify VM',
		type: 'vm',
		description: 'Self-hosted web hosting platform',
		icon: 'Globe',
		color: '#3B82F6',
		position: { x: 450, y: 350 },
		parentId: 'proxmox'
	},
	
	{
		id: 'homeassistant',
		name: 'Home Assistant VM',
		type: 'vm',
		description: 'Home automation platform',
		icon: 'Home',
		color: '#41BDF5',
		position: { x: 700, y: 350 },
		parentId: 'proxmox'
	},
	
	{
		id: 'windows-vm',
		name: 'Windows VM',
		type: 'vm',
		description: 'Virtual Windows machine',
		icon: 'Monitor',
		color: '#0078D4',
		position: { x: 950, y: 350 },
		parentId: 'proxmox'
	},
	
	{
		id: 'cloudstorage',
		name: 'Cloud Storage VM',
		type: 'vm',
		description: 'File storage and sharing services',
		icon: 'Cloud',
		color: '#10B981',
		position: { x: 1200, y: 350 },
		parentId: 'proxmox'
	},
	
	// CasaOS Apps Container
	{
		id: 'casaos-apps',
		name: 'Docker Apps',
		type: 'app',
		description: 'All CasaOS managed applications',
		icon: 'Container',
		color: '#8B5CF6',
		position: { x: 200, y: 500 },
		parentId: 'casaos',
		children: ['media-group', 'dev-group', 'productivity-group', 'network-group', 'admin-group']
	},
	
	// App Categories
	{
		id: 'media-group',
		name: 'Media & Entertainment',
		type: 'app',
		description: 'Media streaming and management',
		icon: 'Film',
		color: '#EF4444',
		position: { x: 50, y: 650 },
		parentId: 'casaos-apps'
	},
	
	{
		id: 'dev-group',
		name: 'Development Tools',
		type: 'app',
		description: 'Code, automation & DevOps',
		icon: 'Code',
		color: '#8B5CF6',
		position: { x: 200, y: 650 },
		parentId: 'casaos-apps'
	},
	
	{
		id: 'productivity-group',
		name: 'Productivity & Finance',
		type: 'app',
		description: 'Notes, docs & financial tools',
		icon: 'FileText',
		color: '#F59E0B',
		position: { x: 350, y: 650 },
		parentId: 'casaos-apps'
	},
	
	{
		id: 'network-group',
		name: 'Network & Security',
		type: 'app',
		description: 'VPN, proxy & security tools',
		icon: 'Shield',
		color: '#06B6D4',
		position: { x: 500, y: 650 },
		parentId: 'casaos-apps'
	},
	
	{
		id: 'admin-group',
		name: 'System & Admin',
		type: 'app',
		description: 'Monitoring & system management',
		icon: 'Settings',
		color: '#84CC16',
		position: { x: 650, y: 650 },
		parentId: 'casaos-apps'
	}
]

// All individual CasaOS applications organized by category
export const casaOSApps: HomelabNode[] = [
	// Media & Entertainment Apps
	{ id: 'radarr', name: 'Radarr', type: 'app', description: 'Movie collection manager', icon: 'Film', color: '#FFD700', position: { x: 20, y: 800 }, parentId: 'media-group' },
	{ id: 'sonarr', name: 'Sonarr', type: 'app', description: 'TV series collection manager', icon: 'Tv', color: '#35C5F0', position: { x: 20, y: 840 }, parentId: 'media-group' },
	{ id: 'bazarr', name: 'Bazarr', type: 'app', description: 'Subtitle management', icon: 'Settings', color: '#64748B', position: { x: 20, y: 880 }, parentId: 'media-group' },
	{ id: 'jellyfin', name: 'Jellyfin', type: 'app', description: 'Media streaming server', icon: 'Play', color: '#00A4DC', position: { x: 20, y: 920 }, parentId: 'media-group' },
	{ id: 'prowlarr', name: 'Prowlarr', type: 'app', description: 'Indexer management', icon: 'Search', color: '#5D4E75', position: { x: 20, y: 960 }, parentId: 'media-group' },
	{ id: 'jackett', name: 'Jackett', type: 'app', description: 'Torrent indexer proxy', icon: 'Database', color: '#9333EA', position: { x: 20, y: 1000 }, parentId: 'media-group' },
	{ id: 'lidarr', name: 'Lidarr', type: 'app', description: 'Music collection manager', icon: 'Music', color: '#06B6D4', position: { x: 20, y: 1040 }, parentId: 'media-group' },
	{ id: 'mylar3', name: 'Mylar3', type: 'app', description: 'Comic book manager', icon: 'Book', color: '#F59E0B', position: { x: 20, y: 1080 }, parentId: 'media-group' },
	{ id: 'qbittorrent', name: 'qBittorrent', type: 'app', description: 'BitTorrent client', icon: 'Download', color: '#2563EB', position: { x: 20, y: 1120 }, parentId: 'media-group' },
	{ id: 'emulatorjs', name: 'EmulatorJS', type: 'app', description: 'Browser-based game emulator', icon: 'Gamepad2', color: '#EF4444', position: { x: 20, y: 1160 }, parentId: 'media-group' },
	{ id: 'romm', name: 'RomM', type: 'app', description: 'ROM management', icon: 'Disc', color: '#8B5CF6', position: { x: 20, y: 1200 }, parentId: 'media-group' },
	{ id: 'crafty', name: 'Crafty', type: 'app', description: 'Minecraft server management', icon: 'Blocks', color: '#0EA5E9', position: { x: 20, y: 1240 }, parentId: 'media-group' },
	
	// Development Tools
	{ id: 'gitea', name: 'Gitea', type: 'app', description: 'Git repository hosting', icon: 'GitBranch', color: '#34D399', position: { x: 170, y: 800 }, parentId: 'dev-group' },
	{ id: 'n8n', name: 'n8n', type: 'app', description: 'Workflow automation', icon: 'Workflow', color: '#EA4560', position: { x: 170, y: 840 }, parentId: 'dev-group' },
	{ id: 'code-server', name: 'Code Server', type: 'app', description: 'VS Code in browser', icon: 'Code2', color: '#007ACC', position: { x: 170, y: 880 }, parentId: 'dev-group' },
	{ id: 'portainer', name: 'Portainer', type: 'app', description: 'Docker management UI', icon: 'Container', color: '#13BEF9', position: { x: 170, y: 920 }, parentId: 'dev-group' },
	{ id: 'dozzle', name: 'Dozzle', type: 'app', description: 'Docker log viewer', icon: 'ScrollText', color: '#4ADE80', position: { x: 170, y: 960 }, parentId: 'dev-group' },
	{ id: 'autobrr', name: 'Autobrr', type: 'app', description: 'Torrent automation', icon: 'Zap', color: '#DC2626', position: { x: 170, y: 1000 }, parentId: 'dev-group' },
	
	// Productivity & Finance
	{ id: 'obsidian', name: 'Obsidian', type: 'app', description: 'Knowledge management', icon: 'Brain', color: '#7C3AED', position: { x: 320, y: 800 }, parentId: 'productivity-group' },
	{ id: 'obsidian-livesync', name: 'Obsidian LiveSync', type: 'app', description: 'Obsidian synchronization', icon: 'RefreshCw', color: '#A855F7', position: { x: 320, y: 840 }, parentId: 'productivity-group' },
	{ id: 'siyuan-note', name: 'SiYuan Note', type: 'app', description: 'Block-based note taking', icon: 'StickyNote', color: '#FB7185', position: { x: 320, y: 880 }, parentId: 'productivity-group' },
	{ id: 'bookstack', name: 'BookStack', type: 'app', description: 'Wiki and documentation', icon: 'BookOpen', color: '#0EA5E9', position: { x: 320, y: 920 }, parentId: 'productivity-group' },
	{ id: 'calibre-web', name: 'Calibre-web', type: 'app', description: 'E-book library management', icon: 'Library', color: '#059669', position: { x: 320, y: 960 }, parentId: 'productivity-group' },
	{ id: 'memos', name: 'Memos', type: 'app', description: 'Quick note taking', icon: 'FileText', color: '#FBBF24', position: { x: 320, y: 1000 }, parentId: 'productivity-group' },
	{ id: 'actual-budget', name: 'Actual Budget', type: 'app', description: 'Personal budgeting', icon: 'DollarSign', color: '#10B981', position: { x: 320, y: 1040 }, parentId: 'productivity-group' },
	{ id: 'i-hate-money', name: 'I Hate Money', type: 'app', description: 'Shared expense tracking', icon: 'Receipt', color: '#EF4444', position: { x: 320, y: 1080 }, parentId: 'productivity-group' },
	{ id: 'invoice-ninja', name: 'Invoice Ninja', type: 'app', description: 'Invoicing platform', icon: 'FileText', color: '#6366F1', position: { x: 320, y: 1120 }, parentId: 'productivity-group' },
	{ id: 'financial-freedom', name: 'Financial Freedom', type: 'app', description: 'Financial planning', icon: 'TrendingUp', color: '#059669', position: { x: 320, y: 1160 }, parentId: 'productivity-group' },
	{ id: 'cal-com', name: 'Cal.com', type: 'app', description: 'Scheduling platform', icon: 'Calendar', color: '#292929', position: { x: 320, y: 1200 }, parentId: 'productivity-group' },
	
	// Network & Security
	{ id: 'pi-hole', name: 'Pi-hole', type: 'app', description: 'Network-wide ad blocking', icon: 'ShieldCheck', color: '#96165B', position: { x: 470, y: 800 }, parentId: 'network-group' },
	{ id: 'nginx-proxy-manager', name: 'Nginx Proxy Manager', type: 'app', description: 'Reverse proxy management', icon: 'Route', color: '#0F9D58', position: { x: 470, y: 840 }, parentId: 'network-group' },
	{ id: 'vaultwarden', name: 'Vaultwarden', type: 'app', description: 'Password manager server', icon: 'KeyRound', color: '#175DDC', position: { x: 470, y: 880 }, parentId: 'network-group' },
	{ id: 'wireguard-easy', name: 'WireGuard Easy', type: 'app', description: 'VPN server management', icon: 'Shield', color: '#88171A', position: { x: 470, y: 920 }, parentId: 'network-group' },
	{ id: 'tailscale', name: 'Tailscale', type: 'app', description: 'Zero-config VPN', icon: 'Network', color: '#24292F', position: { x: 470, y: 960 }, parentId: 'network-group' },
	
	// System & Administration
	{ id: 'beszel', name: 'Beszel', type: 'app', description: 'System monitoring', icon: 'Activity', color: '#8B5CF6', position: { x: 620, y: 800 }, parentId: 'admin-group' },
	{ id: 'dashdot', name: 'Dashdot', type: 'app', description: 'System dashboard', icon: 'BarChart3', color: '#06B6D4', position: { x: 620, y: 840 }, parentId: 'admin-group' },
	{ id: 'esphome', name: 'ESPHome', type: 'app', description: 'ESP device management', icon: 'Cpu', color: '#000000', position: { x: 620, y: 880 }, parentId: 'admin-group' },
	{ id: 'postgresql', name: 'PostgreSQL', type: 'app', description: 'Database server', icon: 'Database', color: '#336791', position: { x: 620, y: 920 }, parentId: 'admin-group' },
	{ id: 'nextcloud', name: 'Nextcloud', type: 'app', description: 'File sync and sharing', icon: 'CloudCog', color: '#0082C9', position: { x: 620, y: 960 }, parentId: 'admin-group' },
	{ id: 'immich', name: 'Immich', type: 'app', description: 'Photo and video backup', icon: 'Image', color: '#4285F4', position: { x: 620, y: 1000 }, parentId: 'admin-group' },
	{ id: 'odoo', name: 'Odoo', type: 'app', description: 'Business management suite', icon: 'Building', color: '#714B67', position: { x: 620, y: 1040 }, parentId: 'admin-group' }
]

export const homelabTechnologies: HomelabTechnology[] = [
	{
		slug: 'hardware',
		name: 'Hardware Server',
		kind: 'other',
		shortDescription: 'AMD Ryzen 5 5600G based server with 16GB RAM and mixed storage',
		whatItIs: 'A custom-built server running on AMD Ryzen 5 5600G processor with integrated graphics, 16GB DDR4 memory, and a combination of NVMe SSD and traditional HDD storage.',
		whyChosen: 'Excellent price-to-performance ratio, integrated GPU for hardware acceleration, low power consumption (65W TDP), and sufficient processing power for virtualization.',
		howItFits: 'Serves as the foundation hardware layer for the entire homelab infrastructure, running Proxmox VE hypervisor.',
		keyDetails: ['6 cores / 12 threads', '3.9GHz base, 4.4GHz boost', 'Integrated Radeon Graphics', 'ECC memory support', 'PCIe 4.0 ready'],
		links: [{ label: 'AMD Ryzen 5 5600G', url: 'https://www.amd.com/en/products/apu/amd-ryzen-5-5600g' }],
		iconKey: 'Server',
		brandColor: '#6B7280',
		replaces: 'Multiple individual cloud VPS instances, reducing monthly costs significantly'
	},
	{
		slug: 'proxmox',
		name: 'Proxmox VE',
		kind: 'hypervisor',
		shortDescription: 'Enterprise-grade virtualization platform based on Debian',
		whatItIs: 'Proxmox Virtual Environment is an open-source virtualization management platform that combines KVM hypervisor and LXC containers with a web-based management interface.',
		whyChosen: 'Free alternative to VMware vSphere, excellent web UI, built-in backup and restore, clustering capabilities, and strong community support.',
		howItFits: 'Acts as the hypervisor layer, managing all virtual machines and containers, providing resource allocation, networking, and storage management.',
		keyDetails: ['KVM virtualization', 'LXC containers', 'Web-based management', 'Built-in backup/restore', 'ZFS support', 'High availability clustering'],
		links: [{ label: 'Proxmox VE', url: 'https://www.proxmox.com/en/proxmox-ve' }],
		iconKey: 'Layers',
		brandColor: '#E57000',
		replaces: 'VMware vSphere, Hyper-V, or XenServer - providing enterprise features for free'
	},
	{
		slug: 'casaos',
		name: 'CasaOS',
		kind: 'os',
		shortDescription: 'Personal cloud OS that makes self-hosting simple',
		whatItIs: 'CasaOS is a simple, elegant, and user-friendly personal cloud operating system designed for home users who want to manage their own cloud services.',
		whyChosen: 'Extremely user-friendly interface for Docker management, one-click app installations, and perfect for users who want simplicity without complexity.',
		howItFits: 'Manages all Docker-based applications and services, providing an intuitive interface for installing and managing containerized apps.',
		keyDetails: ['One-click app installation', 'Docker management', 'File management', 'App store', 'Remote access', 'Mobile app'],
		links: [{ label: 'CasaOS', url: 'https://casaos.io/' }],
		iconKey: 'Box',
		brandColor: '#00AEFF',
		replaces: 'Complex Docker Compose setups, Portainer complexity, manual container management'
	},
	{
		slug: 'coolify',
		name: 'Coolify',
		kind: 'service',
		shortDescription: 'Self-hosted alternative to Heroku and Netlify',
		whatItIs: 'Coolify is an open-source & self-hostable Heroku/Netlify alternative that allows you to deploy applications and databases easily.',
		whyChosen: 'Provides simple deployment workflows, Git integration, automatic SSL certificates, and supports multiple frameworks without vendor lock-in.',
		howItFits: 'Handles web application deployments, CI/CD pipelines, and provides a platform-as-a-service experience for personal projects.',
		keyDetails: ['Git integration', 'Automatic deployments', 'Multiple frameworks', 'Database management', 'SSL certificates', 'Resource monitoring'],
		links: [{ label: 'Coolify', url: 'https://coolify.io/' }],
		iconKey: 'Globe',
		brandColor: '#3B82F6',
		replaces: 'Heroku, Netlify, Vercel - eliminating monthly hosting costs for personal projects'
	},
	{
		slug: 'homeassistant',
		name: 'Home Assistant',
		kind: 'service',
		shortDescription: 'Open source home automation platform',
		whatItIs: 'Home Assistant is a free and open-source software for home automation designed to be a central control system for smart home devices.',
		whyChosen: 'Privacy-focused, works offline, supports thousands of devices, highly customizable, and has an excellent mobile app.',
		howItFits: 'Centralizes control of all smart home devices, provides automation rules, and offers dashboards for monitoring and controlling the home.',
		keyDetails: ['1000+ integrations', 'Local control', 'Mobile app', 'Automation engine', 'Voice control', 'Energy monitoring'],
		links: [{ label: 'Home Assistant', url: 'https://www.home-assistant.io/' }],
		iconKey: 'Home',
		brandColor: '#41BDF5',
		replaces: 'SmartThings, Hubitat, proprietary home automation hubs - with better privacy and local control'
	},
	{
		slug: 'jellyfin',
		name: 'Jellyfin',
		kind: 'service',
		shortDescription: 'Free software media streaming server',
		whatItIs: 'Jellyfin is a Free Software Media System that puts you in control of managing and streaming your media. No premium licenses or paid subscriptions required.',
		whyChosen: 'Completely free with no premium features, excellent transcoding, great mobile apps, and strong privacy focus without data collection.',
		howItFits: 'Serves as the central media streaming platform, organizing and streaming movies, TV shows, music, and photos to all devices.',
		keyDetails: ['Hardware transcoding', 'Multiple clients', 'Live TV & DVR', 'Mobile apps', 'No tracking', 'Plugin system'],
		links: [{ label: 'Jellyfin', url: 'https://jellyfin.org/' }],
		iconKey: 'Play',
		brandColor: '#00A4DC',
		replaces: 'Netflix, Plex Pass features, Emby premium - providing free media streaming with full control'
	},
	{
		slug: 'radarr',
		name: 'Radarr',
		kind: 'service',
		shortDescription: 'Movie collection manager for Usenet and BitTorrent users',
		whatItIs: 'Radarr is a movie collection manager that automatically searches, downloads, and organizes movies for your media library.',
		whyChosen: 'Automated movie acquisition, excellent quality profiles, integrates perfectly with download clients and media servers.',
		howItFits: 'Automates the process of finding, downloading, and organizing movies, ensuring the media library stays current and well-organized.',
		keyDetails: ['Automatic downloads', 'Quality profiles', 'Calendar integration', 'Custom formats', 'Multiple indexers', 'Import lists'],
		links: [{ label: 'Radarr', url: 'https://radarr.video/' }],
		iconKey: 'Film',
		brandColor: '#FFD700',
		replaces: 'Manual movie searching and downloading, reduces time spent managing media library'
	},
	{
		slug: 'sonarr',
		name: 'Sonarr',
		kind: 'service',
		shortDescription: 'TV series collection manager for Usenet and BitTorrent users',
		whatItIs: 'Sonarr is a PVR for Usenet and BitTorrent users that monitors multiple RSS feeds for new episodes and handles downloading, sorting and renaming.',
		whyChosen: 'Intelligent episode tracking, automatic season pack handling, excellent scheduling, and seamless integration with download clients.',
		howItFits: 'Manages TV show collections by automatically tracking new episodes, handling downloads, and maintaining proper organization.',
		keyDetails: ['Episode tracking', 'Season management', 'Quality profiles', 'Calendar view', 'Custom naming', 'Failed download handling'],
		links: [{ label: 'Sonarr', url: 'https://sonarr.tv/' }],
		iconKey: 'Tv',
		brandColor: '#35C5F0',
		replaces: 'Manual TV show tracking and downloading, ensures never missing new episodes'
	},
	{
		slug: 'nextcloud',
		name: 'Nextcloud',
		kind: 'service',
		shortDescription: 'Self-hosted file sync and sharing platform',
		whatItIs: 'Nextcloud is a suite of client-server software for creating and using file hosting services, offering functionality similar to cloud storage services.',
		whyChosen: 'Complete data ownership, extensive app ecosystem, excellent sync clients, and strong focus on privacy and security.',
		howItFits: 'Provides personal cloud storage, file synchronization, calendar, contacts, and collaboration tools replacing multiple cloud services.',
		keyDetails: ['File synchronization', 'Calendar & contacts', 'Collaborative editing', 'Mobile apps', 'End-to-end encryption', 'App ecosystem'],
		links: [{ label: 'Nextcloud', url: 'https://nextcloud.com/' }],
		iconKey: 'CloudCog',
		brandColor: '#0082C9',
		replaces: 'Google Drive, Dropbox, iCloud - with complete data ownership and privacy'
	},
	{
		slug: 'vaultwarden',
		name: 'Vaultwarden',
		kind: 'service',
		shortDescription: 'Unofficial Bitwarden compatible server written in Rust',
		whatItIs: 'Vaultwarden is an alternative implementation of the Bitwarden server API written in Rust and compatible with upstream Bitwarden clients.',
		whyChosen: 'Lightweight, self-hosted password management, full Bitwarden compatibility, no premium subscription required for advanced features.',
		howItFits: 'Manages all passwords and secrets centrally, providing secure access across all devices with full control over sensitive data.',
		keyDetails: ['Bitwarden compatible', 'Resource efficient', 'Premium features included', 'Multi-device sync', '2FA support', 'Organization sharing'],
		links: [{ label: 'Vaultwarden', url: 'https://github.com/dani-garcia/vaultwarden' }],
		iconKey: 'KeyRound',
		brandColor: '#175DDC',
		replaces: 'Bitwarden premium, 1Password, LastPass - with self-hosted security and no subscription fees'
	},
	{
		slug: 'pihole',
		name: 'Pi-hole',
		kind: 'service',
		shortDescription: 'Network-wide ad blocker that acts as a DNS sinkhole',
		whatItIs: 'Pi-hole is a Linux network-level advertisement and Internet tracker blocking application which acts as a DNS sinkhole.',
		whyChosen: 'Blocks ads network-wide for all devices, improves browsing speed, provides detailed analytics, and enhances privacy.',
		howItFits: 'Acts as the primary DNS server for the network, filtering out advertising and tracking domains before they reach any device.',
		keyDetails: ['Network-wide blocking', 'DNS filtering', 'Web interface', 'Detailed statistics', 'Custom blocklists', 'Whitelist management'],
		links: [{ label: 'Pi-hole', url: 'https://pi-hole.net/' }],
		iconKey: 'ShieldCheck',
		brandColor: '#96165B',
		replaces: 'Browser ad blockers, reduces need for individual device ad blocking solutions'
	},
	{
		slug: 'nginx-proxy-manager',
		name: 'Nginx Proxy Manager',
		kind: 'service',
		shortDescription: 'Docker container for managing Nginx proxy hosts with SSL',
		whatItIs: 'Nginx Proxy Manager is a pre-built docker image that enables you to easily forward to your websites running at home or otherwise.',
		whyChosen: 'Simple web interface for reverse proxy management, automatic SSL certificate generation, and perfect for exposing internal services safely.',
		howItFits: 'Manages all reverse proxy configurations, SSL certificates, and provides secure access to internal services from the internet.',
		keyDetails: ['Web-based GUI', 'Automatic SSL', 'Custom locations', 'Access lists', 'Stream support', 'Advanced configurations'],
		links: [{ label: 'Nginx Proxy Manager', url: 'https://nginxproxymanager.com/' }],
		iconKey: 'Route',
		brandColor: '#0F9D58',
		replaces: 'Manual nginx configuration, simplifies reverse proxy setup and SSL management'
	},
	{
		slug: 'immich',
		name: 'Immich',
		kind: 'service',
		shortDescription: 'Self-hosted photo and video backup solution',
		whatItIs: 'Immich is a high performance self-hosted photo and video backup solution directly from your mobile phone.',
		whyChosen: 'Excellent mobile apps, AI-powered search and organization, facial recognition, and provides complete control over photo data.',
		howItFits: 'Automatically backs up photos and videos from mobile devices, provides organization and search capabilities replacing cloud photo services.',
		keyDetails: ['Mobile backup', 'Facial recognition', 'AI search', 'RAW support', 'Video transcoding', 'Shared albums'],
		links: [{ label: 'Immich', url: 'https://immich.app/' }],
		iconKey: 'Image',
		brandColor: '#4285F4',
		replaces: 'Google Photos, iCloud Photos, Amazon Photos - with complete privacy and unlimited storage'
	},
	{
		slug: 'portainer',
		name: 'Portainer',
		kind: 'service',
		shortDescription: 'Lightweight Docker management UI',
		whatItIs: 'Portainer is a lightweight management UI which allows you to easily manage your Docker environments through a simple web-based interface.',
		whyChosen: 'Provides visual Docker management, makes container administration accessible, supports multiple environments, and has excellent user interface.',
		howItFits: 'Offers an alternative interface for Docker management alongside CasaOS, particularly useful for more advanced container operations.',
		keyDetails: ['Visual container management', 'Multi-environment support', 'Template system', 'User management', 'Resource monitoring', 'Stack deployment'],
		links: [{ label: 'Portainer', url: 'https://www.portainer.io/' }],
		iconKey: 'Container',
		brandColor: '#13BEF9',
		replaces: 'Docker Desktop, manual docker commands, complex CLI operations'
	},
	{
		slug: 'gitea',
		name: 'Gitea',
		kind: 'service',
		shortDescription: 'Self-hosted Git service with web interface',
		whatItIs: 'Gitea is a community managed lightweight code hosting solution written in Go. It provides Git hosting with a web interface similar to GitHub.',
		whyChosen: 'Lightweight, self-hosted alternative to GitHub/GitLab, excellent performance, simple setup, and includes issues, pull requests, and CI/CD.',
		howItFits: 'Hosts private repositories, manages code projects, provides collaboration features, and integrates with development workflows.',
		keyDetails: ['Git hosting', 'Issue tracking', 'Pull requests', 'Built-in CI/CD', 'Wiki support', 'Organization management'],
		links: [{ label: 'Gitea', url: 'https://gitea.io/' }],
		iconKey: 'GitBranch',
		brandColor: '#34D399',
		replaces: 'GitHub private repos, GitLab hosting costs, centralized code management'
	},
	{
		slug: 'n8n',
		name: 'n8n',
		kind: 'service',
		shortDescription: 'Workflow automation tool with visual editor',
		whatItIs: 'n8n is a free and open-source workflow automation tool. It provides a visual interface for creating workflows that connect different services and automate tasks.',
		whyChosen: 'Visual workflow builder, extensive integrations, self-hosted privacy, no vendor lock-in, and powerful automation capabilities.',
		howItFits: 'Automates repetitive tasks, integrates different services, handles data synchronization, and creates custom workflows for the homelab.',
		keyDetails: ['Visual workflow editor', '200+ integrations', 'Custom nodes', 'Webhook support', 'Scheduled executions', 'Error handling'],
		links: [{ label: 'n8n', url: 'https://n8n.io/' }],
		iconKey: 'Workflow',
		brandColor: '#EA4560',
		replaces: 'Zapier, Microsoft Power Automate, IFTTT - with complete data privacy'
	},
	{
		slug: 'qbittorrent',
		name: 'qBittorrent',
		kind: 'service',
		shortDescription: 'Open-source BitTorrent client with web interface',
		whatItIs: 'qBittorrent is a cross-platform free and open-source BitTorrent client that provides a web interface for remote management.',
		whyChosen: 'No ads, open source, excellent web UI, built-in search, RSS support, and integrates well with automation tools.',
		howItFits: 'Handles all torrent downloads, integrates with Radarr/Sonarr for automated media acquisition, and provides centralized download management.',
		keyDetails: ['Web interface', 'Built-in search', 'RSS automation', 'IP filtering', 'Bandwidth limiting', 'Plugin system'],
		links: [{ label: 'qBittorrent', url: 'https://www.qbittorrent.org/' }],
		iconKey: 'Download',
		brandColor: '#2563EB',
		replaces: 'uTorrent, BitTorrent client, eliminates need for desktop torrent software'
	}
]

// Mapping for node IDs to technology slugs
const nodeIdToTechSlug: Record<string, string> = {
	'hardware': 'hardware',
	'proxmox': 'proxmox', 
	'casaos': 'casaos',
	'coolify': 'coolify',
	'homeassistant': 'homeassistant',
	'jellyfin': 'jellyfin',
	'radarr': 'radarr',
	'sonarr': 'sonarr',
	'nextcloud': 'nextcloud',
	'vaultwarden': 'vaultwarden',
	'pi-hole': 'pihole',
	'nginx-proxy-manager': 'nginx-proxy-manager',
	'immich': 'immich',
	'portainer': 'portainer',
	'gitea': 'gitea',
	'n8n': 'n8n',
	'qbittorrent': 'qbittorrent'
}

export function getHomelabTechnologyBySlug(slug: string): HomelabTechnology | undefined {
	// First try direct slug lookup
	let technology = homelabTechnologies.find((t: HomelabTechnology) => t.slug === slug)
	
	// If not found, try mapping from node ID
	if (!technology && nodeIdToTechSlug[slug]) {
		technology = homelabTechnologies.find((t: HomelabTechnology) => t.slug === nodeIdToTechSlug[slug])
	}
	
	// Finally try converting slug format (kebab-case to slug)
	if (!technology) {
		const convertedSlug = slug.toLowerCase().replace(/\s+/g, '-')
		technology = homelabTechnologies.find((t: HomelabTechnology) => t.slug === convertedSlug)
	}
	
	return technology
}

export function getHomelabTechnologies(): HomelabTechnology[] {
	return homelabTechnologies
}

export function getHomelabHardware(): HomelabHardwareSpec {
	return homelabHardware
}

export function getHomelabNodes(): HomelabNode[] {
	return [...homelabNodes, ...casaOSApps]
}

export function getDefaultHomelabOgImage(slug?: string): string {
	if (slug) return `/api/og?type=homelab&slug=${encodeURIComponent(slug)}`
	return '/api/og?type=homelab'
}
