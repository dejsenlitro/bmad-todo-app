import { useState, useRef, useEffect } from "react";

interface TodoInputProps {
  onAdd: (text: string) => void;
}

export default function TodoInput({ onAdd }: TodoInputProps) {
  const [text, setText] = useState("");
  const [shaking, setShaking] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) {
      setShaking(true);
      setTimeout(() => setShaking(false), 300);
      return;
    }
    onAdd(trimmed);
    setText("");
    inputRef.current?.focus();
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col sm:flex-row gap-2"
      style={shaking ? { animation: "shake 300ms ease-in-out" } : undefined}
    >
      <input
        ref={inputRef}
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Add a new todo..."
        aria-label="Add a new todo"
        autoComplete="off"
        spellCheck="true"
        className="flex-1 border-2 border-border rounded-lg px-4 py-3 text-text-primary placeholder:text-text-placeholder focus:outline-none focus:border-accent focus:ring-2 focus:ring-accent/20"
      />
      <button
        type="submit"
        className="bg-accent hover:bg-accent-hover text-white rounded-lg px-5 py-3 font-semibold transition-colors duration-150 cursor-pointer"
      >
        Add
      </button>
    </form>
  );
}
