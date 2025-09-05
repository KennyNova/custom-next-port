import type { HomelabHardwareSpec, HomelabTechnology } from '@/types'

export const homelabHardware: HomelabHardwareSpec = {
	cpu: 'AMD Ryzen 5 5600G (6 cores / 12 threads, integrated GPU)',
	memory: '16GB DDR4',
	storage: '1TB SSD/HDD',
	motherboard: 'Micro ATX with B550 chipset',
}

export const homelabTechnologies: HomelabTechnology[] = [
	{
		slug: 'proxmox',
		name: 'Proxmox VE',
		kind: 'hypervisor',
		shortDescription: 'Open-source virtualization platform for VMs and containers',
		whatItIs: 'Proxmox VE is an enterprise-grade open-source virtualization platform supporting KVM for VMs and LXC for containers, with clustering, backups, and web management.',
		whyChosen: 'It offers robust virtualization, snapshots, backups, and excellent community support—ideal for a homelab.',
		howItFits: 'Runs as the host hypervisor on bare metal, hosting a CasaOS VM/LXC and other workloads.',
		keyDetails: ['KVM + LXC', 'Web UI', 'Backups & Snapshots', 'ZFS support'],
		links: [
			{ label: 'Official Docs', url: 'https://pve.proxmox.com/wiki/Main_Page' },
		],
		iconKey: 'proxmox',
		brandColor: '#E57000',
	},
	{
		slug: 'casaos',
		name: 'CasaOS',
		kind: 'os',
		shortDescription: 'Home server OS with an app-store powered by Docker',
		whatItIs: 'CasaOS is a modern, user-friendly home server platform that orchestrates Docker apps through a polished web UI.',
		whyChosen: 'Simple app deployment, great UX, and integrates seamlessly with Docker.',
		howItFits: 'Runs inside Proxmox (VM or LXC). Manages Docker-based apps and services.',
		keyDetails: ['Docker-based', 'App Store', 'Web UI'],
		links: [
			{ label: 'Official Site', url: 'https://www.casaos.io/' },
			{ label: 'Docs', url: 'https://wiki.casaos.io/' },
		],
		iconKey: 'casaos',
		brandColor: '#00AEFF',
	},
	{
		slug: 'ryzen-5600g',
		name: 'AMD Ryzen 5 5600G',
		kind: 'cpu',
		shortDescription: '6-core APU with integrated GPU for efficient homelab tasks',
		whatItIs: 'AMD Zen 3 APU combining CPU and integrated Radeon graphics.',
		whyChosen: 'Great performance-per-watt, supports light transcoding and virtualization.',
		howItFits: 'Primary CPU for the host node running Proxmox VE.',
		keyDetails: ['6 cores / 12 threads', 'Zen 3', 'Integrated Radeon GPU'],
		links: [
			{ label: 'Product Page', url: 'https://www.amd.com/en/products/apu/amd-ryzen-5-5600g' },
		],
		iconKey: 'cpu',
		brandColor: '#ED1C24',
	},
	{
		slug: 'docker',
		name: 'Docker',
		kind: 'container',
		shortDescription: 'Containerization platform for apps and services',
		whatItIs: 'Docker packages applications and dependencies into portable containers.',
		whyChosen: 'Lightweight, reproducible deployments with vast ecosystem support.',
		howItFits: 'Runs on CasaOS to host most homelab applications.',
		keyDetails: ['Compose support', 'Layered images', 'Huge ecosystem'],
		links: [
			{ label: 'Docs', url: 'https://docs.docker.com/' },
		],
		iconKey: 'docker',
		brandColor: '#2496ED',
	},
	{
		slug: 'ubuntu-debian',
		name: 'Ubuntu/Debian',
		kind: 'distro',
		shortDescription: 'Linux distributions used as base OS for VMs/containers',
		whatItIs: 'Stable, widely supported Linux distributions commonly used for servers.',
		whyChosen: 'Excellent stability, large package repos, strong community.',
		howItFits: 'Base OS for CasaOS VM/LXC and various services.',
		keyDetails: ['APT package manager', 'LTS releases', 'Server-ready'],
		links: [
			{ label: 'Ubuntu', url: 'https://ubuntu.com/' },
			{ label: 'Debian', url: 'https://www.debian.org/' },
		],
		iconKey: 'ubuntu',
		brandColor: '#E95420',
	},
	{
		slug: 'virtio',
		name: 'VirtIO',
		kind: 'driver',
		shortDescription: 'Paravirtualized drivers for high-performance I/O in VMs',
		whatItIs: 'A set of virtualization drivers that provide efficient I/O between VMs and the host.',
		whyChosen: 'Better disk and network performance inside virtual machines.',
		howItFits: 'Used by Proxmox VMs for storage and network devices.',
		keyDetails: ['High-performance I/O', 'Virtio-net', 'Virtio-blk'],
		links: [
			{ label: 'KVM Virtio', url: 'https://www.linux-kvm.org/page/Virtio' },
		],
		iconKey: 'chip',
		brandColor: '#5965E0',
	},
]

export function getHomelabTechnologyBySlug(slug: string): HomelabTechnology | undefined {
	return homelabTechnologies.find((t) => t.slug === slug)
}

export function getHomelabTechnologies(): HomelabTechnology[] {
	return homelabTechnologies
}

export function getHomelabHardware(): HomelabHardwareSpec {
	return homelabHardware
}

export function getDefaultHomelabOgImage(slug?: string): string {
	if (slug) return `/api/og?type=homelab&slug=${encodeURIComponent(slug)}`
	return '/api/og?type=homelab'
}

