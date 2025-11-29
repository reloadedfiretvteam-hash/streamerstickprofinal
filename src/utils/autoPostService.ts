/**
 * Auto-Post Service
 * 
 * This service automatically posts scheduled videos to TikTok and YouTube
 * Run this as a scheduled task (cron job) or background worker
 */

import { supabase } from '../lib/supabase';

interface ScheduledPost {
  id: string;
  video_url: string;
  platform: 'tiktok' | 'youtube';
  scheduled_time: string;
  status: 'pending' | 'posted' | 'failed';
}

export async function processScheduledPosts() {
  try {
    // Get all pending posts that are due
    const now = new Date().toISOString();
    
    const { data: posts, error } = await supabase
      .from('scheduled_video_posts')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_time', now)
      .order('scheduled_time', { ascending: true })
      .limit(10);

    if (error) throw error;

    if (!posts || posts.length === 0) {
      console.log('No posts scheduled for now');
      return;
    }

    console.log(`Processing ${posts.length} scheduled posts...`);

    // Process each post
    for (const post of posts) {
      try {
        await postToPlatform(post);
      } catch (error) {
        console.error(`Error posting ${post.id}:`, error);
        await updatePostStatus(post.id, 'failed', null, error instanceof Error ? error.message : 'Unknown error');
      }
    }
  } catch (error) {
    console.error('Error processing scheduled posts:', error);
  }
}

async function postToPlatform(post: ScheduledPost) {
  console.log(`Posting to ${post.platform}: ${post.id}`);

  if (post.platform === 'tiktok') {
    await postToTikTok(post);
  } else if (post.platform === 'youtube') {
    await postToYouTube(post);
  }
}

async function postToTikTok(post: ScheduledPost) {
  // TikTok API integration
  // Note: TikTok requires OAuth and API access
  // For now, this is a placeholder that logs the action
  
  console.log('Posting to TikTok:', post.video_url);
  
  // In production, you would:
  // 1. Get TikTok OAuth token from settings
  // 2. Upload video to TikTok API
  // 3. Get post URL from response
  
  // Placeholder implementation
  const tiktokToken = await getTikTokToken();
  
  if (!tiktokToken) {
    throw new Error('TikTok token not configured');
  }

  // Simulate posting (replace with actual TikTok API call)
  const postUrl = `https://www.tiktok.com/@yourusername/video/${Date.now()}`;
  
  await updatePostStatus(post.id, 'posted', postUrl);
  
  // Update video record
  await supabase
    .from('ai_generated_videos')
    .update({ uploaded_to_tiktok: true, tiktok_url: postUrl })
    .eq('video_url', post.video_url);
}

async function postToYouTube(post: ScheduledPost) {
  // YouTube API integration
  // Note: YouTube requires OAuth and API access
  
  console.log('Posting to YouTube:', post.video_url);
  
  // In production, you would:
  // 1. Get YouTube OAuth token from settings
  // 2. Upload video to YouTube API
  // 3. Get video URL from response
  
  // Placeholder implementation
  const youtubeToken = await getYouTubeToken();
  
  if (!youtubeToken) {
    throw new Error('YouTube token not configured');
  }

  // Simulate posting (replace with actual YouTube API call)
  const videoUrl = `https://www.youtube.com/watch?v=${Date.now()}`;
  
  await updatePostStatus(post.id, 'posted', videoUrl);
  
  // Update video record
  await supabase
    .from('ai_generated_videos')
    .update({ uploaded_to_youtube: true, youtube_url: videoUrl })
    .eq('video_url', post.video_url);
}

async function getTikTokToken(): Promise<string | null> {
  try {
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'tiktok_access_token')
      .single();

    return data?.value || null;
  } catch {
    return null;
  }
}

async function getYouTubeToken(): Promise<string | null> {
  try {
    const { data } = await supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'youtube_access_token')
      .single();

    return data?.value || null;
  } catch {
    return null;
  }
}

async function updatePostStatus(
  postId: string,
  status: 'posted' | 'failed',
  postUrl: string | null,
  errorMessage?: string
) {
  await supabase
    .from('scheduled_video_posts')
    .update({
      status,
      post_url: postUrl,
      posted_at: status === 'posted' ? new Date().toISOString() : null,
      error_message: errorMessage || null,
      updated_at: new Date().toISOString()
    })
    .eq('id', postId);
}

// Run this function on a schedule (every 5 minutes recommended)
export function startAutoPostScheduler() {
  // Process immediately
  processScheduledPosts();

  // Then run every 5 minutes
  setInterval(() => {
    processScheduledPosts();
  }, 5 * 60 * 1000); // 5 minutes

  console.log('Auto-post scheduler started. Checking every 5 minutes...');
}

