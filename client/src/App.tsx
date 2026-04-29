import { useTodos } from "./hooks/use-todos";
import TodoInput from "./components/todo-input";
import TodoList from "./components/todo-list";

function App() {
  const { todos, isLoading, addTodo } = useTodos();

  return (
    <main className="min-h-screen bg-bg-surface">
      <div className="mx-auto max-w-[640px] px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-text-primary mb-6">Todos</h1>
        <TodoInput onAdd={addTodo} />
        <div className="mt-6">
          {isLoading ? (
            <p className="text-center py-10 text-text-secondary text-sm">
              Loading...
            </p>
          ) : (
            <TodoList todos={todos} />
          )}
        </div>
      </div>
    </main>
  );
}

export default App;
