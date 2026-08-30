// Central API service for all HTTP calls

export async function request(url, options = {}) {
  const headers = {
    ...(options.headers || {}),
  };

  if (!(options.body instanceof FormData) && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: "include",
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const data = await response.json();
      errorMsg = data.message || data.error || errorMsg;
    } catch {}
    throw new Error(errorMsg);
  }

  return response.json();
}
