type SectionPlaceholderProps = {
  title: string;
  description: string;
};

export function SectionPlaceholder({
  title,
  description,
}: SectionPlaceholderProps) {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="editorial-heading text-3xl">{title}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="surface-card p-6">
        <span className="eyebrow">Coming in the next stage</span>
        <p className="mt-3 text-sm text-muted-foreground">
          This module is part of the foundation and will be implemented in the
          next development stage.
        </p>
      </div>
    </div>
  );
}
