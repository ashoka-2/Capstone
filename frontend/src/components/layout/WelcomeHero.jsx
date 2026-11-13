import { Sparkles, Terminal, Code2, Globe, Play, ArrowRight, ShieldCheck } from 'lucide-react';
import { Button } from '../common/Button';
import { useSandbox } from '../../hooks/useSandbox';

export const WelcomeHero = () => {
  const { startSandbox, isCreating, error } = useSandbox();

  const features = [
    {
      icon: <Globe className="w-5 h-5 text-[var(--accent-text)]" />,
      title: 'Live Frontend Preview',
      desc: 'Instant hot-module reloading in an isolated preview iframe at your unique preview domain.',
    },
    {
      icon: <Sparkles className="w-5 h-5 text-amber-400" />,
      title: 'AI Code Generation',
      desc: 'Natural language chat with streaming AI that writes, refactors, and inspects project files.',
    },
    {
      icon: <Terminal className="w-5 h-5 text-emerald-400" />,
      title: 'Interactive Web Terminal',
      desc: 'Real-time bash PTY session powered by xterm.js and Socket.IO for total shell access.',
    },
    {
      icon: <Code2 className="w-5 h-5 text-indigo-400" />,
      title: 'Monaco Code Inspector',
      desc: 'Browse workspace files, inspect code with syntax highlighting, and save instant edits.',
    },
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 overflow-y-auto">
      <div className="max-w-2xl w-full text-center space-y-8 animate-in fade-in zoom-in-95 duration-300">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[var(--r-pill)] bg-[var(--surface)] border border-[var(--line-strong)] text-xs font-medium text-[var(--text-muted)] shadow-xs">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--success)]" />
          <span>Isolated Kubernetes Container Sandbox</span>
        </div>

        {/* Headline */}
        <div className="space-y-3">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-[var(--text)]">
            Instant AI Sandbox & Live Frontend Workspace
          </h1>
          <p className="text-sm md:text-base text-[var(--text-muted)] max-w-lg mx-auto leading-relaxed">
            Provision a sandboxed Vite + React environment in seconds. Chat with AI to build UI components, inspect code, and control the terminal in real time.
          </p>
        </div>

        {/* Start Action */}
        <div className="flex flex-col items-center gap-3 pt-2">
          <Button
            variant="accent"
            size="lg"
            icon={<Play className="w-4 h-4 fill-current" />}
            trailingIcon={<ArrowRight className="w-4 h-4" />}
            loading={isCreating}
            onClick={startSandbox}
            className="shadow-md hover:shadow-lg transition-all"
          >
            {isCreating ? 'Provisioning Sandbox Environment...' : 'Start New Sandbox'}
          </Button>

          {error && (
            <p className="text-xs text-[var(--danger)] font-mono bg-[var(--danger-soft)] px-3 py-1.5 rounded-lg border border-red-500/20 max-w-md">
              {error}
            </p>
          )}
        </div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-left pt-6">
          {features.map((item, index) => (
            <div
              key={index}
              className="p-5 rounded-[var(--r-card)] bg-[var(--surface)] border border-[var(--line)] space-y-2 hover:border-[var(--line-strong)] transition-colors shadow-xs"
            >
              <div className="w-9 h-9 rounded-xl bg-[var(--surface-2)] border border-[var(--line)] flex items-center justify-center">
                {item.icon}
              </div>
              <h3 className="text-sm font-semibold text-[var(--text)]">{item.title}</h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default WelcomeHero;
