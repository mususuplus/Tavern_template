import { parseLoreLines, selectLoreSections } from '../data/loreUtils';

export function LoreText({
  content,
  compact = false,
  sections,
}: {
  content: string;
  compact?: boolean;
  sections?: string[];
}) {
  const lines = sections ? selectLoreSections(content, sections) : parseLoreLines(content);
  const visible = compact ? lines.slice(0, 7) : lines;

  return (
    <div className={`lore-text${compact ? ' is-compact' : ''}`}>
      {visible.map((line, index) => {
        if (line.kind === 'heading') {
          return (
            <h4 key={`${line.label}-${index}`} style={{ '--lore-depth': line.depth } as React.CSSProperties}>
              {line.label}
            </h4>
          );
        }
        if (line.kind === 'bullet') {
          return (
            <p
              className="lore-bullet"
              key={`${line.value}-${index}`}
              style={{ '--lore-depth': line.depth } as React.CSSProperties}
            >
              <span aria-hidden="true">✦</span>
              {line.value}
            </p>
          );
        }
        return (
          <p key={`${line.label ?? 'line'}-${index}`} style={{ '--lore-depth': line.depth } as React.CSSProperties}>
            {line.label && <strong>{line.label}</strong>}
            {line.label && line.value && <span className="lore-separator"> / </span>}
            {line.value}
          </p>
        );
      })}
      {compact && lines.length > visible.length && <small>完整卷宗可在聚焦后展开</small>}
    </div>
  );
}
