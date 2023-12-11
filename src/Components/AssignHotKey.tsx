import { useEffect, useState } from "react";
import { Button, Input, Modal, message } from "antd";
import { KeyOutlined } from "@ant-design/icons";
import { Content } from "../../electron/utils";

const AssignHotKey = ({
  contentId,
  setContents,
}: {
  contentId: number;
  setContents: React.Dispatch<React.SetStateAction<Content[]>>;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hotkey, setHotkey] = useState<Set<string>>(new Set());

  const handleOk = async () => {
    try {
      const res = await window.electronAPI.assignHotkey(
        contentId,
        Array.from(hotkey).join("+")
      );
      setContents((state) =>
        state.map((c) => {
          if (c.ID === contentId) {
            return { ...c, hotkey: Array.from(hotkey).join("+") };
          }
          return c;
        })
      );
      message.success(res);
      setIsModalOpen(false);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message.slice(err.message.indexOf(":") + 1)
          : "Something went wrong";
      message.error(errorMessage);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      setHotkey((state) => {
        const newState = new Set(state);
        newState.add(e.key);
        return newState;
      });
    };

    if (isModalOpen) {
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isModalOpen]);

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        icon={<KeyOutlined />}
        size="small"
        className="ml-2"
      >
        Assign Hotkey
      </Button>
      <Modal
        title="Assign Hotkey"
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button key="clear" onClick={() => setHotkey(new Set())}>
            Clear
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleOk}
            className="bg-green-600"
            disabled={hotkey.size === 0}
          >
            Assign
          </Button>,
        ]}
      >
        <Input
          className="!text-black !cursor-pointer"
          disabled
          value={Array.from(hotkey).join(" + ")}
          placeholder="Press Hotkey"
        />
      </Modal>
    </>
  );
};

export default AssignHotKey;
