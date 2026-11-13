/**
 * Helper to identify file type and language for rendering and editing
 */

const IMAGE_EXTENSIONS = new Set([
  'png',
  'jpg',
  'jpeg',
  'webp',
  'gif',
  'ico',
  'bmp',
  'avif',
  'tiff',
]);

const VIDEO_EXTENSIONS = new Set(['mp4', 'webm', 'ogv', 'mov']);

const AUDIO_EXTENSIONS = new Set(['mp3', 'wav', 'ogg', 'aac', 'm4a', 'flac']);

export function getFileCategory(filePath = '') {
  if (!filePath) return { category: 'empty', ext: '', language: 'plaintext' };

  const clean = filePath.split('?')[0].split('#')[0];
  const parts = clean.toLowerCase().split('.');
  const ext = parts.length > 1 ? parts.pop() : '';

  if (ext === 'svg') {
    return {
      category: 'svg',
      ext: 'svg',
      language: 'xml',
      isSvg: true,
      isMedia: true,
    };
  }

  if (ext === 'md' || ext === 'markdown') {
    return {
      category: 'markdown',
      ext,
      language: 'markdown',
      isMarkdown: true,
      isMedia: false,
    };
  }

  if (IMAGE_EXTENSIONS.has(ext)) {
    return {
      category: 'image',
      ext,
      isImage: true,
      isMedia: true,
      mimeType: `image/${ext === 'jpg' ? 'jpeg' : ext}`,
    };
  }

  if (VIDEO_EXTENSIONS.has(ext)) {
    return {
      category: 'video',
      ext,
      isVideo: true,
      isMedia: true,
      mimeType: `video/${ext}`,
    };
  }

  if (AUDIO_EXTENSIONS.has(ext)) {
    return {
      category: 'audio',
      ext,
      isAudio: true,
      isMedia: true,
      mimeType: `audio/${ext}`,
    };
  }

  // Code / text files
  let language = 'plaintext';
  if (['jsx', 'js', 'mjs', 'cjs'].includes(ext)) language = 'javascript';
  else if (['tsx', 'ts'].includes(ext)) language = 'typescript';
  else if (['css', 'scss', 'sass', 'less'].includes(ext)) language = 'css';
  else if (['html', 'htm'].includes(ext)) language = 'html';
  else if (['json'].includes(ext)) language = 'json';
  else if (['md', 'markdown'].includes(ext)) language = 'markdown';
  else if (['yaml', 'yml'].includes(ext)) language = 'yaml';
  else if (['xml'].includes(ext)) language = 'xml';
  else if (ext === 'dockerfile' || clean.toLowerCase().endsWith('dockerfile')) language = 'dockerfile';

  return {
    category: 'code',
    ext,
    language,
    isMedia: false,
  };
}

