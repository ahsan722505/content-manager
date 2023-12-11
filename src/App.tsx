import { useEffect, useState } from "react";
import "./App.css";
import EachContent from "./Components/EachContent";
import { Input } from "antd";
import { Content } from "../electron/utils";

function App() {
  const [contents, setContents] = useState<Content[]>([]);
  const [searchedText, setSearchedText] = useState<string>("");

  useEffect(() => {
    window.electronAPI.getContents().then((contents) => setContents(contents));

    window.electronAPI.subscribeClipboardData((_, content) => {
      setContents((state) => [
        content,
        ...state.filter((c) => c.content !== content.content),
      ]);
    });

    return () => {
      window.electronAPI.unsubscribeClipboardData();
    };
  }, []);

  const filteredContents = contents.filter((c) =>
    c.content.toLowerCase().includes(searchedText.toLowerCase().trim())
  );

  return (
    <div className="m-3">
      <Input
        className="mb-3"
        placeholder="Search Content"
        onChange={(e) => setSearchedText(e.target.value)}
      />
      {filteredContents.map((c) => (
        <EachContent key={c.ID} content={c} setContents={setContents} />
      ))}
    </div>
  );
}

export default App;
