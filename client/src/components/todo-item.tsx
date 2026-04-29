import type { Todo } from "../types/todo";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TodoItem({ todo, onToggle, onDelete }: TodoItemProps) {
  return (
    <li className="border border-border rounded-lg px-4 py-3 flex items-center gap-3 hover:border-gray-300 hover:shadow-sm motion-safe:transition-all motion-safe:duration-150">
      <button
        type="button"
        role="checkbox"
        aria-checked={todo.completed}
        aria-label={`Mark ${todo.text} as complete`}
        onClick={() => onToggle(todo.id)}
        className="flex-shrink-0 w-[22px] h-[22px] border-2 border-border rounded cursor-pointer flex items-center justify-center motion-safe:transition-colors motion-safe:duration-200 focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
        style={todo.completed ? { backgroundColor: '#2563eb', borderColor: '#2563eb' } : undefined}
      >
        {todo.completed && (
          <svg className="w-3 h-3 text-white" viewBox="0 0 12 12" fill="none" aria-hidden="true">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <span
        className={`flex-1 text-base motion-safe:transition-all motion-safe:duration-200 ${
          todo.completed
            ? "line-through text-text-secondary opacity-70"
            : "text-text-primary"
        }`}
      >
        {todo.text}
      </span>
      <button
        type="button"
        aria-label={`Delete ${todo.text}`}
        onClick={() => onDelete(todo.id)}
        className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded text-gray-300 hover:text-red-600 hover:bg-red-50 motion-safe:transition-colors motion-safe:duration-150 cursor-pointer focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
      >
        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
      </button>
    </li>
  );
}
