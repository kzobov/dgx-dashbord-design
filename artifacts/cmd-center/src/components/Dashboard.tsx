import React, { useState, useCallback } from 'react';
import { RefreshCw, Monitor, Cpu, Search, Box, BookOpen, Calendar, Terminal, Bot, Brain, Plug, Database, CalendarClock, FileText, LayoutDashboard, Copy, Check } from 'lucide-react';
import { SiJupyter, SiPostgresql } from 'react-icons/si';
import { motion } from 'framer-motion';
import { config, Service, TailnetDevice, SystemStats } from '../config';

const iconMap: Record<string, React.ElementType> = {
  Monitor, Cpu, Search, Box, BookOpen, Calendar, Terminal, Bot, Brain, Plug, Database, CalendarClock, FileText, LayoutDashboard,
  SiJupyter, SiPostgresql
};

function StatusBadge({ status }: { status: Service['status'] }) {
  if (status === 'healthy') {
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-[rgba(0,229,195,0.15)] text-[#00e5c3] border border-[rgba(0,229,195,0.3)] shadow-[0_0_8px_rgba(0,229,195,0.3)] backdrop-blur-md">
        <div className="w-1.5 h-1.5 rounded-full bg-[#00e5c3] animate-pulse"></div>
        HEALTHY
      </div>
    );
  }
  if (status === 'running') {
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-[rgba(245,158,11,0.15)] text-amber-400 border border-[rgba(245,158,11,0.3)] shadow-[0_0_8px_rgba(245,158,11,0.3)] backdrop-blur-md">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
        RUNNING
      </div>
    );
  }
  if (status === 'offline') {
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-[rgba(248,113,113,0.15)] text-red-400 border border-[rgba(248,113,113,0.3)] shadow-[0_0_8px_rgba(248,113,113,0.3)] backdrop-blur-md">
        <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
        OFFLINE
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold tracking-wider bg-[rgba(148,163,184,0.15)] text-slate-400 border border-[rgba(148,163,184,0.3)] shadow-[0_0_8px_rgba(148,163,184,0.3)] backdrop-blur-md">
      <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
      UNKNOWN
    </div>
  );
}

function ServiceCard({ service }: { service: Service }) {
  const Icon = service.icon && iconMap[service.icon] ? iconMap[service.icon] : Box;
  
  return (
    <div className="glass-card flex flex-col p-4 transition-all duration-300 hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)]">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-md text-[#00e5c3] shadow-[0_0_10px_rgba(0,229,195,0.15)]">
            <Icon size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight">{service.name}</h3>
            {service.port && <span className="text-xs font-mono text-[rgba(255,255,255,0.55)]">:{service.port}</span>}
          </div>
        </div>
        <StatusBadge status={service.status} />
      </div>
      <p className="text-xs text-[rgba(255,255,255,0.55)] leading-relaxed flex-grow">
        {service.description}
      </p>
    </div>
  );
}

function CopyButton({ value, 'data-testid': testId }: { value: string; 'data-testid'?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [value]);
  return (
    <button
      onClick={handleCopy}
      data-testid={testId}
      className="ml-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150 text-[rgba(255,255,255,0.4)] hover:text-[#00e5c3] focus:outline-none"
      title={`Copy ${value}`}
    >
      {copied
        ? <Check size={11} className="text-[#00e5c3]" />
        : <Copy size={11} />}
    </button>
  );
}

function TailnetCard({ device }: { device: TailnetDevice }) {
  const isConnected = device.status === 'connected';

  return (
    <div className="glass-card flex flex-col p-4 transition-all duration-300 hover:bg-[rgba(255,255,255,0.08)]">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-[#00e5c3] shadow-[0_0_8px_rgba(0,229,195,0.6)]' : 'bg-slate-600'}`}></div>
          <h4 className="text-sm font-semibold text-white">{device.hostname}</h4>
        </div>
        <div className="text-[10px] px-2 py-0.5 rounded bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.55)] font-mono">
          {device.os} {device.version}
        </div>
      </div>
      <div className="text-[11px] font-mono text-[rgba(255,255,255,0.45)] space-y-1.5 mt-1">
        <div className="group flex items-center gap-1 min-w-0">
          <span className="truncate text-[rgba(255,255,255,0.6)]">{device.magicDns}</span>
          <CopyButton value={device.magicDns} data-testid={`copy-magicdns-${device.hostname}`} />
        </div>
        <div className="group flex items-center gap-1">
          <span className="text-[rgba(255,255,255,0.55)]">{device.ipv4}</span>
          <CopyButton value={device.ipv4} data-testid={`copy-ipv4-${device.hostname}`} />
        </div>
        <div className="group flex items-center gap-1 min-w-0">
          <span className="truncate text-[rgba(255,255,255,0.35)]">{device.ipv6}</span>
          <CopyButton value={device.ipv6} data-testid={`copy-ipv6-${device.hostname}`} />
        </div>
      </div>
    </div>
  );
}

function StatBar({ value, max, label }: { value: number, max: number, label: string }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className="glass-pill flex items-center justify-between px-4 py-3">
      <div className="flex flex-col gap-1 w-full">
        <div className="flex justify-between items-end mb-1">
          <span className="text-[10px] font-bold tracking-[0.1em] text-[rgba(255,255,255,0.5)] uppercase">{label}</span>
          <span className="text-[11px] font-mono text-[#00e5c3] font-semibold">{percent.toFixed(1)}%</span>
        </div>
        <div className="h-1.5 w-full bg-[rgba(0,0,0,0.3)] rounded-full overflow-hidden border border-[rgba(255,255,255,0.05)]">
          <div className="h-full bg-gradient-to-r from-[#00e5c3] to-[#00b398] rounded-full shadow-[0_0_10px_rgba(0,229,195,0.4)]" style={{ width: `${percent}%` }}></div>
        </div>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [lastRefreshed, setLastRefreshed] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastRefreshed(new Date());
      setIsRefreshing(false);
    }, 500);
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen w-full bg-transparent text-foreground font-sans selection:bg-[#00e5c3]/30">
      
      {/* Header - Fixed & Glass */}
      <div className="fixed top-0 left-0 right-0 z-50 glass-header">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="text-xl font-bold text-[#00e5c3] tracking-tight drop-shadow-[0_0_8px_rgba(0,229,195,0.5)]">⌘</div>
            <h1 className="text-xl font-semibold tracking-tight text-white drop-shadow-md">Center</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-[rgba(255,255,255,0.55)]">
              {lastRefreshed.toLocaleTimeString([], { hour12: false })}
            </span>
            <button 
              onClick={handleRefresh}
              className="p-1.5 text-[rgba(255,255,255,0.55)] hover:text-[#00e5c3] hover:bg-[rgba(255,255,255,0.05)] rounded-md transition-all"
              data-testid="button-refresh"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6 pt-28 space-y-8">
        
        {/* System Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-2">
          <StatBar value={config.system.cpu.usage} max={100} label="CPU USAGE" />
          <StatBar value={config.system.ram.total - config.system.ram.free} max={config.system.ram.total} label={`RAM (${config.system.ram.free} ${config.system.ram.unit} FREE)`} />
          <StatBar value={config.system.disk.total - config.system.disk.free} max={config.system.disk.total} label={`DISK (${config.system.disk.free} ${config.system.disk.unit} FREE)`} />
        </div>

        {/* Sections */}
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-10">
          
          {/* Main Services Column */}
          <div className="grid grid-cols-1 gap-10">
            {config.sections.map((section) => (
              <motion.section key={section.title} variants={item} className="glass-section space-y-5">
                <h2 className="text-xs font-bold tracking-[0.2em] text-[rgba(255,255,255,0.35)] uppercase border-b border-[rgba(255,255,255,0.08)] pb-3">
                  {section.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {section.services.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              </motion.section>
            ))}
          </div>

          <motion.section variants={item} className="glass-section space-y-5">
            <h2 className="text-xs font-bold tracking-[0.2em] text-[rgba(255,255,255,0.35)] uppercase border-b border-[rgba(255,255,255,0.08)] pb-3">
              Tailnet Devices
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {config.tailnet.devices.map((device, idx) => (
                <TailnetCard key={`${device.hostname}-${idx}`} device={device} />
              ))}
            </div>
          </motion.section>

          <motion.section variants={item} className="glass-section space-y-5">
            <h2 className="text-xs font-bold tracking-[0.2em] text-[rgba(255,255,255,0.35)] uppercase border-b border-[rgba(255,255,255,0.08)] pb-3">
              Endpoints
            </h2>
            <div className="glass-card overflow-hidden">
              <table className="w-full text-left text-sm">
                <tbody>
                  {config.endpoints.map((ep, i) => (
                    <tr key={i} className="border-b border-[rgba(255,255,255,0.05)] last:border-0 hover:bg-[rgba(255,255,255,0.03)] transition-colors">
                      <td className="p-4 w-1 whitespace-nowrap">
                        <span className="text-[10px] px-2 py-1 rounded bg-[rgba(0,229,195,0.1)] text-[#00e5c3] font-bold tracking-wider border border-[rgba(0,229,195,0.2)] shadow-[0_0_5px_rgba(0,229,195,0.15)] backdrop-blur-md">
                          {ep.type}
                        </span>
                      </td>
                      <td className="p-4 font-semibold text-white tracking-tight">{ep.label}</td>
                      <td className="p-4 font-mono text-xs text-[rgba(255,255,255,0.55)] text-right">{ep.url}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>

        </motion.div>

        {/* Footer */}
        <footer className="pt-8 pb-4 text-center">
          <div className="inline-block px-4 py-2 glass-pill text-[10px] font-mono text-[rgba(255,255,255,0.4)]">
            <span className="text-[#00e5c3] mr-2">●</span> SYSTEM ONLINE // {lastRefreshed.toISOString()}
          </div>
        </footer>
      </div>
    </div>
  );
}