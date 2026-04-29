import type { Todo } from "../types/todo";

interface TodoItemProps {
  todo: Todo;
}

export default function TodoItem({ todo }: TodoItemProps) {
  return (
    <li className="border border-border rounded-lg px-4 py-3 flex items-center gap-3 hover:border-gray-300 hover:shadow-sm transition-all duration-150">
      <span
        className={`flex-1 text-base ${
          todo.completed
            ? "line-through text-text-secondary opacity-70"
            : "text-text-primary"
        }`}
      >
        {todo.text}
      </span>
    </li>
  );
}
