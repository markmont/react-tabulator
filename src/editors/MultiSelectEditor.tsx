import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { createPortal } from 'react-dom';
import { ReactTags, type Tag } from 'react-tag-autocomplete';

interface IProps {
  cell: any;
  onRendered: (fn: () => void) => void;
  success: (value: string[]) => void;
  editorParams?: any;
  editorId: string;
  root: Root;
}

const Editor: React.FC<IProps> = ({ cell, onRendered, success, editorParams, editorId, root }) => {
  // Map cell values to tag objects
  const [values, setValues] = useState<Tag[]>(
    (cell.getValue() || []).map((item: any) => (typeof item === 'string' ? { value: item, label: item } : item))
  );

  const containerRef = useRef<any>(null);
  const portalRef = useRef<any>(null);
  const tagsApi = useRef<any>(null);

  // On mount, position the portal and focus the tags component
  useEffect(() => {
    if (containerRef.current) {
      // Tell our caller the mouse button was released and the user isn't trying to move a row
      const container = containerRef.current;
      const e = new MouseEvent('mouseup', { bubbles: true, cancelable: true });
      container.dispatchEvent(e);
      // Position the portal over the cell
      if (portalRef.current) {
        const pos = container.getBoundingClientRect();
        const portal = portalRef.current;
        portal.style.top = `${pos.top}px`;
        portal.style.left = `${pos.left}px`;
        portal.style.width = `${pos.width}px`;
      }
    }
    tagsApi.current?.input?.focus?.();
    onRendered(() => {});
  }, []); // eslint-disable-line react-hooks/exhaustive-deps -- no dependencies means only run on mount

  const onDelete = useCallback(
    (tagIndex: number) => {
      const newValues = values.filter((_, index) => index !== tagIndex);
      setValues(newValues);
    },
    [values]
  );

  const onAdd = useCallback(
    (newTag: Tag) => {
      const newValues = [...values, newTag];
      setValues(newValues);
    },
    [values]
  );

  const onBlur = useCallback(() => {
    // The DOM isn't yet updated, so use requestAnimationFrame to wait until after the DOM paint
    window.requestAnimationFrame(() => {
      const el = document.getElementById(editorId);
      if (el && !el.classList.contains('is-active')) {
        root.unmount();
        success(values.map((v) => v.value as string));
      }
    });
  }, [editorId, root, success, values]);

  // If editorParams.values is present and is an array, convert any entries in the old form
  //   { id: 'cat', name: 'cat' }
  // to the new form
  //   { value: 'cat', label: 'cat' }
  const suggestions = useMemo(() => {
    const epValues = editorParams?.values || [];
    const epValuesFixed = epValues.map((item: any) => {
      if (!('value' in item) && 'id' in item && 'name' in item) {
        return { value: item.id, label: item.name };
      }
      return item;
    });
    if (JSON.stringify(epValues) !== JSON.stringify(epValuesFixed)) {
      console.log(
        'Deprecation warning: update ReactTag editorParams.values from { id: "", name: "" }, to { value: "", label: "" }'
      );
    }
    return epValuesFixed;
  }, [editorParams?.values]);

  return (
    <div ref={containerRef}>
      {createPortal(
        <div ref={portalRef} style={{ position: 'fixed', zIndex: 1 }}>
          <ReactTags
            ref={tagsApi}
            placeholderText="Select or type"
            selected={values}
            suggestions={suggestions}
            allowNew={true}
            allowResize={true}
            onAdd={onAdd}
            onDelete={onDelete}
            onBlur={onBlur}
            id={editorId} // avoid conflicts between multiple ReactTags instances
          />
        </div>,
        document.body
      )}
    </div>
  );
};

export default function MultiSelectEditor(
  cell: any,
  onRendered: (fn: any) => void,
  success: (value: any) => void,
  _cancel: () => void,
  editorParams?: any
) {
  const reactContainer = document.createElement('div');
  reactContainer.style.height = '100%';
  const root = createRoot(reactContainer);
  root.render(
    <Editor
      cell={cell}
      onRendered={onRendered}
      success={success}
      editorParams={editorParams}
      editorId={'rt-' + Math.random().toString(36).substring(2, 13)} // prevents conflict between multiple editors
      root={root}
    />
  );
  return reactContainer;
}
