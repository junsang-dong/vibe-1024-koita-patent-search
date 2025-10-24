import { X } from 'lucide-react';

interface TagChipsProps {
  tags: string[];
  onRemove?: (tag: string) => void;
  readOnly?: boolean;
  color?: 'blue' | 'green' | 'purple' | 'gray';
}

export default function TagChips({ 
  tags, 
  onRemove, 
  readOnly = false,
  color = 'blue' 
}: TagChipsProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-800',
    green: 'bg-green-100 text-green-800',
    purple: 'bg-purple-100 text-purple-800',
    gray: 'bg-gray-100 text-gray-800',
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <span
          key={`${tag}-${index}`}
          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${colorClasses[color]}`}
        >
          {tag}
          {!readOnly && onRemove && (
            <button
              onClick={() => onRemove(tag)}
              className="ml-2 hover:bg-white/50 rounded-full p-0.5 transition-colors"
              aria-label={`Remove ${tag}`}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </span>
      ))}
    </div>
  );
}

