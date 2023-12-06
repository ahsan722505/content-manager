import { Button } from "antd";
import { CopyOutlined } from "@ant-design/icons";

const Content = ({ content }: { content: string }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="border border-gray-300 rounded-lg mb-3 p-2">
      <div className="flex justify-end">
        <Button danger size="small">
          Delete
        </Button>
        <Button
          onClick={handleCopy}
          icon={<CopyOutlined />}
          size="small"
          className="ml-2"
        >
          Copy
        </Button>
      </div>
      <p>{content}</p>
    </div>
  );
};

export default Content;
