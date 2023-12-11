import { Button, Popconfirm, message } from "antd";
import { CopyOutlined } from "@ant-design/icons";
import { Content } from "../../electron/utils";
import AssignHotKey from "./AssignHotKey";

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
  const deleteContentHandler = (content: Content) => {
    setContents((state) => state.filter((c) => c.ID !== content.ID));
    window.electronAPI.deleteContent(content);
    message.success("Content deleted successfully");
  };

  return (
    <div className="border border-gray-300 rounded-lg mb-3 p-2">
      <div className="flex justify-end pr-7">
        <Popconfirm
          title="Delete the content"
          description="Are you sure to delete this content?"
          onConfirm={() => deleteContentHandler(content)}
          okText="Yes"
          cancelText="No"
          okButtonProps={{ danger: true }}
        >
          <Button danger size="small">
            Delete
          </Button>
        </Popconfirm>
        {content.hotkey ? (
          <p className="border border-gray-300 rounded ml-2 pl-2 pr-2 text-sm">
            {content.hotkey}
          </p>
        ) : (
          <AssignHotKey setContents={setContents} contentId={content.ID} />
        )}

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
