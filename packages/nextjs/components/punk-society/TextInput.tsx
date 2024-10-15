import { ChangeEvent, FocusEvent, ReactNode, useCallback, useEffect, useRef } from "react";

interface TextInputProps {
  content: string;
  setContent: (desc: string) => void;
  placeholder?: string;
  error?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  reFocus?: boolean;
}

export const TextInput: React.FC<TextInputProps> = ({
  content,
  setContent,
  placeholder,
  error,
  prefix,
  suffix,
  reFocus,
}) => {
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  let modifier = "";
  if (error) {
    modifier = "border-error";
  }

  const handleChange = useCallback(
    (e: ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
    },
    [setContent],
  );

  const onFocus = (e: FocusEvent<HTMLTextAreaElement, Element>) => {
    if (reFocus !== undefined) {
      e.currentTarget.setSelectionRange(e.currentTarget.value.length, e.currentTarget.value.length);
    }
  };

  useEffect(() => {
    if (reFocus !== undefined && reFocus === true) textAreaRef.current?.focus();
  }, [reFocus]);

  return (
    <div className="text-left flex-1">
      <div className={`flex bg-base-200 rounded-lg text-accent ${modifier}`}>
        {prefix}
        <textarea
          className="textarea text-lg textarea-ghost border-base-300 focus:border-green-600 border-2 rounded-lg focus:outline-none focus:bg-transparent focus:text-gray-400 h-auto min-h-[3rem] px-4 w-full font-medium placeholder:text-accent/50 text-green-500 resize-none"
          placeholder={placeholder}
          name="description"
          value={content}
          onChange={handleChange}
          autoComplete="off"
          ref={textAreaRef}
          onFocus={onFocus}
          rows={3} // You can adjust the initial height as needed
        />
        {suffix}
      </div>
    </div>
  );
};
