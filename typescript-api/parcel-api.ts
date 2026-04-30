interface ParcelData {
  id: string;
  name: string;
  area: number;
  crop: string;
}

interface CacheEntry {
  data: ParcelData;
  timestamp: number;
}

interface UIElements {
  select: HTMLSelectElement;
  nameEl: HTMLElement;
  areaEl: HTMLElement;
  cropEl: HTMLElement;
  statusEl: HTMLElement;
}

class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
    public readonly endpoint?: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

const CACHE_TTL = 300_000;
const REQUEST_TIMEOUT = 10_000;
const API_BASE = 'https://api.agri.com/parcels';

const cache = new Map<string, CacheEntry>();
const state = { controller: null as AbortController | null };

function isParcelData(obj: unknown): obj is ParcelData {
  if (typeof obj !== 'object' || obj === null) return false;
  const p = obj as Record<string, unknown>;
  return (
    typeof p['id'] === 'string' &&
    typeof p['name'] === 'string' &&
    typeof p['area'] === 'number' &&
    typeof p['crop'] === 'string'
  );
}

function requireElement<T extends HTMLElement>(id: string): T {
  const el = document.getElementById(id);
  if (!el) throw new Error(`Required element #${id} not found`);
  return el as T;
}

function getCached(parcelId: string): ParcelData | null {
  const entry = cache.get(parcelId);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL) {
    cache.delete(parcelId);
    return null;
  }
  return entry.data;
}

function setCached(parcelId: string, data: ParcelData): void {
  cache.set(parcelId, { data, timestamp: Date.now() });
}

async function attemptFetch(
  url: string,
  externalSignal: AbortSignal,
  allowRetry: boolean
): Promise<Response> {
  const timeoutController = new AbortController();
  const timerId = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT);
  const onExternalAbort = () => timeoutController.abort();
  externalSignal.addEventListener('abort', onExternalAbort, { once: true });

  try {
    return await fetch(url, { signal: timeoutController.signal });
  } catch (error) {
    if (externalSignal.aborted) throw error;
    if (timeoutController.signal.aborted) {
      if (allowRetry) return attemptFetch(url, externalSignal, false);
      throw new ApiError(408, 'Request timeout after 10s');
    }
    throw error;
  } finally {
    clearTimeout(timerId);
    externalSignal.removeEventListener('abort', onExternalAbort);
  }
}

/** Fetches parcel data by ID with in-memory caching, 10s timeout, and one automatic retry. */
async function fetchParcelData(parcelId: string): Promise<ParcelData> {
  if (!parcelId) throw new Error('Invalid parcelId: must be non-empty string');

  const cached = getCached(parcelId);
  if (cached) return cached;

  state.controller?.abort();
  state.controller = new AbortController();
  const { signal } = state.controller;

  const url = `${API_BASE}/${encodeURIComponent(parcelId)}`;
  const response = await attemptFetch(url, signal, true);

  if (response.status === 404) {
    throw new ApiError(404, 'Parcel not found', `/api/parcels/${parcelId}`);
  }
  if (!response.ok) {
    throw new ApiError(response.status, `HTTP error ${response.status}`, url);
  }

  const json: unknown = await response.json();
  if (!isParcelData(json)) throw new Error('Invalid API response: missing required fields');

  setCached(parcelId, json);
  return json;
}

function setLoadingState(elements: UIElements, loading: boolean): void {
  elements.select.disabled = loading;
  elements.statusEl.textContent = loading ? 'Chargement...' : '';
  elements.statusEl.className = loading ? 'status loading' : 'status';
}

function clearParcelDisplay(elements: UIElements): void {
  elements.nameEl.textContent = '';
  elements.areaEl.textContent = '';
  elements.cropEl.textContent = '';
}

function renderParcelData(elements: UIElements, data: ParcelData): void {
  elements.nameEl.textContent = data.name;
  elements.areaEl.textContent = `${data.area} ha`;
  elements.cropEl.textContent = data.crop;
}

function renderError(elements: UIElements, message: string): void {
  clearParcelDisplay(elements);
  elements.statusEl.textContent = message;
  elements.statusEl.className = 'status error';
}

/** Handles dropdown selection with AbortController-based race-condition protection. */
async function handleParcelSelect(parcelId: string, elements: UIElements): Promise<void> {
  clearParcelDisplay(elements);

  if (!parcelId) {
    state.controller?.abort();
    setLoadingState(elements, false);
    return;
  }

  setLoadingState(elements, true);

  try {
    const data = await fetchParcelData(parcelId);
    renderParcelData(elements, data);
    setLoadingState(elements, false);
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') return;
    setLoadingState(elements, false);
    if (error instanceof ApiError) {
      renderError(elements, `Erreur ${error.statusCode} : ${error.message}`);
    } else if (error instanceof TypeError) {
      renderError(elements, 'Erreur réseau : impossible de contacter le serveur');
    } else if (error instanceof Error) {
      renderError(elements, error.message);
    }
  }
}

function init(): void {
  const elements: UIElements = {
    select: requireElement<HTMLSelectElement>('parcel-select'),
    nameEl: requireElement('parcel-name'),
    areaEl: requireElement('parcel-area'),
    cropEl: requireElement('parcel-crop'),
    statusEl: requireElement('parcel-status'),
  };

  elements.select.addEventListener('change', () => {
    void handleParcelSelect(elements.select.value, elements);
  });
}

document.addEventListener('DOMContentLoaded', init);
