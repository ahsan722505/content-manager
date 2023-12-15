import { useEffect, useState } from "react";
import "./App.css";
import EachContent from "./Components/EachContent";
import { Checkbox, Input } from "antd";
import { Content } from "../electron/utils";

function App() {
  const [contents, setContents] = useState<Content[]>([]);
  const [searchedText, setSearchedText] = useState<string>("");
  const [showContentsHavingHotKey, setShowContentsHavingHotKey] =
    useState(false);

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

  const filteredContents = contents.filter(
    (c) =>
      c.content.toLowerCase().includes(searchedText.toLowerCase().trim()) &&
      (showContentsHavingHotKey ? Boolean(c.hotkey) : true)
  );

  return (
    <div className="m-3">
      <Input
        className="mb-3"
        placeholder="Search Content"
        onChange={(e) => setSearchedText(e.target.value)}
      />
      <Checkbox
        value={showContentsHavingHotKey}
        onChange={() => setShowContentsHavingHotKey((state) => !state)}
        className="mb-2"
      >
        Show Contents having hotkey
      </Checkbox>
      {filteredContents.map((c) => (
        <EachContent key={c.ID} content={c} setContents={setContents} />
      ))}
    </div>
  );
}

export default App;
