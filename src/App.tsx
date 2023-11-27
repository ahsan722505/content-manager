import { useEffect, useState } from "react";
import "./App.css";

function App() {
  const [contents, setContents] = useState<string[]>([]);

  useEffect(() => {
    window.electronAPI.getContents().then((contents) => setContents(contents));

    window.electronAPI.subscribeClipboardData((_, text) => {
      setContents((state) => [text, ...state]);
    });

    return () => {
      window.electronAPI.unsubscribeClipboardData();
    };
  }, []);

  return (
    <div>
      {contents.map((c) => (
        <li>{c}</li>
      ))}
    </div>
  );
}

export default App;
