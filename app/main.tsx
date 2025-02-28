import { JSX } from 'react';
import { createRoot } from 'react-dom/client';

const Main = () : JSX.Element => {
  return (
    <div>
      Hello World!
    </div>
  )
}

createRoot(document.getElementById('root')!).render(
  <Main />
);
