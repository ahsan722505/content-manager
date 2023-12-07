import { useEffect, useState } from "react";
import "./App.css";
import Content from "./Components/Content";
import { Input, message } from "antd";

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

  const deleteContentHandler = (content: string) => {
    setContents((state) => state.filter((c) => c !== content));
    window.electronAPI.deleteContent(content);
    message.success("Content deleted successfully");
  };

  return (
    <div className="m-3">
      <Input
        className="mb-3"
        placeholder="Search Content"
        onChange={(e) => setSearchedText(e.target.value)}
      />
      {filteredContents.map((c) => (
        <Content content={c} deleteContenthandler={deleteContentHandler} />
      ))}
    </div>
  );
}

export default App;
