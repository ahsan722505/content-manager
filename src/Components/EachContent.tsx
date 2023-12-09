import { Button, Popconfirm, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { Content } from "../../electron/utils";

const EachContent = ({
  content,
  deleteContenthandler,
}: {
  content: Content;
  deleteContenthandler: (content: Content) => void;
}) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(content.content);
    message.success("Copied!");
  };

  return (
    <div className="border border-gray-300 rounded-lg mb-3 p-2">
      <div className="flex justify-end pr-7">
        <Popconfirm
          title="Delete the content"
          description="Are you sure to delete this content?"
          onConfirm={() => deleteContenthandler(content)}
          okText="Yes"
          cancelText="No"
          okButtonProps={{ danger: true }}
        >
          <Button danger size="small">
            Delete
          </Button>
        </Popconfirm>
        <Button
          onClick={handleCopy}
          icon={<CopyOutlined />}
          size="small"
          className="ml-2"
        >
          Copy
        </Button>
      </div>
      <p>{content.content}</p>
    </div>
  );
};

export default EachContent;
