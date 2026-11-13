import { Eye, Code2, Terminal as TerminalIcon, Sparkles, PanelLeft } from 'lucide-react';
import { useSandbox } from '../../hooks/useSandbox';
import { useAppSelector } from '../../store/hooks';

export const TabsHeader = ({
  isChatCollapsed,
  onToggleChatCollapse,
  isMobile,
  mobileTab,
  onSelectMobileTab,
}) => {
  const { activeTab, switchTab } = useSandbox();
  const isTerminalConnected = useAppSelector((state) => state.terminal.isConnected);
  const unsavedCount = useAppSelector(
    (state) => Object.values(state.files.isUnsaved).filter(Boolean).length
  );

  const desktopTabs = [
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

  const mobileTabs = [
    {
      id: 'chat',
      label: 'AI Chat',
      icon: <Sparkles className="w-4 h-4 text-[var(--accent-text)]" />,
    },
    ...desktopTabs,
  ];

  const currentTabs = isMobile ? mobileTabs : desktopTabs;
  const currentActive = isMobile ? mobileTab : activeTab;
  const handleTabClick = isMobile ? onSelectMobileTab : switchTab;

  return (
    <div className="flex items-center gap-1.5 px-3 py-2 border-b border-[var(--line)] bg-[var(--surface)] overflow-x-auto shrink-0 select-none">
      {/* Desktop expand button when chat is collapsed */}
      {!isMobile && isChatCollapsed && onToggleChatCollapse && (
        <button
          type="button"
          onClick={onToggleChatCollapse}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--r-pill)] text-xs font-medium cursor-pointer transition-all duration-150 text-[var(--accent-text)] bg-[var(--accent-soft)] hover:bg-[var(--accent-soft)]/80 border border-[var(--accent)]/30 mr-1"
          title="Open AI Chat Sidebar"
        >
          <PanelLeft className="w-3.5 h-3.5" />
          <span>AI Chat</span>
        </button>
      )}

      {currentTabs.map((tab) => {
        const isActive = currentActive === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => handleTabClick(tab.id)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-[var(--r-pill)] text-xs font-medium cursor-pointer transition-all duration-150 ${
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
