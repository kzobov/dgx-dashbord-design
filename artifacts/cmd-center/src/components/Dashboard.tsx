import React, { useState, useCallback, useRef, useEffect, Fragment } from 'react';
import { RefreshCw, Monitor, Cpu, Search, Box, BookOpen, Calendar, Terminal, Bot, Brain, Plug, Database, CalendarClock, FileText, LayoutDashboard, Copy, Check, ExternalLink, ChevronRight } from 'lucide-react';
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
  const address = service.ip && service.port
    ? `${service.ip}:${service.port}`
    : service.ip ?? (service.port ? `127.0.0.1:${service.port}` : null);

  const cardInner = (
    <>
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-md text-[#00e5c3] shadow-[0_0_10px_rgba(0,229,195,0.15)]">
            <Icon size={16} />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white tracking-tight leading-tight">{service.name}</h3>
            {service.port && <span className="text-xs font-mono text-[rgba(255,255,255,0.55)]">:{service.port}</span>}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <StatusBadge status={service.status} />
          {service.url && <ExternalLink size={11} className="text-[rgba(255,255,255,0.25)]" />}
        </div>
      </div>
      <p className="text-xs text-[rgba(255,255,255,0.55)] leading-relaxed flex-grow">
        {service.description}
      </p>
    </>
  );

  return (
    <div className="glass-card flex flex-col p-4 transition-all duration-300 hover:bg-[rgba(255,255,255,0.08)] hover:border-[rgba(255,255,255,0.2)]">
      {service.url ? (
        <a
          href={service.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col flex-grow outline-none"
          data-testid={`link-${service.id}`}
        >
          {cardInner}
        </a>
      ) : (
        <div className="flex flex-col flex-grow">{cardInner}</div>
      )}
      {address && (
        <div
          className="group flex items-center gap-1 mt-3 pt-3 border-t border-[rgba(255,255,255,0.06)]"
          onClick={(e) => e.stopPropagation()}
        >
          <span className="text-[11px] font-mono text-[rgba(255,255,255,0.35)] flex-1 truncate" data-testid={`text-ip-${service.id}`}>
            {address}
          </span>
          <CopyButton value={address} data-testid={`copy-ip-${service.id}`} />
        </div>
      )}
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

function AddressRow({ label, value, testId }: { label: string; value: string; testId?: string }) {
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
      className="w-full flex items-center justify-between gap-2 px-3 py-2 rounded-md hover:bg-[rgba(255,255,255,0.06)] active:bg-[rgba(255,255,255,0.1)] transition-colors text-left group"
      title={`Copy ${value}`}
    >
      <span className="font-mono text-[11px] text-[rgba(255,255,255,0.65)] truncate flex-1 min-w-0">{value}</span>
      <div className="flex items-center gap-1.5 shrink-0">
        <span className="text-[9px] font-bold tracking-[0.15em] text-[rgba(255,255,255,0.25)] uppercase">{label}</span>
        <span className="text-[rgba(255,255,255,0.3)] group-hover:text-[#00e5c3] transition-colors">
          {copied ? <Check size={10} className="text-[#00e5c3]" /> : <Copy size={10} />}
        </span>
      </div>
    </button>
  );
}

function TailnetCard({ device }: { device: TailnetDevice }) {
  const isConnected = device.status === 'connected';

  return (
    <div className="glass-card flex flex-col h-full">
      {/* Header */}
      <div className="flex justify-between items-start p-4 pb-3">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`w-2 h-2 shrink-0 rounded-full ${isConnected ? 'bg-[#00e5c3] shadow-[0_0_8px_rgba(0,229,195,0.6)]' : 'bg-slate-600'}`} />
          <h4 className="text-sm font-semibold text-white truncate">{device.hostname}</h4>
        </div>
        <span className="text-[10px] font-mono text-[rgba(255,255,255,0.35)] shrink-0 ml-2">
          {isConnected ? 'Connected' : 'Offline'}
        </span>
      </div>
      {/* OS badge */}
      <div className="px-4 pb-3">
        <span className="text-[10px] font-mono text-[rgba(255,255,255,0.4)]">{device.os} · {device.version}</span>
        {device.updateAvailable && (
          <span className="ml-2 text-[9px] font-bold text-amber-400 tracking-wide">UPDATE</span>
        )}
      </div>
      {/* Addresses — each row is fully tappable */}
      <div className="border-t border-[rgba(255,255,255,0.06)] px-1 py-1 flex flex-col gap-0.5 flex-1">
        <AddressRow label="MAGICDNS" value={device.magicDns} testId={`copy-magicdns-${device.hostname}`} />
        <AddressRow label="IPV4"     value={device.ipv4}     testId={`copy-ipv4-${device.hostname}`} />
        <AddressRow label="IPV6"     value={device.ipv6}     testId={`copy-ipv6-${device.hostname}`} />
      </div>
    </div>
  );
}

function StatBar({ value, max, label }: { value: number, max: number, label: string }) {
  const percent = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className="flex flex-col gap-1 w-full px-1 py-2">
      <div className="flex justify-between items-end mb-1">
        <span className="text-[10px] font-bold tracking-[0.1em] text-[rgba(255,255,255,0.35)] uppercase">{label}</span>
        <span className="text-[11px] font-mono text-[#00e5c3] font-semibold">{percent.toFixed(1)}%</span>
      </div>
      <div className="h-px w-full bg-[rgba(255,255,255,0.08)] rounded-full overflow-hidden">
        <div className="h-full bg-gradient-to-r from-[#00e5c3] to-[#00b398] rounded-full shadow-[0_0_6px_rgba(0,229,195,0.5)]" style={{ width: `${percent}%` }}></div>
      </div>
    </div>
  );
}

function TailnetSection() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll);
    window.addEventListener('resize', checkScroll);
    return () => {
      el.removeEventListener('scroll', checkScroll);
      window.removeEventListener('resize', checkScroll);
    };
  }, [checkScroll]);

  return (
    <motion.section variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }} className="glass-section space-y-5">
      <h2 className="text-xs font-bold tracking-[0.2em] text-[rgba(255,255,255,0.35)] uppercase border-b border-[rgba(255,255,255,0.08)] pb-3">
        Tailnet Devices
      </h2>
      <div className="relative">
        <div
          ref={scrollRef}
          className="flex items-stretch gap-4 overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          data-testid="tailnet-scroll"
        >
          {config.tailnet.devices.map((device, idx) => (
            <div key={`${device.hostname}-${idx}`} className="shrink-0 w-64">
              <TailnetCard device={device} />
            </div>
          ))}
        </div>
        {/* Left scroll hint */}
        <div
          className="pointer-events-none absolute left-0 top-0 bottom-1 w-20 flex items-center justify-start pl-2 transition-opacity duration-300"
          style={{
            opacity: canScrollLeft ? 1 : 0,
            background: 'linear-gradient(to left, transparent, rgba(6,13,20,0.85))',
          }}
        >
          <ChevronRight size={16} className="text-[#00e5c3] animate-pulse rotate-180" />
        </div>
        {/* Right scroll hint */}
        <div
          className="pointer-events-none absolute right-0 top-0 bottom-1 w-20 flex items-center justify-end pr-2 transition-opacity duration-300"
          style={{
            opacity: canScrollRight ? 1 : 0,
            background: 'linear-gradient(to right, transparent, rgba(6,13,20,0.85))',
          }}
        >
          <ChevronRight size={16} className="text-[#00e5c3] animate-pulse" />
        </div>
      </div>
    </motion.section>
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

      {/* Ambient gradient blobs */}
      <div aria-hidden="true" className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div style={{ position: 'absolute', top: '-10%', left: '-5%', width: '55vw', height: '55vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,130,110,0.18) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', top: '30%', right: '-10%', width: '50vw', height: '50vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(30,60,140,0.22) 0%, transparent 70%)', filter: 'blur(80px)' }} />
        <div style={{ position: 'absolute', bottom: '10%', left: '20%', width: '40vw', height: '40vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(80,20,120,0.18) 0%, transparent 70%)', filter: 'blur(70px)' }} />
        <div style={{ position: 'absolute', top: '60%', left: '-8%', width: '35vw', height: '35vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,80,160,0.15) 0%, transparent 70%)', filter: 'blur(60px)' }} />
        <div style={{ position: 'absolute', bottom: '-5%', right: '5%', width: '45vw', height: '45vw', borderRadius: '50%', background: 'radial-gradient(circle, rgba(0,180,140,0.12) 0%, transparent 70%)', filter: 'blur(80px)' }} />
      </div>

      {/* Header - Fixed & Glass */}
      <div className="fixed top-0 left-0 right-0 z-50 glass-header">
        <div className="max-w-6xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="glitch text-xl font-bold text-[#00e5c3] tracking-tight drop-shadow-[0_0_8px_rgba(0,229,195,0.5)]">⌘</div>
            <h1 style={{ fontFamily: "'Press Start 2P', monospace", fontSize: '13px', lineHeight: 1, letterSpacing: '0.02em', animationDelay: '0.15s' }} className="glitch text-white drop-shadow-[0_0_6px_rgba(255,255,255,0.2)]">Center</h1>
          </div>
          <div className="flex items-center gap-4">
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-dgx-dashboard"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-mono text-[rgba(255,255,255,0.55)] hover:text-[#00e5c3] hover:bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(0,229,195,0.3)] transition-all"
            >
              DGX Dashboard
              <ExternalLink size={11} />
            </a>
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="link-terminal"
              className="p-1.5 text-[rgba(255,255,255,0.55)] hover:text-[#00e5c3] hover:bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] hover:border-[rgba(0,229,195,0.3)] rounded-md transition-all"
              title="Terminal"
            >
              <Terminal size={14} />
            </a>
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
          {config.sections.map((section, idx) => (
            <Fragment key={section.title}>
              <motion.section variants={item} className="glass-section space-y-5">
                <h2 className="text-xs font-bold tracking-[0.2em] text-[rgba(255,255,255,0.35)] uppercase border-b border-[rgba(255,255,255,0.08)] pb-3">
                  {section.title}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {section.services.map((service) => (
                    <ServiceCard key={service.id} service={service} />
                  ))}
                </div>
              </motion.section>
              {idx === 0 && <TailnetSection />}
            </Fragment>
          ))}

          <motion.section variants={item} className="glass-section space-y-5">
            <h2 className="text-xs font-bold tracking-[0.2em] text-[rgba(255,255,255,0.35)] uppercase border-b border-[rgba(255,255,255,0.08)] pb-3">
              Endpoints
            </h2>
            <table className="w-full text-left text-sm">
              <tbody>
                {config.endpoints.map((ep, i) => (
                  <tr key={i} className="border-b border-[rgba(255,255,255,0.05)] last:border-0">
                    <td className="py-3 pr-4 w-1 whitespace-nowrap">
                      <span className="text-[10px] px-2 py-1 rounded bg-[rgba(0,229,195,0.08)] text-[#00e5c3] font-bold tracking-wider border border-[rgba(0,229,195,0.15)]">
                        {ep.type}
                      </span>
                    </td>
                    <td className="py-3 font-semibold text-[rgba(255,255,255,0.7)] tracking-tight">{ep.label}</td>
                    <td className="py-3 font-mono text-xs text-[rgba(255,255,255,0.35)] text-right">{ep.url}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.section>

        </motion.div>

        {/* Footer */}
        <footer className="pt-8 pb-4 text-center">
          <div className="text-[10px] font-mono text-[rgba(255,255,255,0.3)]">
            <span className="text-[#00e5c3] mr-2">●</span> SYSTEM ONLINE // {lastRefreshed.toISOString()}
          </div>
        </footer>
      </div>
    </div>
  );
}