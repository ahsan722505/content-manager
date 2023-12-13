import { Button, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { Content } from "../../electron/utils";
import ContentActions from "./ContentActions";

const EachContent = ({
  content,
  setContents,
}: {
  content: Content;
  setContents: React.Dispatch<React.SetStateAction<Content[]>>;
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(content.content);
    message.success("Copied!");
  };

  return (
    <div className="border border-gray-300 rounded-lg mb-3 p-2">
      <div className="flex justify-end pr-7">
        {content.hotkey && (
          <p className="border border-gray-300 rounded ml-2 pl-2 pr-2 text-sm">
            {content.hotkey}
          </p>
        )}
        <Button
          onClick={handleCopy}
          icon={<CopyOutlined />}
          size="small"
          className="ml-2 mr-2"
        >
          Copy
        </Button>
        <ContentActions content={content} setContents={setContents} />
      </div>
      <p>{content.content}</p>
    </div>
  );
};

export default EachContent;
