import { useEffect, useState } from "react";
import "./App.css";
import Content from "./Components/Content";

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
    <div className="m-3">
      {contents.map((c) => (
        <Content content={c} />
      ))}
    </div>
  );
}

export default App;
