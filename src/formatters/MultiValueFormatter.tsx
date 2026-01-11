import {createRoot} from "react-dom/client";

const createCellEl = () => {
  const el = document.createElement('div');
  el.style.height = '100%';
  return el;
};

// example: { title: 'Pets', field: 'pets', formatter: MultiValueFormatter, formatterParams: { style: 'PILL' } }
// default style: comma separated plain text
// other styles: PILL
// eslint-disable-next-line @typescript-eslint/no-unused-vars -- _onRendered is provided by Tabulator but not used here
export default function MultiValueFormatter(cell: any, formatterParams: any, _onRendered: (fn: any) => void) {
  const style = formatterParams.style || ''; // comma separated plain text

  const arr = cell.getValue() || [];
  let content = arr && arr.length > 0 && typeof arr[0] === 'string' ? <span>{arr.join(', ')}</span> : <span />;

  if (style === 'PILL') {
    content = (
      <>
        {arr.map((item: any) => {
          return typeof item === 'string' ? <span key={item}>{item}</span> : <span key={item.name}>{item.name}</span>;
        })}
      </>
    );
  }

  const el = createCellEl();
  el.className = 'multi-value-formatter-content';
  el.title = arr && arr.length > 0 && typeof arr[0] === 'string' ? arr.join(', ') : '';
  const root = createRoot(el);
  root.render(content);
  return el;
}
