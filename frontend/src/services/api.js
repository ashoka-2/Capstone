/**
 * API service for sandbox management and agent file operations.
 * Requests automatically route through the same-origin Vite proxy:
 * /agent-proxy/<sandboxId>/... -> http://localhost/... with Host: <sandboxId>.agent.localhost
 */

export function getAgentBaseUrl(sandboxId) {
  return `/agent-proxy/${sandboxId}`;
}

/**
 * Start/create a new sandbox container in Kubernetes
 * Endpoint: POST /api/sandbox/start
 */
export async function startSandboxApi() {
  const response = await fetch('/api/sandbox/start', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || errorData.error || `Failed with status ${response.status}`);
  }

  return response.json();
}

/**
 * List all project files in the sandbox workspace.
 * Uses cache-busting timestamp and cache: 'no-store' to ensure latest files.
 * Endpoint: GET /agent-proxy/<sandboxId>/list-files
 */
export async function listFilesApi(sandboxId) {
  if (!sandboxId) throw new Error('Sandbox ID is required');

  const baseUrl = getAgentBaseUrl(sandboxId);
  const response = await fetch(`${baseUrl}/list-files?_t=${Date.now()}`, {
    cache: 'no-store',
    headers: {
      Accept: 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
    },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to list files: ${response.status}`);
  }

  const data = await response.json();
  return data.files || [];
}

/**
 * Read contents of one or more files.
 * Uses cache-busting timestamp and cache: 'no-store' to ensure latest file contents.
 * Endpoint: GET /agent-proxy/<sandboxId>/read-files?files=src/main.jsx,src/App.jsx
 */
export async function readFilesApi(sandboxId, filePaths) {
  if (!sandboxId) throw new Error('Sandbox ID is required');
  if (!filePaths || (Array.isArray(filePaths) && filePaths.length === 0)) {
    return {};
  }

  const filesQuery = Array.isArray(filePaths) ? filePaths.join(',') : filePaths;
  const baseUrl = getAgentBaseUrl(sandboxId);

  const response = await fetch(
    `${baseUrl}/read-files?files=${encodeURIComponent(filesQuery)}&_t=${Date.now()}`,
    {
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        Pragma: 'no-cache',
      },
    }
  );

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to read files: ${response.status}`);
  }

  const data = await response.json();
  const resultMap = {};
  if (Array.isArray(data.files)) {
    data.files.forEach((fileObj) => {
      Object.entries(fileObj).forEach(([rawPath, content]) => {
        const normalized = rawPath.startsWith('/') ? rawPath.slice(1) : rawPath;
        resultMap[normalized] = content;
        resultMap[rawPath] = content;
      });
    });
  }

  return resultMap;
}

/**
 * Update existing files
 * Endpoint: POST /agent-proxy/<sandboxId>/update-files
 */
export async function updateFilesApi(sandboxId, updates) {
  if (!sandboxId) throw new Error('Sandbox ID is required');

  const formattedUpdates = updates.map((u) => ({
    file: u.file.startsWith('/') ? u.file : `/${u.file}`,
    content: u.content,
  }));

  const baseUrl = getAgentBaseUrl(sandboxId);
  const response = await fetch(`${baseUrl}/update-files`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ updates: formattedUpdates }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to update files: ${response.status}`);
  }

  return response.json();
}

/**
 * Create new files
 * Endpoint: POST /agent-proxy/<sandboxId>/create-files
 */
export async function createFilesApi(sandboxId, files) {
  if (!sandboxId) throw new Error('Sandbox ID is required');

  const formattedFiles = files.map((f) => ({
    file: f.file.startsWith('/') ? f.file : `/${f.file}`,
    content: f.content,
  }));

  const baseUrl = getAgentBaseUrl(sandboxId);
  const response = await fetch(`${baseUrl}/create-files`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ files: formattedFiles }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to create files: ${response.status}`);
  }

  return response.json();
}


/**
 * Delete a file or directory recursively
 * Endpoint: DELETE /agent-proxy/<sandboxId>/delete-file?path=<path>
 */
export async function deleteFileApi(sandboxId, filePath) {
  if (!sandboxId) throw new Error('Sandbox ID is required');
  if (!filePath) throw new Error('Path is required');

  const cleanPath = filePath.startsWith('/') ? filePath.slice(1) : filePath;
  const baseUrl = getAgentBaseUrl(sandboxId);

  const response = await fetch(`${baseUrl}/delete-file?path=${encodeURIComponent(cleanPath)}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to delete: ${response.status}`);
  }

  return response.json();
}

/**
 * Create an empty directory
 * Endpoint: POST /agent-proxy/<sandboxId>/create-folder
 */
export async function createFolderApi(sandboxId, folderPath) {
  if (!sandboxId) throw new Error('Sandbox ID is required');
  if (!folderPath) throw new Error('Folder path is required');

  const cleanPath = folderPath.startsWith('/') ? folderPath.slice(1) : folderPath;
  const baseUrl = getAgentBaseUrl(sandboxId);

  const response = await fetch(`${baseUrl}/create-folder`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ path: cleanPath }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to create folder: ${response.status}`);
  }

  return response.json();
}

/**
 * Upload an image or binary/text file
 * Endpoint: POST /agent-proxy/<sandboxId>/upload-file
 */
export async function uploadFileApi(sandboxId, { file, content, encoding = 'base64' }) {
  if (!sandboxId) throw new Error('Sandbox ID is required');

  const cleanPath = file.startsWith('/') ? file.slice(1) : file;
  const baseUrl = getAgentBaseUrl(sandboxId);

  const response = await fetch(`${baseUrl}/upload-file`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ file: cleanPath, content, encoding }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to upload file: ${response.status}`);
  }

  return response.json();
}

/**
 * Move or rename a file or folder (drag & drop)
 * Endpoint: POST /agent-proxy/<sandboxId>/move-file
 */
export async function moveFileApi(sandboxId, source, destination) {
  if (!sandboxId) throw new Error('Sandbox ID is required');

  const cleanSrc = source.startsWith('/') ? source.slice(1) : source;
  const cleanDest = destination.startsWith('/') ? destination.slice(1) : destination;
  const baseUrl = getAgentBaseUrl(sandboxId);

  const response = await fetch(`${baseUrl}/move-file`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ source: cleanSrc, destination: cleanDest }),
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.message || `Failed to move file: ${response.status}`);
  }

  return response.json();
}
