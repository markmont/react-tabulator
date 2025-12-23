import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styles.css'
import '../../styles.css'; // required styles
import '../../src/css/tabulator.min.css';  // tabulator theme
import ReactTabulatorExample from '../../src/ReactTabulatorExample';
// import '../../src/css/bootstrap/tabulator_bootstrap.min.css'; // bootstrap theme

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <div>
      <h1>Demo</h1>
      <ReactTabulatorExample />
    </div>
  </StrictMode>,
)

