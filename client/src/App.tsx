import { useTodos } from "./hooks/use-todos";
import TodoInput from "./components/todo-input";
import TodoList from "./components/todo-list";
import ErrorBanner from "./components/error-banner";

function App() {
  const { todos, isLoading, error, addTodo, toggleTodo, removeTodo } = useTodos();

  return (
    <main className="min-h-screen bg-bg-surface">
      <a
        href="#todo-input"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:bg-accent focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:text-sm focus:font-semibold"
      >
        Skip to add todo
      </a>
      <div className="mx-auto max-w-[640px] px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Todos</h1>
        <TodoInput onAdd={addTodo} />
        {error && (
          <div className="mt-3">
            <ErrorBanner message={error} />
          </div>
        )}
        <div className="mt-6">
          {isLoading ? (
            <p className="text-center py-10 text-text-secondary text-sm">
              Loading...
            </p>
          ) : (
            <TodoList todos={todos} onToggle={toggleTodo} onDelete={removeTodo} />
          )}
        </div>
      </div>
    </main>
  );
}

export default App;
