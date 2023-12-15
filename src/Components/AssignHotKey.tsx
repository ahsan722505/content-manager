import { useEffect, useState } from "react";
import { Button, Input, Modal, message } from "antd";
import { Content } from "../../electron/utils";

const AssignHotKey = ({
  content,
  setContents,
  edit,
}: {
  content: Content;
  setContents: React.Dispatch<React.SetStateAction<Content[]>>;
  edit: boolean;
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [hotkey, setHotkey] = useState<Set<string>>(
    new Set(content.hotkey?.split("+") || [])
  );

  const handleOk = async (operation: "Assign" | "Unassign") => {
    try {
      let res: string;
      if (operation === "Assign") {
        res = await window.electronAPI.assignHotkey(
          content,
          Array.from(hotkey).join("+")
        );
      } else {
        res = await window.electronAPI.unassignHotkey(content);
      }
      setContents((state) =>
        state.map((c) => {
          if (c.ID === content.ID) {
            return {
              ...c,
              hotkey:
                operation === "Assign" ? Array.from(hotkey).join("+") : null,
            };
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
        if (e.key === "Backspace") {
          newState.delete(Array.from(state).pop() || "");
        } else newState.add(e.key);
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
      <div onClick={() => setIsModalOpen(true)}>
        {edit ? "Edit" : "Assign"} Hotkey
      </div>
      <Modal
        title={`${edit ? "Edit" : "Assign"} Hotkey`}
        open={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        footer={[
          <Button
            key="assign"
            type="primary"
            onClick={() => handleOk("Assign")}
            className="bg-green-600"
            disabled={hotkey.size === 0}
          >
            Assign
          </Button>,
          edit && (
            <Button key="unassign" danger onClick={() => handleOk("Unassign")}>
              Unassign
            </Button>
          ),
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
