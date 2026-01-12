import * as React from 'react';
import { createRoot } from 'react-dom/client';
import { parse, format } from './DateEditorUtils';

const DEFAULT_DATE_INPUT_FORMAT = 'YYYY-MM-DD'; // date-fns 'yyyy-MM-dd';

const inputCss: React.CSSProperties = {
  width: '100%',
  height: '100%',
  fontSize: '1em',
  fontFamily: 'inherit'
};

interface IProps {
  cell: any;
  onRendered: (fn: () => void) => void;
  success: (value: any) => void;
  cancel: () => void;
  editorParams?: any;
}

function Editor(props: IProps): JSX.Element {
  const { cell, onRendered, success, cancel, editorParams } = props;
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const formatStr = editorParams?.format ?? 'MM/DD/YYYY';

  const [rawValue, setRawValue] = React.useState<string>(cell.getValue() ?? '');

  // compute the default value for the date input (YYYY-MM-DD)
  const defaultInputValue = React.useMemo(() => {
    const parsed = parse(cell.getValue(), formatStr);
    if (parsed) {
      try {
        return format(parsed, DEFAULT_DATE_INPUT_FORMAT);
      } catch (err) {
        console.error(err);
      }
    }
    return format(new Date(), DEFAULT_DATE_INPUT_FORMAT);
  }, [cell, formatStr]);

  React.useEffect(() => {
    onRendered(() => {
      inputRef.current?.focus();
    });
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- no dependencies means only run on mount

  const setValueOnSuccess = React.useCallback(
    (value = rawValue) => {
      if (!value) {
        // user deleted value in the cell => set to ''
        // const result = format(new Date(), this.format);
        success('');
        return;
      }

      let result = value;
      try {
        if (result.indexOf('-') > 0) {
          // value is "yyyy-MM-dd" => parse it
          const valueDate = parse(value, 'YYYY-MM-DD');
          if (valueDate) {
            result = format(valueDate, formatStr);
          } else {
            throw new Error('Invalid date parsed');
          }
        }
      } catch (err) {
        console.error('ERROR', err);
        result = format(new Date(), DEFAULT_DATE_INPUT_FORMAT);
      }

      success(result);
    },
    [rawValue, success, formatStr]
  );

  const onChange = (ev: React.ChangeEvent<HTMLInputElement>) => {
    setRawValue(ev.target.value);
  };

  const onKeyUp = (ev: React.KeyboardEvent<HTMLInputElement>) => {
    if (ev.key === 'Enter') {
      const today = format(new Date(), DEFAULT_DATE_INPUT_FORMAT);
      const value = rawValue || today;
      setValueOnSuccess(value);
    } else if (ev.key === 'Escape') {
      cancel();
    }
  };

  const onBlur = () => {
    setValueOnSuccess();
  };

  return (
    <input
      type="date"
      ref={(r) => (inputRef.current = r)}
      defaultValue={defaultInputValue}
      onBlur={onBlur}
      onChange={onChange}
      onKeyUp={onKeyUp}
      style={inputCss}
    />
  );
}

export default function DateEditor(
  cell: any,
  onRendered: (fn: () => void) => void,
  success: (value: any) => void,
  cancel: () => void,
  editorParams?: any
) {
  const container = document.createElement('div');
  container.style.height = '100%';
  const root = createRoot(container);
  root.render(
    <Editor cell={cell} onRendered={onRendered} success={success} cancel={cancel} editorParams={editorParams} />
  );
  return container;
}
