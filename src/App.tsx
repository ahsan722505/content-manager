import { useEffect, useState } from "react";
import "./App.css";
import Content from "./Components/Content";
import { Input } from "antd";

function App() {
  const [contents, setContents] = useState<string[]>([]);
  const [searchedText, setSearchedText] = useState<string>("");

  useEffect(() => {
    window.electronAPI.getContents().then((contents) => setContents(contents));

    window.electronAPI.subscribeClipboardData((_, text) => {
      setContents((state) => [...new Set([text, ...state])]);
    });

    return () => {
      window.electronAPI.unsubscribeClipboardData();
    };
  }, []);

  const filteredContents = contents.filter((c) =>
    c.toLowerCase().includes(searchedText.toLowerCase().trim())
  );

  return (
    <div className="m-3">
      <Input
        className="mb-3"
        placeholder="Search Content"
        onChange={(e) => setSearchedText(e.target.value)}
      />
      {filteredContents.map((c) => (
        <Content content={c} />
      ))}
    </div>
  );
}

export default App;
