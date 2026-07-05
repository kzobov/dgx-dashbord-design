import React, { useState } from 'react';
import { RefreshCw, Monitor, Cpu, Search, Box, BookOpen, Calendar, Terminal, Bot, Brain, Plug, Database, CalendarClock, FileText, LayoutDashboard } from 'lucide-react';
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
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-teal-500/10 text-teal-400 border border-teal-500/20 shadow-[0_0_8px_rgba(20,184,166,0.2)]">
        <div className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse"></div>
        HEALTHY
      </div>
    );
  }
  if (status === 'running') {
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-amber-500/10 text-amber-400 border border-amber-500/20">
        <div className="w-1.5 h-1.5 rounded-full bg-amber-400"></div>
        RUNNING
      </div>
    );
  }
  if (status === 'offline') {
    return (
      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
        <div className="w-1.5 h-1.5 rounded-full bg-red-400"></div>
        OFFLINE
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold tracking-wider bg-slate-500/10 text-slate-400 border border-slate-500/20">
      <div className="w-1.5 h-1.5 rounded-full bg-slate-400"></div>
      UNKNOWN
    </div>
  );
}

function ServiceCard({ service }: { service: Service }) {
  const Icon = service.icon && iconMap[service.icon] ? iconMap[service.icon] : Box;
  
  return (
    <div className="flex flex-col p-4 bg-card border border-card-border rounded-lg hover:border-primary/50 transition-colors">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-background border border-border rounded-md text-primary">
            <Icon size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground tracking-tight">{service.name}</h3>
            {service.port && <span className="text-xs font-mono text-muted-foreground">:{service.port}</span>}
          </div>
        </div>
        <StatusBadge status={service.status} />
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed flex-grow">
        {service.description}
      </p>
    </div>
  );
}

function TailnetCard({ device }: { device: TailnetDevice }) {
  const isConnected = device.status === 'connected';
  
  return (
    <div className="flex flex-col p-3 bg-card border border-card-border rounded-lg">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-teal-400 shadow-[0_0_5px_rgba(20,184,166,0.6)]' : 'bg-slate-600'}`}></div>
          <h4 className="text-sm font-medium text-foreground">{device.hostname}</h4>
        </div>
        <div className="text-[10px] px-1.5 py-0.5 rounded bg-background border border-border text-muted-foreground font-mono">
          {device.os} {device.version}
        </div>
      </div>
      <div className="text-[11px] font-mono text-muted-foreground space-y-1 mt-1">
        <div className="truncate text-slate-400">{device.magicDns}</div>
        <div className="flex gap-3">
          <span>{device.ipv4}</span>
          <span className="opacity-50">{device.ipv6.slice(0, 15)}...</span>
        </div>
      </div>
    </div>
  );
}

function StatBar({ value, max, label }: { value: number, max: number, label: string }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className="flex flex-col gap-1">
      <div className="flex justify-between items-end">
        <span className="text-[10px] font-bold tracking-wider text-muted-foreground uppercase">{label}</span>
        <span className="text-[11px] font-mono text-primary">{percent.toFixed(1)}%</span>
      </div>
      <div className="h-1.5 w-full bg-background rounded overflow-hidden border border-border">
        <div className="h-full bg-primary" style={{ width: `${percent}%` }}></div>
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
    <div className="min-h-screen w-full bg-background text-foreground font-sans selection:bg-primary/30">
      <div className="max-w-6xl mx-auto p-6 space-y-8">
        
        {/* Header */}
        <header className="flex justify-between items-center pb-4 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="text-xl font-bold text-primary tracking-tight">⌘</div>
            <h1 className="text-xl font-semibold tracking-tight">Center</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs font-mono text-muted-foreground">
              {lastRefreshed.toLocaleTimeString([], { hour12: false })}
            </span>
            <button 
              onClick={handleRefresh}
              className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded transition-all"
              data-testid="button-refresh"
            >
              <RefreshCw size={14} className={isRefreshing ? "animate-spin" : ""} />
            </button>
          </div>
        </header>

        {/* System Stats */}
        <div className="grid grid-cols-3 gap-6 py-2">
          <StatBar value={config.system.cpu.usage} max={100} label="CPU USAGE" />
          <StatBar value={config.system.ram.total - config.system.ram.free} max={config.system.ram.total} label={`RAM (${config.system.ram.free} ${config.system.ram.unit} FREE)`} />
          <StatBar value={config.system.disk.total - config.system.disk.free} max={config.system.disk.total} label={`DISK (${config.system.disk.free} ${config.system.disk.unit} FREE)`} />
        </div>

        {/* Sections */}
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-10">
          
          {/* Main Services Column */}
          <div className="grid grid-cols-1 gap-10">
            {config.sections.map((section) => (
              <motion.section key={section.title} variants={item} className="space-y-4">
                <h2 className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase border-b border-border/50 pb-2">
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

          <motion.section variants={item} className="space-y-4">
            <h2 className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase border-b border-border/50 pb-2">
              Tailnet Devices
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {config.tailnet.devices.map((device, idx) => (
                <TailnetCard key={`${device.hostname}-${idx}`} device={device} />
              ))}
            </div>
          </motion.section>

          <motion.section variants={item} className="space-y-4">
            <h2 className="text-xs font-bold tracking-[0.2em] text-muted-foreground uppercase border-b border-border/50 pb-2">
              Endpoints
            </h2>
            <div className="bg-card border border-card-border rounded-lg overflow-hidden">
              <table className="w-full text-left text-sm">
                <tbody>
                  {config.endpoints.map((ep, i) => (
                    <tr key={i} className="border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors">
                      <td className="p-4 w-1 whitespace-nowrap">
                        <span className="text-[10px] px-2 py-1 rounded bg-primary/10 text-primary font-bold tracking-wider border border-primary/20">
                          {ep.type}
                        </span>
                      </td>
                      <td className="p-4 font-medium text-foreground">{ep.label}</td>
                      <td className="p-4 font-mono text-xs text-muted-foreground text-right">{ep.url}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.section>

        </motion.div>

        {/* Footer */}
        <footer className="pt-8 pb-4 text-center">
          <div className="text-[10px] font-mono text-muted-foreground/50">
            SYSTEM ONLINE // {lastRefreshed.toISOString()}
          </div>
        </footer>
      </div>
    </div>
  );
}