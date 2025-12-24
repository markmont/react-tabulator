import * as React from 'react';
import {createRoot} from "react-dom/client";

export function isSameArray(a: any[], b: any[]) {
  let i = a && a.length ? a.length : 0;
  if (i !== (b && b.length ? b.length : 0)) {
    return false;
  }
  while (i--) {
    if (a[i] !== b[i]) {
      return false;
    }
  }
  return true;
}

export function reactFormatter(JSX: any) {
  // @ts-expect-error: formatterParams is not used here but is part of the Tabulator formatter signature
  return function customFormatter(cell: any, formatterParams: any, onRendered: (callback: () => void) => void) {
    // cell - the cell component
    // formatterParams - parameters set for the column, see https://github.com/olifolkerd/tabulator/blob/master/src/js/modules/Format/defaults/formatters/toggle.js
    // onRendered - function to call when the formatter has been rendered
    const renderFn = () => {
      const cellEl = cell.getElement();
      if (cellEl) {
        const formatterCell = cellEl.querySelector('.formatterCell');
        if (formatterCell) {
          const CompWithMoreProps = React.cloneElement(JSX, { cell });


          // Create a root for the formatterCell if it doesn't already have one
          let root = formatterCell._reactRoot;
          if (!root) {
            root = createRoot(formatterCell);
            formatterCell._reactRoot = root; // Store the root for potential future re-renders
          }

          // Render the component
          root.render(CompWithMoreProps);
        }
      }
    };

    onRendered(renderFn); // initial render only.

    setTimeout(() => {
      renderFn(); // render every time cell value changed.
    }, 0);
    return '<div class="formatterCell"></div>';
  };
}
