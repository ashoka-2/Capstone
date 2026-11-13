import { Eye, Code2, Terminal as TerminalIcon } from 'lucide-react';
import { useSandbox } from '../../hooks/useSandbox';
import { useAppSelector } from '../../store/hooks';

export const TabsHeader = () => {
  const { activeTab, switchTab } = useSandbox();
  const isTerminalConnected = useAppSelector((state) => state.terminal.isConnected);
  const unsavedCount = useAppSelector(
    (state) => Object.values(state.files.isUnsaved).filter(Boolean).length
  );

  const tabs = [
    {
      id: 'preview',
      label: 'Live Preview',
      icon: <Eye className="w-4 h-4" />,
    },
    {
      id: 'code',
      label: 'Code Editor',
      icon: <Code2 className="w-4 h-4" />,
      badge: unsavedCount > 0 ? `${unsavedCount} unsaved` : null,
      badgeColor: 'bg-[var(--warning-soft)] text-[var(--warning)]',
    },
    {
      id: 'terminal',
      label: 'Terminal',
      icon: <TerminalIcon className="w-4 h-4" />,
      dot: isTerminalConnected ? 'bg-[var(--success)]' : 'bg-[var(--text-subtle)]',
    },
  ];

  return (
    <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[var(--line)] bg-[var(--surface)] overflow-x-auto shrink-0">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => switchTab(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[var(--r-pill)] text-xs font-medium cursor-pointer transition-all duration-150 select-none ${
              isActive
                ? 'bg-[var(--surface-2)] text-[var(--text)] border border-[var(--line-strong)] shadow-xs'
                : 'text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-2)]/50 border border-transparent'
            }`}
          >
            <span className={isActive ? 'text-[var(--accent-text)]' : 'text-current'}>
              {tab.icon}
            </span>
            <span>{tab.label}</span>

            {tab.badge && (
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${tab.badgeColor}`}>
                {tab.badge}
              </span>
            )}

            {tab.dot && (
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${tab.dot}`} />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default TabsHeader;
