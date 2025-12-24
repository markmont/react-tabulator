import * as React from 'react';
import { pickHTMLProps } from 'pick-react-known-prop';
import { propsToOptions } from './ConfigUtils';

/* tslint:disable-next-line */
// import * as Tabulator_Import from 'tabulator-tables';
// const { TabulatorFull: Tabulator } = Tabulator_Import;
import * as Tabulator from 'tabulator-tables';

export interface ReactTabulatorOptions extends Tabulator.Options {
  [k: string]: any;
}

export type ColumnDefinition = Tabulator.ColumnDefinition

export interface ReactTabulatorProps {
  columns?: ColumnDefinition[];
  options?: any;
  events?: any;
  onRef?: (ref: any) => void
  [k: string]: any;
}

const ReactTabulator = (props: ReactTabulatorProps) => {
  const ref = React.useRef();
  const instanceRef: any = React.useRef();
  const [mainId, ] = React.useState(`tabulator-${+new Date()}-${Math.floor(Math.random() * 9999999)}`);

  const htmlProps: any  = pickHTMLProps(props); // pick valid html props
  delete htmlProps['data']; // don't render data & columns as attributes
  delete htmlProps['columns'];

  const initTabulator = async () => {
    const domEle: any = ref.current; // Directly access the DOM element
    const { columns, data, options } = props;
    const propOptions = await propsToOptions(props);
    if (data) {
      propOptions.data = data;
    }

    instanceRef.current = new Tabulator.TabulatorFull(domEle, {
      columns,
      ...propOptions,
      layout: props.layout ?? 'fitColumns', // fit columns to width of table (optional)
      ...options // props.options are passed to Tabulator's options.
    });
    if (props.events) {
      Object.keys(props.events).forEach((eventName: string) => {
        const handler = props.events[eventName];
        (instanceRef.current as any).on(eventName, handler);
      });
    }
    if (props.onRef) {
      props.onRef(instanceRef);
    }
  };

  React.useEffect(() => {
    // console.log('useEffect - onmount');
    initTabulator();

    // Cleanup function to destroy Tabulator instance on unmount
    return () => {
      if (instanceRef.current) {
        instanceRef.current.destroy();
      }
    };
  }, []);

  React.useEffect(() => {
    // console.log('useEffect - props.data changed');
    if (instanceRef?.current) {
      initTabulator();
    }
  }, [props.data]);

  return <div ref={ref} data-instance={mainId} {...htmlProps} className={props.className} />;
};

export default ReactTabulator;
