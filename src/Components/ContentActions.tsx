import { Dropdown, MenuProps, Popconfirm, message } from "antd";
import { MoreOutlined, KeyOutlined, DeleteOutlined } from "@ant-design/icons";
import { Content } from "../../electron/utils";
import AssignHotKey from "./AssignHotKey";

const ContentActions = ({
  setContents,
  content,
}: {
  setContents: React.Dispatch<React.SetStateAction<Content[]>>;
  content: Content;
}) => {
  const deleteContentHandler = (content: Content) => {
    setContents((state) => state.filter((c) => c.ID !== content.ID));
    window.electronAPI.deleteContent(content);
    message.success("Content deleted successfully");
  };

  const items: MenuProps["items"] = [
    {
      key: "1",
      label: (
        <Popconfirm
          title="Delete the content"
          description="Are you sure to delete this content?"
          onConfirm={() => deleteContentHandler(content)}
          okText="Yes"
          cancelText="No"
          okButtonProps={{ danger: true }}
        >
          Delete Content
        </Popconfirm>
      ),
      icon: <DeleteOutlined />,
    },
    {
      key: "2",
      label: (
        <AssignHotKey
          edit={Boolean(content.hotkey)}
          setContents={setContents}
          content={content}
        />
      ),
      icon: <KeyOutlined />,
    },
  ];
  return (
    <Dropdown menu={{ items }} placement="bottomLeft">
      <MoreOutlined className="cursor-pointer" />
    </Dropdown>
  );
};

export default ContentActions;
