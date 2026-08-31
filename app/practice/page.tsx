'use client';

import { useState } from 'react';

export default function Practice() {
  const [count, setCount] = useState(0);

  return (
    <div className="flex flex-col flex-1 items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-center py-32 px-16 bg-white text-center dark:bg-black">
        <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
          Practice Page
        </h1>
        
        <div className="mt-8 p-8 border-2 border-blue-500 rounded-lg">
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            You clicked the button: <span className="font-bold text-blue-600">{count}</span> times
          </p>
          
          <button
            onClick={() => setCount(count + 1)}
            className="mt-6 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-bold rounded-lg transition"
          >
            Click Me! 🎉
          </button>
        </div>
      </main>
    </div>
  );
}
