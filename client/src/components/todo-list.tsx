import type { Todo } from "../types/todo";
import TodoItem from "./todo-item";
import EmptyState from "./empty-state";

interface TodoListProps {
  todos: Todo[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function TodoList({ todos, onToggle, onDelete }: TodoListProps) {
  if (todos.length === 0) {
    return <EmptyState />;
  }

  return (
    <ul
      role="list"
      aria-label="Todo list"
      aria-live="polite"
      className="flex flex-col gap-2"
    >
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          onToggle={onToggle}
          onDelete={onDelete}
        />
      ))}
    </ul>
  );
}
