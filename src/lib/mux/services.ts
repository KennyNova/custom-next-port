import { mux } from './client';
import type { MuxAsset } from '@/types';

export class MuxService {
  // Get all assets from Mux
  static async getAllAssets(): Promise<MuxAsset[]> {
    try {
      const response = await mux.video.assets.list();
      return response.data.map(asset => ({
        id: asset.id!,
        status: asset.status as any,
        playback_ids: asset.playbook_ids as any,
        duration: asset.duration,
        aspect_ratio: asset.aspect_ratio,
        tracks: asset.tracks as any,
      }));
    } catch (error) {
      console.error('Error fetching Mux assets:', error);
      throw error;
    }
  }

  // Get asset details by ID
  static async getAsset(assetId: string): Promise<MuxAsset> {
    try {
      const asset = await mux.video.assets.retrieve(assetId);
      return {
        id: asset.id!,
        status: asset.status as any,
        playback_ids: asset.playbook_ids as any,
        duration: asset.duration,
        aspect_ratio: asset.aspect_ratio,
        tracks: asset.tracks as any,
      };
    } catch (error) {
      console.error(`Error fetching Mux asset ${assetId}:`, error);
      throw error;
    }
  }

  // Generate thumbnail URL
  static getThumbnailUrl(playbackId: string, options: {
    time?: number;
    width?: number;
    height?: number;
    fit_mode?: 'preserve' | 'crop' | 'pad';
  } = {}): string {
    const params = new URLSearchParams();
    if (options.time !== undefined) params.set('time', options.time.toString());
    if (options.width) params.set('width', options.width.toString());
    if (options.height) params.set('height', options.height.toString());
    if (options.fit_mode) params.set('fit_mode', options.fit_mode);

    const query = params.toString();
    return `https://image.mux.com/${playbackId}/thumbnail.jpg${query ? `?${query}` : ''}`;
  }

  // Get video URL for playback
  static getVideoUrl(playbackId: string): string {
    return `https://stream.mux.com/${playbackId}.m3u8`;
  }

  // Get orientation from aspect ratio
  static getOrientationFromAspectRatio(aspectRatio?: string): 'vertical' | 'horizontal' | undefined {
    if (!aspectRatio) return undefined;
    
    const [width, height] = aspectRatio.split(':').map(Number);
    if (width && height) {
      return height > width ? 'vertical' : 'horizontal';
    }
    
    return undefined;
  }

  // Format duration for display
  static formatDuration(seconds?: number): string {
    if (!seconds) return '0:00';
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
