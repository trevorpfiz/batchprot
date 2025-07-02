import type { Metadata } from 'next';
import { Header } from './components/header';

const title = 'Batchprot';
const description = 'Batchprot';

export const metadata: Metadata = {
  title,
  description,
};

const App = () => {
  return (
    <>
      <Header page="Batchprot" pages={['Batchprot']} />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min">
          <h1>Batchprot</h1>
        </div>
      </div>
    </>
  );
};

export default App;
