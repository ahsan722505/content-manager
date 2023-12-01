const Content = ({ content }: { content: string }) => {
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
  };

  return (
    <div className="border border-gray-300 rounded-lg mb-3 p-2">
      <p onClick={handleCopy} className="cursor-pointer">
        {content}
      </p>
    </div>
  );
};

export default Content;
