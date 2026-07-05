export interface SystemStats {
  cpu: { usage: number; label: string };
  ram: { free: number; total: number; unit: string; label: string };
  disk: { free: number; total: number; unit: string; label: string };
}

export interface Service {
  id: string;
  name: string;
  description: string;
  status: 'healthy' | 'running' | 'offline' | 'unknown';
  icon?: string; // lucide icon name or react-icons key
  port?: number;
  url?: string;
  ip?: string;
}

export interface ServiceSection {
  title: string;
  services: Service[];
}

export interface TailnetDevice {
  hostname: string;
  status: 'connected' | 'disconnected';
  os: string;
  version: string;
  updateAvailable?: boolean;
  magicDns: string;
  ipv4: string;
  ipv6: string;
}

export interface Endpoint {
  type: string;
  label: string;
  url: string;
}

export interface DashboardConfig {
  title: string;
  system: SystemStats;
  sections: ServiceSection[];
  tailnet: { devices: TailnetDevice[] };
  endpoints: Endpoint[];
}

export const config: DashboardConfig = {
  title: "⌘ Center",
  system: {
    cpu: { usage: 0, label: "CPU" },
    ram: { free: 21.8, total: 64, unit: "GiB", label: "GB10" },
    disk: { free: 2.82, total: 4, unit: "TB", label: "" },
  },
  sections: [
    {
      title: "AI & Inference",
      services: [
        { id: "openwebui", name: "OpenWebUI", description: "Chat UI → qwen36-35b · port :3000", status: "healthy", icon: "Monitor", port: 3000, ip: "127.0.0.1", url: "http://localhost:3000" },
        { id: "vllm", name: "vLLM · qwen36", description: "Daily driver · Qwen3.6-35B-A3B-NVFP4 · :8000 · 256k · MTP", status: "healthy", icon: "Cpu", port: 8000, ip: "127.0.0.1" },
        { id: "fastcontext", name: "FastContext", description: "Repo-exploration subagent · 4B · :8002", status: "healthy", icon: "Search", port: 8002, ip: "127.0.0.1" },
        { id: "ollama", name: "Ollama", description: "Embeddings (embeddinggemma) · :11434", status: "healthy", icon: "Box", port: 11434, ip: "127.0.0.1" },
      ],
    },
    {
      title: "Tools & UIs",
      services: [
        { id: "jupyterlab", name: "JupyterLab", description: "Notebooks · CUDA · :8888 · token: run scripts/jupyter-url.sh", status: "healthy", icon: "BookOpen", port: 8888, ip: "127.0.0.1" },
        { id: "calendar-dash", name: "Calendar Dashboard", description: "Calendar / family triage dashboard · :8078", status: "running", icon: "Calendar", port: 8078, ip: "127.0.0.1" },
        { id: "web-terminal", name: "Web Terminal", description: "In-browser shell (Open WebUI panel backend)", status: "healthy", icon: "Terminal", ip: "127.0.0.1" },
        { id: "hermes-dash", name: "Hermes Dashboard", description: "Agent config UI · :9119 (via host-rewrite proxy)", status: "healthy", icon: "Bot", port: 9119, ip: "127.0.0.1" },
      ],
    },
    {
      title: "MCP & Data",
      services: [
        { id: "gbrain-mcp", name: "gbrain MCP", description: "gbrain memory MCP · tailnet + bearer auth · (POST-only endpoint)", status: "unknown", icon: "Brain", ip: "100.x.x.x" },
        { id: "assistant-mcp", name: "Assistant MCP", description: "spark-assistant MCP sidecar", status: "healthy", icon: "Plug", ip: "127.0.0.1" },
        { id: "postgres", name: "Postgres", description: "gbrain vector DB · pgvector · :5432", status: "healthy", icon: "Database", port: 5432, ip: "127.0.0.1" },
      ],
    },
    {
      title: "Workers & Infra",
      services: [
        { id: "calendar-sidecar", name: "Calendar Sidecar", description: "calendar triage worker", status: "healthy", icon: "CalendarClock", ip: "127.0.0.1" },
        { id: "parse-sidecar", name: "Parse Sidecar", description: "document parsing worker", status: "healthy", icon: "FileText", ip: "127.0.0.1" },
        { id: "homepage", name: "Homepage", description: "this service index (gethomepage)", status: "healthy", icon: "LayoutDashboard", ip: "127.0.0.1" },
      ],
    },
  ],
  tailnet: {
    devices: [
      { hostname: "localhost", status: "connected", os: "iOS", version: "v1.98.8", magicDns: "ipad-pro-11-4th-gen-wifi.tail23ff8b.ts.net", ipv4: "100.115.128.40", ipv6: "fd7a:115c:a1e0::38:8029" },
      { hostname: "localhost", status: "connected", os: "iOS", version: "v1.98.5", updateAvailable: true, magicDns: "iphone-15-pro-max.tail23ff8b.ts.net", ipv4: "100.122.8.126", ipv6: "fd7a:115c:a1e0::a838:87e" },
      { hostname: "sk's MacBook Pro", status: "connected", os: "macOS", version: "v1.98.8", magicDns: "macbook-pro.tail23ff8b.ts.net", ipv4: "100.100.100.1", ipv6: "fd7a:115c:a1e0::1:1" },
      { hostname: "edgexpert", status: "connected", os: "Linux", version: "v1.98.8", magicDns: "edgexpert-2a5d.tail23ff8b.ts.net", ipv4: "100.64.0.1", ipv6: "fd7a:115c:a1e0::64:1" },
    ],
  },
  endpoints: [
    { type: "MCP", label: "gbrain MCP", url: "edgexpert-2a5d.tail23ff8b.ts.net" },
    { type: "API", label: "vLLM API (qwen36)", url: "edgexpert-2a5d.tail23ff8b.ts.net" },
  ],
};